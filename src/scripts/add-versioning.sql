-- Add versioning columns to systems table
alter table systems 
add column if not exists change_notes text,
add column if not exists current_revision uuid,
add column if not exists previous_revision uuid;

-- Create system_versions table
create table if not exists system_versions (
  id uuid primary key default uuid_generate_v4(),
  system_id uuid references systems not null,
  data jsonb not null,
  version_number integer not null,
  change_notes text,
  created_by uuid references auth.users not null,
  created_at timestamptz default now() not null,
  status text check (status in ('draft', 'pending', 'published', 'rejected')) default 'draft',
  reviewed_by uuid references auth.users,
  reviewed_at timestamptz,
  review_notes text
);

-- Create indexes
create index system_versions_system_id_idx on system_versions(system_id);
create index system_versions_created_by_idx on system_versions(created_by);
create index system_versions_status_idx on system_versions(status);

-- Create function to get next version number
create or replace function get_next_version_number(p_system_id uuid)
returns integer as $$
declare
  v_max_version integer;
begin
  select coalesce(max(version_number), 0)
  into v_max_version
  from system_versions
  where system_id = p_system_id;
  
  return v_max_version + 1;
end;
$$ language plpgsql;

-- Enable RLS
alter table system_versions enable row level security;

-- Create RLS policies for system_versions
create policy "Allow editors create versions"
  on system_versions for insert
  to authenticated
  with check (
    auth.is_editor(auth.uid())
    and created_by = auth.uid()
  );

create policy "Allow editors view own versions"
  on system_versions for select
  to authenticated
  using (
    created_by = auth.uid()
    or auth.is_admin(auth.uid())
  );

create policy "Allow admins manage versions"
  on system_versions for all
  to authenticated
  using (auth.is_admin(auth.uid()))
  with check (auth.is_admin(auth.uid()));

-- Create trigger to archive current version before update
create or replace function archive_system_version()
returns trigger as $$
begin
  if TG_OP = 'UPDATE' and OLD.status = 'published' then
    insert into system_versions (
      system_id,
      data,
      version_number,
      created_by,
      status
    ) values (
      OLD.id,
      to_jsonb(OLD),
      get_next_version_number(OLD.id),
      OLD.created_by,
      'published'
    );
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger archive_system_version_trigger
  before update on systems
  for each row
  execute function archive_system_version();