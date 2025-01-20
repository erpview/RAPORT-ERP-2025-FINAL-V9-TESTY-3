-- First, create a function to safely grant admin role
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

-- Replace USER_ID with the actual UUID from Supabase Auth dashboard
select auth.grant_admin_role('USER_ID');