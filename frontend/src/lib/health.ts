/**
 * health.ts
 * ---------------------------------------------------------------------------
 * Lightweight backend health-check utility.
 * Pings GET /api/health (proxied to backend via next.config.js rewrites).
 * Used by useBackendHealth hook and for manual warm-up triggers.
 * ---------------------------------------------------------------------------
 */

export type HealthStatus = "ok" | "error";

export interface HealthResponse {
  status: string;
}

/**
 * Ping backend health endpoint with a timeout.
 * Returns true if backend responds with { status: "ok" }.
 */
export async function pingBackend(timeoutMs = 8000): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch("/api/health", {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    clearTimeout(timeout);
    if (!res.ok) return false;
    try {
      const data = (await res.json()) as HealthResponse;
      return data.status === "ok";
    } catch {
      // Some deployments may return plain text
      return res.ok;
    }
  } catch {
    clearTimeout(timeout);
    return false;
  }
}

/**
 * Poll backend until it responds or max attempts exceeded.
 * Useful for Render cold-start (can take 30-60s).
 */
export async function pollUntilHealthy(opts?: {
  maxAttempts?: number;
  intervalMs?: number;
  timeoutMs?: number;
  onAttempt?: (attempt: number) => void;
}): Promise<boolean> {
  const {
    maxAttempts = 20,
    intervalMs = 3000,
    timeoutMs = 8000,
    onAttempt,
  } = opts ?? {};

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    onAttempt?.(attempt);
    const ok = await pingBackend(timeoutMs);
    if (ok) return true;
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
  return false;
}
