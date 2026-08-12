import { NextResponse } from "next/server";
import { DEV_AUTH_COOKIE, isDevAuth } from "@/lib/constants";
import { supabaseAuthServer } from "@/lib/supabase/server";

export async function POST() {
  if (!isDevAuth()) {
    const supabase = await supabaseAuthServer();
    await supabase.auth.signOut();
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEV_AUTH_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
