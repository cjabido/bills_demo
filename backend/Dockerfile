# ── Base ──────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN apk add --no-cache netcat-openbsd
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# ── Development ───────────────────────────────────────────────
FROM base AS dev
RUN npm install
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
# Source files are bind-mounted via docker-compose volumes
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]

# ── Production ────────────────────────────────────────────────
FROM base AS prod
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --production
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
