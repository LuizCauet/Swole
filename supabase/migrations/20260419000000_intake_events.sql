-- Add intake_events table for per-event logging
create table public.intake_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tracking_date date not null,
  calories int not null default 0,
  protein int not null default 0,
  carbs int not null default 0,
  fat int not null default 0,
  description text,
  created_at timestamptz not null default now()
);

-- Index for performance
create index idx_intake_events_user_date on public.intake_events(user_id, tracking_date);

-- Enable RLS
alter table public.intake_events enable row level security;

-- RLS policies
create policy "Users can view own intake events"
  on public.intake_events for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own intake events"
  on public.intake_events for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own intake events"
  on public.intake_events for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own intake events"
  on public.intake_events for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Add show_intake_description setting to profiles
alter table public.profiles
  add column show_intake_description boolean not null default false;
