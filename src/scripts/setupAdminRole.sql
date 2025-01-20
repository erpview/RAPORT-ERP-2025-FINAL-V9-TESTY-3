-- Create user_roles table if it doesn't exist
create table if not exists user_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint user_roles_user_id_key unique (user_id)
);

-- Insert admin role for the user
-- Replace USER_ID with the actual user ID from Supabase dashboard
insert into user_roles (user_id, role)
values ('USER_ID', 'admin');