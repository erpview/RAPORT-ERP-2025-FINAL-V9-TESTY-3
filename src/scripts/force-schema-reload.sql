-- Force PostgREST to reload its schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Additional step: Verify the function is accessible via RPC
COMMENT ON FUNCTION public.update_slide_overlay(text, text, text, text, integer) IS 'Updates slide overlay information';

-- Verify function parameters and permissions
SELECT 
    routine_schema,
    routine_name,
    parameter_name,
    parameter_mode,
    data_type,
    ordinal_position
FROM information_schema.parameters 
WHERE specific_schema = 'public' 
    AND specific_name = 'update_slide_overlay'
ORDER BY ordinal_position;
