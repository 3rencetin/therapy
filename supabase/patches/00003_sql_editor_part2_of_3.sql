-- 00003 parça 2/3 — yalnızca public.profiles RLS
-- Önkoşul: part1 başarıyla bitti. Part3’ten önce bunu tek çalıştırın.

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
