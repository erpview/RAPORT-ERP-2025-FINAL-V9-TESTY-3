-- Add is_required column to survey_fields table
ALTER TABLE survey_fields
ADD COLUMN is_required boolean NOT NULL DEFAULT false;
