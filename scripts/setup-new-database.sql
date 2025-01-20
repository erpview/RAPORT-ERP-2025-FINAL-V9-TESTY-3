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

-- Create RLS policies for profiles table
alter table public.profiles enable row level security;

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
    using (
        exists (
            select 1
            from user_management
            where user_id = auth.uid()
            and role = 'admin'
            and is_active = true
        )
    );

create policy "Admin can update all profiles"
    on profiles for update
    to authenticated
    using (
        exists (
            select 1
            from user_management
            where user_id = auth.uid()
            and role = 'admin'
            and is_active = true
        )
    );

-- Create RLS policies for user_management table
alter table public.user_management enable row level security;

create policy "Allow users to insert own record"
    on user_management for insert
    to authenticated
    with check (
        -- Allow users to create their own record during registration
        (auth.uid() = user_id and role = 'user' and not is_active)
        or
        -- Allow admins to create records
        exists (
            select 1
            from user_management
            where user_id = auth.uid()
            and role = 'admin'
            and is_active = true
        )
    );

create policy "Users can view own record"
    on user_management for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Admin can view all records"
    on user_management for select
    to authenticated
    using (
        exists (
            select 1
            from user_management
            where user_id = auth.uid()
            and role = 'admin'
            and is_active = true
        )
    );

create policy "Admin can update all records"
    on user_management for update
    to authenticated
    using (
        exists (
            select 1
            from user_management
            where user_id = auth.uid()
            and role = 'admin'
            and is_active = true
        )
    );

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
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all routines in schema public to anon, authenticated;
