-- İsteğe bağlı: örnek müsaitlik aralıkları (SQL Editor / postgres).
-- Önkoşul: 00001 + 00002 migration'ları ve demo terapist seed'i uygulanmış olmalı.
-- Güvenli tekrar: aynı (profile_id, starts_at) için do nothing.

-- Dr. Selin Aydın
insert into public.therapist_availability (profile_id, starts_at, ends_at)
select
  p.profile_id,
  base + o.off,
  base + o.off + interval '50 minutes'
from public.therapist_profiles p
cross join lateral (select now() as base) as r
cross join lateral (
  values
    (interval '30 hours'),
    (interval '54 hours'),
    (interval '78 hours'),
    (interval '126 hours')
) as o(off)
where
  p.full_name = 'Dr. Selin Aydın'
  and p.verified = true
  and p.active = true
on conflict (profile_id, starts_at) do nothing;

-- Uzm. Psk. Emre Kaya
insert into public.therapist_availability (profile_id, starts_at, ends_at)
select
  p.profile_id,
  base + o.off,
  base + o.off + interval '50 minutes'
from public.therapist_profiles p
cross join lateral (select now() as base) as r
cross join lateral (
  values
    (interval '33 hours'),
    (interval '57 hours'),
    (interval '81 hours'),
    (interval '135 hours')
) as o(off)
where
  p.full_name = 'Uzm. Psk. Emre Kaya'
  and p.verified = true
  and p.active = true
on conflict (profile_id, starts_at) do nothing;

-- Dr. Maya Öztürk
insert into public.therapist_availability (profile_id, starts_at, ends_at)
select
  p.profile_id,
  base + o.off,
  base + o.off + interval '50 minutes'
from public.therapist_profiles p
cross join lateral (select now() as base) as r
cross join lateral (
  values
    (interval '27 hours'),
    (interval '63 hours'),
    (interval '90 hours'),
    (interval '117 hours')
) as o(off)
where
  p.full_name = 'Dr. Maya Öztürk'
  and p.verified = true
  and p.active = true
on conflict (profile_id, starts_at) do nothing;

-- Psk. Dan. Arda Demir
insert into public.therapist_availability (profile_id, starts_at, ends_at)
select
  p.profile_id,
  base + o.off,
  base + o.off + interval '50 minutes'
from public.therapist_profiles p
cross join lateral (select now() as base) as r
cross join lateral (
  values
    (interval '36 hours'),
    (interval '60 hours'),
    (interval '99 hours'),
    (interval '144 hours')
) as o(off)
where
  p.full_name = 'Psk. Dan. Arda Demir'
  and p.verified = true
  and p.active = true
on conflict (profile_id, starts_at) do nothing;

-- Dr. Derin Yılmaz
insert into public.therapist_availability (profile_id, starts_at, ends_at)
select
  p.profile_id,
  base + o.off,
  base + o.off + interval '50 minutes'
from public.therapist_profiles p
cross join lateral (select now() as base) as r
cross join lateral (
  values
    (interval '42 hours'),
    (interval '66 hours'),
    (interval '93 hours'),
    (interval '120 hours')
) as o(off)
where
  p.full_name = 'Dr. Derin Yılmaz'
  and p.verified = true
  and p.active = true
on conflict (profile_id, starts_at) do nothing;
