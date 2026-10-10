-- Online course payments via Tripay (lib/tripay.ts).
--
-- Rows are written only by the server with the service-role key:
-- app/api/checkout creates them as UNPAID, app/api/tripay/callback moves them
-- to PAID/EXPIRED/FAILED/REFUND. The public never reads this table directly
-- (it holds buyer emails and phone numbers), so RLS is on with no anon/
-- authenticated policies at all; admins read it through is_admin().

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  merchant_ref text not null unique,
  tripay_reference text unique,
  course_slug text not null,
  course_title text not null,
  amount integer not null check (amount > 0),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  payment_method text not null,
  checkout_url text,
  status text not null default 'UNPAID'
    check (status in ('UNPAID', 'PAID', 'EXPIRED', 'FAILED', 'REFUND')),
  paid_at timestamptz,
  amount_received integer,
  -- Set once the buyer + admin "payment received" emails go out, so a
  -- re-delivered PAID callback never emails twice.
  paid_email_sent_at timestamptz,
  -- Ticked by the admin in /admin/orders once the Google Drive class access
  -- has been shared with the buyer.
  access_sent_at timestamptz
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

alter table public.orders enable row level security;

drop policy if exists "orders_admin_select" on public.orders;
create policy "orders_admin_select" on public.orders
  for select
  to authenticated
  using (public.is_admin());

-- Admins may only tick/untick access_sent_at; payment fields stay server-owned.
revoke update on public.orders from authenticated;
grant update (access_sent_at) on public.orders to authenticated;

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
