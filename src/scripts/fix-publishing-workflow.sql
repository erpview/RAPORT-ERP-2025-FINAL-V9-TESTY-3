-- First create the system_revisions table
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

-- Create indexes
create index if not exists system_revisions_system_id_idx on system_revisions(system_id);
create index if not exists system_revisions_created_by_idx on system_revisions(created_by);
create index if not exists system_revisions_status_idx on system_revisions(status);

-- Enable RLS
alter table system_revisions enable row level security;

-- Drop existing policies
drop policy if exists "Allow public read access to systems" on systems;
drop policy if exists "Allow admin full access to systems" on systems;
drop policy if exists "Allow editors to manage own systems" on systems;
drop policy if exists "Allow editors to create systems" on systems;
drop policy if exists "Allow editors to update own draft systems" on systems;
drop policy if exists "Allow editors to view own systems" on systems;

-- Create separate policies for different operations
-- READ policy (no WITH CHECK needed for SELECT)
create policy "Allow public read access to systems"
  on systems for select
  to anon, authenticated
  using (true);

-- Admin policies
create policy "Allow admin insert systems"
  on systems for insert
  to authenticated
  with check (auth.is_admin(auth.uid()));

create policy "Allow admin update systems"
  on systems for update
  to authenticated
  using (auth.is_admin(auth.uid()))
  with check (auth.is_admin(auth.uid()));

create policy "Allow admin delete systems"
  on systems for delete
  to authenticated
  using (auth.is_admin(auth.uid()));

-- Editor policies
create policy "Allow editors insert systems"
  on systems for insert
  to authenticated
  with check (
    auth.is_editor(auth.uid()) 
    and auth.uid() = created_by
    and status = 'draft'
  );

create policy "Allow editors update own draft systems"
  on systems for update
  to authenticated
  using (
    auth.is_editor(auth.uid()) 
    and created_by = auth.uid()
    and status = 'draft'
  )
  with check (
    auth.is_editor(auth.uid()) 
    and created_by = auth.uid()
    and status = 'draft'
  );

-- System revisions policies
create policy "Allow editors create revisions"
  on system_revisions for insert
  to authenticated
  with check (
    auth.is_editor(auth.uid()) 
    and auth.uid() = created_by
  );

create policy "Allow editors view revisions"
  on system_revisions for select
  to authenticated
  using (
    (auth.is_editor(auth.uid()) and created_by = auth.uid())
    or auth.is_admin(auth.uid())
  );

create policy "Allow admins manage revisions"
  on system_revisions for all
  to authenticated
  using (auth.is_admin(auth.uid()))
  with check (auth.is_admin(auth.uid()));