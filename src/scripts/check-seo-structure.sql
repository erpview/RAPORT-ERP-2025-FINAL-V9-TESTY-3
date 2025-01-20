-- First, let's check the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'page_seo';

-- Check all existing SEO templates
SELECT 
    page_identifier,
    is_dynamic,
    parent_page,
    title_template,
    description_template
FROM page_seo
ORDER BY page_identifier;

-- Check if there's any template related to systems
SELECT *
FROM page_seo
WHERE page_identifier LIKE '%system%'
   OR page_identifier LIKE '%erp%'
   OR parent_page LIKE '%system%'
   OR parent_page LIKE '%erp%';
