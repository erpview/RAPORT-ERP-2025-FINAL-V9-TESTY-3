-- Add publishing status to systems table
alter table systems add column if not exists status text check (status in ('draft', 'pending', 'published', 'rejected')) default 'draft';
alter table systems add column if not exists review_notes text;
alter table systems add column if not exists reviewed_by uuid references auth.users;
alter table systems add column if not exists reviewed_at timestamptz;

-- Create table for system revisions
create table if not exists system_revisions (
  id uuid primary key default uuid_generate_v4(),
  system_id uuid references systems not null,
  data jsonb not null,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_by uuid references auth.users not null,
  created_at timestamptz default now() not null,
  reviewed_by uuid references auth.users,
  reviewed_at timestamptz,
  review_notes text
);

-- Create a trigger to enforce one pending revision per system
create or replace function check_pending_revision()
returns trigger as $$
begin
  if NEW.status = 'pending' and exists (
    select 1 from system_revisions 
    where system_id = NEW.system_id 
    and status = 'pending' 
    and id != NEW.id
  ) then
    raise exception 'Only one pending revision allowed per system';
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger enforce_one_pending_revision
  before insert or update on system_revisions
  for each row
  execute function check_pending_revision();

-- Create indexes
create index system_revisions_system_id_idx on system_revisions(system_id);
create index system_revisions_created_by_idx on system_revisions(created_by);
create index system_revisions_status_idx on system_revisions(status);

-- Enable RLS
alter table system_revisions enable row level security;

-- Create RLS policies for system_revisions
create policy "Allow editors to create revisions"
  on system_revisions for insert
  to authenticated
  using (auth.is_editor(auth.uid()));

create policy "Allow editors to view own revisions"
  on system_revisions for select
  to authenticated
  using (
    auth.is_editor(auth.uid()) and created_by = auth.uid()
    or auth.is_admin(auth.uid())
  );

create policy "Allow admins to manage revisions"
  on system_revisions for all
  to authenticated
  using (auth.is_admin(auth.uid()));

-- Update systems table policies
drop policy if exists "Allow editors to manage own systems" on systems;

create policy "Allow editors to create systems"
  on systems for insert
  to authenticated
  using (auth.is_editor(auth.uid()));

create policy "Allow editors to update own draft systems"
  on systems for update
  to authenticated
  using (
    auth.is_editor(auth.uid()) 
    and created_by = auth.uid()
    and status = 'draft'
  );

create policy "Allow editors to view own systems"
  on systems for select
  to authenticated
  using (
    created_by = auth.uid()
    or status = 'published'
    or auth.is_admin(auth.uid())
  );