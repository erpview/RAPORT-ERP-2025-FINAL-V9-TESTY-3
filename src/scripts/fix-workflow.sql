-- First add status column if it doesn't exist
alter table systems 
add column if not exists status text 
check (status in ('draft', 'pending', 'published', 'rejected')) 
default 'draft';

-- Add review-related columns
alter table systems add column if not exists review_notes text;
alter table systems add column if not exists reviewed_by uuid references auth.users;
alter table systems add column if not exists reviewed_at timestamptz;

-- Add created_by if it doesn't exist
do $$ 
begin
  if not exists (
    select from information_schema.columns 
    where table_name = 'systems' and column_name = 'created_by'
  ) then
    alter table systems add column created_by uuid references auth.users;
  end if;
end $$;

-- Create indexes
create index if not exists systems_status_idx on systems(status);
create index if not exists systems_created_by_idx on systems(created_by);

-- Drop existing policies
drop policy if exists "Allow public read access to systems" on systems;
drop policy if exists "Allow admin full access to systems" on systems;
drop policy if exists "Allow editors to manage own systems" on systems;
drop policy if exists "Allow editors to create systems" on systems;
drop policy if exists "Allow editors to update own draft systems" on systems;
drop policy if exists "Allow editors to view own systems" on systems;

-- Create separate policies for different operations
create policy "Allow public read access to systems"
  on systems for select
  to anon, authenticated
  using (status = 'published');

create policy "Allow authenticated users view own systems"
  on systems for select
  to authenticated
  using (
    auth.uid() = created_by
    or auth.is_admin(auth.uid())
    or status = 'published'
  );

create policy "Allow admin full access"
  on systems for all
  to authenticated
  using (auth.is_admin(auth.uid()))
  with check (auth.is_admin(auth.uid()));

create policy "Allow editors create systems"
  on systems for insert
  to authenticated
  with check (
    auth.is_editor(auth.uid())
    and auth.uid() = created_by
    and status in ('draft', 'pending')
  );

create policy "Allow editors update own systems"
  on systems for update
  to authenticated
  using (
    auth.is_editor(auth.uid())
    and auth.uid() = created_by
    and status in ('draft', 'rejected')
  )
  with check (
    auth.is_editor(auth.uid())
    and auth.uid() = created_by
    and status in ('draft', 'pending')
  );

create policy "Allow editors delete own draft systems"
  on systems for delete
  to authenticated
  using (
    auth.is_editor(auth.uid())
    and auth.uid() = created_by
    and status = 'draft'
  );