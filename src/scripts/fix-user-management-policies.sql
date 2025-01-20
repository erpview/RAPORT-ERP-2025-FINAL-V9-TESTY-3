-- Drop existing policies if they exist
drop policy if exists "user_management_insert_policy" on user_management;
drop policy if exists "user_management_select_policy" on user_management;
drop policy if exists "user_management_update_policy" on user_management;
drop policy if exists "user_management_delete_policy" on user_management;
drop policy if exists "Allow users to insert own record" on user_management;
drop policy if exists "Allow users to view own record and admins to view all" on user_management;
drop policy if exists "Allow admins to update any record" on user_management;
drop policy if exists "Allow users to update own basic info" on user_management;
drop policy if exists "Allow admins to delete records" on user_management;

-- Grant necessary permissions
grant usage on schema auth to authenticated;
grant select on auth.users to authenticated;
grant select on profiles to authenticated;

-- Drop existing foreign key if it exists
alter table user_management 
drop constraint if exists user_management_user_id_fkey;

-- First ensure all users from user_management have profiles
insert into profiles (id, full_name, company_name, phone_number, nip, position, industry, company_size, status, marketing_accepted)
select 
    um.user_id,
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'company_name',
    au.raw_user_meta_data->>'phone_number',
    au.raw_user_meta_data->>'nip',
    au.raw_user_meta_data->>'position',
    au.raw_user_meta_data->>'industry',
    au.raw_user_meta_data->>'company_size',
    'pending',
    false
from user_management um
join auth.users au on au.id = um.user_id
left join profiles p on p.id = um.user_id
where p.id is null;

-- Then ensure all users from profiles have user_management entries
insert into user_management (user_id, email, role, is_active)
select 
    p.id,
    au.email,
    'user',
    true
from profiles p
join auth.users au on au.id = p.id
left join user_management um on um.user_id = p.id
where um.user_id is null;

-- Now add back the foreign key relationship
alter table user_management 
add constraint user_management_user_id_fkey 
foreign key (user_id) 
references profiles(id) 
on delete cascade;

-- Helper function to check admin status without accessing user_management
create or replace function auth.is_admin_by_metadata()
returns boolean as $$
begin
  return exists (
    select 1 
    from auth.users 
    where id = auth.uid() 
    and raw_app_meta_data->>'role' in ('admin', 'service_role')
  );
end;
$$ language plpgsql security definer;

-- Drop existing policies for profiles if they exist
drop policy if exists "profiles_select_policy" on profiles;
drop policy if exists "profiles_update_policy" on profiles;

-- Create policies for profiles table
create policy "profiles_select_policy"
on profiles for select
to authenticated
using (
  -- Users can view their own profile
  auth.uid() = id
  or
  -- Admins can view all profiles
  auth.is_admin_by_metadata()
);

create policy "profiles_update_policy"
on profiles for update
to authenticated
using (
  -- Users can update their own profile
  auth.uid() = id
  or
  -- Admins can update any profile
  auth.is_admin_by_metadata()
)
with check (
  -- Users can update their own profile
  auth.uid() = id
  or
  -- Admins can update any profile
  auth.is_admin_by_metadata()
);

-- Enable RLS on profiles table
alter table profiles force row level security;

-- Insert policy for user_management
create policy "user_management_insert_policy"
on user_management for insert
to authenticated
with check (
  -- Allow users to create their own record during registration
  (auth.uid() = user_id and role = 'user' and not is_active)
  or
  -- Allow admins to create records
  auth.is_admin_by_metadata()
);

-- Select policy for user_management
create policy "user_management_select_policy"
on user_management for select
to authenticated
using (
  -- Users can view their own record
  auth.uid() = user_id
  or
  -- Admins can view all records
  auth.is_admin_by_metadata()
);

-- Update policy for user_management
create policy "user_management_update_policy"
on user_management for update
to authenticated
using (
  -- Users can update their own record or admins can update any record
  auth.uid() = user_id
  or
  auth.is_admin_by_metadata()
);

-- Delete policy for user_management
create policy "user_management_delete_policy"
on user_management for delete
to authenticated
using (
  auth.is_admin_by_metadata()
);

-- Enable RLS on user_management
alter table user_management force row level security;

-- Grant necessary permissions for profiles table
grant usage on schema public to authenticated;
grant select on profiles to authenticated;
