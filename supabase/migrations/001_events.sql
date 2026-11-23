-- Events table with server-side validation and Row Level Security.
-- Run in the Supabase SQL editor (or via the Supabase CLI) once per project.

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null,
  description text not null default '',
  date        date not null,
  start_time  time not null,
  end_time    time not null,
  location    text not null default '',
  category    text not null default 'other',
  status      text not null default 'upcoming',
  created_at  timestamptz not null default now(),

  constraint events_title_len     check (char_length(btrim(title)) between 1 and 120),
  constraint events_desc_len      check (char_length(description) <= 2000),
  constraint events_location_len  check (char_length(location) <= 200),
  constraint events_time_order    check (end_time > start_time),
  constraint events_category_enum check (category in ('work','personal','meeting','social','health','other')),
  constraint events_status_enum   check (status in ('upcoming','completed','cancelled'))
);

create index if not exists events_user_date_idx on public.events (user_id, date, start_time);

alter table public.events enable row level security;

-- Each policy is scoped to the owner. user_id defaults to auth.uid() and cannot be reassigned.
drop policy if exists "events_select_own" on public.events;
create policy "events_select_own" on public.events
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "events_insert_own" on public.events;
create policy "events_insert_own" on public.events
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "events_update_own" on public.events;
create policy "events_update_own" on public.events
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "events_delete_own" on public.events;
create policy "events_delete_own" on public.events
  for delete to authenticated using (user_id = auth.uid());

-- Anonymous visitors get no access at all.
revoke all on public.events from anon;
