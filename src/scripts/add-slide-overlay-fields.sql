-- Add new columns to slides table with temporary NULL constraint
ALTER TABLE slides
ADD COLUMN overlay_heading TEXT,
ADD COLUMN overlay_description TEXT,
ADD COLUMN button_text TEXT,
ADD COLUMN button_url TEXT;

-- Update existing slides to have default values
UPDATE slides
SET 
    button_text = COALESCE(title, 'Zobacz więcej'),  -- Use existing title or default text
    button_url = link_url,  -- Copy existing link_url to new button_url
    overlay_heading = title;  -- Use existing title as initial overlay heading

-- Make button fields NOT NULL after setting defaults
ALTER TABLE slides
ALTER COLUMN button_text SET NOT NULL,
ALTER COLUMN button_url SET NOT NULL;

-- Add comment to explain the new columns
COMMENT ON COLUMN slides.overlay_heading IS 'Main heading text displayed on the slide overlay';
COMMENT ON COLUMN slides.overlay_description IS 'Description text displayed below the heading on the slide overlay';
COMMENT ON COLUMN slides.button_text IS 'Text displayed on the slide button';
COMMENT ON COLUMN slides.button_url IS 'URL that the slide button links to';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists for the updated_at column
DROP TRIGGER IF EXISTS set_updated_at ON public.slides;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.slides
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
