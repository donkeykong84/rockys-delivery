-- Rocky's Delivery App — Supabase Schema
-- Paste this entire file into: supabase.com/dashboard/project/qbavxwgxtnqfrhmumiky/sql/new
-- Then click Run.

-- Orders
create table if not exists public.orders (
  id            text primary key,
  customer      jsonb default '{}',
  lines         jsonb not null default '[]',
  stage         integer not null default 0,
  picked        jsonb not null default '{}',
  subs          jsonb not null default '{}',
  address       text,
  lat           double precision,
  lng           double precision,
  cancelled     boolean not null default false,
  placed_at     bigint not null,
  handed_off_at bigint,
  delivered_at  bigint
);

-- Stock items
create table if not exists public.stock_items (
  id          text primary key,
  ean         text,
  name        text not null,
  variant     text,
  price       double precision not null default 0,
  qty         integer not null default 0,
  low         integer not null default 6,
  aisle       text not null default 'Pantry',
  brand       text,
  image       text,
  last_reason text
);

-- Staff chat
create table if not exists public.chat_messages (
  id         bigint generated always as identity primary key,
  from_role  text not null,
  from_name  text not null,
  text       text not null,
  t          text,
  created_at timestamptz not null default now()
);

-- Disable RLS (demo — no auth enforcement needed)
alter table public.orders       disable row level security;
alter table public.stock_items  disable row level security;
alter table public.chat_messages disable row level security;

-- Enable real-time for live updates across browsers
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.stock_items;
