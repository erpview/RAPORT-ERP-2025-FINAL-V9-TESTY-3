-- Drop and recreate the survey_responses table to ensure schema is fresh
DROP TABLE IF EXISTS survey_responses CASCADE;

CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID REFERENCES survey_forms(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES survey_assignments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY survey_responses_insert ON survey_responses
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY survey_responses_select ON survey_responses
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Force schema refresh
NOTIFY pgrst, 'reload schema';
