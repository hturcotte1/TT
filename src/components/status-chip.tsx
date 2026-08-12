import { cn } from "@/lib/utils";

/**
 * Soft status chips. Gray for todo/lead, blue for in_progress/contacted,
 * green for done/won/ok, red for error/dead, amber for late dates.
 * replied (violet) and call (amber) are not specified in the design brief;
 * the choice is noted in the README.
 */
const CHIP_STYLES: Record<string, string> = {
  todo: "bg-neutral-100 text-neutral-700",
  lead: "bg-neutral-100 text-neutral-700",
  in_progress: "bg-blue-50 text-blue-700",
  contacted: "bg-blue-50 text-blue-700",
  replied: "bg-violet-50 text-violet-700",
  call: "bg-amber-50 text-amber-800",
  done: "bg-emerald-50 text-emerald-700",
  won: "bg-emerald-50 text-emerald-700",
  ok: "bg-emerald-50 text-emerald-700",
  active: "bg-emerald-50 text-emerald-700",
  error: "bg-red-50 text-red-700",
  dead: "bg-red-50 text-red-700",
  late: "bg-amber-50 text-amber-800",
};

export function StatusChip({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        CHIP_STYLES[status] ?? "bg-neutral-100 text-neutral-700",
        className
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
