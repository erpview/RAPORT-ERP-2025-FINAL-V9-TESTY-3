-- Drop existing policies
DROP POLICY IF EXISTS survey_responses_select ON survey_responses;
DROP POLICY IF EXISTS survey_responses_insert ON survey_responses;

-- Create select policy that allows:
-- 1. Users to see their own responses
-- 2. Admins and editors to see all responses
CREATE POLICY survey_responses_select ON survey_responses
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_user_meta_data->>'role' = 'editor'
            )
        )
    );

-- Create insert policy for all authenticated users
CREATE POLICY survey_responses_insert ON survey_responses
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
