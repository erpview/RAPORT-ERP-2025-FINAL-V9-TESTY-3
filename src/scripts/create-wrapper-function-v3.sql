-- Create a type to hold our parameters
DROP TYPE IF EXISTS slide_overlay_params CASCADE;
CREATE TYPE slide_overlay_params AS (
    slide_id integer,
    overlay_heading text,
    overlay_description text,
    button_text text,
    button_url text
);

-- Create function that takes our custom type
CREATE OR REPLACE FUNCTION public.update_slide_overlay_v3(
    params slide_overlay_params
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.slides
    SET 
        overlay_heading = params.overlay_heading,
        overlay_description = params.overlay_description,
        button_text = params.button_text,
        button_url = params.button_url,
        updated_at = NOW()
    WHERE id = params.slide_id;

    RETURN json_build_object(
        'success', true,
        'slide_id', params.slide_id
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.update_slide_overlay_v3(slide_overlay_params) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_slide_overlay_v3(slide_overlay_params) TO service_role;

-- Add comment for PostgREST
COMMENT ON FUNCTION public.update_slide_overlay_v3(slide_overlay_params) 
IS 'Updates slide overlay information using a record parameter';

-- Force schema reload
SELECT pg_notify('pgrst', 'reload schema');
