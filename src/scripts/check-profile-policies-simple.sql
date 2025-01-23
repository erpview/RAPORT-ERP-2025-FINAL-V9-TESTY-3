-- Check if profiles table exists
SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public' 
    AND tablename = 'profiles'
) as profiles_table_exists;

-- List all policies for profiles table
SELECT 
    policyname,
    roles,
    cmd as operation,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
