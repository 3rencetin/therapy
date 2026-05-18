-- Terapi: seans ↔ profil FK (embed) + terapistin kendi danışanlarının profilini okuması
-- Önkoşul: 00003 profiles, 00002 booked_sessions

alter table public.booked_sessions
drop constraint if exists booked_sessions_user_id_profiles_fkey;

alter table public.booked_sessions
add constraint booked_sessions_user_id_profiles_fkey
foreign key (user_id) references public.profiles (id) on delete cascade;

drop policy if exists "profiles_select_booked_clients" on public.profiles;

create policy "profiles_select_booked_clients"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.booked_sessions bs
    join public.therapist_profiles tp on tp.profile_id = bs.profile_id
    where
      bs.user_id = profiles.id
      and tp.user_id = auth.uid ()
      and bs.status in ('pending', 'confirmed', 'completed')
  )
);

comment on policy "profiles_select_booked_clients" on public.profiles is 'Terapist, kendisiyle seansı olan danışanın temel profilini görebilir.';
