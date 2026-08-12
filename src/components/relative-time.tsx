"use client";

import { useEffect, useState } from "react";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Renders "2 minutes ago" style times and refreshes them every 30 seconds. */
export function RelativeTime({
  iso,
  className,
}: {
  iso: string;
  className?: string;
}) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  return (
    <time
      dateTime={iso}
      suppressHydrationWarning
      className={cn("text-xs text-muted-foreground whitespace-nowrap", className)}
    >
      {relativeTime(iso)}
    </time>
  );
}
