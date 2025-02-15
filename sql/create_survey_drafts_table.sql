-- Create survey_drafts table
CREATE TABLE IF NOT EXISTS survey_drafts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    assignment_id UUID REFERENCES survey_assignments(id) ON DELETE CASCADE,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, assignment_id)
);

-- Enable RLS on table
ALTER TABLE survey_drafts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS survey_drafts_select ON survey_drafts;
DROP POLICY IF EXISTS survey_drafts_insert ON survey_drafts;
DROP POLICY IF EXISTS survey_drafts_update ON survey_drafts;
DROP POLICY IF EXISTS survey_drafts_delete ON survey_drafts;

-- Policies for survey_drafts
CREATE POLICY survey_drafts_select ON survey_drafts
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY survey_drafts_insert ON survey_drafts
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY survey_drafts_update ON survey_drafts
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY survey_drafts_delete ON survey_drafts
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Add comment
COMMENT ON TABLE survey_drafts IS 'Stores draft survey responses for users';
