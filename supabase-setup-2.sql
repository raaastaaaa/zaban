-- زبان دوم — بخش دوم: پیام خصوصی بین کاربران (یک بار در SQL Editor اجرا شود)
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
