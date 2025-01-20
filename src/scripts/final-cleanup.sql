-- Drop all existing policies first
do $$ 
declare
  r record;
begin
  for r in (
    select policyname 
    from pg_policies 
    where tablename = 'systems'
  ) loop
    execute format('drop policy if exists %I on systems', r.policyname);
  end loop;
end $$;

-- Drop all versioning-related tables
drop table if exists system_versions cascade;
drop table if exists system_revisions cascade;

-- Drop all versioning-related functions
drop function if exists get_next_version_number() cascade;
drop function if exists archive_system_version() cascade;
drop function if exists check_pending_revision() cascade;

-- Drop all versioning-related triggers
drop trigger if exists archive_system_version_trigger on systems cascade;
drop trigger if exists enforce_one_pending_revision on systems cascade;
drop trigger if exists update_version_number_trigger on systems cascade;

-- Recreate systems table from scratch
create table if not exists systems_new (
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

-- Copy data from old table to new table
insert into systems_new (
  select 
    id,
    name,
    vendor,
    website,
    description,
    size,
    finance,
    hr,
    scm,
    production,
    crm,
    warehouse,
    purchasing,
    project,
    bi,
    grc,
    dam,
    cmms,
    plm,
    rental,
    ecommerce,
    edi,
    iot,
    api,
    dms,
    mobile,
    portals,
    customization_level,
    update_frequency,
    supported_databases,
    multilingual,
    max_users,
    concurrent_users,
    pricing_model,
    implementation_time,
    target_industries,
    languages,
    support_options,
    training_options,
    integration_options,
    security_features,
    compliance_standards,
    backup_options,
    reporting_features,
    status,
    review_notes,
    reviewed_by,
    reviewed_at,
    change_notes,
    created_by,
    created_at,
    updated_at
  from systems
);

-- Drop old table and rename new one
drop table systems cascade;
alter table systems_new rename to systems;

-- Create indexes
create index systems_status_idx on systems(status);
create index systems_created_by_idx on systems(created_by);
create index systems_reviewed_by_idx on systems(reviewed_by);

-- Enable RLS
alter table systems enable row level security;

-- Create policies
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
  );

create policy "systems_editor_delete"
  on systems for delete
  to authenticated
  using (
    auth.is_editor(auth.uid())
    and auth.uid() = created_by
    and status in ('draft', 'rejected')
  );