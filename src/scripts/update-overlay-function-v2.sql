-- First, drop the existing function with all possible parameter combinations
DROP FUNCTION IF EXISTS public.update_slide_overlay(bigint, text, text, text, text);
DROP FUNCTION IF EXISTS public.update_slide_overlay(integer, text, text, text, text);

-- Create the function with exact parameter types matching the frontend
CREATE OR REPLACE FUNCTION public.update_slide_overlay(
    slide_id integer,  -- Changed from bigint to integer to match frontend
    p_overlay_heading text,
    p_overlay_description text,
    p_button_text text,
    p_button_url text
) RETURNS json AS $$
BEGIN
    UPDATE public.slides
    SET 
        overlay_heading = p_overlay_heading,
        overlay_description = p_overlay_description,
        button_text = p_button_text,
        button_url = p_button_url,
        updated_at = NOW()
    WHERE id = slide_id;

    -- Return a simple success response
    RETURN json_build_object(
        'success', true,
        'slide_id', slide_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.update_slide_overlay TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_slide_overlay TO service_role;

-- Force a schema cache reload
NOTIFY pgrst, 'reload schema';

-- Additional step to ensure schema cache is updated
SELECT pg_notify('pgrst', 'reload schema');
