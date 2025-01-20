-- Drop existing function
DROP FUNCTION IF EXISTS public.update_slide_overlay(integer, text, text, text, text);

-- Create function with parameters in the exact order PostgREST is expecting
CREATE OR REPLACE FUNCTION public.update_slide_overlay(
    p_button_text text,
    p_button_url text,
    p_overlay_description text,
    p_overlay_heading text,
    slide_id integer
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.slides
    SET 
        button_text = p_button_text,
        button_url = p_button_url,
        overlay_description = p_overlay_description,
        overlay_heading = p_overlay_heading,
        updated_at = NOW()
    WHERE id = slide_id;

    RETURN json_build_object(
        'success', true,
        'slide_id', slide_id
    );
END;
$$;

-- Reset permissions
REVOKE ALL ON FUNCTION public.update_slide_overlay(text, text, text, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_slide_overlay(text, text, text, text, integer) FROM anon;
REVOKE ALL ON FUNCTION public.update_slide_overlay(text, text, text, text, integer) FROM authenticated;
REVOKE ALL ON FUNCTION public.update_slide_overlay(text, text, text, text, integer) FROM service_role;

-- Grant new permissions
GRANT EXECUTE ON FUNCTION public.update_slide_overlay(text, text, text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_slide_overlay(text, text, text, text, integer) TO service_role;

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');
