import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createRepo } from "@/lib/data";

interface CreateRepoBody {
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

export async function POST(request: Request) {
  // No redirect here: fetch() would follow it to /login and read it as success.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateRepoBody;
  try {
    body = (await request.json()) as CreateRepoBody;
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
    const repo = await createRepo({
      name,
      url,
      notes: optionalString(body.notes),
      userId: user.id,
    });
    return NextResponse.json(repo);
  } catch {
    return NextResponse.json({ error: "Failed to create repo" }, { status: 500 });
  }
}
