-- Add module_values column to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS module_values jsonb DEFAULT '{}'::jsonb;

-- Update RLS policies to include module_values
DROP POLICY IF EXISTS "Public can view published companies" ON companies;
DROP POLICY IF EXISTS "Authenticated users can view all companies" ON companies;
DROP POLICY IF EXISTS "Admin users can insert companies" ON companies;
DROP POLICY IF EXISTS "Admin users can update companies" ON companies;
DROP POLICY IF EXISTS "Admin users can delete companies" ON companies;

-- Allow public read access to published companies
CREATE POLICY "Public can view published companies"
ON companies
FOR SELECT
USING (status = 'published');

-- Allow authenticated users to view all companies
CREATE POLICY "Authenticated users can view all companies"
ON companies
FOR SELECT
TO authenticated
USING (true);

-- Allow admin users to insert companies
CREATE POLICY "Admin users can insert companies"
ON companies
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  )
);

-- Allow admin users to update companies
CREATE POLICY "Admin users can update companies"
ON companies
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  )
);

-- Allow admin users to delete companies
CREATE POLICY "Admin users can delete companies"
ON companies
FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  )
);
