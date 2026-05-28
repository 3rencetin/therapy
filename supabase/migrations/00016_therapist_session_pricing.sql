-- Terapist bazlı seans süresi ve ücret ayarları

alter table public.therapist_profiles
add column if not exists session_duration_minutes smallint not null default 50,
add column if not exists session_fee_try integer not null default 0;

alter table public.therapist_profiles
drop constraint if exists therapist_profiles_session_duration_chk;

alter table public.therapist_profiles
add constraint therapist_profiles_session_duration_chk
check (session_duration_minutes >= 15 and session_duration_minutes <= 180);

alter table public.therapist_profiles
drop constraint if exists therapist_profiles_session_fee_chk;

alter table public.therapist_profiles
add constraint therapist_profiles_session_fee_chk
check (session_fee_try >= 0 and session_fee_try <= 1000000);
