-- First drop the existing function
drop function if exists auth.is_admin(uuid);

-- Then recreate it with the correct parameter name
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

-- Create RLS policies for systems table
create policy "Allow public read access to systems"
  on systems for select
  to anon, authenticated
  using (true);

create policy "Allow admin full access to systems"
  on systems for all
  to authenticated
  using (auth.is_admin(auth.uid()));

-- Create RLS policies for user_roles table
create policy "Allow users to read own role"
  on user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow admins to manage roles"
  on user_roles for all
  to authenticated
  using (auth.is_admin(auth.uid()));