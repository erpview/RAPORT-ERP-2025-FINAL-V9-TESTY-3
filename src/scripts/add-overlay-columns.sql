-- Add the new columns to the slides table
ALTER TABLE public.slides 
ADD COLUMN IF NOT EXISTS overlay_heading text DEFAULT '',
ADD COLUMN IF NOT EXISTS overlay_description text DEFAULT '',
ADD COLUMN IF NOT EXISTS button_text text DEFAULT '',
ADD COLUMN IF NOT EXISTS button_url text DEFAULT '';

-- Grant permissions on the new columns
GRANT ALL ON public.slides TO authenticated;
GRANT ALL ON public.slides TO service_role;

-- Force schema cache reload
SELECT pg_notify('pgrst', 'reload schema');

-- Verify columns exist
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'slides'
ORDER BY ordinal_position;
