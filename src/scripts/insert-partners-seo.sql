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
    'partners',
    true,
    'Partnerzy - Raport ERP by ERP-VIEW.PL',
    'Poznaj naszych zaufanych partnerów biznesowych. Współpracujemy z wiodącymi dostawcami systemów ERP w Polsce.',
    'partnerzy erp, dostawcy erp, systemy erp polska, współpraca erp, partnerzy biznesowi',
    'Partnerzy Biznesowi | Raport ERP by ERP-VIEW.PL',
    'Zobacz listę zaufanych partnerów biznesowych Raport ERP. Współpracujemy z najlepszymi dostawcami systemów ERP w Polsce.',
    jsonb_build_object(
        '@context', 'https://schema.org',
        '@type', 'CollectionPage',
        'name', 'Partnerzy - Raport ERP by ERP-VIEW.PL',
        'description', 'Poznaj naszych zaufanych partnerów biznesowych. Współpracujemy z wiodącymi dostawcami systemów ERP w Polsce.',
        'url', 'https://raport-erp.pl/partnerzy',
        'isPartOf', jsonb_build_object(
            '@type', 'WebSite',
            'name', 'Raport ERP by ERP-VIEW.PL',
            'url', 'https://raport-erp.pl'
        ),
        'mainEntity', jsonb_build_object(
            '@type', 'ItemList',
            'itemListElement', '{partners_list}'
        ),
        'potentialAction', jsonb_build_object(
            '@type', 'SearchAction',
            'target', 'https://raport-erp.pl/search?q={search_term_string}',
            'query-input', 'required name=search_term_string'
        )
    ),
    'index, follow',
    'partners_list'
)
RETURNING *;
