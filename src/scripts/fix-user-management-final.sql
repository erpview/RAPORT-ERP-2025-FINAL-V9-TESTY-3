-- Drop existing policies
drop policy if exists "Allow admins to view users" on user_management;
drop policy if exists "Allow admins to create users" on user_management;
drop policy if exists "Allow admins to update users" on user_management;
drop policy if exists "Allow admins to delete users" on user_management;
drop policy if exists "Allow users to view own record" on user_management;

-- Create simplified policies that work with both admin users and service role
create policy "user_management_select_policy"
  on user_management for select
  to authenticated
  using (
    -- User can view their own record
    auth.uid() = user_id
    -- Admin can view all records
    or exists (
      select 1
      from user_management
      where user_id = auth.uid()
      and role = 'admin'
      and is_active = true
    )
    -- Service role can view all records
    or auth.jwt()->>'role' = 'service_role'
  );

create policy "user_management_insert_policy"
  on user_management for insert
  to authenticated
  with check (
    -- Admin can insert
    exists (
      select 1
      from user_management
      where user_id = auth.uid()
      and role = 'admin'
      and is_active = true
    )
    -- Service role can insert
    or auth.jwt()->>'role' = 'service_role'
  );

create policy "user_management_update_policy"
  on user_management for update
  to authenticated
  using (
    exists (
      select 1
      from user_management
      where user_id = auth.uid()
      and role = 'admin'
      and is_active = true
    )
    or auth.jwt()->>'role' = 'service_role'
  )
  with check (
    exists (
      select 1
      from user_management
      where user_id = auth.uid()
      and role = 'admin'
      and is_active = true
    )
    or auth.jwt()->>'role' = 'service_role'
  );

create policy "user_management_delete_policy"
  on user_management for delete
  to authenticated
  using (
    exists (
      select 1
      from user_management
      where user_id = auth.uid()
      and role = 'admin'
      and is_active = true
    )
    or auth.jwt()->>'role' = 'service_role'
  );