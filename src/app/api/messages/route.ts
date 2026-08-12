import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sendMessage } from "@/lib/data";

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

  const channelId = readString(payload, "channelId") ?? "";
  const body = readString(payload, "body")?.trim() ?? "";
  if (!channelId.trim()) {
    return NextResponse.json(
      { error: "channelId must be a non-empty string" },
      { status: 400 }
    );
  }
  if (!body) {
    return NextResponse.json(
      { error: "body must be a non-empty string" },
      { status: 400 }
    );
  }

  try {
    const message = await sendMessage({ channelId, userId: user.id, body });
    return NextResponse.json(message);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "message send failed";
    const status = message === "channel not found" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
