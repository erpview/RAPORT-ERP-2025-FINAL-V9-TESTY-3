-- Create survey_forms table
CREATE TABLE IF NOT EXISTS survey_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive')),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create survey_modules table if it doesn't exist
CREATE TABLE IF NOT EXISTS survey_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID REFERENCES survey_forms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create survey_fields table if it doesn't exist
CREATE TABLE IF NOT EXISTS survey_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES survey_modules(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    field_key VARCHAR(255) NOT NULL,
    field_type VARCHAR(20) CHECK (field_type IN ('text', 'number', 'boolean', 'date', 'multiselect', 'select', 'radio', 'checkbox')),
    is_required BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0,
    options JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module_id, field_key)
);

-- Create survey_assignments table
CREATE TABLE IF NOT EXISTS survey_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID REFERENCES survey_forms(id) ON DELETE CASCADE,
    target_type VARCHAR(20) CHECK (target_type IN ('system', 'company')),
    target_id UUID NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(form_id, target_type, target_id)
);

-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID REFERENCES survey_forms(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES survey_assignments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on tables
ALTER TABLE survey_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS survey_forms_select ON survey_forms;
DROP POLICY IF EXISTS survey_forms_insert ON survey_forms;
DROP POLICY IF EXISTS survey_forms_update ON survey_forms;
DROP POLICY IF EXISTS survey_forms_delete ON survey_forms;

DROP POLICY IF EXISTS survey_modules_select ON survey_modules;
DROP POLICY IF EXISTS survey_modules_insert ON survey_modules;
DROP POLICY IF EXISTS survey_modules_update ON survey_modules;
DROP POLICY IF EXISTS survey_modules_delete ON survey_modules;

DROP POLICY IF EXISTS survey_fields_select ON survey_fields;
DROP POLICY IF EXISTS survey_fields_insert ON survey_fields;
DROP POLICY IF EXISTS survey_fields_update ON survey_fields;
DROP POLICY IF EXISTS survey_fields_delete ON survey_fields;

DROP POLICY IF EXISTS survey_assignments_select ON survey_assignments;
DROP POLICY IF EXISTS survey_assignments_insert ON survey_assignments;
DROP POLICY IF EXISTS survey_assignments_update ON survey_assignments;
DROP POLICY IF EXISTS survey_assignments_delete ON survey_assignments;

DROP POLICY IF EXISTS survey_responses_select ON survey_responses;
DROP POLICY IF EXISTS survey_responses_insert ON survey_responses;
DROP POLICY IF EXISTS survey_responses_update ON survey_responses;
DROP POLICY IF EXISTS survey_responses_delete ON survey_responses;

-- Policies for survey_forms
CREATE POLICY survey_forms_select ON survey_forms
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY survey_forms_insert ON survey_forms
    FOR INSERT TO authenticated
    WITH CHECK (auth.role() = 'admin');

CREATE POLICY survey_forms_update ON survey_forms
    FOR UPDATE TO authenticated
    USING (auth.role() = 'admin')
    WITH CHECK (auth.role() = 'admin');

CREATE POLICY survey_forms_delete ON survey_forms
    FOR DELETE TO authenticated
    USING (auth.role() = 'admin');

-- Policies for survey_modules
CREATE POLICY survey_modules_select ON survey_modules
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY survey_modules_insert ON survey_modules
    FOR INSERT TO authenticated
    WITH CHECK (auth.role() = 'admin');

CREATE POLICY survey_modules_update ON survey_modules
    FOR UPDATE TO authenticated
    USING (auth.role() = 'admin')
    WITH CHECK (auth.role() = 'admin');

CREATE POLICY survey_modules_delete ON survey_modules
    FOR DELETE TO authenticated
    USING (auth.role() = 'admin');

-- Policies for survey_fields
CREATE POLICY survey_fields_select ON survey_fields
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY survey_fields_insert ON survey_fields
    FOR INSERT TO authenticated
    WITH CHECK (auth.role() = 'admin');

CREATE POLICY survey_fields_update ON survey_fields
    FOR UPDATE TO authenticated
    USING (auth.role() = 'admin')
    WITH CHECK (auth.role() = 'admin');

CREATE POLICY survey_fields_delete ON survey_fields
    FOR DELETE TO authenticated
    USING (auth.role() = 'admin');

-- Policies for survey_assignments
CREATE POLICY survey_assignments_select ON survey_assignments
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY survey_assignments_insert ON survey_assignments
    FOR INSERT TO authenticated
    WITH CHECK (auth.role() = 'admin');

CREATE POLICY survey_assignments_update ON survey_assignments
    FOR UPDATE TO authenticated
    USING (auth.role() = 'admin')
    WITH CHECK (auth.role() = 'admin');

CREATE POLICY survey_assignments_delete ON survey_assignments
    FOR DELETE TO authenticated
    USING (auth.role() = 'admin');

-- Policies for survey_responses
CREATE POLICY survey_responses_select ON survey_responses
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR auth.role() = 'admin');

CREATE POLICY survey_responses_insert ON survey_responses
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY survey_responses_update ON survey_responses
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY survey_responses_delete ON survey_responses
    FOR DELETE TO authenticated
    USING (auth.role() = 'admin');
