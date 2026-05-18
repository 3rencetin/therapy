-- 00003 parça 3/3 — therapist_profiles, onboarding, bookings, availability RLS
-- Önkoşul: part1 + part2 bitti. 00002 migration (booked_sessions vb.) uygulanmış olmalı.

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
