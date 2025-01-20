-- Create user_comparison_report table
CREATE TABLE IF NOT EXISTS user_comparison_report (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    comparison_start TIMESTAMP WITH TIME ZONE NOT NULL,
    comparison_end TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    systems_compared TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_comparison_user_id ON user_comparison_report(user_id);
CREATE INDEX IF NOT EXISTS idx_user_comparison_date ON user_comparison_report(comparison_start);

-- Enable RLS
ALTER TABLE user_comparison_report ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own comparison records" ON user_comparison_report;
DROP POLICY IF EXISTS "Admins and editors can view all comparison records" ON user_comparison_report;
DROP POLICY IF EXISTS "Users can update their own comparison records" ON user_comparison_report;

-- Policy for inserting - any authenticated user can insert their own records
CREATE POLICY "Users can insert their own comparison records"
ON user_comparison_report
FOR INSERT
TO authenticated
WITH CHECK (
    -- Allow users to insert records for themselves
    auth.uid() = user_id
);

-- Policy for selecting - admins and editors can view all records
CREATE POLICY "Editors and admins can view all comparison records"
ON user_comparison_report
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM user_management 
        WHERE user_management.id = auth.uid() 
        AND user_management.role IN ('editor', 'admin')
    )
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to call the function
DROP TRIGGER IF EXISTS update_user_comparison_report_updated_at ON user_comparison_report;
CREATE TRIGGER update_user_comparison_report_updated_at
    BEFORE UPDATE ON user_comparison_report
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Drop existing view if exists
DROP VIEW IF EXISTS user_emails_view;

-- Create view to combine user emails from both tables
CREATE OR REPLACE VIEW user_emails_view AS
SELECT 
    u.id,
    COALESCE(um.email, u.email) AS email,
    COALESCE(um.role, u.role) AS role
FROM auth.users u
LEFT JOIN user_management um ON um.id = u.id;

-- Grant access to the view
GRANT SELECT ON user_emails_view TO authenticated;
