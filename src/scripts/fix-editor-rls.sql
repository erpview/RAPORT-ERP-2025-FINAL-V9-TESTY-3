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