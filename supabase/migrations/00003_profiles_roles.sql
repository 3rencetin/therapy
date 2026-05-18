-- Terapi: kullanıcı profilleri (rol), auth tetikleyici, admin RLS genişletmesi
-- Önkoşul: 00001 (+ isteğe bağlı 00002) uygulanmış olmalı.
--
-- Deadlock (40P01): Bu betiği yalnızca TEK SQL Editor sekmesinde çalıştırın; aynı anda ikinci
-- kez yapıştırıp çalıştırmayın. Yerelde `npm run dev` veya Studio’da açık uzun sorguları kapatın.
-- Hâlâ deadlock olursa `supabase/patches/00003_sql_editor_part1_of_3.sql` … part3 dosyalarını
-- sırayla (arada 2–5 sn) çalıştırın.
--
-- Supabase SQL Editor: tercihen dosyanın TAMAMINI tek seferde çalıştırın.

-- ---------------------------------------------------------------------------
-- Yardımcı: rol kontrolü (SECURITY DEFINER → RLS üzerinde güvenilir okuma)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin(check_uid uuid)
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
      and p.role = 'admin'
  );
$$;

comment on function public.is_admin(uuid) is 'Oturum politikalarında admin doğrulaması; SECURITY DEFINER.';

grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.is_admin(uuid) to service_role;

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

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text not null default '',
  role text not null default 'user'
    check (role in ('user', 'therapist', 'admin', 'moderator')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tablo Supabase şablonundan veya önceki denemeden kaldıysa CREATE atlanır; email eksik olabilir
alter table public.profiles add column if not exists email text;

-- Şablonda eksikse handle_updated_at tetikleyicisi için gerekli
alter table public.profiles add column if not exists created_at timestamptz not null default now();

alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- Şablonda role = public.user_role enum ise therapist değeri eklenebilsin (PG15+)
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
      alter type public.user_role add value if not exists 'therapist';
    exception
      when duplicate_object then null;
    end;
    begin
      alter type public.user_role add value if not exists 'moderator';
    exception
      when duplicate_object then null;
    end;
  end if;
end
$enum$;

create index if not exists profiles_role_idx on public.profiles (role);

create index if not exists profiles_created_idx on public.profiles (created_at desc);

create index if not exists profiles_email_idx on public.profiles (email)
where
  email is not null;

comment on table public.profiles is 'Uygulama rolü ve görünen ad; auth.users ile 1:1.';

drop trigger if exists profiles_updated on public.profiles;

create trigger profiles_updated
before update on public.profiles
for each row
execute procedure public.handle_updated_at();

-- Rol yükseltmeyi yalnızca admin yapabilir (doğrudan SQL veya admin arayüzü)
create or replace function public.profiles_block_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    -- SQL Editor / service rolünde JWT yoktur; bakım amaçlı rol atamasına izin ver
    if auth.uid() is not null and not public.is_admin(auth.uid()) then
      raise exception 'ROL_DEGISIMI_YETKISIZ'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_role_guard on public.profiles;

create trigger profiles_role_guard
before update on public.profiles
for each row
execute procedure public.profiles_block_role_escalation();

-- ---------------------------------------------------------------------------
-- Auth: yeni kullanıcı → profiles
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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

  if role_udt = 'user_role' then
    insert into public.profiles (id, email, full_name, role)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      'user'::public.user_role
    )
    on conflict (id) do nothing;
  else
    insert into public.profiles (id, email, full_name, role)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      'user'
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

-- Mevcut auth kullanıcılarına satır aç (role sütunu text veya user_role enum olabilir)
do $backfill$
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

  if role_udt = 'user_role' then
    insert into public.profiles (id, email, full_name, role)
    select
      u.id,
      u.email,
      coalesce(u.raw_user_meta_data->>'full_name', ''),
      'user'::public.user_role
    from auth.users u
    where
      not exists (
        select 1
        from public.profiles p
        where
          p.id = u.id
      )
    on conflict (id) do nothing;
  else
    insert into public.profiles (id, email, full_name, role)
    select
      u.id,
      u.email,
      coalesce(u.raw_user_meta_data->>'full_name', ''),
      'user'
    from auth.users u
    where
      not exists (
        select 1
        from public.profiles p
        where
          p.id = u.id
      )
    on conflict (id) do nothing;
  end if;
end
$backfill$;

-- ---------------------------------------------------------------------------
-- profiles RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;

create policy "profiles_select_self"
on public.profiles
for select
to authenticated
using (id = auth.uid ());

drop policy if exists "profiles_select_admin" on public.profiles;

create policy "profiles_select_admin"
on public.profiles
for select
to authenticated
using (public.is_staff(auth.uid ()));

drop policy if exists "profiles_update_self" on public.profiles;

create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (id = auth.uid ())
with check (id = auth.uid ());

drop policy if exists "profiles_update_admin" on public.profiles;

create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using (public.is_admin(auth.uid ()))
with check (public.is_admin(auth.uid ()));

drop policy if exists "profiles_insert_own" on public.profiles;

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid ());

-- ---------------------------------------------------------------------------
-- therapist_profiles: kendi satırı + admin
-- ---------------------------------------------------------------------------
drop policy if exists "therapist_profiles_select_own_staff" on public.therapist_profiles;

create policy "therapist_profiles_select_own_staff"
on public.therapist_profiles
for select
to authenticated
using (
  (user_id is not null and user_id = auth.uid ())
  or profile_id = auth.uid ()
);

drop policy if exists "therapist_profiles_update_own_staff" on public.therapist_profiles;

create policy "therapist_profiles_update_own_staff"
on public.therapist_profiles
for update
to authenticated
using (user_id = auth.uid () or profile_id = auth.uid ())
with check (user_id = auth.uid () or profile_id = auth.uid ());

drop policy if exists "therapist_profiles_admin_select_all" on public.therapist_profiles;

create policy "therapist_profiles_admin_select_all"
on public.therapist_profiles
for select
to authenticated
using (public.is_staff(auth.uid ()));

drop policy if exists "therapist_profiles_admin_update" on public.therapist_profiles;

create policy "therapist_profiles_admin_update"
on public.therapist_profiles
for update
to authenticated
using (public.is_admin(auth.uid ()))
with check (public.is_admin(auth.uid ()));

-- ---------------------------------------------------------------------------
-- onboarding_answers: admin okuma
-- ---------------------------------------------------------------------------
drop policy if exists "onboarding_answers_admin_select" on public.onboarding_answers;

create policy "onboarding_answers_admin_select"
on public.onboarding_answers
for select
to authenticated
using (public.is_staff(auth.uid ()));

-- ---------------------------------------------------------------------------
-- booked_sessions: admin okuma
-- ---------------------------------------------------------------------------
drop policy if exists "booked_sessions_admin_select" on public.booked_sessions;

create policy "booked_sessions_admin_select"
on public.booked_sessions
for select
to authenticated
using (public.is_staff(auth.uid ()));

-- ---------------------------------------------------------------------------
-- therapist_availability: admin okuma
-- ---------------------------------------------------------------------------
drop policy if exists "therapist_availability_admin_select" on public.therapist_availability;

create policy "therapist_availability_admin_select"
on public.therapist_availability
for select
to authenticated
using (public.is_staff(auth.uid ()));
