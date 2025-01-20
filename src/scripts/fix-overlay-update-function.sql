-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.update_slide_overlay;

-- Create the function with proper parameter names and types
CREATE OR REPLACE FUNCTION public.update_slide_overlay(
    slide_id integer,
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
        button_url = p_button_url
    WHERE id = slide_id;

    -- Return updated row as JSON
    RETURN json_build_object(
        'success', true,
        'updated_id', slide_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.update_slide_overlay TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_slide_overlay TO service_role;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
