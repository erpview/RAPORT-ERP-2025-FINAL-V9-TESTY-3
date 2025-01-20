-- First drop all existing policies
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

-- Create a more permissive admin check function
create or replace function auth.is_admin(checking_user_id uuid)
returns boolean as $$
declare
  user_role text;
begin
  -- First check app_metadata
  select raw_app_meta_data->>'role'
  into user_role
  from auth.users
  where id = checking_user_id;

  -- Return true if user has admin or service_role in app_metadata
  if user_role in ('admin', 'service_role') then
    return true;
  end if;

  -- Then check user_management table
  return exists (
    select 1
    from user_management
    where user_id = checking_user_id
    and role = 'admin'
    and is_active = true
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

-- Create a single policy for admin operations
create policy "systems_admin_all"
  on systems for all
  to authenticated
  using (
    -- Check both app_metadata and user_management for admin role
    exists (
      select 1 
      from auth.users 
      where id = auth.uid() 
      and (
        raw_app_meta_data->>'role' = 'admin'
        or raw_app_meta_data->>'role' = 'service_role'
      )
    )
    or exists (
      select 1
      from user_management
      where user_id = auth.uid()
      and role = 'admin'
      and is_active = true
    )
  )
  with check (
    -- Same check for insert/update operations
    exists (
      select 1 
      from auth.users 
      where id = auth.uid() 
      and (
        raw_app_meta_data->>'role' = 'admin'
        or raw_app_meta_data->>'role' = 'service_role'
      )
    )
    or exists (
      select 1
      from user_management
      where user_id = auth.uid()
      and role = 'admin'
      and is_active = true
    )
  );

-- Create policies for editor operations
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