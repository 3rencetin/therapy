-- Görüntülü görüşme oda süresi: takvim bitişi + isteğe bağlı terapist uzatımı
-- RLS: terapist genel UPDATE politikası yok; uzatım yalnızca SECURITY DEFINER RPC ile.

alter table public.booked_sessions
add column if not exists video_call_extended_until timestamptz null;

comment on column public.booked_sessions.video_call_extended_until is
  'Terapistin uzattığı görüşme bitişi (null ise video için sadece ends_at kullanılır).';

create or replace function public.extend_booked_session_video (p_session_id uuid, p_minutes int)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bs public.booked_sessions%rowtype;
  v_base timestamptz;
  v_new_end timestamptz;
begin
  if p_minutes is null or p_minutes < 1 or p_minutes > 120 then
    raise exception 'invalid_minutes' using errcode = 'P0001';
  end if;

  select * into v_bs
  from public.booked_sessions
  where id = p_session_id
  for update;

  if not found then
    raise exception 'not_found' using errcode = 'P0001';
  end if;

  if v_bs.status not in ('pending', 'confirmed') then
    raise exception 'bad_status' using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.therapist_profiles t
    where t.profile_id = v_bs.profile_id
      and t.user_id is not null
      and t.user_id = auth.uid ()
  ) then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;

  v_base := greatest(
    v_bs.ends_at,
    coalesce(v_bs.video_call_extended_until, v_bs.ends_at),
    now()
  );
  v_new_end := v_base + (p_minutes * interval '1 minute');

  update public.booked_sessions
  set
    video_call_extended_until = v_new_end,
    updated_at = now()
  where id = p_session_id;

  return v_new_end;
end;
$$;

grant execute on function public.extend_booked_session_video (uuid, int) to authenticated;

comment on function public.extend_booked_session_video (uuid, int) is
  'Yalnızca seansın terapisti (therapist_profiles.user_id) görüşmeyi dakika bazında uzatır.';
