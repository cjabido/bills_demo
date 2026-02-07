#!/bin/sh
set -e

# ── Wait for PostgreSQL ──────────────────────────────────────
echo "Waiting for PostgreSQL at $DATABASE_URL ..."
# Extract host and port from DATABASE_URL
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
DB_PORT=${DB_PORT:-5432}

until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
  echo "  PostgreSQL not ready — retrying in 2s"
  sleep 2
done
echo "PostgreSQL is up."

# ── Sync database schema ─────────────────────────────────────
if [ "$NODE_ENV" = "production" ]; then
  echo "Running prisma migrate deploy ..."
  npx prisma migrate deploy
else
  echo "Running prisma db push ..."
  npx prisma db push --skip-generate
fi

# ── Generate Prisma client (dev needs this after migrate) ────
npx prisma generate

# ── Seed demo data ──────────────────────────────────────────
echo "Running seed ..."
npx tsx prisma/seed.ts

# ── Start server ─────────────────────────────────────────────
if [ "$NODE_ENV" = "production" ]; then
  echo "Starting production server ..."
  exec node dist/server.js
else
  echo "Starting development server (tsx watch) ..."
  exec npx tsx watch src/server.ts
fi
