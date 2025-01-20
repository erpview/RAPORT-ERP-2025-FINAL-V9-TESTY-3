-- Check all SEO templates
SELECT 
    page_identifier,
    is_dynamic,
    parent_page,
    title_template,
    description_template
FROM page_seo
ORDER BY page_identifier;
