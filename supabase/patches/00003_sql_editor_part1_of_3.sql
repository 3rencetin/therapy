-- 00003 parça 1/3 — şema, fonksiyonlar, tetikleyiciler, auth.users trigger, backfill
-- Önkoşul: 00001 (handle_updated_at dahil). Deadlock önlemi: part2’den ÖNCE bu sorgunun
-- tamamen bitmesini bekleyin; başka sekmede aynı migration çalışmasın.
-- Sonra part2, ardından part3 çalıştırın.

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

alter table public.profiles add column if not exists email text;

alter table public.profiles add column if not exists created_at timestamptz not null default now();

alter table public.profiles add column if not exists updated_at timestamptz not null default now();

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

create or replace function public.profiles_block_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
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
