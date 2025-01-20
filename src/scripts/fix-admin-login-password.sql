-- First, ensure we have the required extensions
create extension if not exists "pgcrypto";

-- Fix admin user setup with proper password hash
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
    -- Update user's password and metadata
    update auth.users
    set 
      encrypted_password = crypt('PZaj)!001zaj', gen_salt('bf')),
      raw_app_meta_data = jsonb_build_object('role', 'admin'),
      raw_user_meta_data = jsonb_build_object(),
      email_confirmed_at = now(),
      updated_at = now()
    where id = existing_user_id;

    -- Ensure user has a record in user_management
    insert into user_management (
      user_id,
      email,
      role,
      is_active
    ) values (
      existing_user_id,
      'p.jaworski@me.com',
      'admin',
      true
    )
    on conflict (user_id) 
    do update set
      role = 'admin',
      is_active = true,
      updated_at = now();

    -- Ensure user has an identity record
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
      existing_user_id,
      existing_user_id,
      jsonb_build_object(
        'sub', existing_user_id,
        'email', 'p.jaworski@me.com'
      ),
      'email',
      existing_user_id::text,
      now(),
      now(),
      now()
    )
    on conflict (provider, provider_id) 
    do nothing;

    raise notice 'Admin user updated successfully';
  else
    -- Create new admin user if doesn't exist
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
      'p.jaworski@me.com',
      crypt('PZaj)!001zaj', gen_salt('bf')),
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

    raise notice 'New admin user created successfully';
  end if;
end $$;