-- Email list from the free calculator pages. Written only by server code (service role).
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

alter table public.subscribers enable row level security;
-- No policies on purpose: anon/authenticated roles cannot read or write.
