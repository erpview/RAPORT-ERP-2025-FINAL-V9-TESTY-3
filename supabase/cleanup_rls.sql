-- Clean up duplicate and conflicting policies for profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Clean up duplicate and conflicting policies for user_management table
DROP POLICY IF EXISTS "Users can insert their own data" ON user_management;
DROP POLICY IF EXISTS "Users can update their own data" ON user_management;
DROP POLICY IF EXISTS "Users can view their own data" ON user_management;

-- Create simplified policies for profiles
CREATE POLICY "profiles_insert_policy" ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Keep existing policies that work well:
-- "profiles_select_policy" - allows users and admins to view profiles
-- "profiles_update_policy" - allows users and admins to update profiles

-- Create simplified policies for user_management
CREATE POLICY "user_management_insert_linkedin_policy" ON user_management
FOR INSERT
TO authenticated
WITH CHECK (
    (auth.uid() = user_id AND role = 'user' AND auth_provider = 'linkedin_oidc')
    OR auth.is_admin_by_metadata()
);

-- Keep existing policies that work well:
-- "Editors can view active users"
-- "user_management_delete_policy"
-- "user_management_select_policy"
-- "user_management_update_policy"

-- Verify the changes
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename IN ('user_management', 'profiles')
ORDER BY
    tablename, cmd;
