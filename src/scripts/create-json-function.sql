-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.update_slide_overlay_json;

-- Create function that takes a single JSON parameter
CREATE OR REPLACE FUNCTION public.update_slide_overlay_json(
    data jsonb
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    _slide_id integer;
BEGIN
    -- Extract values from JSON
    _slide_id := (data->>'slide_id')::integer;
    
    UPDATE public.slides
    SET 
        overlay_heading = data->>'overlay_heading',
        overlay_description = data->>'overlay_description',
        button_text = data->>'button_text',
        button_url = data->>'button_url',
        updated_at = NOW()
    WHERE id = _slide_id;

    RETURN json_build_object(
        'success', true,
        'slide_id', _slide_id
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.update_slide_overlay_json(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_slide_overlay_json(jsonb) TO service_role;

-- Add comment for PostgREST
COMMENT ON FUNCTION public.update_slide_overlay_json(jsonb) 
IS 'Updates slide overlay information using JSON input';

-- Force schema reload
SELECT pg_notify('pgrst', 'reload schema');
