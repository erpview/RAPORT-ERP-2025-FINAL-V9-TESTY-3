-- Check the existing partners SEO template
SELECT 
    page_identifier,
    is_dynamic,
    title_template,
    description_template,
    keywords_template,
    og_title_template,
    og_description_template,
    structured_data_template,
    robots,
    dynamic_field,
    created_at,
    updated_at
FROM page_seo 
WHERE page_identifier = 'partners';
