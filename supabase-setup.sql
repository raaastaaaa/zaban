-- زبان دوم — راه‌اندازی بخش آنلاین (یک بار در SQL Editor اجرا شود)

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null,
  avatar text default '🙂',
  photo text,
  is_admin boolean not null default false,
  banned boolean not null default false,
  warnings int not null default 0,
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

create table if not exists public.progress (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  xp int not null default 0,
  week_xp int not null default 0,
  streak int not null default 0,
  mastered int not null default 0,
  learned int not null default 0,
  current_unit text,
  minutes_total int not null default 0,
  minutes_today int not null default 0,
  minutes_week int not null default 0,
  ai_chat int not null default 0,
  ai_voice int not null default 0,
  level text,
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  room text not null,
  user_id uuid references public.profiles(id) on delete set null,
  username text,
  display_name text,
  kind text not null default 'user' check (kind in ('user','teacher','system')),
  body text not null check (char_length(body) <= 2000),
  meta jsonb,
  deleted boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists messages_room_idx on public.messages(room, created_at desc);

create table if not exists public.notices (
  id bigint generated always as identity primary key,
  to_user uuid references public.profiles(id) on delete cascade, -- خالی = همه
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select coalesce((select is_admin from public.profiles where id = auth.uid()), false) $$;

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.messages enable row level security;
alter table public.notices enable row level security;

drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated using (true);
drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles for insert to authenticated with check (id = auth.uid() and is_admin = false);
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (public.is_admin() or (id = auth.uid() and is_admin = false));

drop policy if exists "progress read" on public.progress;
create policy "progress read" on public.progress for select to authenticated using (true);
drop policy if exists "progress write own" on public.progress;
create policy "progress write own" on public.progress for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "progress update own" on public.progress;
create policy "progress update own" on public.progress for update to authenticated using (user_id = auth.uid());

drop policy if exists "messages read" on public.messages;
create policy "messages read" on public.messages for select to authenticated using (true);
drop policy if exists "messages insert" on public.messages;
create policy "messages insert" on public.messages for insert to authenticated with check (
  user_id = auth.uid() and not coalesce((select banned from public.profiles where id = auth.uid()), false));
drop policy if exists "messages moderate" on public.messages;
create policy "messages moderate" on public.messages for update to authenticated using (public.is_admin() or user_id = auth.uid());

drop policy if exists "notices read" on public.notices;
create policy "notices read" on public.notices for select to authenticated using (to_user is null or to_user = auth.uid() or public.is_admin());
drop policy if exists "notices admin" on public.notices;
create policy "notices admin" on public.notices for insert to authenticated with check (public.is_admin());

-- پیام‌های زنده
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when others then null; end $$;
