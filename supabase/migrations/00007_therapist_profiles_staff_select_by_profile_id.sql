-- Terapist kendi dizin satırını görebilmeli: profile_id = auth.uid() (yeni eşleme modeli)
-- veya user_id = auth.uid(). Yalnızca verified kayıtların listelenmesi ayrı politikada kalır.

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
