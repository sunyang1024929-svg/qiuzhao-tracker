-- Shared tracker data for every visitor who unlocks the page with 1024.
-- The page lock prevents casual edits only; this table is intentionally shared.

create table if not exists public.shared_tracker_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint shared_tracker_state_singleton check (id = 'main')
);

insert into public.shared_tracker_state (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

create or replace function public.set_shared_tracker_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shared_tracker_state_set_updated_at on public.shared_tracker_state;
create trigger shared_tracker_state_set_updated_at
before update on public.shared_tracker_state
for each row execute function public.set_shared_tracker_updated_at();

alter table public.shared_tracker_state enable row level security;

drop policy if exists "shared tracker readable" on public.shared_tracker_state;
create policy "shared tracker readable"
on public.shared_tracker_state
for select
to anon, authenticated
using (id = 'main');

drop policy if exists "shared tracker writable" on public.shared_tracker_state;
create policy "shared tracker writable"
on public.shared_tracker_state
for update
to anon, authenticated
using (id = 'main')
with check (id = 'main');
