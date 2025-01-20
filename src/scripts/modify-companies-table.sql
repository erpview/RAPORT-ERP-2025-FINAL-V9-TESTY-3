-- First, drop columns we don't need anymore
ALTER TABLE companies
DROP COLUMN IF EXISTS industry,
DROP COLUMN IF EXISTS size,
DROP COLUMN IF EXISTS year_founded,
DROP COLUMN IF EXISTS headquarters,
DROP COLUMN IF EXISTS revenue_range,
DROP COLUMN IF EXISTS employee_count,
DROP COLUMN IF EXISTS erp_system,
DROP COLUMN IF EXISTS implementation_year,
DROP COLUMN IF EXISTS implementation_time,
DROP COLUMN IF EXISTS modules_implemented,
DROP COLUMN IF EXISTS roi_achieved,
DROP COLUMN IF EXISTS key_benefits,
DROP COLUMN IF EXISTS challenges_faced,
DROP COLUMN IF EXISTS success_factors,
DROP COLUMN IF EXISTS deployment_type,
DROP COLUMN IF EXISTS integration_points,
DROP COLUMN IF EXISTS customizations;

-- Add new columns
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS street text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS nip text,
ADD COLUMN IF NOT EXISTS logo_url text;

-- Add constraints
ALTER TABLE companies
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN street SET NOT NULL,
ALTER COLUMN postal_code SET NOT NULL,
ALTER COLUMN city SET NOT NULL,
ALTER COLUMN phone SET NOT NULL,
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN nip SET NOT NULL,
ALTER COLUMN description SET NOT NULL,
ALTER COLUMN website SET NOT NULL;

-- Add validation for postal code (XX-XXX format)
ALTER TABLE companies
ADD CONSTRAINT valid_postal_code CHECK (postal_code ~ '^\d{2}-\d{3}$');

-- Add validation for email
ALTER TABLE companies
ADD CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$');

-- Add validation for phone (polish format)
ALTER TABLE companies
ADD CONSTRAINT valid_phone CHECK (phone ~ '^\+?[0-9]{9,12}$');

-- Keep metadata and SEO fields
-- id, created_at, created_by, updated_at, updated_by, status, slug, meta_title, meta_description, canonical_url
