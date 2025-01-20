-- Drop all existing versions of the function
DROP FUNCTION IF EXISTS public.update_slide_overlay(integer, text, text, text, text);
DROP FUNCTION IF EXISTS public.update_slide_overlay(bigint, text, text, text, text);

-- Create a new version with explicit parameter names and types
CREATE OR REPLACE FUNCTION public.update_slide_overlay(
    "slide_id" int,  -- Using double quotes to preserve case
    "p_overlay_heading" text,
    "p_overlay_description" text,
    "p_button_text" text,
    "p_button_url" text
) RETURNS json 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.slides
    SET 
        overlay_heading = p_overlay_heading,
        overlay_description = p_overlay_description,
        button_text = p_button_text,
        button_url = p_button_url,
        updated_at = NOW()
    WHERE id = slide_id;

    RETURN json_build_object(
        'success', true,
        'slide_id', slide_id
    );
END;
$$;

-- Reset permissions
REVOKE ALL ON FUNCTION public.update_slide_overlay(int, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_slide_overlay(int, text, text, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.update_slide_overlay(int, text, text, text, text) FROM authenticated;
REVOKE ALL ON FUNCTION public.update_slide_overlay(int, text, text, text, text) FROM service_role;

-- Grant new permissions
GRANT EXECUTE ON FUNCTION public.update_slide_overlay(int, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_slide_overlay(int, text, text, text, text) TO service_role;

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');
