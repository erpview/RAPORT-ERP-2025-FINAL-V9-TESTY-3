-- Drop existing wrapper if exists
DROP FUNCTION IF EXISTS public.update_slide_overlay_v2;

-- Create a new version of the function with named parameters
CREATE OR REPLACE FUNCTION public.update_slide_overlay_v2(
    _slide_id integer,
    _overlay_heading text DEFAULT '',
    _overlay_description text DEFAULT '',
    _button_text text DEFAULT '',
    _button_url text DEFAULT ''
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.slides
    SET 
        overlay_heading = _overlay_heading,
        overlay_description = _overlay_description,
        button_text = _button_text,
        button_url = _button_url,
        updated_at = NOW()
    WHERE id = _slide_id;

    RETURN json_build_object(
        'success', true,
        'slide_id', _slide_id
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.update_slide_overlay_v2(integer, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_slide_overlay_v2(integer, text, text, text, text) TO service_role;

-- Add comment for PostgREST
COMMENT ON FUNCTION public.update_slide_overlay_v2(integer, text, text, text, text) 
IS 'Updates slide overlay information with named parameters';

-- Force schema reload
SELECT pg_notify('pgrst', 'reload schema');
