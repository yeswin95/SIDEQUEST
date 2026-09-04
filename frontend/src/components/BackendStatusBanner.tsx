"use client";

import { useBackendHealth } from "@/lib/useBackendHealth";
import { Loader2, WifiOff, RefreshCw } from "lucide-react";

/**
 * Global inline banner shown while backend is waking from Render cold start.
 * Displays: "Connecting to server... Please wait a few seconds."
 * Auto-hides once backend responds. Also shows retry on ultimate failure.
 */
export default function BackendStatusBanner() {
  const { state, isWarmingUp, isConnected, retry } = useBackendHealth();

  if (isConnected) return null;

  if (state === "error") {
    return (
      <div
        role="alert"
        className="flex items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200"
      >
        <WifiOff className="h-3.5 w-3.5 shrink-0" />
        <span>Server is taking longer than expected to respond.</span>
        <button
          type="button"
          onClick={retry}
          className="ml-2 inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-100"
        >
          <RefreshCw className="h-3 w-3" />
          Retry now
        </button>
      </div>
    );
  }

  if (isWarmingUp) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-center gap-2 border-b border-sky-200 bg-sky-50 px-4 py-2 text-xs font-medium text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-200"
      >
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
        <span>Connecting to server... Please wait a few seconds.</span>
      </div>
    );
  }

  return null;
}
