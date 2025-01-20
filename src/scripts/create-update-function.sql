-- Create a function to update slides that bypasses PostgREST's schema cache
CREATE OR REPLACE FUNCTION public.update_slide_all_fields(
    p_id bigint,
    p_title text,
    p_image_url text,
    p_link_url text,
    p_overlay_heading text DEFAULT '',
    p_overlay_description text DEFAULT '',
    p_button_text text DEFAULT '',
    p_button_url text DEFAULT ''
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.slides
    SET 
        title = p_title,
        image_url = p_image_url,
        link_url = p_link_url,
        overlay_heading = p_overlay_heading,
        overlay_description = p_overlay_description,
        button_text = p_button_text,
        button_url = p_button_url,
        updated_at = now()
    WHERE id = p_id;

    RETURN json_build_object(
        'success', true,
        'id', p_id
    );
END;
$$;

-- Create a function to update slides that takes a single JSON parameter
CREATE OR REPLACE FUNCTION public.update_slide_all_fields(payload json)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.slides
    SET 
        title = COALESCE((payload->>'title')::text, title),
        image_url = COALESCE((payload->>'image_url')::text, image_url),
        link_url = COALESCE((payload->>'link_url')::text, link_url),
        overlay_heading = COALESCE((payload->>'overlay_heading')::text, overlay_heading),
        overlay_description = COALESCE((payload->>'overlay_description')::text, overlay_description),
        button_text = COALESCE((payload->>'button_text')::text, button_text),
        button_url = COALESCE((payload->>'button_url')::text, button_url),
        updated_at = now()
    WHERE id = (payload->>'id')::bigint;

    RETURN json_build_object(
        'success', true,
        'id', (payload->>'id')::bigint
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_slide_all_fields(bigint, text, text, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_slide_all_fields(bigint, text, text, text, text, text, text, text) TO service_role;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_slide_all_fields(json) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_slide_all_fields(json) TO service_role;

-- Add comment for PostgREST
COMMENT ON FUNCTION public.update_slide_all_fields(bigint, text, text, text, text, text, text, text) 
IS 'Updates all fields of a slide including overlay information';

-- Add comment for PostgREST
COMMENT ON FUNCTION public.update_slide_all_fields(json) 
IS 'Updates all fields of a slide including overlay information';

-- Force schema reload
SELECT pg_notify('pgrst', 'reload schema');
