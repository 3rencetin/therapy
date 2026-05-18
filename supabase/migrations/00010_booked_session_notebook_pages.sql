-- Danışan: seans bazlı çok sayfalı seans öncesi notları (terapist okur; yalnızca danışan yazar/günceller)

create table if not exists public.booked_session_notebook_pages (
  id uuid primary key default gen_random_uuid (),
  session_id uuid not null references public.booked_sessions (id) on delete cascade,
  sort_order int not null,
  title text not null default '',
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now (),
  constraint booked_session_notebook_pages_sort_nonneg check (sort_order >= 0),
  constraint booked_session_notebook_pages_title_len check (char_length(title) <= 200),
  constraint booked_session_notebook_pages_body_len check (char_length(body) <= 50000),
  constraint booked_session_notebook_pages_session_sort_key unique (session_id, sort_order)
);

create index if not exists booked_session_notebook_pages_session_idx on public.booked_session_notebook_pages (
  session_id,
  sort_order
);

drop trigger if exists booked_session_notebook_pages_updated on public.booked_session_notebook_pages;

create trigger booked_session_notebook_pages_updated
before update on public.booked_session_notebook_pages
for each row
execute procedure public.handle_updated_at ();

comment on table public.booked_session_notebook_pages is 'Danışanın seans öncesi çok sayfalı notları.';

alter table public.booked_session_notebook_pages enable row level security;

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

drop policy if exists "booked_session_notebook_pages_insert_client" on public.booked_session_notebook_pages;

create policy "booked_session_notebook_pages_insert_client"
on public.booked_session_notebook_pages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.booked_sessions bs
    where
      bs.id = session_id
      and bs.user_id = auth.uid ()
      and bs.status in ('pending', 'confirmed', 'completed')
  )
);

drop policy if exists "booked_session_notebook_pages_update_client" on public.booked_session_notebook_pages;

create policy "booked_session_notebook_pages_update_client"
on public.booked_session_notebook_pages
for update
to authenticated
using (
  exists (
    select 1
    from public.booked_sessions bs
    where
      bs.id = booked_session_notebook_pages.session_id
      and bs.user_id = auth.uid ()
      and bs.status in ('pending', 'confirmed', 'completed')
  )
)
with check (
  exists (
    select 1
    from public.booked_sessions bs
    where
      bs.id = booked_session_notebook_pages.session_id
      and bs.user_id = auth.uid ()
      and bs.status in ('pending', 'confirmed', 'completed')
  )
);

drop policy if exists "booked_session_notebook_pages_delete_client" on public.booked_session_notebook_pages;

create policy "booked_session_notebook_pages_delete_client"
on public.booked_session_notebook_pages
for delete
to authenticated
using (
  exists (
    select 1
    from public.booked_sessions bs
    where
      bs.id = booked_session_notebook_pages.session_id
      and bs.user_id = auth.uid ()
      and bs.status in ('pending', 'confirmed', 'completed')
  )
);

drop policy if exists "booked_session_notebook_pages_admin_select" on public.booked_session_notebook_pages;

create policy "booked_session_notebook_pages_admin_select"
on public.booked_session_notebook_pages
for select
to authenticated
using (public.is_staff (auth.uid ()));
