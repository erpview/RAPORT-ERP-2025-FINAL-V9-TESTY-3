-- Force PostgREST to reload its schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Ensure v2 function has proper comment
COMMENT ON FUNCTION public.update_slide_overlay_v2(integer, text, text, text, text) 
IS 'Updates slide overlay information with named parameters';

-- Double check v2 function permissions
SELECT grantee, privilege_type 
FROM information_schema.routine_privileges 
WHERE routine_name = 'update_slide_overlay_v2' 
  AND routine_schema = 'public';
