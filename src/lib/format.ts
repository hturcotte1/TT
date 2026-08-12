import { formatDistanceToNowStrict } from "date-fns";

/** "2 minutes ago", "3 days ago" */
export function relativeTime(iso: string | Date): string {
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  });
}

export function formatTokens(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(value);
}
