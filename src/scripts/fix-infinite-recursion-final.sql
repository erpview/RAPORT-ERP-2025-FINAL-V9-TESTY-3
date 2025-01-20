-- First drop all existing policies and functions
drop policy if exists "user_management_select_policy" on user_management;
drop policy if exists "user_management_insert_policy" on user_management;
drop policy if exists "user_management_update_policy" on user_management;
drop policy if exists "user_management_delete_policy" on user_management;
drop function if exists auth.is_admin cascade;
drop function if exists auth.is_editor cascade;

-- Create a simpler admin check function that only uses app_metadata
create or replace function auth.is_admin(checking_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 
    from auth.users 
    where id = checking_user_id 
    and (
      raw_app_meta_data->>'role' = 'admin'
      or raw_app_meta_data->>'role' = 'service_role'
    )
  );
end;
$$ language plpgsql security definer;

-- Create a simpler editor check function that only uses app_metadata
create or replace function auth.is_editor(checking_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 
    from auth.users 
    where id = checking_user_id 
    and raw_app_meta_data->>'role' = 'editor'
  );
end;
$$ language plpgsql security definer;

-- Create simplified policies that don't cause recursion
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

-- Create trigger to sync role changes with auth.users metadata
create or replace function sync_user_role()
returns trigger as $$
begin
  -- Only update if role has changed
  if TG_OP = 'INSERT' or NEW.role is distinct from OLD.role then
    update auth.users
    set raw_app_meta_data = 
      jsonb_set(
        coalesce(raw_app_meta_data, '{}'::jsonb),
        '{role}',
        to_jsonb(NEW.role)
      )
    where id = NEW.user_id;
  end if;
  
  return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger for role sync if it doesn't exist
drop trigger if exists sync_user_role_trigger on user_management;
create trigger sync_user_role_trigger
  after insert or update on user_management
  for each row
  execute function sync_user_role();