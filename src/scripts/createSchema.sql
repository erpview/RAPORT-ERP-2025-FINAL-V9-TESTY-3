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
  -- Basic modules
  finance boolean,
  production boolean,
  warehouse boolean,
  crm boolean,
  bi boolean,
  hr boolean,
  -- Deployment options
  cloud boolean,
  onpremise boolean,
  hybrid boolean,
  mobile boolean,
  api boolean,
  -- New detailed information
  pricing_model text[], -- e.g., ["subscription", "perpetual", "user-based"]
  implementation_time text, -- e.g., "3-6 months"
  target_industries text[], -- e.g., ["Manufacturing", "Retail", "Services"]
  languages text[], -- e.g., ["Polish", "English", "German"]
  support_options text[], -- e.g., ["Phone", "Email", "Chat", "On-site"]
  training_options text[], -- e.g., ["Online", "On-site", "Documentation"]
  customization_level text, -- e.g., "High", "Medium", "Low"
  update_frequency text, -- e.g., "Monthly", "Quarterly", "Yearly"
  min_users integer, -- Minimum number of users
  max_users integer, -- Maximum number of users (null for unlimited)
  integration_options text[], -- e.g., ["API", "Web Services", "File Import/Export"]
  security_features text[], -- e.g., ["2FA", "Role-based access", "Audit trails"]
  compliance_standards text[], -- e.g., ["GDPR", "ISO 27001", "SOC 2"]
  backup_options text[], -- e.g., ["Automatic", "Manual", "Cloud storage"]
  reporting_features text[], -- e.g., ["Custom reports", "Dashboards", "Export to Excel"]
  created_at timestamptz default now() not null,
  -- Add unique constraint on name
  constraint systems_name_key unique (name)
);

-- Create index on vendor name for faster searches
create index if not exists systems_vendor_idx on systems(vendor);