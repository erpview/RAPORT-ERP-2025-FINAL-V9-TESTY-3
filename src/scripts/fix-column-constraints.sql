-- Make columns nullable and add defaults
ALTER TABLE public.slides
  ALTER COLUMN overlay_heading SET DEFAULT '',
  ALTER COLUMN overlay_heading DROP NOT NULL,
  ALTER COLUMN button_text SET DEFAULT '',
  ALTER COLUMN button_text DROP NOT NULL,
  ALTER COLUMN button_url SET DEFAULT '',
  ALTER COLUMN button_url DROP NOT NULL;

-- Update existing rows to have empty strings instead of nulls
UPDATE public.slides
SET 
  overlay_heading = COALESCE(overlay_heading, ''),
  overlay_description = COALESCE(overlay_description, ''),
  button_text = COALESCE(button_text, ''),
  button_url = COALESCE(button_url, '');

-- Force schema cache reload
SELECT pg_notify('pgrst', 'reload schema');
