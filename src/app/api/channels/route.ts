import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createChannel } from "@/lib/data";

function readString(payload: unknown, key: string): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

export async function POST(request: Request) {
  // No redirect here: fetch() would follow it to /login and read it as success.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = readString(payload, "name")?.trim() ?? "";
  if (!name) {
    return NextResponse.json(
      { error: "name must be a non-empty string" },
      { status: 400 }
    );
  }

  try {
    const channel = await createChannel({ name, userId: user.id });
    return NextResponse.json(channel);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "channel create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
