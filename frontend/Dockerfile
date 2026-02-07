# ── Base ──────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./

# ── Development ───────────────────────────────────────────────
FROM base AS dev
RUN npm install
# Source files are bind-mounted via docker-compose volumes
EXPOSE 5173
CMD ["npx", "vite", "--host", "0.0.0.0"]

# ── Build (for production) ────────────────────────────────────
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build
# Output: /app/dist — copied by nginx in docker-compose.prod.yml
