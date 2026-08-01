-- Blackberry Space — database schema
-- Run this in the Supabase SQL Editor (or via `supabase db push`) to provision
-- the tables, relationships, Row Level Security policies, and the profile
-- auto-creation trigger that the app depends on.

-- ---------------------------------------------------------------------------
-- profiles: one row per authenticated user, mirrored from auth.users.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text unique,
  full_name   text,
  avatar_url  text,
  updated_at  timestamptz not null default now(),
  thorium     integer not null default 0,
  "isAdmin"   boolean not null default false,
  last_login_at timestamptz
);

-- ---------------------------------------------------------------------------
-- snippets: code snippets shared by users.
-- user_id references profiles(id) so PostgREST can embed `profiles(...)`.
-- ---------------------------------------------------------------------------
create table if not exists public.snippets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  title       text not null,
  description text,
  language    text not null,
  code        text not null,
  tags        text[] not null default '{}',
  credits     text,
  created_at  timestamptz not null default now(),
  likes_count integer not null default 0,
  forkable    boolean not null default true
);

create index if not exists snippets_user_id_idx    on public.snippets (user_id);
create index if not exists snippets_created_at_idx on public.snippets (created_at desc);

-- ---------------------------------------------------------------------------
-- likes: join table between users and snippets.
-- ---------------------------------------------------------------------------
create table if not exists public.likes (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  snippet_id  uuid not null references public.snippets (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, snippet_id)
);

create index if not exists likes_user_id_idx    on public.likes (user_id);
create index if not exists likes_snippet_id_idx on public.likes (snippet_id);

-- ---------------------------------------------------------------------------
-- system_settings: global application settings.
-- ---------------------------------------------------------------------------
create table if not exists public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

insert into public.system_settings (key, value)
values ('maintenance_mode', 'false'::jsonb)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles  enable row level security;
alter table public.snippets  enable row level security;
alter table public.likes     enable row level security;
alter table public.system_settings enable row level security;

-- profiles: world-readable, but a user may only modify their own row.
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- snippets: world-readable, but a user may only write their own snippets.
create policy "Snippets are viewable by everyone"
  on public.snippets for select
  using (true);

create policy "Users can insert own snippets"
  on public.snippets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own snippets"
  on public.snippets for update
  using (auth.uid() = user_id);

create policy "Users can delete own snippets"
  on public.snippets for delete
  using (auth.uid() = user_id);

-- likes: world-readable, users can manage their own likes.
create policy "Likes are viewable by everyone"
  on public.likes for select
  using (true);

create policy "Users can insert own likes"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own likes"
  on public.likes for delete
  using (auth.uid() = user_id);

-- system_settings: public read, admin update.
create policy "Allow public read access" on public.system_settings
    for select using (true);

create policy "Allow admins to update system_settings" on public.system_settings
    for update
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid() and profiles."isAdmin" = true
        )
    );

-- ---------------------------------------------------------------------------
-- Functions & Triggers
-- ---------------------------------------------------------------------------

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, username, thorium)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'user_name',
    100
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prevent users from escalating privileges by updating their own profile
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Only restrict updates originating from authenticated user sessions (API clients)
  if auth.role() = 'authenticated' then
    -- Prevent changing isAdmin
    new."isAdmin" = old."isAdmin";
    -- Prevent arbitrary thorium modification from the client
    new.thorium = old.thorium;
  end if;
  return new;
end;
$$;

create trigger protect_profile_columns_trigger
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- Sync likes_count on snippets table.
create or replace function public.sync_likes_count()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $$
begin
    if TG_OP = 'INSERT' then
        update public.snippets set likes_count = likes_count + 1 where id = NEW.snippet_id;
    elsif TG_OP = 'DELETE' then
        update public.snippets set likes_count = greatest(likes_count - 1, 0) where id = OLD.snippet_id;
    end if;
    return null;
end;
$$;

create trigger on_likes_change
    after insert or delete on public.likes
    for each row execute function public.sync_likes_count();
