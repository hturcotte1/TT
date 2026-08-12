"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Polls for new data by re-rendering the server components on an interval.
 * Used on the Home page and the Channels page (3 seconds). Version 1 uses
 * polling; Supabase Realtime is a later task (see README).
 */
export function AutoRefresh({ intervalMs = 3000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
