-- Add status column to systems table
alter table systems 
add column if not exists status text 
check (status in ('draft', 'pending', 'published', 'rejected')) 
default 'draft';

-- Add review-related columns
alter table systems add column if not exists review_notes text;
alter table systems add column if not exists reviewed_by uuid references auth.users;
alter table systems add column if not exists reviewed_at timestamptz;

-- Create index for status
create index if not exists systems_status_idx on systems(status);

-- Update existing rows to have 'published' status
update systems set status = 'published' where status is null;