-- First check if user exists and update their role
do $$
declare
  admin_user_id uuid;
begin
  -- Get the user ID
  select id into admin_user_id
  from auth.users
  where email = 'p.jaworski@me.com';

  if admin_user_id is not null then
    -- Update user's app_metadata to include admin role
    update auth.users
    set raw_app_meta_data = jsonb_set(
      coalesce(raw_app_meta_data, '{}'::jsonb),
      '{role}',
      '"admin"'
    )
    where id = admin_user_id;

    -- Ensure user has a record in user_management
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
    )
    on conflict (user_id) 
    do update set
      role = 'admin',
      is_active = true;

    raise notice 'Admin user updated successfully';
  else
    raise notice 'User not found';
  end if;
end $$;