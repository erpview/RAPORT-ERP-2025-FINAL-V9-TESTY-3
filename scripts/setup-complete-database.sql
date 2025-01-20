-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    company_name text,
    phone_number text,
    nip text,
    position text,
    industry text,
    company_size text,
    status text default 'pending',
    marketing_accepted boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_management table
create table if not exists public.user_management (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade,
    email text,
    role text default 'user',
    is_active boolean default false,
    status text default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create systems table
create table if not exists public.systems (
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

-- Create system_editors table
create table if not exists public.system_editors (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users on delete cascade,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_management enable row level security;
alter table public.systems enable row level security;
alter table public.system_editors enable row level security;

-- Create indexes for systems table
create index if not exists systems_vendor_idx on systems(vendor);
create index if not exists systems_size_idx on systems using gin(size);
create index if not exists systems_target_industries_idx on systems using gin(target_industries);
create index if not exists systems_languages_idx on systems using gin(languages);
create index if not exists systems_created_by_idx on systems(created_by);
create index if not exists systems_status_idx on systems(status);

-- Create admin and editor check functions
create or replace function auth.is_admin(checking_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from user_management
    where user_id = checking_user_id
    and role = 'admin'
    and is_active = true
  );
end;
$$ language plpgsql security definer;

create or replace function auth.is_editor(checking_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from system_editors
    where user_id = checking_user_id
  );
end;
$$ language plpgsql security definer;

-- RLS Policies for profiles
create policy "Users can view own profile"
    on profiles for select
    to authenticated
    using (auth.uid() = id);

create policy "Users can update own profile"
    on profiles for update
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);

create policy "Users can insert own profile"
    on profiles for insert
    to authenticated
    with check (auth.uid() = id);

create policy "Admin can view all profiles"
    on profiles for select
    to authenticated
    using (auth.is_admin(auth.uid()));

create policy "Admin can update all profiles"
    on profiles for update
    to authenticated
    using (auth.is_admin(auth.uid()));

-- RLS Policies for user_management
create policy "Allow users to insert own record"
    on user_management for insert
    to authenticated
    with check (
        (auth.uid() = user_id and role = 'user' and not is_active)
        or auth.is_admin(auth.uid())
    );

create policy "Users can view own record"
    on user_management for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Admin can view all records"
    on user_management for select
    to authenticated
    using (auth.is_admin(auth.uid()));

create policy "Admin can update all records"
    on user_management for update
    to authenticated
    using (auth.is_admin(auth.uid()));

-- RLS Policies for systems
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

-- RLS Policies for system_editors
create policy "Admin can manage editors"
    on system_editors for all
    to authenticated
    using (auth.is_admin(auth.uid()))
    with check (auth.is_admin(auth.uid()));

create policy "Editors can view own status"
    on system_editors for select
    to authenticated
    using (user_id = auth.uid());

-- Create function to handle user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, full_name, company_name, phone_number, nip, position, industry, company_size, marketing_accepted)
    values (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'company_name',
        new.raw_user_meta_data->>'phone_number',
        new.raw_user_meta_data->>'nip',
        new.raw_user_meta_data->>'position',
        new.raw_user_meta_data->>'industry',
        new.raw_user_meta_data->>'company_size',
        (new.raw_user_meta_data->>'marketing_accepted')::boolean
    );

    insert into public.user_management (user_id, email, role, is_active, status)
    values (
        new.id,
        new.email,
        'user',
        false,
        'pending'
    );

    return new;
end;
$$;

-- Create trigger for new user registration
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant usage on schema auth to anon, authenticated;
grant select on auth.users to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all routines in schema public to anon, authenticated;
