-- Drop existing function if exists
DROP FUNCTION IF EXISTS update_slide_overlay;

-- Create function to update slide overlay fields
CREATE OR REPLACE FUNCTION public.update_slide_overlay(
    slide_id bigint,
    p_overlay_heading text,
    p_overlay_description text,
    p_button_text text,
    p_button_url text
) RETURNS json AS $$
DECLARE
    result json;
BEGIN
    UPDATE public.slides
    SET 
        overlay_heading = p_overlay_heading,
        overlay_description = p_overlay_description,
        button_text = p_button_text,
        button_url = p_button_url,
        updated_at = NOW()
    WHERE id = slide_id
    RETURNING json_build_object(
        'id', id,
        'overlay_heading', overlay_heading,
        'overlay_description', overlay_description,
        'button_text', button_text,
        'button_url', button_url
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_slide_overlay TO authenticated;

-- Notify PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
