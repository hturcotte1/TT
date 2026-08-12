// The two founders. The ids are fixed and must match supabase/seed.sql.
// A later version replaces ALLOWED_EMAILS with a domain check (irrigant.xyz).
export const FOUNDERS = [
  {
    key: "henry",
    id: "11111111-1111-4111-8111-111111111111",
    email: "henrylachtur@gmail.com",
    name: "Henry",
  },
  {
    key: "marco",
    id: "22222222-2222-4222-8222-222222222222",
    email: "marcotrotta909@gmail.com",
    name: "Marco",
  },
] as const;

export type FounderKey = (typeof FOUNDERS)[number]["key"];

export const ALLOWED_EMAILS: readonly string[] = FOUNDERS.map((f) => f.email);

export const DEV_AUTH_COOKIE = "tt-dev-user";

export function isDevAuth(): boolean {
  return process.env.NEXT_PUBLIC_DEV_AUTH === "true";
}

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export const CONTACT_STATUSES = [
  "lead",
  "contacted",
  "replied",
  "call",
  "won",
  "dead",
] as const;
export const EVENT_STATUSES = ["ok", "error"] as const;
