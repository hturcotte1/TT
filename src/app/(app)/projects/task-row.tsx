import { RelativeTime } from "@/components/relative-time";
import { StatusChip } from "@/components/status-chip";
import type { TaskItem } from "@/lib/types";
import { TaskStatusSelect } from "./task-status-select";

/** One task row: title + chip, owner / due date / last change, status control. */
export function TaskRow({ task }: { task: TaskItem }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{task.title}</span>
          <StatusChip status={task.status} />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span>{task.ownerName ?? "Unassigned"}</span>
          {task.due_date ? (
            <>
              <span aria-hidden>·</span>
              <span>Due {task.due_date}</span>
            </>
          ) : null}
          <span aria-hidden>·</span>
          <RelativeTime iso={task.updated_at} />
        </div>
      </div>
      <TaskStatusSelect taskId={task.id} status={task.status} />
    </div>
  );
}
