-- Check the actual ENUM values
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value,
    e.enumsortorder AS sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'company_category'
ORDER BY e.enumsortorder;

-- Try to directly insert a value to test the ENUM
DO $$
BEGIN
    UPDATE companies 
    SET category = 'Konsulting IT'::company_category
    WHERE id = '69fce0be-6e29-4997-a64f-4a29cf3096de';
END $$;
