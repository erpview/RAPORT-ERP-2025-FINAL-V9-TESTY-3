-- List all functions that have 'overlay' in their name
SELECT n.nspname as schema_name,
       p.proname as function_name,
       pg_get_function_arguments(p.oid) as arguments,
       pg_get_function_result(p.oid) as return_type,
       p.prosecdef as security_definer,
       obj_description(p.oid, 'pg_proc') as description
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname LIKE '%overlay%';

-- List all custom types related to overlay
SELECT t.typname as type_name,
       t.typtype as type_type,
       obj_description(t.oid, 'pg_type') as description
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'public'
  AND t.typname LIKE '%overlay%';
