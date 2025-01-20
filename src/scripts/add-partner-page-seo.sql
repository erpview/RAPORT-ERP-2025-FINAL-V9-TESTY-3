-- First, let's delete any existing template for partner pages
DELETE FROM page_seo WHERE page_identifier LIKE 'partner-%';

-- Insert or update the partner template
INSERT INTO page_seo (
    page_identifier,
    is_dynamic,
    title_template,
    description_template,
    keywords_template,
    og_title_template,
    og_description_template,
    structured_data_template,
    robots,
    dynamic_field
)
VALUES (
    'partner',
    true,
    '{name} - Partner Raportu ERP by ERP-VIEW.PL',
    '{description}',
    'erp, system erp, {name}, partner erp, dostawca erp',
    '{name} | Partner Raportu ERP by ERP-VIEW.PL',
    '{description}',
    jsonb_build_object(
        '@context', 'https://schema.org',
        '@type', 'Organization',
        'name', '{name}',
        'description', '{description}',
        'logo', '{logo_url}',
        'url', 'https://raport-erp.pl/partnerzy/{slug}',
        'isPartOf', jsonb_build_object(
            '@type', 'WebSite',
            'name', 'Raport ERP by ERP-VIEW.PL',
            'url', 'https://raport-erp.pl'
        )
    ),
    'index, follow',
    'partner_data'
)
ON CONFLICT (page_identifier) 
DO UPDATE SET
    is_dynamic = EXCLUDED.is_dynamic,
    title_template = EXCLUDED.title_template,
    description_template = EXCLUDED.description_template,
    keywords_template = EXCLUDED.keywords_template,
    og_title_template = EXCLUDED.og_title_template,
    og_description_template = EXCLUDED.og_description_template,
    structured_data_template = EXCLUDED.structured_data_template,
    robots = EXCLUDED.robots,
    dynamic_field = EXCLUDED.dynamic_field;