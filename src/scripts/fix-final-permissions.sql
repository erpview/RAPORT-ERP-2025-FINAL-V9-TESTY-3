-- Drop existing policies and functions
drop policy if exists "systems_public_read" on systems;
drop policy if exists "systems_authenticated_view" on systems;
drop policy if exists "systems_admin_all" on systems;
drop policy if exists "systems_editor_create" on systems;
drop policy if exists "systems_editor_update" on systems;
drop policy if exists "systems_editor_delete" on systems;
drop function if exists auth.is_admin cascade;
drop function if exists auth.is_editor cascade;

-- Create simplified admin check function
create or replace function auth.is_admin(checking_user_id uuid)
returns boolean as $$
begin
  -- Only check app_metadata to avoid recursion
  return exists (
    select 1 
    from auth.users 
    where id = checking_user_id 
    and (
      raw_app_meta_data->>'role' = 'admin'
      or raw_app_meta_data->>'role' = 'service_role'
    )
  );
end;
$$ language plpgsql security definer;

-- Create simplified editor check function
create or replace function auth.is_editor(checking_user_id uuid)
returns boolean as $$
begin
  -- Only check app_metadata to avoid recursion
  return exists (
    select 1 
    from auth.users 
    where id = checking_user_id 
    and raw_app_meta_data->>'role' = 'editor'
  );
end;
$$ language plpgsql security definer;

-- Create simplified policies for systems table
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
    and status in ('draft', 'pending')
  );

create policy "systems_editor_delete"
  on systems for delete
  to authenticated
  using (
    auth.is_editor(auth.uid())
    and auth.uid() = created_by
    and status in ('draft', 'rejected')
  );

-- Grant necessary permissions
grant usage on schema auth to anon, authenticated;
grant select on auth.users to anon, authenticated;
grant select on systems to anon, authenticated;
grant all on systems to authenticated;