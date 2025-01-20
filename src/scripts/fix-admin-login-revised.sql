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
  admin_user_id uuid;
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
    -- Check if admin user already exists in auth.users
    select id into admin_user_id
    from auth.users
    where email = 'admin@erp-view.pl';

    -- If admin user doesn't exist, create it
    if admin_user_id is null then
      insert into auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      ) values (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'admin@erp-view.pl',
        crypt('admin123', gen_salt('bf')),
        now(),
        '{"role": "admin"}'::jsonb,
        '{}'::jsonb,
        now(),
        now(),
        encode(gen_random_bytes(32), 'hex'),
        null,
        null,
        null
      ) returning id into admin_user_id;
    else
      -- Update existing user's app_metadata
      update auth.users
      set raw_app_meta_data = '{"role": "admin"}'::jsonb
      where id = admin_user_id;
    end if;

    -- Create or update user_management record
    insert into user_management (
      user_id,
      email,
      role,
      is_active
    ) values (
      admin_user_id,
      'admin@erp-view.pl',
      'admin',
      true
    )
    on conflict (user_id) do update
    set role = 'admin',
        is_active = true;
  end if;
end $$;