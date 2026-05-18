-- Terapi: terapist müsaitlik satırları + kullanıcı rezervasyonları
-- ÖNEMLİ: Supabase SQL Editor'de bu dosyanın TAMAMINI çalıştırın (yalnızca indeks satırı değil).
-- Önkoşul: public.therapist_profiles tablosu (00001) mevcut olmalı.

-- Önce bağımlı tablo, sonra üst tablo silinir:
-- drop table if exists public.booked_sessions cascade;
-- drop table if exists public.therapist_availability cascade;

-- ---------------------------------------------------------------------------
-- therapist_availability
-- ---------------------------------------------------------------------------
create table if not exists public.therapist_availability (
  id uuid primary key default gen_random_uuid (),
  profile_id uuid not null references public.therapist_profiles (profile_id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint therapist_availability_time_chk check (ends_at > starts_at)
);

create index if not exists therapist_availability_profile_starts_idx on public.therapist_availability (profile_id, starts_at);

create unique index if not exists therapist_availability_profile_start_utc_key on public.therapist_availability (profile_id, starts_at);

-- Kısmi indekste now() kullanılamaz (42P17). starts_at aralık sorguları bu indeksi kullanır.
create index if not exists therapist_availability_starts_at_idx on public.therapist_availability (starts_at);

comment on table public.therapist_availability is 'Rezervasyona açılabilen müsait zaman dilimleri; doluluk booked_sessions ile sorgulanır.';

-- ---------------------------------------------------------------------------
-- booked_sessions
-- ---------------------------------------------------------------------------
create table if not exists public.booked_sessions (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  profile_id uuid not null references public.therapist_profiles (profile_id),
  availability_id uuid not null references public.therapist_availability (id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'refunded')),
  notes text null,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now (),
  constraint booked_sessions_time_chk check (ends_at > starts_at)
);

create unique index if not exists booked_sessions_active_availability_idx on public.booked_sessions (availability_id)
where
  status in ('pending', 'confirmed');

create index if not exists booked_sessions_user_starts_idx on public.booked_sessions (user_id, starts_at);

create index if not exists booked_sessions_profile_starts_idx on public.booked_sessions (profile_id, starts_at);

create index if not exists booked_sessions_status_idx on public.booked_sessions (status);

drop trigger if exists booked_sessions_updated on public.booked_sessions;

create trigger booked_sessions_updated
before update on public.booked_sessions
for each row
execute procedure public.handle_updated_at();

comment on table public.booked_sessions is 'Kullanıcı-terapist seans rezervasyonları; RLS ile sahip ve eşleşen terapist okuyabilir.';

comment on column public.booked_sessions.payment_status is 'Ödeme entegrasyonu öncesi yer tutucu (unpaid | paid | refunded).';

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.therapist_availability enable row level security;

alter table public.booked_sessions enable row level security;

drop policy if exists "therapist_availability_select_verified_future" on public.therapist_availability;

create policy "therapist_availability_select_verified_future"
on public.therapist_availability
for select
to authenticated
using (
  exists (
    select 1
    from public.therapist_profiles t
    where
      t.profile_id = therapist_availability.profile_id
      and t.verified = true
      and t.active = true
  )
  and starts_at > now()
);

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
      and t.user_id = auth.uid ()
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
      and t.user_id = auth.uid ()
  )
)
with check (
  exists (
    select 1
    from public.therapist_profiles t
    where
      t.profile_id = therapist_availability.profile_id
      and t.user_id = auth.uid ()
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
      and t.user_id = auth.uid ()
  )
);

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
      and t.user_id = auth.uid ()
  )
);

drop policy if exists "booked_sessions_insert_self" on public.booked_sessions;

create policy "booked_sessions_insert_self"
on public.booked_sessions
for insert
to authenticated
with check (user_id = auth.uid ());

drop policy if exists "booked_sessions_update_self" on public.booked_sessions;

create policy "booked_sessions_update_self"
on public.booked_sessions
for update
to authenticated
using (user_id = auth.uid ())
with check (user_id = auth.uid ());
