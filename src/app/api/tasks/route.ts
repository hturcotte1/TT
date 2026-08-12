import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createTask } from "@/lib/data";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface CreateTaskBody {
  title?: unknown;
  projectId?: unknown;
  ownerId?: unknown;
  dueDate?: unknown;
}

/** Coerce an optional string field: trimmed string, or null when empty/absent. */
function optionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function POST(request: Request) {
  // No redirect here: fetch() would follow it to /login and read it as success.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateTaskBody;
  try {
    body = (await request.json()) as CreateTaskBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const projectId = optionalString(body.projectId);
  const ownerId = optionalString(body.ownerId);
  const dueDate = optionalString(body.dueDate);
  if (dueDate !== null && !DATE_RE.test(dueDate)) {
    return NextResponse.json(
      { error: "Due date must be yyyy-mm-dd" },
      { status: 400 }
    );
  }

  try {
    const task = await createTask({
      projectId,
      title,
      ownerId,
      dueDate,
      userId: user.id,
    });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
