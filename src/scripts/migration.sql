-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Drop existing policies and tables if they exist
drop policy if exists "Allow public read access to systems" on systems;
drop policy if exists "Allow admin full access to systems" on systems;
drop policy if exists "Allow admins to read roles" on user_roles;
drop policy if exists "Allow users to read own role" on user_roles;
drop policy if exists "Allow admins to manage roles" on user_roles;

drop table if exists systems cascade;
drop table if exists user_roles cascade;

-- Create systems table
create table systems (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  vendor text not null,
  website text not null,
  description text not null,
  size text[] not null,
  
  -- Basic modules (boolean fields)
  finance boolean default false,
  hr boolean default false,
  scm boolean default false,
  production boolean default false,
  crm boolean default false,
  warehouse boolean default false,
  purchasing boolean default false,
  
  -- Special modules (boolean fields)
  project boolean default false,
  bi boolean default false,
  grc boolean default false,
  dam boolean default false,
  cmms boolean default false,
  plm boolean default false,
  rental boolean default false,
  ecommerce boolean default false,
  
  -- Connectivity modules (boolean fields)
  edi boolean default false,
  iot boolean default false,
  api boolean default false,
  dms boolean default false,
  mobile boolean default false,
  portals boolean default false,
  
  -- Technical aspects
  customization_level text check (customization_level in ('Low', 'Medium', 'High')),
  update_frequency text check (update_frequency in ('Monthly', 'Quarterly', 'Semi-annually', 'Annually', 'No-data', 'When-client-ask', 'Regular', 'Regular-and-when-client-ask')),
  supported_databases text[],
  multilingual boolean default false,
  max_users integer,
  concurrent_users integer,
  
  -- Detailed information
  pricing_model text[] check (pricing_model is null or pricing_model <@ array['subscription', 'perpetual', 'user-based']::text[]),
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
  
  -- Metadata
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  created_by uuid references auth.users not null,
  
  -- Add unique constraint on name
  constraint systems_name_key unique (name)
);

-- Create user_roles table
create table user_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  is_active boolean default true not null,
  
  -- Each user can only have one active role
  constraint user_roles_user_id_key unique (user_id)
);

-- Create indexes for better query performance
create index systems_vendor_idx on systems(vendor);
create index systems_size_idx on systems using gin(size);
create index systems_target_industries_idx on systems using gin(target_industries);
create index systems_languages_idx on systems using gin(languages);
create index systems_created_by_idx on systems(created_by);
create index user_roles_user_id_idx on user_roles(user_id);
create index user_roles_role_idx on user_roles(role) where is_active = true;

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_systems_updated_at
  before update on systems
  for each row
  execute function update_updated_at_column();

create trigger update_user_roles_updated_at
  before update on user_roles
  for each row
  execute function update_updated_at_column();

-- Enable Row Level Security
alter table systems enable row level security;
alter table user_roles enable row level security;

-- Create security definer function to check admin status
create or replace function auth.is_admin(checking_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from user_roles
    where user_id = checking_user_id
    and role = 'admin'
    and is_active = true
  );
end;
$$ language plpgsql security definer;

-- Create RLS policies for systems table
create policy "Allow public read access to systems"
  on systems for select
  to anon, authenticated
  using (true);

create policy "Allow admin full access to systems"
  on systems for all
  to authenticated
  using (auth.is_admin(auth.uid()));

-- Create RLS policies for user_roles table
create policy "Allow users to read own role"
  on user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow admins to manage roles"
  on user_roles for all
  to authenticated
  using (auth.is_admin(auth.uid()));