-- Create a wrapper function that takes a single JSON parameter
CREATE OR REPLACE FUNCTION public.update_slide_overlay_wrapper(params json)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN public.update_slide_overlay(
        (params->>'p_button_text')::text,
        (params->>'p_button_url')::text,
        (params->>'p_overlay_description')::text,
        (params->>'p_overlay_heading')::text,
        (params->>'slide_id')::integer
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.update_slide_overlay_wrapper(json) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_slide_overlay_wrapper(json) TO service_role;

-- Add comment for PostgREST
COMMENT ON FUNCTION public.update_slide_overlay_wrapper(json) IS 'Updates slide overlay information via JSON parameters';

-- Force schema reload
SELECT pg_notify('pgrst', 'reload schema');
