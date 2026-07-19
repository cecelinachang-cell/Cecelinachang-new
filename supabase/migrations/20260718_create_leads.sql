create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  course_slug text not null,
  course_title text not null,
  email text,
  phone text,
  city text,
  tiktok_handle text
);

alter table public.leads enable row level security;

-- anon may insert leads (public form submission), never read/update/delete
create policy "leads_insert_anon" on public.leads
  for insert
  to anon
  with check (true);
