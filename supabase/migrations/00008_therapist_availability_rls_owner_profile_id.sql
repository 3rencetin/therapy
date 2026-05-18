-- Terapist–kayıt eşlemesi: user_id VEYA profile_id = auth.uid() (müsaitlik CRUD + seans okuma)

drop policy if exists "therapist_availability_insert_own" on public.therapist_availability;

create policy "therapist_availability_insert_own"
on public.therapist_availability
for insert
to authenticated
with check (
  exists (
    select 1
    from public.therapist_profiles t
    where
      t.profile_id = therapist_availability.profile_id
      and (
        t.user_id = auth.uid ()
        or t.profile_id = auth.uid ()
      )
  )
);

drop policy if exists "therapist_availability_update_own" on public.therapist_availability;

create policy "therapist_availability_update_own"
on public.therapist_availability
for update
to authenticated
using (
  exists (
    select 1
    from public.therapist_profiles t
    where
      t.profile_id = therapist_availability.profile_id
      and (
        t.user_id = auth.uid ()
        or t.profile_id = auth.uid ()
      )
  )
)
with check (
  exists (
    select 1
    from public.therapist_profiles t
    where
      t.profile_id = therapist_availability.profile_id
      and (
        t.user_id = auth.uid ()
        or t.profile_id = auth.uid ()
      )
  )
);

drop policy if exists "therapist_availability_delete_own" on public.therapist_availability;

create policy "therapist_availability_delete_own"
on public.therapist_availability
for delete
to authenticated
using (
  exists (
    select 1
    from public.therapist_profiles t
    where
      t.profile_id = therapist_availability.profile_id
      and (
        t.user_id = auth.uid ()
        or t.profile_id = auth.uid ()
      )
  )
);

-- booked_sessions: terapist okuması user_id veya profile_id üzerinden
drop policy if exists "booked_sessions_select_participants" on public.booked_sessions;

create policy "booked_sessions_select_participants"
on public.booked_sessions
for select
to authenticated
using (
  user_id = auth.uid ()
  or exists (
    select 1
    from public.therapist_profiles t
    where
      t.profile_id = booked_sessions.profile_id
      and (
        t.user_id = auth.uid ()
        or t.profile_id = auth.uid ()
      )
  )
);
