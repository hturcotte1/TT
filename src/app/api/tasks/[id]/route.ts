import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { TASK_STATUSES } from "@/lib/constants";
import { updateTaskStatus } from "@/lib/data";
import type { TaskStatus } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // No redirect here: fetch() would follow it to /login and read it as success.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: { status?: unknown };
  try {
    body = (await request.json()) as { status?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const status = body.status;
  if (
    typeof status !== "string" ||
    !(TASK_STATUSES as readonly string[]).includes(status)
  ) {
    return NextResponse.json(
      { error: `Status must be one of: ${TASK_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const task = await updateTaskStatus({
      taskId: id,
      status: status as TaskStatus,
      userId: user.id,
    });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
