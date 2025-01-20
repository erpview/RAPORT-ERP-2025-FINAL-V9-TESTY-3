-- Add deployment type columns if they don't exist
alter table systems 
add column if not exists deployment_type text[] check (deployment_type <@ array['cloud', 'onpremise', 'hybrid']::text[]);