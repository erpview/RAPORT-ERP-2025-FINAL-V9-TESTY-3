-- Add new columns for detailed information
ALTER TABLE systems
ADD COLUMN IF NOT EXISTS pricing_model text[],
ADD COLUMN IF NOT EXISTS implementation_time text,
ADD COLUMN IF NOT EXISTS target_industries text[],
ADD COLUMN IF NOT EXISTS languages text[],
ADD COLUMN IF NOT EXISTS support_options text[],
ADD COLUMN IF NOT EXISTS training_options text[],
ADD COLUMN IF NOT EXISTS customization_level text,
ADD COLUMN IF NOT EXISTS update_frequency text,
ADD COLUMN IF NOT EXISTS min_users integer,
ADD COLUMN IF NOT EXISTS max_users integer,
ADD COLUMN IF NOT EXISTS integration_options text[],
ADD COLUMN IF NOT EXISTS security_features text[],
ADD COLUMN IF NOT EXISTS compliance_standards text[],
ADD COLUMN IF NOT EXISTS backup_options text[],
ADD COLUMN IF NOT EXISTS reporting_features text[];