-- Orders for the Amniverse Crypto Trading Journal.
-- Written only by server code using the service-role key; no public access.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  razorpay_order_id text not null unique,
  razorpay_payment_id text,
  name text not null,
  email text not null,
  phone text not null,
  amount_paise integer not null,
  currency text not null default 'INR',
  status text not null default 'created' check (status in ('created', 'paid', 'failed')),
  paid_via text check (paid_via in ('checkout', 'webhook')),
  emailed_at timestamptz,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists orders_email_idx on public.orders (email);
create index if not exists orders_status_idx on public.orders (status);

alter table public.orders enable row level security;
-- No policies on purpose: anon/authenticated roles cannot read or write.
-- The service role bypasses RLS.
