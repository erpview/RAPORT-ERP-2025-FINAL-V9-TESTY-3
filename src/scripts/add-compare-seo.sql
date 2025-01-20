-- Add SEO template for compare page
INSERT INTO page_seo (
    page_identifier,
    is_dynamic,
    title_template,
    description_template,
    keywords_template,
    canonical_url_template,
    og_title_template,
    og_description_template,
    structured_data_template,
    robots
) VALUES (
    'compare',  -- Matches the pageIdentifier in Compare.tsx
    true,      -- Dynamic for system comparison data
    'Porównanie systemów ERP - porównywarka ERP | Raport ERP by ERP-VIEW.PL',
    'Porównaj systemy ERP dostępne w Polsce. Zestawienie funkcjonalności, cen i możliwości najpopularniejszych systemów ERP.',
    'porównanie ERP, porównywarka systemów ERP, zestawienie ERP, systemy ERP porównanie, porównaj ERP',
    'https://raport-erp.pl/porownaj-systemy-erp',
    'Porównanie systemów ERP - porównywarka ERP | Raport ERP by ERP-VIEW.PL',
    'Porównaj systemy ERP dostępne w Polsce. Zestawienie funkcjonalności i możliwości systemów ERP.',
    jsonb_build_object(
        '@context', 'https://schema.org',
        '@type', 'WebPage',
        'name', 'Porównanie systemów ERP | Raport ERP by ERP-VIEW.PL',
        'description', 'Szczegółowe porównanie funkcjonalności i cen systemów ERP dostępnych w Polsce',
        'url', 'https://raport-erp.pl/porownaj-systemy-erp',
        'mainEntity', jsonb_build_object(
            '@type', 'Table',
            'about', 'Porównanie systemów ERP',
            'description', 'Szczegółowe porównanie funkcjonalności i cen systemów ERP dostępnych w Polsce'
        ),
        'publisher', jsonb_build_object(
            '@type', 'Organization',
            'name', 'Raport ERP by ERP-VIEW.PL',
            'url', 'https://raport-erp.pl'
        )
    ),
    'index, follow'
)
ON CONFLICT (page_identifier) 
DO UPDATE SET
    title_template = EXCLUDED.title_template,
    description_template = EXCLUDED.description_template,
    keywords_template = EXCLUDED.keywords_template,
    canonical_url_template = EXCLUDED.canonical_url_template,
    og_title_template = EXCLUDED.og_title_template,
    og_description_template = EXCLUDED.og_description_template,
    structured_data_template = EXCLUDED.structured_data_template,
    robots = EXCLUDED.robots,
    updated_at = NOW()
RETURNING *;
