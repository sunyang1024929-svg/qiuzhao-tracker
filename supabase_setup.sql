-- Run this in Supabase SQL Editor for qiuzhao-tracker.
-- It creates per-user private application records protected by Row Level Security.

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id text not null,
  applied_position text not null default '',
  status text not null default 'pending',
  notes text not null default '',
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, company_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

alter table public.applications enable row level security;

drop policy if exists "applications select own rows" on public.applications;
create policy "applications select own rows"
on public.applications
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "applications insert own rows" on public.applications;
create policy "applications insert own rows"
on public.applications
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "applications update own rows" on public.applications;
create policy "applications update own rows"
on public.applications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "applications delete own rows" on public.applications;
create policy "applications delete own rows"
on public.applications
for delete
to authenticated
using (auth.uid() = user_id);
