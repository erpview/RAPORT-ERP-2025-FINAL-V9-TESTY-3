-- Update the page identifier to match the code
UPDATE page_seo
SET 
    page_identifier = 'systems',
    is_dynamic = true,  -- Enable dynamic data for systems list
    structured_data_template = jsonb_build_object(
        '@context', 'https://schema.org',
        '@type', 'CollectionPage',
        'name', 'Systemy ERP w Polsce',
        'description', 'Kompleksowy przegląd i porównanie systemów ERP dostępnych na polskim rynku',
        'url', 'https://raport-erp.pl/systemy-erp',
        'mainEntity', jsonb_build_object(
            '@type', 'ItemList',
            'itemListElement', '{systems_list}'
        ),
        'publisher', jsonb_build_object(
            '@type', 'Organization',
            'name', 'Raport ERP by ERP-VIEW.PL',
            'url', 'https://raport-erp.pl'
        )
    ),
    og_title_template = 'Systemy ERP w Polsce - Dostawcy ERP | Raport ERP',
    og_description_template = 'Poznaj najpopularniejsze systemy ERP dostępne w Polsce. Porównaj funkcjonalności i wybierz najlepsze rozwiązanie dla swojej firmy.',
    canonical_url_template = 'https://raport-erp.pl/systemy-erp'
WHERE page_identifier = 'erp-systems'
RETURNING *;
