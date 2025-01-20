-- First add the created_by column if it doesn't exist
do $$ 
begin
  if not exists (
    select from information_schema.columns 
    where table_name = 'systems' and column_name = 'created_by'
  ) then
    alter table systems add column created_by uuid references auth.users;
    -- Set existing rows to the first admin user's ID (you'll need to update this)
    -- update systems set created_by = 'ADMIN_USER_UUID';
    -- Then make it not null
    -- alter table systems alter column created_by set not null;
  end if;
end $$;

-- Create index for created_by if it doesn't exist
create index if not exists systems_created_by_idx on systems(created_by);

-- First drop ALL existing policies
drop policy if exists "Allow public read access to systems" on systems;
drop policy if exists "Allow admin full access to systems" on systems;
drop policy if exists "Allow users to read own role" on user_roles;
drop policy if exists "Allow admins to manage roles" on user_roles;
drop policy if exists "Allow editors to manage own systems" on systems;

-- Now recreate the function
drop function if exists auth.is_admin cascade;

create or replace function auth.is_admin(checking_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from user_roles
    where user_id = checking_user_id
    and role = 'admin'
    and is_active = true
  );
end;
$$ language plpgsql security definer;

-- Create editor check function
create or replace function auth.is_editor(checking_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from user_roles
    where user_id = checking_user_id
    and role = 'editor'
    and is_active = true
  );
end;
$$ language plpgsql security definer;

-- Recreate all policies
create policy "Allow public read access to systems"
  on systems for select
  to anon, authenticated
  using (true);

create policy "Allow admin full access to systems"
  on systems for all
  to authenticated
  using (auth.is_admin(auth.uid()));

create policy "Allow editors to manage own systems"
  on systems for all
  to authenticated
  using (
    auth.is_editor(auth.uid()) 
    and created_by = auth.uid()
  );

create policy "Allow users to read own role"
  on user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow admins to manage roles"
  on user_roles for all
  to authenticated
  using (auth.is_admin(auth.uid()));