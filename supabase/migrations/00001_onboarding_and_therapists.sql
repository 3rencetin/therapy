-- Terapi: onboarding + therapist directory
-- Supabase Dashboard → SQL Editor → New query → tüm dosyayı çalıştırın.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- onboarding_answers: kullanıcı başına tek satır (upsert)
-- ---------------------------------------------------------------------------
create table public.onboarding_answers (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  emotions text[] not null default '{}',
  support_type text,
  therapist_gender_preference text,
  preferred_languages text[] not null default '{}',
  availability_preferences text[] not null default '{}',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint onboarding_answers_user_id_key unique (user_id),
  constraint therapist_gender_pref_values check (
    therapist_gender_preference is null
    or therapist_gender_preference in ('male', 'female', 'any')
  )
);

create index onboarding_answers_user_id_idx on public.onboarding_answers (user_id);

comment on table public.onboarding_answers is 'Kullanıcı eşleştirme sihirbazı yanıtları (RLS: yalnızca sahibi).';

-- ---------------------------------------------------------------------------
-- therapist_profiles: genel terapist dizini
-- ---------------------------------------------------------------------------
create table public.therapist_profiles (
  profile_id uuid primary key default gen_random_uuid (),
  user_id uuid references auth.users (id) on delete set null,
  full_name text not null,
  professional_title text,
  gender text not null,
  specialization text[] not null default '{}',
  languages text[] not null default '{}',
  availability text[] not null default '{}',
  bio text not null default '',
  rating numeric(3, 2) not null default 0,
  years_of_experience smallint not null default 0,
  verified boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint therapist_profiles_gender_chk check (gender in ('male', 'female')),
  constraint therapist_profiles_rating_chk check (rating >= 0 and rating <= 5),
  constraint therapist_profiles_yoe_chk check (years_of_experience >= 0)
);

create index therapist_profiles_list_idx on public.therapist_profiles (verified, active)
where
  verified = true
  and active = true;

create index therapist_profiles_gender_idx on public.therapist_profiles (gender);

create index therapist_profiles_specialization_gin on public.therapist_profiles using gin (specialization);

create index therapist_profiles_languages_gin on public.therapist_profiles using gin (languages);

comment on table public.therapist_profiles is 'Terapist kamu profilleri; doğrulanmış kayıtlar istemciye RLS ile açılır.';

-- ---------------------------------------------------------------------------
-- updated_at (Supabase / PostgreSQL: trigger function)
-- ---------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger onboarding_answers_updated
before update on public.onboarding_answers
for each row
execute procedure public.handle_updated_at();

create trigger therapist_profiles_updated
before update on public.therapist_profiles
for each row
execute procedure public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.onboarding_answers enable row level security;

alter table public.therapist_profiles enable row level security;

create policy "onboarding_select_own"
on public.onboarding_answers
for select
to authenticated
using (auth.uid () = user_id);

create policy "onboarding_insert_own"
on public.onboarding_answers
for insert
to authenticated
with check (auth.uid () = user_id);

create policy "onboarding_update_own"
on public.onboarding_answers
for update
to authenticated
using (auth.uid () = user_id)
with check (auth.uid () = user_id);

create policy "onboarding_delete_own"
on public.onboarding_answers
for delete
to authenticated
using (auth.uid () = user_id);

create policy "therapist_select_verified"
on public.therapist_profiles
for select
to authenticated
using (verified = true and active = true);

-- Tanıtım / halka açık liste gerekiyorsa: ayrı policy with to anon
-- create policy "therapist_select_verified_anon" ...
