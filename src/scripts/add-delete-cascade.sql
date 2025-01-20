-- Drop existing functions if they exist
drop function if exists delete_system_cascade;
drop function if exists public.delete_system;

-- Create function to handle cascading delete of systems
create or replace function delete_system_cascade(p_system_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- First delete any system versions that reference this system
  delete from system_versions 
  where system_id = p_system_id;

  -- Then delete any systems that reference this as previous version
  delete from systems 
  where previous_version_id = p_system_id;

  -- Finally delete the system itself
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