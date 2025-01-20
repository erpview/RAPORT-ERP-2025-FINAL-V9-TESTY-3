-- Drop existing policies
drop policy if exists "Allow admins to manage users" on user_management;
drop policy if exists "Allow users to view own record" on user_management;

-- Create more granular policies
create policy "Allow admins to view users"
  on user_management for select
  to authenticated
  using (auth.is_super_admin(auth.uid()));

create policy "Allow admins to create users"
  on user_management for insert
  to authenticated
  with check (
    -- Allow service role or admin to create users
    auth.is_super_admin(auth.uid()) or 
    auth.jwt()->>'role' = 'service_role' or
    -- Also allow creation during signup
    (
      auth.uid() = user_id and
      role = 'user'
    )
  );

create policy "Allow admins to update users"
  on user_management for update
  to authenticated
  using (auth.is_super_admin(auth.uid()))
  with check (auth.is_super_admin(auth.uid()));

create policy "Allow admins to delete users"
  on user_management for delete
  to authenticated
  using (auth.is_super_admin(auth.uid()));

create policy "Allow users to view own record"
  on user_management for select
  to authenticated
  using (auth.uid() = user_id);

-- Update the super admin function to handle service role
create or replace function auth.is_super_admin(checking_user_id uuid)
returns boolean as $$
begin
  -- Check if user has service role
  if exists (
    select 1 
    from auth.users 
    where id = checking_user_id 
    and (
      raw_app_meta_data->>'role' = 'service_role' or
      raw_app_meta_data->>'role' = 'admin'
    )
  ) then
    return true;
  end if;

  -- Check custom admin role
  return exists (
    select 1
    from user_management
    where user_id = checking_user_id
    and role = 'admin'
    and is_active = true
  );
end;
$$ language plpgsql security definer;