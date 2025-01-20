-- Create user management table
create table if not exists user_management (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  email text not null,
  role text not null check (role in ('admin', 'editor', 'user')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  constraint user_management_user_id_key unique (user_id),
  constraint user_management_email_key unique (email)
);

-- Enable RLS
alter table user_management enable row level security;

-- Create admin check function
create or replace function auth.is_super_admin(checking_user_id uuid)
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

-- Create policies
create policy "Allow admins to manage users"
  on user_management for all
  to authenticated
  using (auth.is_super_admin(auth.uid()))
  with check (auth.is_super_admin(auth.uid()));

create policy "Allow users to view own record"
  on user_management for select
  to authenticated
  using (auth.uid() = user_id);

-- Create trigger for updated_at
create trigger update_user_management_updated_at
  before update on user_management
  for each row
  execute function update_updated_at_column();