import { NextResponse, type NextRequest } from "next/server";
import { ALLOWED_EMAILS } from "@/lib/constants";
import { supabaseAuthServer } from "@/lib/supabase/server";

/**
 * Google OAuth callback (Supabase Auth). Exchanges the code for a session,
 * then rejects any email that is not in ALLOWED_EMAILS.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await supabaseAuthServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const email = data.user?.email?.toLowerCase();
  if (!email || !ALLOWED_EMAILS.includes(email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=denied`);
  }

  return NextResponse.redirect(`${origin}/`);
}
