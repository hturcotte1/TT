import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ALLOWED_EMAILS,
  DEV_AUTH_COOKIE,
  FOUNDERS,
  isDevAuth,
} from "@/lib/constants";
import { supabaseAuthServer } from "@/lib/supabase/server";
import type { AppUser } from "@/lib/types";

/**
 * The one module that supplies the current user. All pages and route
 * handlers read the user from here only.
 *
 * Mode 1 (NEXT_PUBLIC_DEV_AUTH=true): the user comes from a dev cookie set
 * by the two login buttons.
 * Mode 2: the user comes from the Supabase Auth session (Google OAuth). The
 * email must be in ALLOWED_EMAILS; any other account is rejected.
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  if (isDevAuth()) {
    const key = (await cookies()).get(DEV_AUTH_COOKIE)?.value;
    const founder = FOUNDERS.find((f) => f.key === key);
    return founder ? toAppUser(founder) : null;
  }

  const supabase = await supabaseAuthServer();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!email || !ALLOWED_EMAILS.includes(email)) return null;
  const founder = FOUNDERS.find((f) => f.email === email);
  return founder ? toAppUser(founder) : null;
}

/** Redirects to /login when there is no permitted user. */
export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

function toAppUser(founder: (typeof FOUNDERS)[number]): AppUser {
  return {
    id: founder.id,
    email: founder.email,
    name: founder.name,
    avatarUrl: null,
  };
}
