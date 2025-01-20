UPDATE page_seo 
SET 
  title_template = 'Raport ERP - Kompleksowy przewodnik po systemach ERP',
  description_template = 'Poznaj najnowszy raport o systemach ERP w Polsce. Sprawdź ranking, porównaj ceny i funkcjonalności wiodących systemów ERP.',
  keywords_template = 'erp, system erp, zarządzanie przedsiębiorstwem, oprogramowanie dla firm, raport erp, ranking erp',
  structured_data_template = '{
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Raport ERP 2025",
    "description": "Kompleksowy przewodnik po systemach ERP"
  }',
  robots = 'index, follow',
  updated_at = NOW()
WHERE page_identifier = 'home';
