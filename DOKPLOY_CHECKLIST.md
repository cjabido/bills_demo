# Dokploy Deployment Checklist

Use this checklist **before** deploying any new Node.js/Docker project to Dokploy. These items prevent the common errors of build failures, port conflicts, and DNS crashes.

## 1. Dockerfile & Build
- [ ] **Dependencies**: In multi-stage builds, ensure the `build` stage installs **ALL** dependencies (including dev deps like `@types/*` and `typescript`).
    - *Incorrect:* `RUN npm ci --omit=dev` (in build stage)
    - *Correct:* `RUN npm ci` -> Build -> `RUN npm prune --production`
- [ ] **Prisma**: If using Prisma, ensure `npx prisma generate` runs **before** the build step.

## 2. Docker Compose Configuration
- [ ] **Ports**: **REMOVE** any `ports` mapping (e.g., `80:80`) for the web/proxy service. Dokploy handles ingress automatically.
- [ ] **Networks**: Define a custom bridge network (e.g., `app-network`) and ensure **ALL** services (DB, Backend, Nginx) are explicitly attached to it.
    - *Why:* The default bridge network has unreliable DNS resolution (`SERVFAIL`).
- [ ] **Environment**: ensure `NODE_ENV=production`.

## 3. Resilience & Startup
- [ ] **Healthchecks**: Add a `healthcheck` to your Backend service (e.g., using `netcat` or `curl`) to verify it's listening.
- [ ] **Depends On**: Configure Nginx (or your frontend proxy) to `depends_on` the Backend with `condition: service_healthy`.
    - *Why:* Prevents Nginx from starting and crashing before the Backend is ready.

## 4. Nginx Configuration (If using custom Nginx)
- [ ] **Runtime Resolution**: Use a variable for `proxy_pass` to force DNS resolution at request time.
    ```nginx
    resolver 127.0.0.11 ipv6=off valid=30s;
    set $backend "http://backend:3000";
    proxy_pass $backend;
    ```
    - *Why:* Prevents "host not found" startup crashes if the upstream container is slow to register in DNS.

## 5. Database & Migrations
- [ ] **Strategies**: Decide how migrations run.
    - *Option A:* Generate migrations locally (`prisma migrate dev`) and commit the `migrations/` folder. The production container runs `prisma migrate deploy`.
    - *Option B:* (Not recommended for prod) Use `prisma db push`.
- [ ] **Network**: Verify the Database container is on the same custom network as the Backend.

---

## Quick Validations
Run these locally before pushing:
1. `docker compose -f docker-compose.prod.yml config` (Checks syntax)
2. `docker compose -f docker-compose.prod.yml up --build` (Verifies local startup)
