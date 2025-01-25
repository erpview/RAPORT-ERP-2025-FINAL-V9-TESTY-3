-- Check ENUM type values
SELECT t.typname, e.enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'company_category'
ORDER BY e.enumsortorder;

-- Check column constraints
SELECT c.column_name, c.data_type, c.is_nullable, c.column_default
FROM information_schema.columns c
WHERE table_name = 'companies' AND column_name = 'company_category';
