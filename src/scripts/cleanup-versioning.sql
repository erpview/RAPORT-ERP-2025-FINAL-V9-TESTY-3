-- First drop ALL existing policies to avoid dependency issues
do $$ 
declare
  r record;
begin
  for r in (
    select policyname 
    from pg_policies 
    where tablename = 'systems'
  ) loop
    execute format('drop policy if exists %I on systems', r.policyname);
  end loop;
end $$;

-- Drop any existing versioning-related functions
drop function if exists get_next_version_number cascade;
drop function if exists archive_system_version cascade;
drop function if exists check_pending_revision cascade;

-- Drop any existing triggers
drop trigger if exists archive_system_version_trigger on systems;
drop trigger if exists enforce_one_pending_revision on systems;
drop trigger if exists update_version_number_trigger on systems;

-- Drop versioning-related tables if they exist
drop table if exists system_versions cascade;
drop table if exists system_revisions cascade;

-- Make sure we have the correct columns and remove any versioning columns
alter table systems 
drop column if exists previous_version_id cascade,
drop column if exists version_number cascade,
drop column if exists is_latest_version cascade,
drop column if exists current_revision cascade,
drop column if exists previous_revision cascade;

-- Ensure we have the correct columns for the simple review workflow
alter table systems 
add column if not exists status text check (status in ('draft', 'pending', 'published', 'rejected')) default 'draft',
add column if not exists review_notes text,
add column if not exists reviewed_by uuid references auth.users,
add column if not exists reviewed_at timestamptz,
add column if not exists change_notes text;

-- Create indexes for better performance
create index if not exists systems_status_idx on systems(status);
create index if not exists systems_created_by_idx on systems(created_by);
create index if not exists systems_reviewed_by_idx on systems(reviewed_by);

-- Recreate the policies
create policy "systems_public_read"
  on systems for select
  to anon, authenticated
  using (status = 'published');

create policy "systems_authenticated_view"
  on systems for select
  to authenticated
  using (
    auth.uid() = created_by
    or auth.is_admin(auth.uid())
    or status = 'published'
  );

create policy "systems_admin_all"
  on systems for all
  to authenticated
  using (auth.is_admin(auth.uid()))
  with check (auth.is_admin(auth.uid()));

create policy "systems_editor_create"
  on systems for insert
  to authenticated
  with check (
    auth.is_editor(auth.uid())
    and auth.uid() = created_by
    and status in ('draft', 'pending')
  );

create policy "systems_editor_update"
  on systems for update
  to authenticated
  using (
    auth.is_editor(auth.uid())
    and auth.uid() = created_by
    and status in ('draft', 'rejected', 'published')
  )
  with check (
    auth.is_editor(auth.uid())
    and auth.uid() = created_by
  );

create policy "systems_editor_delete"
  on systems for delete
  to authenticated
  using (
    auth.is_editor(auth.uid())
    and auth.uid() = created_by
    and status in ('draft', 'rejected')
  );