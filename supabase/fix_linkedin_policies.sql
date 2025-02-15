-- Drop any existing LinkedIn-specific policies
DROP POLICY IF EXISTS "enable_linkedin_profile_access" ON profiles;
DROP POLICY IF EXISTS "enable_linkedin_user_access" ON user_management;

-- Create a unified policy for profiles that allows access to own data for LinkedIn users
CREATE POLICY "enable_linkedin_profile_access"
ON profiles
FOR ALL
USING (
    auth.uid() = id AND
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_app_meta_data->>'provider' = 'linkedin_oidc')
)
WITH CHECK (
    auth.uid() = id
);

-- Create a unified policy for user_management that allows access to own data for LinkedIn users
CREATE POLICY "enable_linkedin_user_access"
ON user_management
FOR ALL
USING (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_app_meta_data->>'provider' = 'linkedin_oidc')
)
WITH CHECK (
    auth.uid() = user_id
);

