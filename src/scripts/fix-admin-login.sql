-- Drop existing functions and policies
drop function if exists auth.is_admin cascade;
drop function if exists auth.is_editor cascade;

-- Create a more robust admin check function
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

-- Create editor check function
create or replace function auth.is_editor(checking_user_id uuid)
returns boolean as $$
declare
  user_role text;
begin
  -- First check app_metadata
  select raw_app_meta_data->>'role'
  into user_role
  from auth.users
  where id = checking_user_id;

  -- Return true if user has editor role in app_metadata
  if user_role = 'editor' then
    return true;
  end if;

  -- Then check user_management table
  return exists (
    select 1
    from user_management
    where user_id = checking_user_id
    and role = 'editor'
    and is_active = true
  );
end;
$$ language plpgsql security definer;

-- Update user_management policies
drop policy if exists "user_management_select_policy" on user_management;
drop policy if exists "user_management_insert_policy" on user_management;
drop policy if exists "user_management_update_policy" on user_management;
drop policy if exists "user_management_delete_policy" on user_management;

create policy "user_management_select_policy"
  on user_management for select
  to authenticated
  using (
    auth.uid() = user_id
    or auth.is_admin(auth.uid())
  );

create policy "user_management_insert_policy"
  on user_management for insert
  to authenticated
  with check (auth.is_admin(auth.uid()));

create policy "user_management_update_policy"
  on user_management for update
  to authenticated
  using (auth.is_admin(auth.uid()))
  with check (auth.is_admin(auth.uid()));

create policy "user_management_delete_policy"
  on user_management for delete
  to authenticated
  using (auth.is_admin(auth.uid()));

-- Create initial admin user if not exists
do $$
declare
  admin_exists boolean;
begin
  -- Check if admin exists in user_management
  select exists(
    select 1 
    from user_management 
    where role = 'admin' 
    and is_active = true
  ) into admin_exists;

  -- If no admin exists, create one
  if not admin_exists then
    -- First create auth user if not exists
    insert into auth.users (
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data
    )
    values (
      'admin@erp-view.pl',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"role": "admin"}'::jsonb
    )
    on conflict (email) do update
    set raw_app_meta_data = '{"role": "admin"}'::jsonb
    returning id;

    -- Then create user_management record
    insert into user_management (
      user_id,
      email,
      role,
      is_active
    )
    select 
      id,
      'admin@erp-view.pl',
      'admin',
      true
    from auth.users
    where email = 'admin@erp-view.pl'
    on conflict (user_id) do update
    set role = 'admin',
        is_active = true;
  end if;
end $$;