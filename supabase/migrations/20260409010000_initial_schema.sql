-- Swole: Initial database schema
-- Profiles table (auto-created on user signup)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  calories_goal int,
  protein_goal int,
  carb_goal int,
  fat_goal int,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Daily logs table (one row per user per tracking day)
create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tracking_date date not null,
  calories int not null default 0,
  protein int not null default 0,
  carbs int not null default 0,
  fat int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tracking_date)
);

-- Indexes for performance
create index idx_daily_logs_user_id on public.daily_logs(user_id);
create index idx_daily_logs_user_date on public.daily_logs(user_id, tracking_date);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;

-- Profiles RLS policies
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- Daily logs RLS policies
create policy "Users can view own logs"
  on public.daily_logs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own logs"
  on public.daily_logs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own logs"
  on public.daily_logs for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger daily_logs_updated_at
  before update on public.daily_logs
  for each row execute function public.update_updated_at();
