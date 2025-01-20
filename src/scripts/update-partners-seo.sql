UPDATE page_seo 
SET 
    is_dynamic = true,
    title_template = 'Partnerzy Raportu ERP - Sprawdzeni dostawcy systemów ERP',
    description_template = 'Zobacz listę certyfikowanych partnerów ERP. Znajdź najlepszego dostawcę systemu ERP dla Twojej firmy.',
    keywords_template = 'partnerzy erp, dostawcy erp, systemy erp polska, certyfikowani partnerzy, wdrożenia erp',
    og_title_template = 'Partnerzy Raportu ERP | Certyfikowani dostawcy systemów ERP',
    og_description_template = 'Zobacz listę certyfikowanych partnerów ERP. Znajdź najlepszego dostawcę systemu ERP dla Twojej firmy.',
    structured_data_template = jsonb_build_object(
        '@context', 'https://schema.org',
        '@type', 'CollectionPage',
        'name', 'Partnerzy Raportu ERP',
        'description', 'Lista certyfikowanych partnerów ERP',
        'url', 'https://raport-erp.pl/partnerzy',
        'isPartOf', jsonb_build_object(
            '@type', 'WebSite',
            'name', 'Raport ERP',
            'url', 'https://raport-erp.pl'
        ),
        'mainEntity', jsonb_build_object(
            '@type', 'ItemList',
            'itemListElement', '{partners_list}'
        )
    ),
    robots = 'index, follow',
    dynamic_field = 'partners_list',
    updated_at = NOW()
WHERE page_identifier = 'partners'
RETURNING 
    page_identifier,
    is_dynamic,
    title_template,
    structured_data_template,
    dynamic_field;
