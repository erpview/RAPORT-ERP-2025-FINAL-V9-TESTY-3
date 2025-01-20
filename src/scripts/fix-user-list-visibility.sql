-- Drop existing policies
drop policy if exists "user_management_select_policy" on user_management;
drop policy if exists "user_management_insert_policy" on user_management;
drop policy if exists "user_management_update_policy" on user_management;
drop policy if exists "user_management_delete_policy" on user_management;

-- Create a more permissive select policy
create policy "user_management_select_policy"
  on user_management for select
  to authenticated
  using (
    -- User can view their own record
    auth.uid() = user_id
    -- Admin can view all records (check both app_metadata and user_management)
    or (
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
  );

-- Update other policies to use the same admin check
create policy "user_management_insert_policy"
  on user_management for insert
  to authenticated
  with check (
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

create policy "user_management_update_policy"
  on user_management for update
  to authenticated
  using (
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

create policy "user_management_delete_policy"
  on user_management for delete
  to authenticated
  using (
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