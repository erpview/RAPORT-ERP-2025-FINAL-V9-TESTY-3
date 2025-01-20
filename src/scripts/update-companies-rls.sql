-- Drop existing policies
drop policy if exists "Public can view published companies" on companies;
drop policy if exists "Authenticated users can view all companies" on companies;
drop policy if exists "Admin users can insert companies" on companies;
drop policy if exists "Admin users can update companies" on companies;
drop policy if exists "Admin users can delete companies" on companies;
drop policy if exists "Editors can manage their own companies" on companies;

-- Allow public read access to published companies
create policy "Public can view published companies"
on companies
for select
using (status = 'published');

-- Allow authenticated users to view all companies
create policy "Authenticated users can view all companies"
on companies
for select
to authenticated
using (true);

-- Allow admin users to manage all companies
create policy "Admin users can manage companies"
on companies
for all
to authenticated
using (
  exists (
    select 1 
    from user_management 
    where user_id = auth.uid() 
    and role = 'admin'
    and is_active = true
  )
)
with check (
  exists (
    select 1 
    from user_management 
    where user_id = auth.uid() 
    and role = 'admin'
    and is_active = true
  )
);

-- Allow editors to manage their own companies
create policy "Editors can manage their own companies"
on companies
for all
to authenticated
using (
  auth.uid() = created_by
  and exists (
    select 1 
    from user_management 
    where user_id = auth.uid() 
    and role = 'editor'
    and is_active = true
  )
)
with check (
  auth.uid() = created_by
  and exists (
    select 1 
    from user_management 
    where user_id = auth.uid() 
    and role = 'editor'
    and is_active = true
  )
);
