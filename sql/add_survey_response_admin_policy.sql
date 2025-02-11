-- Add admin policy for survey responses
CREATE POLICY survey_responses_admin_select ON survey_responses
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'role' = 'admin'
                 OR auth.users.raw_user_meta_data->>'role' = 'editor')
        )
    );
