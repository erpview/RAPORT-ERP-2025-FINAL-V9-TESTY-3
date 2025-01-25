SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'company_category'
)
ORDER BY enumsortorder;
