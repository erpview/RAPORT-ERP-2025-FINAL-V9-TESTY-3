-- Add form banner fields to partner_pages table
ALTER TABLE partner_pages
ADD COLUMN IF NOT EXISTS form_banner_url TEXT,
ADD COLUMN IF NOT EXISTS form_url TEXT;
