-- Check if template exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM page_seo 
        WHERE page_identifier = 'dictionary_term'
    ) THEN
        -- Insert template if it doesn't exist
        INSERT INTO page_seo (
            page_identifier,
            title_template,
            description_template,
            keywords_template,
            structured_data_template,
            is_dynamic
        ) VALUES (
            'dictionary_term',
            '{title} - Słownik ERP | Kalkulator ERP',
            '{description}',
            'ERP, system ERP, {title}, słownik ERP',
            '{
                "@context": "https://schema.org",
                "@type": "DefinedTerm",
                "name": "{title}",
                "description": "{description}",
                "inDefinedTermSet": {
                    "@type": "DefinedTermSet",
                    "name": "Słownik ERP",
                    "url": "https://kalkulator-erp.com/slownik-erp"
                },
                "url": "https://kalkulator-erp.com/slownik-erp/{slug}"
            }',
            true
        );
    ELSE
        -- Update existing template
        UPDATE page_seo
        SET 
            title_template = '{title} - Słownik ERP | Kalkulator ERP',
            description_template = '{description}',
            keywords_template = 'ERP, system ERP, {title}, słownik ERP',
            structured_data_template = '{
                "@context": "https://schema.org",
                "@type": "DefinedTerm",
                "name": "{title}",
                "description": "{description}",
                "inDefinedTermSet": {
                    "@type": "DefinedTermSet",
                    "name": "Słownik ERP",
                    "url": "https://kalkulator-erp.com/slownik-erp"
                },
                "url": "https://kalkulator-erp.com/slownik-erp/{slug}"
            }',
            is_dynamic = true
        WHERE page_identifier = 'dictionary_term';
    END IF;
END $$;
