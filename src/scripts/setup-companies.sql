-- Create the companies table
create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  industry text not null,
  website text not null,
  description text not null,
  size text not null,
  
  -- Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references auth.users(id),
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  
  -- SEO fields
  slug text unique,
  meta_title text,
  meta_description text,
  canonical_url text
);

-- Create RLS policies
alter table companies enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Public can view published companies" on companies;
drop policy if exists "Authenticated users can view all companies" on companies;
drop policy if exists "Admin users can insert companies" on companies;
drop policy if exists "Admin users can update companies" on companies;
drop policy if exists "Admin users can delete companies" on companies;

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

-- Allow admin users to insert companies
create policy "Admin users can insert companies"
on companies
for insert
to authenticated
with check (
  auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'role' = 'admin'
  )
);

-- Allow admin users to update companies
create policy "Admin users can update companies"
on companies
for update
to authenticated
using (
  auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'role' = 'admin'
  )
)
with check (
  auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'role' = 'admin'
  )
);

-- Allow admin users to delete companies
create policy "Admin users can delete companies"
on companies
for delete
to authenticated
using (
  auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'role' = 'admin'
  )
);
