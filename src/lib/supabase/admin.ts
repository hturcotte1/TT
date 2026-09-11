import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Server code only — never import this from a
 * client component. All database reads and writes in TT go through this
 * client. Row-level security is enabled on every public table with no
 * policies, so the anon and authenticated roles can read nothing; only the
 * service role (which bypasses RLS) reaches the data.
 */
let client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env.local and fill in the values from `npx supabase start`."
    );
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
