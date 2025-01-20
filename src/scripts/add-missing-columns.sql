-- Add the missing overlay columns
ALTER TABLE public.slides
ADD COLUMN IF NOT EXISTS overlay_heading text DEFAULT '',
ADD COLUMN IF NOT EXISTS overlay_description text DEFAULT '',
ADD COLUMN IF NOT EXISTS button_text text DEFAULT '',
ADD COLUMN IF NOT EXISTS button_url text DEFAULT '';

-- Grant permissions
GRANT ALL ON public.slides TO authenticated;
GRANT SELECT ON public.slides TO anon;

-- Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');

-- Verify the columns were added
SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'slides'
    AND column_name = 'overlay_heading'
) as has_overlay_heading,
EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'slides'
    AND column_name = 'overlay_description'
) as has_overlay_description,
EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'slides'
    AND column_name = 'button_text'
) as has_button_text,
EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'slides'
    AND column_name = 'button_url'
) as has_button_url;
