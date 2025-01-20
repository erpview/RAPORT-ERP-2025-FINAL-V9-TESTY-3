-- Drop and recreate the columns to force schema refresh
BEGIN;

-- Temporarily store the data
CREATE TEMP TABLE temp_slides AS 
SELECT id, overlay_heading, overlay_description, button_text, button_url 
FROM public.slides;

-- Drop the columns
ALTER TABLE public.slides 
DROP COLUMN IF EXISTS overlay_heading,
DROP COLUMN IF EXISTS overlay_description,
DROP COLUMN IF EXISTS button_text,
DROP COLUMN IF EXISTS button_url;

-- Re-add the columns
ALTER TABLE public.slides
ADD COLUMN overlay_heading TEXT,
ADD COLUMN overlay_description TEXT,
ADD COLUMN button_text TEXT,
ADD COLUMN button_url TEXT;

-- Restore the data
UPDATE public.slides s
SET 
    overlay_heading = t.overlay_heading,
    overlay_description = t.overlay_description,
    button_text = t.button_text,
    button_url = t.button_url
FROM temp_slides t
WHERE s.id = t.id;

-- Set default values for any NULL fields
UPDATE public.slides
SET 
    button_text = COALESCE(button_text, title, 'Zobacz więcej'),
    button_url = COALESCE(button_url, link_url),
    overlay_heading = COALESCE(overlay_heading, title)
WHERE button_text IS NULL OR button_url IS NULL OR overlay_heading IS NULL;

-- Add NOT NULL constraints
ALTER TABLE public.slides
ALTER COLUMN button_text SET NOT NULL,
ALTER COLUMN button_url SET NOT NULL;

-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
