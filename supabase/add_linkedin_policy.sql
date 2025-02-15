-- Add specific policy for LinkedIn authentication
CREATE POLICY "allow_linkedin_auth_insert" ON "user_management"
FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = user_id 
    AND role = 'user'
    AND auth_provider = 'linkedin_oidc'
);

-- Add specific policy for LinkedIn profile creation
CREATE POLICY "allow_linkedin_profile_insert" ON "profiles"
FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = id
);

-- Grant necessary permissions
GRANT INSERT ON "user_management" TO authenticated;
GRANT INSERT ON "profiles" TO authenticated;
