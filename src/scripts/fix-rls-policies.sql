-- Drop existing policies
drop policy if exists "Allow public read access to systems" on systems;
drop policy if exists "Allow admin full access to systems" on systems;
drop policy if exists "Allow editors to manage own systems" on systems;
drop policy if exists "Allow editors to create systems" on systems;
drop policy if exists "Allow editors to update own draft systems" on systems;
drop policy if exists "Allow editors to view own systems" on systems;

-- Recreate policies with proper USING and WITH CHECK clauses
create policy "Allow public read access to systems"
  on systems for select
  to anon, authenticated
  using (true);

create policy "Allow admin full access to systems"
  on systems for all
  to authenticated
  using (auth.is_admin(auth.uid()))
  with check (auth.is_admin(auth.uid()));

create policy "Allow editors to create systems"
  on systems for insert
  to authenticated
  using (auth.is_editor(auth.uid()))
  with check (auth.is_editor(auth.uid()));

create policy "Allow editors to update own draft systems"
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

create policy "Allow editors to view own systems"
  on systems for select
  to authenticated
  using (
    created_by = auth.uid()
    or status = 'published'
    or auth.is_admin(auth.uid())
  );

-- Drop and recreate system_revisions policies
drop policy if exists "Allow editors to create revisions" on system_revisions;
drop policy if exists "Allow editors to view own revisions" on system_revisions;
drop policy if exists "Allow admins to manage revisions" on system_revisions;

create policy "Allow editors to create revisions"
  on system_revisions for insert
  to authenticated
  using (auth.is_editor(auth.uid()))
  with check (auth.is_editor(auth.uid()));

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
  using (auth.is_admin(auth.uid()))
  with check (auth.is_admin(auth.uid()));