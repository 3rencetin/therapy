-- Terapist: danışan profil özeti (ad/e-posta) tüm seans durumlarında listelenebilsin
-- Önceki politika yalnızca pending | confirmed | completed içeriyordu; iptal satırlarında JOIN boş kalıyordu.

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
      and bs.status in ('pending', 'confirmed', 'completed', 'cancelled')
  )
);

comment on policy "profiles_select_booked_clients" on public.profiles is 'Terapist, kendisiyle rezervasyonu olan danışanın temel profilini (tüm durumlar) görebilir.';
