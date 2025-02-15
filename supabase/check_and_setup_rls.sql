-- Check existing RLS policies for user_management table
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
    tablename IN ('user_management', 'profiles');

-- Enable RLS on tables if not enabled
ALTER TABLE user_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON user_management;
DROP POLICY IF EXISTS "Users can update their own data" ON user_management;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create policies for user_management table
CREATE POLICY "Users can view their own data"
ON user_management
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own data"
ON user_management
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow insert for authenticated users
CREATE POLICY "Users can insert their own data"
ON user_management
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON user_management TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

-- Verify the policies were created
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
    tablename IN ('user_management', 'profiles');
