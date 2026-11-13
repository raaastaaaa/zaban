-- حریم خصوصی: «آخرین بازدید» و زمان فعالیت هیچ کاربری برای دیگران قابل خواندن نیست؛ فقط مدیر.
-- رقابت فقط بر اساس زمان مطالعهٔ هر زبان (lang_stats).

alter table public.progress add column if not exists lang_stats jsonb not null default '{}'::jsonb;

-- profiles: همهٔ ستون‌ها جز last_seen
revoke select on public.profiles from anon, authenticated;
do $$ declare c text; begin
  for c in select column_name from information_schema.columns
           where table_schema = 'public' and table_name = 'profiles' and column_name <> 'last_seen' loop
    execute format('grant select (%I) on public.profiles to authenticated', c);
  end loop;
end $$;

-- progress: بدون updated_at (زمان آخرین همگام‌سازی) و بدون آمار مصرف هوش مصنوعی
revoke select on public.progress from anon, authenticated;
do $$ declare c text; begin
  for c in select column_name from information_schema.columns
           where table_schema = 'public' and table_name = 'progress' and column_name not in ('updated_at', 'ai_chat', 'ai_voice') loop
    execute format('grant select (%I) on public.progress to authenticated', c);
  end loop;
end $$;

-- فقط مدیر: فهرست کامل کاربران با آخرین بازدید
create or replace function public.admin_users() returns setof jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(p) || jsonb_build_object('progress', to_jsonb(g))
  from public.profiles p left join public.progress g on g.user_id = p.id
  where public.is_admin()
  order by p.last_seen desc
  limit 1000
$$;
revoke all on function public.admin_users() from public, anon;
grant execute on function public.admin_users() to authenticated;

create or replace function public.admin_last_seen(uname text) returns timestamptz
language sql stable security definer set search_path = public as $$
  select last_seen from public.profiles where username = uname and public.is_admin()
$$;
revoke all on function public.admin_last_seen(text) from public, anon;
grant execute on function public.admin_last_seen(text) to authenticated;

notify pgrst, 'reload schema';
