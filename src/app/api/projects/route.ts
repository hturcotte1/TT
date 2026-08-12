import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createProject } from "@/lib/data";

export async function POST(request: Request) {
  // No redirect here: fetch() would follow it to /login and read it as success.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: unknown; description?: unknown };
  try {
    body = (await request.json()) as { name?: unknown; description?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const description =
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim()
      : null;

  try {
    // createProject also creates the project's channel internally.
    const result = await createProject({ name, description, userId: user.id });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
