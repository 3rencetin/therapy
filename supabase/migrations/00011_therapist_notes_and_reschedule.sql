-- Terapist özel hazırlık notları (danışan görmez) + seans yeniden planlama talepleri + RPC ile güvenli onay

-- ---------------------------------------------------------------------------
-- booked_session_therapist_private_notes
-- ---------------------------------------------------------------------------
create table if not exists public.booked_session_therapist_private_notes (
  session_id uuid primary key references public.booked_sessions (id) on delete cascade,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now (),
  constraint booked_session_therapist_notes_body_len check (char_length(body) <= 50000)
);

drop trigger if exists booked_session_therapist_private_notes_updated on public.booked_session_therapist_private_notes;

create trigger booked_session_therapist_private_notes_updated
before update on public.booked_session_therapist_private_notes
for each row
execute procedure public.handle_updated_at ();

comment on table public.booked_session_therapist_private_notes is 'Terapistin seansa özel hazırlık notları; danışan erişemez.';

alter table public.booked_session_therapist_private_notes enable row level security;

drop policy if exists "therapist_private_notes_select_owner" on public.booked_session_therapist_private_notes;

create policy "therapist_private_notes_select_owner"
on public.booked_session_therapist_private_notes
for select
to authenticated
using (
  exists (
    select 1
    from public.booked_sessions bs
    join public.therapist_profiles t on t.profile_id = bs.profile_id
    where
      bs.id = booked_session_therapist_private_notes.session_id
      and t.user_id = auth.uid ()
  )
);

drop policy if exists "therapist_private_notes_insert_owner" on public.booked_session_therapist_private_notes;

create policy "therapist_private_notes_insert_owner"
on public.booked_session_therapist_private_notes
for insert
to authenticated
with check (
  exists (
    select 1
    from public.booked_sessions bs
    join public.therapist_profiles t on t.profile_id = bs.profile_id
    where
      bs.id = session_id
      and t.user_id = auth.uid ()
  )
);

drop policy if exists "therapist_private_notes_update_owner" on public.booked_session_therapist_private_notes;

create policy "therapist_private_notes_update_owner"
on public.booked_session_therapist_private_notes
for update
to authenticated
using (
  exists (
    select 1
    from public.booked_sessions bs
    join public.therapist_profiles t on t.profile_id = bs.profile_id
    where
      bs.id = booked_session_therapist_private_notes.session_id
      and t.user_id = auth.uid ()
  )
)
with check (
  exists (
    select 1
    from public.booked_sessions bs
    join public.therapist_profiles t on t.profile_id = bs.profile_id
    where
      bs.id = booked_session_therapist_private_notes.session_id
      and t.user_id = auth.uid ()
  )
);

drop policy if exists "therapist_private_notes_delete_owner" on public.booked_session_therapist_private_notes;

create policy "therapist_private_notes_delete_owner"
on public.booked_session_therapist_private_notes
for delete
to authenticated
using (
  exists (
    select 1
    from public.booked_sessions bs
    join public.therapist_profiles t on t.profile_id = bs.profile_id
    where
      bs.id = booked_session_therapist_private_notes.session_id
      and t.user_id = auth.uid ()
  )
);

drop policy if exists "therapist_private_notes_admin_select" on public.booked_session_therapist_private_notes;

create policy "therapist_private_notes_admin_select"
on public.booked_session_therapist_private_notes
for select
to authenticated
using (public.is_staff (auth.uid ()));

-- ---------------------------------------------------------------------------
-- session_reschedule_requests
-- ---------------------------------------------------------------------------
create table if not exists public.session_reschedule_requests (
  id uuid primary key default gen_random_uuid (),
  session_id uuid not null references public.booked_sessions (id) on delete cascade,
  proposed_by uuid not null references auth.users (id) on delete cascade,
  proposed_availability_id uuid not null references public.therapist_availability (id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at timestamptz not null default now (),
  resolved_at timestamptz null
);

create unique index if not exists session_reschedule_one_pending_per_session_idx
  on public.session_reschedule_requests (session_id)
  where
    status = 'pending';

create index if not exists session_reschedule_session_idx on public.session_reschedule_requests (session_id);

comment on table public.session_reschedule_requests is 'Seans için yeni zaman önerisi; karşı taraf RPC ile onaylar/reddeder.';

alter table public.session_reschedule_requests enable row level security;

drop policy if exists "session_reschedule_select_participants" on public.session_reschedule_requests;

create policy "session_reschedule_select_participants"
on public.session_reschedule_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.booked_sessions bs
    where
      bs.id = session_reschedule_requests.session_id
      and (
        bs.user_id = auth.uid ()
        or exists (
          select 1
          from public.therapist_profiles t
          where
            t.profile_id = bs.profile_id
            and t.user_id = auth.uid ()
        )
      )
  )
);

drop policy if exists "session_reschedule_insert_participant" on public.session_reschedule_requests;

create policy "session_reschedule_insert_participant"
on public.session_reschedule_requests
for insert
to authenticated
with check (
  proposed_by = auth.uid ()
  and exists (
    select 1
    from public.booked_sessions bs
    join public.therapist_availability ta on ta.id = proposed_availability_id
    where
      bs.id = session_id
      and ta.profile_id = bs.profile_id
      and bs.status in ('pending', 'confirmed')
      and (
        bs.user_id = auth.uid ()
        or exists (
          select 1
          from public.therapist_profiles t
          where
            t.profile_id = bs.profile_id
            and t.user_id = auth.uid ()
        )
      )
  )
);

drop policy if exists "session_reschedule_update_proposer_cancel" on public.session_reschedule_requests;

create policy "session_reschedule_update_proposer_cancel"
on public.session_reschedule_requests
for update
to authenticated
using (proposed_by = auth.uid () and status = 'pending')
with check (status = 'cancelled' and proposed_by = auth.uid ());

drop policy if exists "session_reschedule_admin_select" on public.session_reschedule_requests;

create policy "session_reschedule_admin_select"
on public.session_reschedule_requests
for select
to authenticated
using (public.is_staff (auth.uid ()));

-- ---------------------------------------------------------------------------
-- RPC: onay / ret (RLS dışı atomik güncelleme)
-- ---------------------------------------------------------------------------
create or replace function public.resolve_session_reschedule_request(p_request_id uuid, p_accept boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid ();
  r public.session_reschedule_requests%rowtype;
  bs public.booked_sessions%rowtype;
  slot public.therapist_availability%rowtype;
begin
  if v_actor is null then
    return jsonb_build_object('ok', false, 'error', 'auth');
  end if;

  select * into r from public.session_reschedule_requests where id = p_request_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if r.status is distinct from 'pending' then
    return jsonb_build_object('ok', false, 'error', 'not_pending');
  end if;

  if v_actor = r.proposed_by then
    return jsonb_build_object('ok', false, 'error', 'cannot_resolve_own');
  end if;

  select * into bs from public.booked_sessions where id = r.session_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'session_missing');
  end if;

  if
    v_actor is distinct from bs.user_id
    and not exists (
      select 1
      from public.therapist_profiles t
      where
        t.profile_id = bs.profile_id
        and t.user_id = v_actor
    )
  then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  if not p_accept then
    update public.session_reschedule_requests
    set
      status = 'rejected',
      resolved_at = now()
    where
      id = p_request_id;
    return jsonb_build_object('ok', true, 'status', 'rejected');
  end if;

  select * into slot from public.therapist_availability where id = r.proposed_availability_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'slot_gone');
  end if;

  if slot.profile_id is distinct from bs.profile_id then
    return jsonb_build_object('ok', false, 'error', 'slot_mismatch');
  end if;

  if slot.starts_at <= now() then
    return jsonb_build_object('ok', false, 'error', 'slot_past');
  end if;

  if
    exists (
      select 1
      from public.booked_sessions b2
      where
        b2.availability_id = r.proposed_availability_id
        and b2.id is distinct from bs.id
        and b2.status in ('pending', 'confirmed')
    )
  then
    return jsonb_build_object('ok', false, 'error', 'slot_taken');
  end if;

  update public.booked_sessions
  set
    availability_id = r.proposed_availability_id,
    starts_at = slot.starts_at,
    ends_at = slot.ends_at,
    updated_at = now()
  where
    id = bs.id;

  update public.session_reschedule_requests
  set
    status = 'cancelled',
    resolved_at = now()
  where
    session_id = bs.id
    and id is distinct from p_request_id
    and status = 'pending';

  update public.session_reschedule_requests
  set
    status = 'accepted',
    resolved_at = now()
  where
    id = p_request_id;

  return jsonb_build_object('ok', true, 'status', 'accepted');
end;
$$;

comment on function public.resolve_session_reschedule_request (uuid, boolean) is 'Seans yeniden planlama: karşı taraf onaylar veya reddeder.';

revoke all on function public.resolve_session_reschedule_request (uuid, boolean) from public;
grant execute on function public.resolve_session_reschedule_request (uuid, boolean) to authenticated;
grant execute on function public.resolve_session_reschedule_request (uuid, boolean) to service_role;
