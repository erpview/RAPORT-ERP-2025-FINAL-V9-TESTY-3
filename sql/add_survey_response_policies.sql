-- Add policies for survey_responses table
CREATE POLICY survey_responses_insert ON survey_responses
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY survey_responses_select ON survey_responses
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
