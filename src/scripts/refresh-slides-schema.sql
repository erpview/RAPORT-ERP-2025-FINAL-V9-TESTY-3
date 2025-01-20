-- Start transaction
BEGIN;

-- Verify columns exist and refresh schema
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'slides' 
    AND column_name = 'button_text'
);

-- Re-add columns if they don't exist
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE public.slides
        ADD COLUMN IF NOT EXISTS overlay_heading TEXT,
        ADD COLUMN IF NOT EXISTS overlay_description TEXT,
        ADD COLUMN IF NOT EXISTS button_text TEXT,
        ADD COLUMN IF NOT EXISTS button_url TEXT;
    EXCEPTION WHEN duplicate_column THEN 
        NULL;
    END;
END $$;

-- Update existing slides to have default values if not set
UPDATE public.slides
SET 
    button_text = COALESCE(button_text, title, 'Zobacz więcej'),
    button_url = COALESCE(button_url, link_url),
    overlay_heading = COALESCE(overlay_heading, title)
WHERE button_text IS NULL OR button_url IS NULL OR overlay_heading IS NULL;

-- Make sure NOT NULL constraints are in place
ALTER TABLE public.slides
ALTER COLUMN button_text SET NOT NULL,
ALTER COLUMN button_url SET NOT NULL;

-- Refresh the schema cache for this table
NOTIFY pgrst, 'reload schema';

COMMIT;
