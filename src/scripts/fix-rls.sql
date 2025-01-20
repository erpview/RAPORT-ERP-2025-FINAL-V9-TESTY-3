-- First ensure the created_by column exists and has the correct constraints
do $$ 
begin
  -- Add created_by column if it doesn't exist
  if not exists (
    select from information_schema.columns 
    where table_name = 'systems' and column_name = 'created_by'
  ) then
    alter table systems add column created_by uuid references auth.users;
  end if;
end $$;

-- Drop existing policies
drop policy if exists "Allow public read access to systems" on systems;
drop policy if exists "Allow admin full access to systems" on systems;
drop policy if exists "Allow editors to manage own systems" on systems;

-- Recreate policies with correct permissions
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

-- Create index for created_by if it doesn't exist
create index if not exists systems_created_by_idx on systems(created_by);