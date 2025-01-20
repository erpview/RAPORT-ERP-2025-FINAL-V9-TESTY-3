-- Create user_roles table
create table if not exists user_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Each user can only have one role
  constraint user_roles_user_id_key unique (user_id)
);

-- Create RLS policies
alter table user_roles enable row level security;

-- Only admins can view roles
create policy "Admins can view all roles"
  on user_roles for select
  using (auth.uid() in (
    select user_id from user_roles where role = 'admin'
  ));

-- Only admins can modify roles
create policy "Admins can modify roles"
  on user_roles for all
  using (auth.uid() in (
    select user_id from user_roles where role = 'admin'
  ));