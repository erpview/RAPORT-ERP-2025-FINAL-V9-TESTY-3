-- First, ensure we have the required extensions
create extension if not exists "pgcrypto";

-- Fix admin user setup with Supabase password hash
do $$
declare
  admin_user_id uuid;
  existing_user_id uuid;
begin
  -- Get the existing user ID
  select id into existing_user_id
  from auth.users
  where email = 'p.jaworski@me.com';

  if existing_user_id is not null then
    -- First delete existing records in correct order
    delete from user_management where user_id = existing_user_id;
    delete from auth.identities where user_id = existing_user_id;
    delete from auth.users where id = existing_user_id;
  end if;

  -- Create new admin user with proper Supabase password format
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
    recovery_token,
    is_super_admin
  ) values (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'p.jaworski@me.com',
    '$2a$10$' || encode(sha256('PZaj)!001zaj'::bytea), 'hex'),
    now(),
    '{"role": "admin"}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    encode(gen_random_bytes(32), 'hex'),
    encode(gen_random_bytes(32), 'hex'),
    false
  ) returning id into admin_user_id;

  -- Create user_management record
  insert into user_management (
    user_id,
    email,
    role,
    is_active
  ) values (
    admin_user_id,
    'p.jaworski@me.com',
    'admin',
    true
  );

  -- Create identity record
  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    admin_user_id,
    admin_user_id,
    jsonb_build_object(
      'sub', admin_user_id,
      'email', 'p.jaworski@me.com'
    ),
    'email',
    admin_user_id::text,
    now(),
    now(),
    now()
  );

  -- Update user's email settings
  update auth.users
  set 
    email_confirmed_at = now(),
    confirmation_sent_at = now(),
    is_sso_user = false,
    email_change_token_current = null,
    email_change = null,
    email_change_token_new = null,
    email_change_confirm_status = 0,
    phone = null,
    phone_confirmed_at = null,
    phone_change = null,
    phone_change_token = null,
    phone_change_sent_at = null,
    confirmed_at = now(),
    confirmation_token = null,
    recovery_token = null,
    last_sign_in_at = now()
  where id = admin_user_id;

  raise notice 'Admin user created/updated successfully with ID: %', admin_user_id;
end $$;