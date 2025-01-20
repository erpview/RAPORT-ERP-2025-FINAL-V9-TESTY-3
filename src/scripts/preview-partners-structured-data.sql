WITH numbered_partners AS (
    SELECT 
        *,
        ROW_NUMBER() OVER (ORDER BY is_main_partner DESC, order_index) as position
    FROM partners
),
partner_data AS (
    SELECT 
        jsonb_agg(
            jsonb_build_object(
                '@type', 'ListItem',
                'position', position,
                'item', jsonb_build_object(
                    '@type', 'Organization',
                    'name', name,
                    'description', COALESCE(
                        (SELECT description FROM partner_pages WHERE partner_id = numbered_partners.id LIMIT 1),
                        'Partner systemu ERP'
                    ),
                    'url', 'https://raport-erp.pl/partnerzy/' || slug,
                    'logo', logo_url,
                    'sameAs', website_url
                )
            )
        ) AS partners_list
    FROM numbered_partners
),
seo_template AS (
    SELECT structured_data_template
    FROM page_seo
    WHERE page_identifier = 'partners'
)
SELECT 
    jsonb_pretty(
        jsonb_set(
            structured_data_template,
            '{mainEntity,itemListElement}',
            COALESCE((SELECT partners_list FROM partner_data), '[]'::jsonb)
        )
    ) AS final_structured_data
FROM seo_template;
