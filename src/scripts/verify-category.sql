-- Verify the ENUM type was created
SELECT typname, enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE typname = 'company_category';

-- Verify the column was added to the companies table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'companies' AND column_name = 'category';
