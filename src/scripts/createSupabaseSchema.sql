-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Drop existing table if it exists
drop table if exists systems;

-- Create systems table with all required columns
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
  
  -- Add unique constraint on name
  constraint systems_name_key unique (name)
);

-- Create indexes for better query performance
create index systems_vendor_idx on systems(vendor);
create index systems_size_idx on systems using gin(size);
create index systems_target_industries_idx on systems using gin(target_industries);
create index systems_languages_idx on systems using gin(languages);

-- Create updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_systems_updated_at
  before update on systems
  for each row
  execute function update_updated_at_column();