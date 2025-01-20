-- First drop ALL existing policies
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

-- Add deployment_type column if it doesn't exist
alter table systems 
add column if not exists deployment_type text[] check (deployment_type <@ array['cloud', 'onpremise', 'hybrid']::text[]),
add column if not exists change_notes text;

-- Ensure we have all the required columns for the review workflow
alter table systems 
add column if not exists status text check (status in ('draft', 'pending', 'published', 'rejected')) default 'draft',
add column if not exists review_notes text,
add column if not exists reviewed_by uuid references auth.users,
add column if not exists reviewed_at timestamptz;

-- Create indexes for better performance
create index if not exists systems_status_idx on systems(status);
create index if not exists systems_created_by_idx on systems(created_by);
create index if not exists systems_reviewed_by_idx on systems(reviewed_by);
create index if not exists systems_deployment_type_idx on systems using gin(deployment_type);

-- Create new policies with unique names
create policy "systems_public_read_policy"
  on systems for select
  to anon, authenticated
  using (status = 'published');

create policy "systems_authenticated_view_policy"
  on systems for select
  to authenticated
  using (
    auth.uid() = created_by
    or auth.is_admin(auth.uid())
    or status = 'published'
  );

create policy "systems_admin_all_policy"
  on systems for all
  to authenticated
  using (auth.is_admin(auth.uid()))
  with check (auth.is_admin(auth.uid()));

create policy "systems_editor_create_policy"
  on systems for insert
  to authenticated
  with check (
    auth.is_editor(auth.uid())
    and auth.uid() = created_by
    and status in ('draft', 'pending')
  );

create policy "systems_editor_update_policy"
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

create policy "systems_editor_delete_policy"
  on systems for delete
  to authenticated
  using (
    auth.is_editor(auth.uid())
    and auth.uid() = created_by
    and status in ('draft', 'rejected')
  );