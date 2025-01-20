-- Check existing columns in the slides table
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'slides'
ORDER BY ordinal_position;

-- Check if specific overlay columns exist
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
