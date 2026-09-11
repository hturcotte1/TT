-- Enable row-level security on every table in the public schema.
-- No policies are created, so the anon and authenticated roles can read and
-- write nothing through PostgREST. The application only touches tables with
-- the service-role client (src/lib/supabase/admin.ts), which bypasses RLS.
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;
