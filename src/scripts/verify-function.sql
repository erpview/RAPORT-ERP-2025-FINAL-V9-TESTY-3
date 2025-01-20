-- Check if the function exists and show its definition
SELECT p.proname as function_name,
       pg_get_function_arguments(p.oid) as arguments,
       pg_get_function_result(p.oid) as result_type,
       p.prosecdef as security_definer
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'update_slide_overlay';

-- Check permissions on the function
SELECT grantee, privilege_type 
FROM information_schema.routine_privileges 
WHERE routine_name = 'update_slide_overlay' 
  AND routine_schema = 'public';
