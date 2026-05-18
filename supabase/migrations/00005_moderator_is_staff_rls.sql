-- Moderatör rolü + is_staff(); okuma politikalarında moderatörlere izin (yazma yine admin'de).
-- Önkoşul: 00003 uygulanmış olmalı.
-- Not: user_role enum'unda 'moderator' yoksa is_staff içinde ::text karşılaştırması kullanılır;
-- aksi halde CREATE FUNCTION sırasında literal enum'a çevrilir ve 22P02 verir.

do $enum$
begin
  if exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where
      n.nspname = 'public'
      and t.typname = 'user_role'
  ) then
    begin
      alter type public.user_role add value if not exists 'moderator';
    exception
      when duplicate_object then null;
    end;
  end if;
end
$enum$;

create or replace function public.is_staff(check_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where
      p.id = check_uid
      and p.role::text in ('admin', 'moderator')
  );
$$;

comment on function public.is_staff(uuid) is 'Admin veya moderatör; RLS okuma politikaları. SECURITY DEFINER.';

grant execute on function public.is_staff(uuid) to authenticated;
grant execute on function public.is_staff(uuid) to service_role;

do $chk$
declare
  role_udt text;
begin
  select c.udt_name
  into role_udt
  from information_schema.columns c
  where
    c.table_schema = 'public'
    and c.table_name = 'profiles'
    and c.column_name = 'role';

  if role_udt is null or role_udt = 'user_role' then
    return;
  end if;

  alter table public.profiles drop constraint if exists profiles_role_check;

  alter table public.profiles add constraint profiles_role_check check (
    role in ('user', 'therapist', 'admin', 'moderator')
  );
end
$chk$;

drop policy if exists "profiles_select_admin" on public.profiles;

create policy "profiles_select_admin"
on public.profiles
for select
to authenticated
using (public.is_staff(auth.uid ()));

drop policy if exists "therapist_profiles_admin_select_all" on public.therapist_profiles;

create policy "therapist_profiles_admin_select_all"
on public.therapist_profiles
for select
to authenticated
using (public.is_staff(auth.uid ()));

drop policy if exists "onboarding_answers_admin_select" on public.onboarding_answers;

create policy "onboarding_answers_admin_select"
on public.onboarding_answers
for select
to authenticated
using (public.is_staff(auth.uid ()));

drop policy if exists "booked_sessions_admin_select" on public.booked_sessions;

create policy "booked_sessions_admin_select"
on public.booked_sessions
for select
to authenticated
using (public.is_staff(auth.uid ()));

drop policy if exists "therapist_availability_admin_select" on public.therapist_availability;

create policy "therapist_availability_admin_select"
on public.therapist_availability
for select
to authenticated
using (public.is_staff(auth.uid ()));
