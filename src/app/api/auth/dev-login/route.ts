import { NextResponse, type NextRequest } from "next/server";
import { DEV_AUTH_COOKIE, FOUNDERS, isDevAuth } from "@/lib/constants";

export async function POST(request: NextRequest) {
  if (!isDevAuth()) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const key = (body as { user?: string })?.user;
  const founder = FOUNDERS.find((f) => f.key === key);
  if (!founder) {
    return NextResponse.json({ error: "Unknown user" }, { status: 400 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEV_AUTH_COOKIE, founder.key, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
