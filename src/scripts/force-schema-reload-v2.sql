-- Force PostgREST to reload its schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Add comment to function to ensure it's exposed via RPC
COMMENT ON FUNCTION public.update_slide_overlay(text, text, text, text, integer) IS 'Updates slide overlay information';

-- Verify function exists and is accessible
SELECT n.nspname as schema_name,
       p.proname as function_name,
       pg_get_function_arguments(p.oid) as arguments,
       pg_get_function_result(p.oid) as return_type,
       p.prosecdef as security_definer
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'update_slide_overlay';
