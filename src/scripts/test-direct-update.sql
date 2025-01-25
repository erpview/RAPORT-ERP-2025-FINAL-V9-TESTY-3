-- First check current value
SELECT id, name, category FROM companies WHERE id = '69fce0be-6e29-4997-a64f-4a29cf3096de';

-- Try direct update with type casting
UPDATE companies 
SET category = 'Konsulting IT'::company_category 
WHERE id = '69fce0be-6e29-4997-a64f-4a29cf3096de';

-- Verify the update
SELECT id, name, category FROM companies WHERE id = '69fce0be-6e29-4997-a64f-4a29cf3096de';
