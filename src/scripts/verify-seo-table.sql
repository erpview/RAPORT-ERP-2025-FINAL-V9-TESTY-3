-- Check table structure
\d page_seo;

-- Check all entries in the table
SELECT * FROM page_seo;

-- Check specifically for the home page entry
SELECT page_identifier, title_template, description_template 
FROM page_seo 
WHERE page_identifier = 'home';

-- Check for any case sensitivity issues
SELECT page_identifier, title_template, description_template 
FROM page_seo 
WHERE page_identifier ILIKE 'home';
