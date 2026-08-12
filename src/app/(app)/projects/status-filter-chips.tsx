import Link from "next/link";
import { TASK_STATUSES } from "@/lib/constants";
import type { TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Validate a ?status= search param; anything unknown means "All". */
export function parseStatusFilter(
  value: string | undefined
): TaskStatus | null {
  return value && (TASK_STATUSES as readonly string[]).includes(value)
    ? (value as TaskStatus)
    : null;
}

export function StatusFilterChips({
  basePath,
  active,
}: {
  basePath: string;
  active: TaskStatus | null;
}) {
  const options: { label: string; value: TaskStatus | null }[] = [
    { label: "All", value: null },
    ...TASK_STATUSES.map((s) => ({
      label: s.replace(/_/g, " "),
      value: s as TaskStatus,
    })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((option) => {
        const isActive = active === option.value;
        return (
          <Link
            key={option.label}
            href={
              option.value ? `${basePath}?status=${option.value}` : basePath
            }
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              isActive
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-foreground hover:bg-muted"
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
