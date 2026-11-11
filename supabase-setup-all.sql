-- آموزش زبان رستا — راه‌اندازی کامل سرور (یک بار اجرا شود)
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

-- زبان دوم — بخش دوم: بستن حفره‌های امنیتی + پیام خصوصی + پشتیبان ابری (یک بار در SQL Editor اجرا شود)

-- ۱) کاربر نتواند مدیر شود، محرومیت یا اخطار خودش را تغییر دهد
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (
    public.is_admin() or (
      id = auth.uid()
      and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid())
      and banned = (select p.banned from public.profiles p where p.id = auth.uid())
      and warnings >= (select p.warnings from public.profiles p where p.id = auth.uid())
    ));

-- ۲) اخطار فقط با تابع امن اضافه شود (بعد از ۳ اخطار، محرومیت خودکار)
create or replace function public.add_warning() returns int language plpgsql security definer set search_path = public as $$
declare w int;
begin
  update public.profiles set warnings = warnings + 1, banned = (warnings + 1 >= 3) where id = auth.uid() returning warnings into w;
  return w;
end $$;
grant execute on function public.add_warning() to authenticated;

-- ۳) پیام «معلم» فقط بازخورد به خود نویسنده باشد؛ پیام «سیستم» فقط از مدیر؛ ویرایش پیام فقط با مدیر
drop policy if exists "messages insert" on public.messages;
create policy "messages insert" on public.messages for insert to authenticated with check (
  user_id = auth.uid()
  and not coalesce((select banned from public.profiles where id = auth.uid()), false)
  and username = (select username from public.profiles where id = auth.uid())
  and (kind = 'user'
       or (kind = 'teacher' and (meta->>'to' = username or meta->>'scenario' = 'true'))
       or (kind = 'system' and public.is_admin())));
drop policy if exists "messages moderate" on public.messages;
create policy "messages moderate" on public.messages for update to authenticated using (public.is_admin());

-- ۴-الف) عکس پروفایل فقط تصویر سالم و کوچک؛ شکلک کوتاه
alter table public.profiles drop constraint if exists profiles_photo_ok;
alter table public.profiles add constraint profiles_photo_ok check (photo is null or (photo ~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$' and length(photo) < 200000));
alter table public.profiles drop constraint if exists profiles_avatar_ok;
alter table public.profiles add constraint profiles_avatar_ok check (char_length(avatar) <= 16 and char_length(display_name) <= 40);

-- ۴) امتیاز هفتگی غیرواقعی پذیرفته نشود (سقف معقول)
alter table public.progress drop constraint if exists progress_sane;
alter table public.progress add constraint progress_sane check (week_xp between 0 and 20000 and minutes_today between 0 and 1440);

create table if not exists public.dms (
  id bigint generated always as identity primary key,
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) <= 2000),
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists dms_pair_idx on public.dms(least(from_user, to_user), greatest(from_user, to_user), created_at desc);
alter table public.dms enable row level security;
drop policy if exists "dms read own" on public.dms;
create policy "dms read own" on public.dms for select to authenticated using (auth.uid() in (from_user, to_user));
drop policy if exists "dms send" on public.dms;
create policy "dms send" on public.dms for insert to authenticated with check (from_user = auth.uid() and not coalesce((select banned from public.profiles where id = auth.uid()), false));
drop policy if exists "dms mark read" on public.dms;
create policy "dms mark read" on public.dms for update to authenticated using (to_user = auth.uid());
do $$ begin alter publication supabase_realtime add table public.dms; exception when others then null; end $$;

-- پشتیبان ابری خودکار (همهٔ پیشرفت، لایتنر، کتاب‌ها) برای انتقال بین دستگاه‌ها
create table if not exists public.backups (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.backups enable row level security;
drop policy if exists "backup own" on public.backups;
create policy "backup own" on public.backups for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ───── ورود با یوزرنیم و رمز: فقط اگر رمز درست باشد ایمیل برمی‌گردد (ایمیل کسی لو نمی‌رود) ─────
create extension if not exists pgcrypto with schema extensions;
create or replace function public.login_email(uname text, pw text) returns text
language plpgsql stable security definer set search_path = public, extensions, auth as $$
declare e text; h text;
begin
  select u.email, u.encrypted_password into e, h from auth.users u join public.profiles p on p.id = u.id where p.username = lower(trim(uname));
  if e is null or h is null or h = '' then perform pg_sleep(0.4); return null; end if;
  if extensions.crypt(pw, h) = h then return e; end if;
  perform pg_sleep(0.4); return null;
end $$;
revoke all on function public.login_email(text, text) from public;
grant execute on function public.login_email(text, text) to anon, authenticated;

-- آیا این یوزرنیم آزاد است؟ (برای فرم ثبت‌نام)
create or replace function public.username_free(uname text) returns boolean language sql stable security definer set search_path = public as
$$ select not exists (select 1 from public.profiles where username = lower(trim(uname))) $$;
grant execute on function public.username_free(text) to anon, authenticated;

-- ───── درس‌های آماده (یک بار توسط مدیر ساخته می‌شوند، همه بدون هوش مصنوعی و آفلاین استفاده می‌کنند) ─────
create table if not exists public.lessons (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.lessons enable row level security;
drop policy if exists "lessons read" on public.lessons;
create policy "lessons read" on public.lessons for select to anon, authenticated using (true);
drop policy if exists "lessons admin write" on public.lessons;
create policy "lessons admin write" on public.lessons for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───── مصرف هوش مصنوعی هر کاربر (فقط سرور واسط می‌نویسد؛ کاربر فقط مصرف خودش را می‌بیند) ─────
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  usd numeric not null default 0,
  calls int not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security;
drop policy if exists "usage read own" on public.ai_usage;
create policy "usage read own" on public.ai_usage for select to authenticated using (user_id = auth.uid() or public.is_admin());
create or replace function public.add_ai_usage(uid uuid, d date, amount numeric) returns void language sql security definer set search_path = public as
$$ insert into public.ai_usage(user_id, day, usd, calls) values (uid, d, amount, 1)
   on conflict (user_id, day) do update set usd = public.ai_usage.usd + excluded.usd, calls = public.ai_usage.calls + 1 $$;
revoke all on function public.add_ai_usage(uuid, date, numeric) from public, anon, authenticated;
