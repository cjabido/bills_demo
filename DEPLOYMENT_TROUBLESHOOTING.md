# Dokploy Deployment Troubleshooting Guide

This guide documents the errors encountered during the deployment of the `bills_demo` application on Dokploy and their resolutions. Use this as a reference for future deployments.

## 1. Backend Build Failure
**Symtoms:** Deployment fails during `backend` build step.
**Error:** TypeScript errors like `Cannot find name 'process'` or `Could not find a declaration file for module 'express'`.
**Cause:** The production Dockerfile used `npm ci --omit=dev`, which skipped installing development dependencies (`@types/*`, `typescript`) required for the build process.
**Resolution:**
Modify `backend/Dockerfile` to install **all** dependencies first, build the app, and then prune dev dependencies.
```dockerfile
# backend/Dockerfile (prod stage)
COPY package*.json ./
RUN npm ci                  # Install ALL deps (including dev)
COPY . .
RUN npx prisma generate
RUN npm run build           # Build using dev deps
RUN npm prune --production  # Remove dev deps for smaller image
```

## 2. Nginx Port Conflict
**Services:** `nginx`
**Error:** `Bind for 0.0.0.0:80 failed: port is already allocated`.
**Cause:** `docker-compose.prod.yml` explicitly mapped port `80:80`. Dokploy's own proxy (Traefik/Nginx) already listens on port 80 on the host, causing a conflict.
**Resolution:**
Remove the `ports` section from the `nginx` service in `docker-compose.prod.yml`. Dokploy routes traffic to the container internally.
```yaml
# docker-compose.prod.yml
  nginx:
    # ports:        <-- REMOVED
    #   - "80:80"   <-- REMOVED
```

## 3. Missing Database Tables (CrashLoopBackOff)
**Services:** `backend`
**Error:**Backend crashes with `The table public.budgets does not exist`. Log shows `No migration found in prisma/migrations`.
**Cause:** Prisma migration files were not generated or committed to the repository. The production entrypoint (`prisma migrate deploy`) does nothing if the `migrations` folder is empty.
**Resolution:**
Generate the initial migration locally and commit the `prisma/migrations` folder.
```bash
# Run locally in backend/
npx prisma migrate dev --name init
# Commit the generated prisma/migrations folder
```

## 4. DNS Resolution Failure (SERVFAIL)
**Services:** `nginx`, `backend`
**Error:** Nginx logs show `backend could not be resolved (2: Server failure)`. Manual `nslookup backend` inside the container returns `SERVFAIL`.
**Cause:** The default Docker Compose bridge network has legacy DNS behavior and unreliable service discovery.
**Resolution:**
Explicitly define a **User-Defined Bridge Network** (`app-network`) and ensure **ALL** services are attached to it.
```yaml
# docker-compose.prod.yml
services:
  postgres:
    networks:
      - app-network  # Critical: DB must be on same network
  backend:
    networks:
      - app-network
  nginx:
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## 5. Nginx Startup Race Condition
**Services:** `nginx`
**Error:** Nginx starts before the backend is ready, or fails to resolve the backend hostname at startup `(host not found)`.
**Cause:** Nginx checks upstream hostnames immediately upon config loading. If the backend service isn't fully ready in Docker DNS, Nginx crashes.
**Resolution:**
Implement "Belt and Suspenders" resilience:
1.  **Healthcheck:** Make Nginx wait for the Backend to be healthy (listening on port 3000).
2.  **Runtime Resolution:** Force Nginx to resolve the hostname at *request time* using a variable.

**Step 1: Healthcheck (docker-compose.prod.yml)**
```yaml
  backend:
    healthcheck:
      test: ["CMD", "nc", "-z", "localhost", "3000"]
      interval: 5s
  nginx:
    depends_on:
      backend:
        condition: service_healthy
```

**Step 2: Runtime DNS (nginx.conf)**
```nginx
        # Use Docker's internal DNS (127.0.0.11), disable IPv6 to prevent failures
        resolver 127.0.0.11 ipv6=off valid=30s;
        
        location /api/ {
            # Using a variable forces runtime resolution
            set $backend "http://backend:3000";
            proxy_pass $backend;
        }
```
