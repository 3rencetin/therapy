-- Seans notu görünürlüğü + seans sonrası mini değerlendirme + kullanıcı günlük/notlar

alter table public.booked_session_notebook_pages
add column if not exists therapist_can_view boolean not null default true;

drop policy if exists "booked_session_notebook_pages_select_participants" on public.booked_session_notebook_pages;
create policy "booked_session_notebook_pages_select_participants"
on public.booked_session_notebook_pages
for select
to authenticated
using (
  exists (
    select 1
    from public.booked_sessions bs
    where
      bs.id = booked_session_notebook_pages.session_id
      and (
        bs.user_id = auth.uid()
        or (
          booked_session_notebook_pages.therapist_can_view = true
          and exists (
            select 1
            from public.therapist_profiles t
            where t.profile_id = bs.profile_id and t.user_id = auth.uid()
          )
        )
      )
  )
);

create table if not exists public.session_reflections (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.booked_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  mood smallint not null check (mood between 1 and 5),
  note text not null default '' check (char_length(note) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint session_reflections_session_user_uniq unique (session_id, user_id)
);

create index if not exists session_reflections_user_created_idx
  on public.session_reflections(user_id, created_at desc);

drop trigger if exists session_reflections_updated on public.session_reflections;
create trigger session_reflections_updated
before update on public.session_reflections
for each row execute procedure public.handle_updated_at();

alter table public.session_reflections enable row level security;

drop policy if exists "session_reflections_select_own_or_therapist" on public.session_reflections;
create policy "session_reflections_select_own_or_therapist"
on public.session_reflections
for select to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.booked_sessions bs
    join public.therapist_profiles t on t.profile_id = bs.profile_id
    where bs.id = session_reflections.session_id and t.user_id = auth.uid()
  )
);

drop policy if exists "session_reflections_insert_own" on public.session_reflections;
create policy "session_reflections_insert_own"
on public.session_reflections
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.booked_sessions bs
    where bs.id = session_id and bs.user_id = auth.uid()
  )
);

drop policy if exists "session_reflections_update_own" on public.session_reflections;
create policy "session_reflections_update_own"
on public.session_reflections
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create table if not exists public.user_journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  title text not null default '' check (char_length(title) <= 200),
  body text not null default '' check (char_length(body) <= 50000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_journal_entries_user_date_uniq unique (user_id, entry_date)
);

drop trigger if exists user_journal_entries_updated on public.user_journal_entries;
create trigger user_journal_entries_updated
before update on public.user_journal_entries
for each row execute procedure public.handle_updated_at();

alter table public.user_journal_entries enable row level security;

drop policy if exists "user_journal_entries_select_own" on public.user_journal_entries;
create policy "user_journal_entries_select_own"
on public.user_journal_entries
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "user_journal_entries_insert_own" on public.user_journal_entries;
create policy "user_journal_entries_insert_own"
on public.user_journal_entries
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "user_journal_entries_update_own" on public.user_journal_entries;
create policy "user_journal_entries_update_own"
on public.user_journal_entries
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create table if not exists public.user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  note_date date not null default (now() at time zone 'utc')::date,
  title text not null default '' check (char_length(title) <= 200),
  body text not null default '' check (char_length(body) <= 50000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_notes_user_date_idx on public.user_notes(user_id, note_date desc, updated_at desc);

drop trigger if exists user_notes_updated on public.user_notes;
create trigger user_notes_updated
before update on public.user_notes
for each row execute procedure public.handle_updated_at();

alter table public.user_notes enable row level security;

drop policy if exists "user_notes_select_own" on public.user_notes;
create policy "user_notes_select_own"
on public.user_notes
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "user_notes_insert_own" on public.user_notes;
create policy "user_notes_insert_own"
on public.user_notes
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "user_notes_update_own" on public.user_notes;
create policy "user_notes_update_own"
on public.user_notes
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "user_notes_delete_own" on public.user_notes;
create policy "user_notes_delete_own"
on public.user_notes
for delete to authenticated
using (user_id = auth.uid());
