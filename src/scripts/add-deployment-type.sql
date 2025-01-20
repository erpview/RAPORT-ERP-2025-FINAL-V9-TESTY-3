-- Add deployment_type column to systems table
alter table systems 
add column if not exists deployment_type text[] check (deployment_type <@ array['cloud', 'onpremise', 'hybrid']::text[]);

-- Create index for better performance
create index if not exists systems_deployment_type_idx on systems using gin(deployment_type);

-- Update existing records to have empty array if null
update systems 
set deployment_type = array[]::text[]
where deployment_type is null;