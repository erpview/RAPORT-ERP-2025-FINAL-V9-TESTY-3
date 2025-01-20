-- Drop existing trigger if it exists
drop trigger if exists update_user_management_updated_at on user_management;

-- Drop existing function if it exists
drop function if exists auth.is_super_admin;

-- Create or replace admin check function that works with Supabase roles
create or replace function auth.is_super_admin(checking_user_id uuid)
returns boolean as $$
begin
  -- First check Supabase service role
  if exists (
    select 1 
    from auth.users 
    where id = checking_user_id 
    and raw_app_meta_data->>'role' = 'service_role'
  ) then
    return true;
  end if;

  -- Then check our custom admin role
  return exists (
    select 1
    from user_management
    where user_id = checking_user_id
    and role = 'admin'
    and is_active = true
  );
end;
$$ language plpgsql security definer;

-- Create trigger for updated_at
create trigger update_user_management_updated_at
  before update on user_management
  for each row
  execute function update_updated_at_column();

-- Update policies to work with Supabase roles
drop policy if exists "Allow admins to manage users" on user_management;
drop policy if exists "Allow users to view own record" on user_management;

create policy "Allow admins to manage users"
  on user_management for all
  to authenticated
  using (
    auth.is_super_admin(auth.uid()) or 
    auth.jwt()->>'role' = 'service_role'
  )
  with check (
    auth.is_super_admin(auth.uid()) or 
    auth.jwt()->>'role' = 'service_role'
  );

create policy "Allow users to view own record"
  on user_management for select
  to authenticated
  using (auth.uid() = user_id);

-- Function to sync user roles with Supabase
create or replace function sync_user_role()
returns trigger as $$
begin
  -- Update Supabase user role
  update auth.users
  set raw_app_meta_data = 
    jsonb_set(
      coalesce(raw_app_meta_data, '{}'::jsonb),
      '{role}',
      to_jsonb(NEW.role)
    )
  where id = NEW.user_id;
  
  return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger for role sync
drop trigger if exists sync_user_role_trigger on user_management;
create trigger sync_user_role_trigger
  after insert or update of role on user_management
  for each row
  execute function sync_user_role();