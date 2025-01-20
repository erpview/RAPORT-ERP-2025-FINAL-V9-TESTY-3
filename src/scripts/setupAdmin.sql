-- Enable auth schema if not already enabled
create schema if not exists auth;

-- Create initial admin user
insert into auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  role
) values (
  'admin@erp-view.pl',
  crypt('admin123', gen_salt('bf')),
  now(),
  'authenticated'
);

-- Get the user ID of the admin user
do $$
declare
  admin_user_id uuid;
begin
  select id into admin_user_id from auth.users where email = 'admin@erp-view.pl';
  
  -- Insert admin role for the user
  insert into public.user_roles (user_id, role)
  values (admin_user_id, 'admin');
end $$;