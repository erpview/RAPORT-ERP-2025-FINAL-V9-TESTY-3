-- First, let's create a dummy function to force schema reload
CREATE OR REPLACE FUNCTION public.force_schema_reload()
RETURNS void AS $$
BEGIN
    -- Do nothing, just here to trigger schema reload
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the function to force cache invalidation
DROP FUNCTION IF EXISTS public.force_schema_reload();

-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');

-- Add explicit comments on the new columns to ensure they're exposed
COMMENT ON COLUMN public.slides.overlay_heading IS 'Heading text for slide overlay';
COMMENT ON COLUMN public.slides.overlay_description IS 'Description text for slide overlay';
COMMENT ON COLUMN public.slides.button_text IS 'Text for the overlay button';
COMMENT ON COLUMN public.slides.button_url IS 'URL for the overlay button';

-- Verify PostgREST can see the columns
SELECT 
    table_name,
    column_name,
    is_updatable,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'slides'
    AND column_name IN ('overlay_heading', 'overlay_description', 'button_text', 'button_url');
