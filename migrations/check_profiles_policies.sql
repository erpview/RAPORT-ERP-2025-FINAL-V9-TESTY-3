-- Check if RLS is enabled on profiles table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- List all policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Check table owner and privileges
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'profiles' AND table_schema = 'public';
