-- Enable auth schema if not already enabled
create schema if not exists auth;

-- Create admin user role function if it doesn't exist
create or replace function auth.is_admin(checking_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from user_roles
    where user_id = checking_user_id
    and role = 'admin'
    and is_active = true
  );
end;
$$ language plpgsql security definer;

-- Create editor check function
create or replace function auth.is_editor(checking_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from user_roles
    where user_id = checking_user_id
    and role = 'editor'
    and is_active = true
  );
end;
$$ language plpgsql security definer;

-- Create function to safely grant admin role
create or replace function auth.grant_admin_role(target_user_id uuid)
returns void as $$
begin
  -- Deactivate any existing roles for the user
  update user_roles
  set is_active = false
  where user_id = target_user_id;
  
  -- Insert new admin role
  insert into user_roles (user_id, role, is_active)
  values (target_user_id, 'admin', true)
  on conflict (user_id)
  do update set role = 'admin', is_active = true, updated_at = now();
end;
$$ language plpgsql security definer;