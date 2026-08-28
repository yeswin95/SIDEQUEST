# Deploy SIDEQUEST to Render + Supabase

This guide deploys **Backend (Spring Boot) + Frontend (Next.js)** on **Render** with **Supabase Postgres** as the cloud database.

---

## Architecture

```
Supabase Postgres (cloud) 
    ↑  (jdbc:postgresql://.../postgres?sslmode=require)
Render Web Service: sidequest-backend (Docker, Spring Boot, prod profile)
    ↑  /api/v1/* rewrites
Render Web Service: sidequest-frontend (Node, Next.js)
```

---

## Prerequisites

1. GitHub repo: `yeswin95/SIDEQUEST` (already connected to Render)
2. Render account linked to GitHub
3. Supabase project (free tier): https://supabase.com/dashboard

---

## Step 1 — Create Supabase Database

1. Go to **Supabase Dashboard → New Project**
2. Choose region closest to Render `oregon` (e.g., `us-west-1` or `ap-south-1`)
3. Note your **Database password** (you set it at project creation)
4. After project is ready: **Project Settings → Database → Connection string**
   - Select **Transaction mode** (port `6543`, `pgbouncer=true`) — recommended for Render free tier (connection pooling)
   - Or **Session mode** (port `5432`) if you prefer
5. Copy the URI, e.g.:
   ```
   postgresql://postgres.smistqexample:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```
6. **Important for Render/Spring:** Convert to JDBC form by adding `jdbc:` prefix and `?sslmode=require` if missing:
   ```
   jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```
   Or keep the original `postgresql://` form and set it as `DATABASE_URL` — the included `DatabaseUrlProcessor` will auto-convert `postgres://` → `jdbc:postgresql://?sslmode=require` at startup.

7. Apply schema (optional — Hibernate `ddl-auto: update` will auto-create tables on first boot, but to apply the full `database/schema.sql` with enums/indexes/triggers exactly):
   - Supabase Dashboard → **SQL Editor** → paste contents of `database/schema.sql` → Run
   - OR connect via `psql`:
     ```bash
     psql "postgresql://postgres.smistqexample:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require" -f database/schema.sql
     ```

---

## Step 2 — Prepare Render Blueprint

The repo now contains:

- `backend/Dockerfile` — multi-stage Maven build, runs with `SPRING_PROFILES_ACTIVE=prod`
- `backend/src/main/resources/application-prod.yml` — prod datasource (Supabase, pool, ssl)
- `backend/src/main/java/com/sidequest/config/DatabaseUrlProcessor.java` — auto-converts `DATABASE_URL` (Render/Supabase `postgres://`) to JDBC
- `frontend/next.config.js` — rewrites `/api/v1/*` to `BACKEND_API_URL`, handles bare host from Render
- `render.yaml` — Blueprint defining both services

Commit & push is already done; Render will read `render.yaml`.

---

## Step 3 — Deploy via Render Dashboard (Blueprint)

1. **Render Dashboard → New → Blueprint**
2. Select repo `yeswin95/SIDEQUEST` → branch `main`
3. Render detects `render.yaml` with 2 services:
   - `sidequest-backend` (Docker, free)
   - `sidequest-frontend` (Node, free)
4. It will prompt for **secrets** (sync: false):
   - `DATABASE_URL` — paste Supabase Transaction Pooler URL (e.g., `postgresql://postgres.xxx:pass@aws-0-...:6543/postgres`)
   - `SPRING_DATASOURCE_URL` — leave empty if using `DATABASE_URL`, or paste JDBC URL explicitly
   - `SPRING_DATASOURCE_USERNAME` — e.g., `postgres.smistqexample` (from Supabase connection string user part)
   - `SPRING_DATASOURCE_PASSWORD` — your Supabase DB password
   - `JWT_SECRET` — auto-generated; or paste a 32+ char random secret (`openssl rand -base64 32`)
5. Click **Apply**. Render will start building both services in parallel.
6. **Backend first**: Docker build (~3-5 min) → health check `GET /actuator/health` (exposed via `management.endpoints.web.exposure.include=health`)
7. **Frontend second**: `npm ci && npm run build` → `npm start` on `PORT=10000`
8. After green ✅, note URLs:
   - Backend: `https://sidequest-backend.onrender.com`
   - Frontend: `https://sidequest-frontend.onrender.com`

### If DB connection fails

- Check backend logs: **Render → sidequest-backend → Logs**
- Common fixes:
  - Ensure `DATABASE_URL` includes `?sslmode=require` (or let processor add it)
  - Username must be `postgres.<project_ref>` not just `postgres` when using pooler
  - Use **Transaction pooler port 6543** for Render free; **6543** requires pgbouncer param, but Supabase already handles it
  - Verify Supabase IP allowlist allows `0.0.0.0/0` (default)

### Update CORS

After first deploy, frontend URL is known. In **Render → sidequest-backend → Environment**, set:
```
CORS_ALLOWED_ORIGINS=https://sidequest-frontend.onrender.com
```
Or keep the default wildcard `https://sidequest-frontend.onrender.com,http://localhost:3000`. Redeploy backend.

---

## Step 4 — Alternative: Manual Service Creation (without Blueprint)

If you prefer manual:

1. **Backend**:
   - New → Web Service → Connect `yeswin95/SIDEQUEST`
   - Root Directory: `backend`
   - Runtime: `Docker`
   - Dockerfile Path: `./Dockerfile`
   - Plan: Free, Region: Oregon
   - Add env vars as above; set `SPRING_PROFILES_ACTIVE=prod`

2. **Frontend**:
   - New → Web Service → same repo
   - Root Directory: `frontend`
   - Runtime: `Node`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
   - Env: `BACKEND_API_URL=https://sidequest-backend.onrender.com` (replace with your actual backend URL)

---

## Step 5 — Post-Deploy Checks

```bash
# Health
curl https://sidequest-backend.onrender.com/actuator/health
# Should return {"status":"UP"}

# API
curl https://sidequest-backend.onrender.com/api/v1/skills

# Frontend
open https://sidequest-frontend.onrender.com
```

Test flows: **Sign Up → Sign In → Post Quest → Apply to Join → My Quests → Skills (tree/list) → Profile badges**

---

## Local Development vs Production

- Local: `SPRING_PROFILES_ACTIVE=dev` → uses H2 in-memory, `JWT_SECRET` dev default
- Production (Render): `SPRING_PROFILES_ACTIVE=prod` → uses Supabase Postgres via `DATABASE_URL`/`SPRING_DATASOURCE_URL`, `JWT_SECRET` generated, `CORS_ALLOWED_ORIGINS` set to frontend

No code changes needed; profiles switch automatically via `render.yaml` (`SPRING_PROFILES_ACTIVE=prod`).

---

## Costs

- Render Web Services (free): 750h/month, sleeps after 15m inactivity, 512MB RAM
- Supabase (free): 500MB DB, 2GB bandwidth, 50k MAU
- Upgrading: Render `0.5c-512mb` ($7/mo) + Supabase Pro ($25/mo) for prod

---

## Troubleshooting

- `FATAL: password authentication failed` → check `SPRING_DATASOURCE_USERNAME` = `postgres.<ref>` and password correct
- `FATAL: remaining connection slots are reserved` → switch to Transaction pooler port `6543` (pgbouncer)
- `CORS blocked` → update backend `CORS_ALLOWED_ORIGINS` to frontend URL
- `no such table: skills` → set `spring.jpa.hibernate.ddl-auto=update` (already in prod) or manually run `database/schema.sql` in Supabase SQL Editor
- Frontend `API Error 404` → check `BACKEND_API_URL` in frontend env; rebuild frontend after backend URL changes

---

## Security Notes

- `JWT_SECRET` must be 32+ bytes; `generateValue: true` in `render.yaml` creates a base64 256-bit secret
- Supabase DB password is secret — never commit to Git; use Render `sync: false` prompt
- Rotate JWT secret + DB password periodically via Supabase & Render dashboards
