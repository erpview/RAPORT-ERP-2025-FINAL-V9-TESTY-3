-- Add version tracking fields to systems table
alter table systems 
add column if not exists previous_version_id uuid references systems,
add column if not exists version_number integer default 1,
add column if not exists is_latest_version boolean default true;

-- Create index for version tracking
create index if not exists systems_previous_version_id_idx on systems(previous_version_id);
create index if not exists systems_version_number_idx on systems(version_number);

-- Create function to update version numbers
create or replace function update_version_number()
returns trigger as $$
begin
  if NEW.previous_version_id is not null then
    NEW.version_number := (
      select version_number + 1
      from systems
      where id = NEW.previous_version_id
    );
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Create trigger for version numbering
create trigger update_version_number_trigger
  before insert on systems
  for each row
  execute function update_version_number();

-- Update RLS policies to handle versioning
create policy "systems_version_chain_access"
  on systems for select
  to authenticated
  using (
    status = 'published' 
    or (status = 'pending' and (
      auth.uid() = created_by
      or auth.is_admin(auth.uid())
    ))
  );