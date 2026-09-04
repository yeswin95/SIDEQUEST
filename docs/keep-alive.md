# Keep-Alive — Prevent Render Free-Tier Sleep

Render free tier puts web services to sleep after ~15 minutes of inactivity.
Cold start can take 30-60s, during which requests return 502/503 or timeout.

The frontend now handles cold starts automatically (health ping + retry + banner),
but you can further reduce wake-ups by pinging the backend periodically.

## Recommended: External Uptime Monitor (no code changes)

Use a free external monitor to GET `/api/health` every 10 minutes:

### UptimeRobot
1. Create account at https://uptimerobot.com
2. Add New Monitor:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: `sidequest-backend`
   - **URL**: `https://sidequest-backend.onrender.com/api/health`
   - **Monitoring Interval**: 10 minutes
3. Save. UptimeRobot will keep the service warm during active hours.

### Alternatives (free)
- **cron-job.org** — Create cron job GET `https://sidequest-backend.onrender.com/api/health` every 10 min
- **healthchecks.io / betteruptime.com** — Same pattern
- **GitHub Actions** — Scheduled workflow with `curl` every 10 min (less reliable, 6h minimum ideal)

> Any HTTP GET to `/api/health` or `/health` that returns `{ "status": "ok" }` counts.
> The endpoint is unauthenticated, lightweight (no DB query), and suitable for health checks.

## Optional: Built-in Self-Ping Scheduler (fallback)

The backend includes an optional `KeepAliveScheduler` (`backend/src/main/java/com/sidequest/config/KeepAliveScheduler.java`).

Enable it via environment variables:

```
KEEP_ALIVE_ENABLED=true
KEEP_ALIVE_TARGET_URL=https://sidequest-backend.onrender.com
# Optional: interval in ms, default 600000 (10 min)
KEEP_ALIVE_INTERVAL_MS=600000
```

Add these in Render Dashboard → `sidequest-backend` → Environment.

Notes:
- This is a **fallback** — Render may still sleep the process; external pings are more reliable.
- Do **not** enable self-ping with `target-url` pointing to `localhost` in production.
- The scheduler uses `@ConditionalOnProperty`; it is disabled by default (`KEEP_ALIVE_ENABLED=false`).

## Render Blueprint

`render.yaml` sets `healthCheckPath: /actuator/health` for Render's own health checks.
The lightweight `/api/health` is intended for external keep-alive monitors and frontend warm-up — it does not replace Render's actuator check.
