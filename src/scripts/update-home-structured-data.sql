UPDATE page_seo
SET structured_data_template = jsonb_build_object(
  '@context', 'https://schema.org',
  '@type', 'WebSite',
  'name', 'Raport ERP by ERP-VIEW.PL',
  'description', 'Kompleksowy przewodnik po systemach ERP w Polsce. Sprawdź ranking, porównaj ceny i funkcjonalności wiodących systemów ERP.',
  'url', 'https://raport-erp.pl',
  'potentialAction', jsonb_build_object(
    '@type', 'SearchAction',
    'target', 'https://raport-erp.pl/search?q={search_term_string}',
    'query-input', 'required name=search_term_string'
  )
)
WHERE page_identifier = 'home'
RETURNING page_identifier, structured_data_template;
