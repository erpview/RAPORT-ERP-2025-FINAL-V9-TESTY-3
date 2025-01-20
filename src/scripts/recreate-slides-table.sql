-- Start transaction
BEGIN;

-- Create new slides table
CREATE TABLE IF NOT EXISTS slides_new (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    overlay_heading TEXT NOT NULL,
    overlay_description TEXT,
    button_text TEXT NOT NULL,
    button_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copy data from old table to new table
INSERT INTO slides_new (
    id, 
    title, 
    image_url, 
    link_url, 
    order_index,
    overlay_heading,
    overlay_description,
    button_text,
    button_url,
    created_at,
    updated_at
)
SELECT 
    id,
    title,
    image_url,
    link_url,
    order_index,
    COALESCE(overlay_heading, title) as overlay_heading,
    overlay_description,
    COALESCE(button_text, 'Zobacz więcej') as button_text,
    COALESCE(button_url, link_url) as button_url,
    created_at,
    updated_at
FROM slides;

-- Store the sequence name
DO $$
DECLARE
    seq_name text;
BEGIN
    seq_name := pg_get_serial_sequence('slides_new', 'id');
    EXECUTE format('SELECT setval(%L, COALESCE((SELECT MAX(id) FROM slides_new), 1), true)', seq_name);
END $$;

-- Grant permissions on new table and its sequence
GRANT ALL ON slides_new TO authenticated;
GRANT SELECT ON slides_new TO anon;
GRANT USAGE, SELECT ON SEQUENCE slides_new_id_seq TO authenticated;

-- Drop old table
DROP TABLE slides;

-- Rename new table to slides
ALTER TABLE slides_new RENAME TO slides;

-- Rename sequence
ALTER SEQUENCE slides_new_id_seq RENAME TO slides_id_seq;

-- Recreate the updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to new table
DROP TRIGGER IF EXISTS set_updated_at ON public.slides;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.slides
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Update permissions for renamed objects
GRANT ALL ON slides TO authenticated;
GRANT SELECT ON slides TO anon;
GRANT USAGE, SELECT ON SEQUENCE slides_id_seq TO authenticated;

COMMIT;
