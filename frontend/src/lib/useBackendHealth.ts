"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { pingBackend } from "@/lib/health";

export type BackendHealthState = "checking" | "connected" | "waking" | "error";

const WARMUP_INTERVAL_MS = 3000;
const MAX_WARMUP_ATTEMPTS = 20; // ~60s for Render cold start
const INITIAL_TIMEOUT_MS = 8000;
const WARMUP_TIMEOUT_MS = 5000;

const BACKEND_READY_EVENT = "sidequest_backend_ready";

/**
 * Global backend health hook.
 * - Pings /api/health on mount.
 * - If backend is waking (timeout / 502/503), switches to "waking" and retries.
 * - On success, dispatches `sidequest_backend_ready` so pages can refetch data.
 */
export function useBackendHealth() {
  const [state, setState] = useState<BackendHealthState>("checking");
  const [attempt, setAttempt] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const mountedRef = useRef(true);

  const check = useCallback(async () => {
    const ok = await pingBackend(INITIAL_TIMEOUT_MS);
    if (!mountedRef.current) return ok;
    if (ok) {
      setState("connected");
      setIsReady(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(BACKEND_READY_EVENT));
      }
      return true;
    }
    // Initial ping failed -> backend likely sleeping
    setState("waking");
    return false;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    const warmup = async () => {
      const initialOk = await check();
      if (initialOk || cancelled || !mountedRef.current) return;

      for (let i = 1; i <= MAX_WARMUP_ATTEMPTS; i++) {
        if (cancelled || !mountedRef.current) break;
        setAttempt(i);
        await new Promise((r) => setTimeout(r, WARMUP_INTERVAL_MS));
        if (cancelled || !mountedRef.current) break;
        const ok = await pingBackend(WARMUP_TIMEOUT_MS);
        if (ok && !cancelled && mountedRef.current) {
          setState("connected");
          setIsReady(true);
          setAttempt(0);
          window.dispatchEvent(new CustomEvent(BACKEND_READY_EVENT));
          return;
        }
      }

      if (!cancelled && mountedRef.current) {
        // Still not reachable after max attempts — show error but keep background retries
        setState("error");
      }
    };

    warmup();

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, [check]);

  const retry = useCallback(async () => {
    setState("checking");
    setAttempt(0);
    await check();
  }, [check]);

  const isWarmingUp = state === "waking" || state === "checking";
  const isConnected = state === "connected";

  return { state, attempt, isWarmingUp, isConnected, isReady, retry };
}

export const BACKEND_READY_EVENT_NAME = BACKEND_READY_EVENT;
