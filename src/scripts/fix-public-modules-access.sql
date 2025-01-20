-- Drop existing policies if they exist
drop policy if exists "Allow public read access to system_modules" on system_modules;
drop policy if exists "Allow public read access to system_fields" on system_fields;

-- Enable RLS on system_modules and system_fields tables if not already enabled
alter table system_modules enable row level security;
alter table system_fields enable row level security;

-- Create policy for public read access to system_modules
create policy "Allow public read access to system_modules"
  on system_modules for select
  to anon, authenticated
  using (true);

-- Create policy for public read access to system_fields
create policy "Allow public read access to system_fields"
  on system_fields for select
  to anon, authenticated
  using (true);
