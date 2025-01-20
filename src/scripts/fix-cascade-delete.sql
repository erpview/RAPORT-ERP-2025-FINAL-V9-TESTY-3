-- First drop existing functions
drop function if exists delete_system_cascade;
drop function if exists public.delete_system;

-- Drop existing foreign key constraints
alter table system_versions 
  drop constraint if exists system_versions_system_id_fkey;

-- Recreate foreign key with cascade delete
alter table system_versions
  add constraint system_versions_system_id_fkey 
  foreign key (system_id) 
  references systems(id) 
  on delete cascade;

-- Create function to handle cascading delete of systems
create or replace function delete_system_cascade(p_system_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Delete the system (versions will be deleted automatically via cascade)
  delete from systems 
  where id = p_system_id;
end;
$$;

-- Create RPC function that can be called from Supabase client
create or replace function public.delete_system(p_system_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Check if user has permission to delete the system
  if (select auth.is_admin(auth.uid())) then
    -- Admin can delete any system
    perform delete_system_cascade(p_system_id);
  elsif (select auth.is_editor(auth.uid())) then
    -- Editor can only delete their own draft or rejected systems
    if exists (
      select 1 
      from systems 
      where id = p_system_id 
      and created_by = auth.uid()
      and status in ('draft', 'rejected')
    ) then
      perform delete_system_cascade(p_system_id);
    else
      raise exception 'Unauthorized: Editors can only delete their own draft or rejected systems';
    end if;
  else
    raise exception 'Unauthorized: User must be an admin or editor';
  end if;
end;
$$;