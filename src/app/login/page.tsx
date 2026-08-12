import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ALLOWED_EMAILS, isDevAuth } from "@/lib/constants";
import { supabaseAuthServer } from "@/lib/supabase/server";
import { DevLoginButtons } from "./dev-login-buttons";
import { GoogleLoginButton } from "./google-login-button";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const user = await getCurrentUser();
  if (user) redirect("/");
  const params = await searchParams;
  let denied = params.error === "denied";

  // A lingering Supabase session for a non-permitted email (signed in
  // elsewhere, or removed from the list later) also sees the message.
  if (!denied && !isDevAuth()) {
    const supabase = await supabaseAuthServer();
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email?.toLowerCase();
    if (email && !ALLOWED_EMAILS.includes(email)) denied = true;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8">
        <h1 className="text-2xl font-semibold tracking-tight">TT</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The private workspace for Henry and Marco.
        </p>
        {denied ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            Access is not permitted.
          </p>
        ) : null}
        <div className="mt-6">
          {isDevAuth() ? <DevLoginButtons /> : <GoogleLoginButton />}
        </div>
      </div>
    </div>
  );
}
