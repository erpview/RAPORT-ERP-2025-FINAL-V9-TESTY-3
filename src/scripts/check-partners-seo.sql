-- Check if partners page template exists
SELECT page_identifier, structured_data_template 
FROM page_seo 
WHERE page_identifier = 'partners';
