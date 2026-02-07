# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Finance Tracker Demo** — a public-facing demo version of a full-stack personal finance tracker. No authentication, pre-seeded with mock data, deployed publicly via Dokploy on Hostinger VPS.

This is a **separate repo** from the private `bills` project. It shares the same codebase minus all authentication (WebAuthn, JWT, cookies).

## Tech Stack

- **Frontend:** React 19 / TypeScript 5 / Vite 7 / Tailwind CSS v4 / lucide-react / date-fns / TanStack Query
- **Backend:** Node.js 20 / Express 5 / TypeScript 5 / Prisma ORM / Zod validation
- **Database:** PostgreSQL 15 with UUIDs, DECIMAL(15,2) for amounts, enum types
- **Infrastructure:** Docker Compose / Nginx (HTTP only) / Dokploy handles SSL (Let's Encrypt)

## Key Differences from Private `bills` Repo

- **No authentication** — no WebAuthn, JWT, cookies, or `Owner` model
- **Public-facing** — CORS is `origin: '*'`, no credentials
- **Demo banner** — amber banner at top with GitHub link
- **Demo reset** — `POST /api/demo/reset` endpoint (60s cooldown)
- **Pre-seeded data** — seed runs on every container start
- **No SSL in nginx** — Dokploy proxies HTTPS → HTTP

## Commands

```bash
# Development (Docker)
docker compose up                    # Start all services with hot-reload

# Backend
cd backend
npm run typecheck                    # Type-check only
npm run db:seed                      # Re-seed database
npm run db:push                      # Push schema to database

# Frontend
cd frontend
npm run dev                          # Vite dev server (localhost:5173)
npm run build                        # Type-check + production build

# Production
docker compose -f docker-compose.prod.yml up -d
```

## Environment Variables

Backend only needs: `DATABASE_URL`, `PORT`, `NODE_ENV`, `ALLOWED_ORIGIN`

No secrets required — no JWT, no WebAuthn, no encryption keys.

## Database Seed

`backend/prisma/seed.ts` exports a `seed()` function used by:
1. `docker-entrypoint.sh` — runs on every container start
2. `POST /api/demo/reset` — programmatic reset endpoint

Seeds: 20 categories, 10 accounts, 14 recurring templates, 21 transactions, 4 periods, 36 budgets, 72 asset snapshots.

## Design System

Defined in `frontend/src/index.css` via Tailwind v4 `@theme`:
- **Surfaces:** surface-0 through surface-4
- **Accents:** mint, rose, amber, sky, violet (each with `-dim` variant)
- **Fonts:** DM Sans, JetBrains Mono
- **Amount convention:** positive = income, negative = expense. DECIMAL(15,2) always.
