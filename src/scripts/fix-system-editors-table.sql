-- First, check if the table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS system_editors (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_id uuid REFERENCES systems(id) ON DELETE CASCADE,
    editor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(system_id, editor_id)
);

-- If the table exists but has the wrong column name, rename it
DO $$ 
BEGIN 
    -- Check if the wrong column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'system_editors' 
        AND column_name = 'user_id'
    ) THEN
        -- Rename the column from user_id to editor_id
        ALTER TABLE system_editors RENAME COLUMN user_id TO editor_id;
    END IF;
END $$;

-- Grant appropriate permissions
GRANT ALL ON system_editors TO authenticated;
GRANT ALL ON system_editors TO service_role;

-- Create policies for system_editors table
DO $$ 
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "system_editors_insert_policy" ON system_editors;
    DROP POLICY IF EXISTS "system_editors_select_policy" ON system_editors;
    DROP POLICY IF EXISTS "system_editors_delete_policy" ON system_editors;
    
    -- Enable RLS
    ALTER TABLE system_editors ENABLE ROW LEVEL SECURITY;
    
    -- Create new policies
    CREATE POLICY "system_editors_insert_policy"
    ON system_editors FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IN (
        SELECT user_id 
        FROM user_management 
        WHERE role = 'admin' 
        AND is_active = true
    ));

    CREATE POLICY "system_editors_select_policy"
    ON system_editors FOR SELECT
    TO authenticated
    USING (true);

    CREATE POLICY "system_editors_delete_policy"
    ON system_editors FOR DELETE
    TO authenticated
    USING (auth.uid() IN (
        SELECT user_id 
        FROM user_management 
        WHERE role = 'admin' 
        AND is_active = true
    ));
END $$;
