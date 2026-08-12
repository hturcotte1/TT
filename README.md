# TT

TT is the private web application for the two founders:

- Henry — henrylachtur@gmail.com
- Marco — marcotrotta909@gmail.com

It gives them message channels, projects and tasks, an activity feed, an
outreach tracker, an API cost dashboard, and a repository list.

Stack: Next.js (App Router) + TypeScript, Tailwind CSS + shadcn/ui,
Supabase (Postgres + Auth), recharts, lucide-react, date-fns.

## Local setup

Requirements: Node 20+, npm, Docker (for local Supabase).

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start local Supabase (creates `supabase/config.toml` on first run):

   ```bash
   npx supabase init   # only the first time; keeps the existing migrations
   npx supabase start
   ```

   `npx supabase start` prints the API URL, the anon key, and the service
   role key.

3. Apply the migration and the seed data:

   ```bash
   npx supabase db reset
   ```

   This runs `supabase/migrations/*.sql` and then `supabase/seed.sql`.

4. Configure the environment:

   ```bash
   cp .env.example .env.local
   ```

   Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` from the `npx supabase start` output. Keep
   `NEXT_PUBLIC_DEV_AUTH=true` for the development login. Set
   `INGEST_TOKEN` to a long random string.

5. Run the app:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000, pick "Continue as Henry" or
   "Continue as Marco", and every page shows the seed data.

### Test the ingest endpoint

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer $INGEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"source":"ask-helios","model":"claude-sonnet-5","tokens_in":1200,"tokens_out":300,"cost_usd":0.0081,"latency_ms":2100,"status":"ok"}'
```

A new row appears at the top of the Spend page.

## Turning on real Google OAuth

1. **Google Cloud**: create a project at https://console.cloud.google.com,
   open *APIs & Services → Credentials*, and create an *OAuth client ID* of
   type *Web application*.
   - Authorized JavaScript origins: `http://localhost:3000` (and your
     production URL).
   - Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
     (for local Supabase: `http://127.0.0.1:54321/auth/v1/callback`).
   - Configure the OAuth consent screen (External is fine; add both founder
     emails as test users while the app is unverified).
2. **Supabase**: in the dashboard open *Authentication → Providers → Google*,
   enable it, and paste the client ID and client secret. Under
   *Authentication → URL Configuration* set the Site URL to your app URL and
   add `http://localhost:3000/auth/callback` (and the production equivalent)
   to the redirect allow list.
3. **App**: set `NEXT_PUBLIC_DEV_AUTH=false`. The login page now shows
   "Continue with Google". After login the app checks the email against the
   allow list in `src/lib/constants.ts` (`ALLOWED_EMAILS`); any other account
   is signed out and sees "Access is not permitted."

## Deploying to Vercel

1. Push this repository to GitHub and import it at https://vercel.com/new
   (framework preset: Next.js; no special build settings).
2. Create a hosted Supabase project at https://supabase.com, then link and
   push the schema and seed:

   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push        # applies supabase/migrations
   ```

   Run the contents of `supabase/seed.sql` in the Supabase SQL editor if you
   want the demo data in production.
3. Set the environment variables in Vercel (Project → Settings →
   Environment Variables): `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `NEXT_PUBLIC_DEV_AUTH` (`false` for production), `INGEST_TOKEN`.
4. Deploy, then add the Vercel URL to the Google OAuth client (JavaScript
   origin) and to the Supabase redirect allow list
   (`https://<app>.vercel.app/auth/callback`).

## Decisions not fixed by the build instruction

- **Development session**: the dev login sets an httpOnly cookie
  (`tt-dev-user`). `src/lib/auth.ts` is the single module that supplies the
  current user in both auth modes; pages and route handlers only read the
  user from there.
- **User identity**: the application `users` rows use fixed UUIDs defined in
  `src/lib/constants.ts` and seeded in `supabase/seed.sql`. In OAuth mode
  the Supabase Auth identity is mapped to the app user by email address.
- **Polling**: the Home and Channels pages poll by re-rendering the server
  components every 3 seconds (`src/components/auto-refresh.tsx` calls
  `router.refresh()`), so there is one data path instead of parallel JSON
  endpoints. No websockets in version 1.
- **Read markers**: `channel_reads` upserts are bookkeeping and are not
  written to `activities` — a feed entry every 3 seconds while a channel is
  open would flood the feed. All other writes log one activity row.
- **Chip colors**: the design brief does not name colors for the `replied`
  and `call` contact statuses; `replied` is violet and `call` is amber
  (`src/components/status-chip.tsx`). Late dates are rendered in red text in
  the outreach table (section 7.4); the amber "late" chip style from
  section 9 exists in the chip component for other late markers.
- **Touch form**: logging a touch can optionally set the contact's next
  touch date in the same submit, because a call usually produces the next
  follow-up date.
- **Package name**: npm forbids capital letters in package names, so
  `package.json` uses `tt` although the repository directory is `TT`.
- **supabase/config.toml** is not committed; `npx supabase init` generates a
  config that matches your local CLI version.
- **Bounded reads**: the Spend page computes totals over the newest 5,000
  events, lists the newest 200 (labeled in the UI), and a channel view shows
  its newest 500 messages. Day buckets and "today" use the server timezone
  (UTC on Vercel); each event carries its server-computed day key so the
  chart and the day filter always agree.

## Verification status

The build environment for this commit had no Docker, so `npx supabase start`
could not run there. Instead the schema, seed, and app were verified against
a local PostgreSQL 16 with PostgREST standing in for the Supabase API (the
same interface supabase-js talks to). All verification steps from the build
instruction passed:

1. `npm run build` — no errors (ESLint also clean).
2. The app starts with the development login on.
3. All six pages render the seed data.
4. A message sent as Henry in #general appears and persists.
5. Creating a project named `test-project` also creates the `test-project`
   channel and two activity rows. Both rows were deleted after the check
   (the app has no delete UI, so they were removed with SQL); the choice
   was to delete, keeping the demo data clean.
6. `POST /api/events` returns 401 for a bad token, 400 for a bad body, and
   201 for a valid request, whose row then appears on the Spend page.

Task, contact, touch, and repo mutations were exercised the same way; every
write produced its `activities` row, and unauthenticated requests are
redirected without writing.

## Later tasks

- Row-level security (version 1 uses the service-role key in server code
  only; no RLS policies yet).
- Supabase Realtime instead of 3-second polling.
- Replace the `ALLOWED_EMAILS` constant with a domain check for
  `irrigant.xyz`.
- GitHub API data (stars, last push, open PRs) for the Repos page.
- Agent dispatch.
- Server-side SQL aggregation for the Spend totals once event volume passes
  the version-1 read caps.
