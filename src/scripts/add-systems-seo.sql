-- Add SEO template for systems page
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
    'systems',  -- This should match what's in seoHelpers.ts
    true,
    'Systemy ERP - Porównaj i Wybierz Najlepsze Rozwiązanie dla Firmy',
    'Poznaj najlepsze systemy ERP dostępne na rynku. Porównaj funkcjonalności, ceny i opinie użytkowników. Znajdź idealne rozwiązanie dla swojej firmy.',
    'systemy ERP, porównanie ERP, oprogramowanie ERP, wdrożenie ERP, system dla firm',
    'https://raport-erp.pl/systemy-erp',
    'Systemy ERP | Porównanie i Ranking Systemów ERP',
    'Poznaj najlepsze systemy ERP dostępne na rynku. Porównaj funkcjonalności, ceny i opinie użytkowników.',
    jsonb_build_object(
        '@context', 'https://schema.org',
        '@type', 'CollectionPage',
        'name', 'Systemy ERP',
        'description', 'Porównanie i ranking systemów ERP dostępnych na polskim rynku',
        'url', 'https://raport-erp.pl/systemy-erp',
        'isPartOf', jsonb_build_object(
            '@type', 'WebSite',
            'name', 'Raport ERP',
            'url', 'https://raport-erp.pl'
        ),
        'mainEntity', jsonb_build_object(
            '@type', 'ItemList',
            'itemListElement', '{systems_list}'
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
