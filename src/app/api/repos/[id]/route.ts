import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateRepo } from "@/lib/data";

interface UpdateRepoBody {
  name?: unknown;
  url?: unknown;
  notes?: unknown;
}

/** Coerce an optional string field: trimmed string, or null when empty/absent. */
function optionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

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

  let body: UpdateRepoBody;
  try {
    body = (await request.json()) as UpdateRepoBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const url = optionalString(body.url);
  if (url !== null && !url.startsWith("http://") && !url.startsWith("https://")) {
    return NextResponse.json(
      { error: "URL must start with http:// or https://" },
      { status: 400 }
    );
  }

  try {
    const repo = await updateRepo({
      repoId: id,
      name,
      url,
      notes: optionalString(body.notes),
      userId: user.id,
    });
    return NextResponse.json(repo);
  } catch {
    return NextResponse.json({ error: "Failed to update repo" }, { status: 500 });
  }
}
