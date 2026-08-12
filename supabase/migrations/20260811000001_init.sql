-- TT initial schema (version 1, no row-level security — see README later tasks).

create table users (
  id uuid primary key,
  email text unique not null,
  name text not null,
  avatar_url text
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  project_id uuid references projects(id),
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id),
  user_id uuid not null references users(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table channel_reads (
  channel_id uuid not null references channels(id),
  user_id uuid not null references users(id),
  last_read_at timestamptz not null default now(),
  primary key (channel_id, user_id)
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  title text not null,
  status text not null default 'todo',
  owner_id uuid references users(id),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table outreach_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  status text not null default 'lead',
  next_touch_date date,
  notes text,
  created_at timestamptz not null default now()
);

create table touches (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references outreach_contacts(id),
  user_id uuid not null references users(id),
  note text not null,
  occurred_at timestamptz not null default now()
);

create table repos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  notes text
);

create table llm_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  source text not null,
  model text not null,
  tokens_in integer not null default 0,
  tokens_out integer not null default 0,
  cost_usd numeric(10,4) not null default 0,
  latency_ms integer,
  status text not null default 'ok',
  input_ref text,
  output_ref text
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  verb text not null,
  object_type text not null,
  object_id uuid,
  object_label text not null,
  created_at timestamptz not null default now()
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  quarter text not null,
  status text not null default 'active'
);
