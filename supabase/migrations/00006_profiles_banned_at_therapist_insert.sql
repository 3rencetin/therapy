-- Profil ban alanı + banned_at yalnızca admin tarafından değiştirilebilir.
-- Terapist rolü atanınca uygulamanın oluşturacağı satır için admin INSERT politikası.

alter table public.profiles add column if not exists banned_at timestamptz null;

comment on column public.profiles.banned_at is 'Dolu ise oturum engellenir; yalnızca admin güncelleyebilir.';

create or replace function public.profiles_protect_banned_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.banned_at is distinct from old.banned_at then
    if auth.uid() is null or not public.is_admin(auth.uid()) then
      raise exception 'BANNED_AT_YETKISIZ'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_banned_guard on public.profiles;

create trigger profiles_banned_guard
before update on public.profiles
for each row
execute procedure public.profiles_protect_banned_at();

drop policy if exists "therapist_profiles_admin_insert" on public.therapist_profiles;

create policy "therapist_profiles_admin_insert"
on public.therapist_profiles
for insert
to authenticated
with check (public.is_admin(auth.uid()));
