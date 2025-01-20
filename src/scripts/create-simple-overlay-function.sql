-- Drop any existing functions
DROP FUNCTION IF EXISTS public.update_slide_overlay_simple;

-- Create a simpler function with minimal parameters
CREATE OR REPLACE FUNCTION public.update_slide_overlay_simple(
    _id integer,
    _heading text,
    _description text
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.slides
    SET 
        overlay_heading = _heading,
        overlay_description = _description,
        updated_at = NOW()
    WHERE id = _id;

    RETURN json_build_object(
        'success', true,
        'id', _id
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.update_slide_overlay_simple(integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_slide_overlay_simple(integer, text, text) TO service_role;

-- Add comment for PostgREST
COMMENT ON FUNCTION public.update_slide_overlay_simple(integer, text, text) 
IS 'Updates slide overlay heading and description';

-- Force schema reload
SELECT pg_notify('pgrst', 'reload schema');
