-- Create function to safely grant editor role
create or replace function auth.grant_editor_role(target_user_id uuid)
returns void as $$
begin
  -- Deactivate any existing roles for the user
  update user_roles
  set is_active = false
  where user_id = target_user_id;
  
  -- Insert new editor role
  insert into user_roles (user_id, role, is_active)
  values (target_user_id, 'editor', true)
  on conflict (user_id)
  do update set role = 'editor', is_active = true, updated_at = now();
end;
$$ language plpgsql security definer;

-- Replace USER_ID with the actual UUID from Supabase Auth dashboard
select auth.grant_editor_role('USER_ID');