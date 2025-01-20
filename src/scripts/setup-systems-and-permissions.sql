-- First create the systems table
create table if not exists systems (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  vendor text not null,
  website text not null,
  description text not null,
  size text[] not null,
  
  -- Basic modules
  finance boolean default false,
  hr boolean default false,
  scm boolean default false,
  production boolean default false,
  crm boolean default false,
  warehouse boolean default false,
  purchasing boolean default false,
  
  -- Special modules
  project boolean default false,
  bi boolean default false,
  grc boolean default false,
  dam boolean default false,
  cmms boolean default false,
  plm boolean default false,
  rental boolean default false,
  ecommerce boolean default false,
  
  -- Connectivity modules
  edi boolean default false,
  iot boolean default false,
  api boolean default false,
  dms boolean default false,
  mobile boolean default false,
  portals boolean default false,
  
  -- Technical aspects
  customization_level text check (customization_level in ('Low', 'Medium', 'High')),
  update_frequency text,
  supported_databases text[],
  multilingual boolean default false,
  max_users integer,
  concurrent_users integer,
  
  -- Detailed information
  pricing_model text[],
  implementation_time text,
  target_industries text[],
  languages text[],
  support_options text[],
  training_options text[],
  integration_options text[],
  security_features text[],
  compliance_standards text[],
  backup_options text[],
  reporting_features text[],
  
  -- Review workflow
  status text check (status in ('draft', 'pending', 'published', 'rejected')) default 'draft',
  review_notes text,
  reviewed_by uuid references auth.users,
  reviewed_at timestamptz,
  change_notes text,
  
  -- Metadata
  created_by uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table systems enable row level security;

-- Create indexes
create index if not exists systems_vendor_idx on systems(vendor);
create index if not exists systems_size_idx on systems using gin(size);
create index if not exists systems_target_industries_idx on systems using gin(target_industries);
create index if not exists systems_languages_idx on systems using gin(languages);
create index if not exists systems_created_by_idx on systems(created_by);
create index if not exists systems_status_idx on systems(status);

-- Create admin check function
create or replace function auth.is_admin(checking_user_id uuid)
returns boolean as $$
begin
  -- Only check app_metadata to avoid recursion
  return exists (
    select 1 
    from auth.users 
    where id = checking_user_id 
    and (
      raw_app_meta_data->>'role' = 'admin'
      or raw_app_meta_data->>'role' = 'service_role'
    )
  );
end;
$$ language plpgsql security definer;

-- Create editor check function
create or replace function auth.is_editor(checking_user_id uuid)
returns boolean as $$
begin
  -- Only check app_metadata to avoid recursion
  return exists (
    select 1 
    from auth.users 
    where id = checking_user_id 
    and raw_app_meta_data->>'role' = 'editor'
  );
end;
$$ language plpgsql security definer;

-- Create RLS policies
create policy "systems_public_read"
  on systems for select
  to anon, authenticated
  using (status = 'published');

create policy "systems_authenticated_view"
  on systems for select
  to authenticated
  using (
    auth.uid() = created_by
    or auth.is_admin(auth.uid())
    or status = 'published'
  );

create policy "systems_admin_all"
  on systems for all
  to authenticated
  using (auth.is_admin(auth.uid()))
  with check (auth.is_admin(auth.uid()));

create policy "systems_editor_create"
  on systems for insert
  to authenticated
  with check (
    auth.is_editor(auth.uid())
    and auth.uid() = created_by
    and status in ('draft', 'pending')
  );

create policy "systems_editor_update"
  on systems for update
  to authenticated
  using (
    auth.is_editor(auth.uid())
    and auth.uid() = created_by
    and status in ('draft', 'rejected', 'published')
  )
  with check (
    auth.is_editor(auth.uid())
    and auth.uid() = created_by
    and status in ('draft', 'pending')
  );

create policy "systems_editor_delete"
  on systems for delete
  to authenticated
  using (
    auth.is_editor(auth.uid())
    and auth.uid() = created_by
    and status in ('draft', 'rejected')
  );

-- Grant necessary permissions
grant usage on schema auth to anon, authenticated;
grant select on auth.users to anon, authenticated;
grant select on systems to anon, authenticated;
grant all on systems to authenticated;