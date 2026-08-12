"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TASK_STATUSES } from "@/lib/constants";
import type { TaskStatus } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TaskStatusSelect({
  taskId,
  status,
}: {
  taskId: string;
  status: TaskStatus;
}) {
  const router = useRouter();
  // Optimistic value shown while the PATCH + refresh are in flight.
  const [optimistic, setOptimistic] = useState<TaskStatus | null>(null);
  const [saving, setSaving] = useState(false);

  // Drop the optimistic value once the server prop changes (guarded
  // set-state-during-render, per react.dev "You Might Not Need an Effect").
  const [prevStatus, setPrevStatus] = useState(status);
  if (prevStatus !== status) {
    setPrevStatus(status);
    setOptimistic(null);
  }

  const value = optimistic ?? status;

  async function handleChange(next: string) {
    const nextStatus = next as TaskStatus;
    if (nextStatus === value || saving) return;
    setOptimistic(nextStatus);
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      router.refresh();
    } catch {
      setOptimistic(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={saving}>
      <SelectTrigger className="h-8 w-[130px] text-xs" aria-label="Task status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TASK_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s.replace(/_/g, " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
