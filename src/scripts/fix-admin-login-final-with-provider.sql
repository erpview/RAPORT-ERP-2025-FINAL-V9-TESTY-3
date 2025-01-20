-- First, let's make sure we have the required extensions
create extension if not exists "pgcrypto";

-- Drop existing functions to avoid conflicts
drop function if exists auth.is_admin cascade;
drop function if exists auth.is_editor cascade;

-- Create admin check function
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

-- Create initial admin user
do $$
declare
  admin_user_id uuid;
  hashed_password text;
  existing_user_id uuid;
begin
  -- Generate proper Supabase password hash
  select encode(digest('admin123', 'sha256'), 'hex') into hashed_password;
  
  -- Get existing admin user id if exists
  select id into existing_user_id
  from auth.users
  where email = 'admin@erp-view.pl';

  -- Delete existing admin records in correct order
  if existing_user_id is not null then
    -- First delete from user_management (child table)
    delete from user_management where user_id = existing_user_id;
    -- Then delete from auth.identities
    delete from auth.identities where user_id = existing_user_id;
    -- Finally delete from auth.users
    delete from auth.users where id = existing_user_id;
  end if;

  -- Create new admin user
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
    recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@erp-view.pl',
    hashed_password,
    now(),
    '{"role": "admin"}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    encode(gen_random_bytes(32), 'hex'),
    encode(gen_random_bytes(32), 'hex')
  ) returning id into admin_user_id;

  -- Create user_management record
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
  );

  -- Set identities for the user with provider_id
  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at,
    email
  ) values (
    admin_user_id,
    admin_user_id,
    jsonb_build_object(
      'sub', admin_user_id,
      'email', 'admin@erp-view.pl'
    ),
    'email',
    admin_user_id::text,
    now(),
    now(),
    now(),
    'admin@erp-view.pl'
  );
end $$;