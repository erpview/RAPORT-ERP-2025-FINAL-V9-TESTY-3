import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { Company } from '../src/types/company';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function generateCompaniesIndexSEO() {
  try {
    // Fetch all published companies
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .eq('status', 'published');

    if (error) throw error;
    if (!companies) {
      console.log('No companies found');
      return false;
    }

    // Group companies by category
    const companiesByCategory = (companies as Company[]).reduce((acc, company) => {
      const category = company.category || 'Inne';
      if (!acc[category]) acc[category] = [];
      acc[category].push(company);
      return acc;
    }, {} as Record<string, Company[]>);

    // Create category counts for meta description
    const categoryCounts = Object.entries(companiesByCategory)
      .map(([category, companies]) => `${companies.length} firm z kategorii ${category}`)
      .join(', ');

    const template = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Katalog Firm IT | Raport ERP by ERP-VIEW.PL</title>
  <meta name="description" content="Poznaj sprawdzone firmy IT w Polsce. ${categoryCounts}. Znajdź dostawcę, integratora lub firmę konsultingową dla Twojego projektu ERP.">
  <meta name="keywords" content="firmy IT, dostawcy ERP, integratorzy systemów, konsulting IT, wdrożenia ERP, katalog firm IT">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://www.raport-erp.pl/firmy-it">
  
  <!-- OpenGraph Tags -->
  <meta property="og:title" content="Katalog Firm IT | Raport ERP by ERP-VIEW.PL">
  <meta property="og:description" content="Katalog firm IT - znajdź i porównaj najlepsze firmy informatyczne w Polsce. Producenci, integratorzy i firmy konsultingowe specjalizujące się w systemach ERP." />
  <meta property="og:url" content="https://www.raport-erp.pl/firmy-it">
  <meta property="og:type" content="website">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Katalog Firm IT",
      "description": "Lista firm IT specjalizujących się w systemach ERP",
      "numberOfItems": ${(companies as Company[]).length},
      "itemListElement": [
        ${(companies as Company[]).map((company, index) => `{
          "@type": "ListItem",
          "position": ${index + 1},
          "item": {
            "@type": "Organization",
            "name": "${company.name}",
            "url": "https://www.raport-erp.pl/firmy-it/${company.slug}",
            "description": "${company.meta_description || `${company.name} - ${company.category}`}"
          }
        }`).join(',\n        ')}
      ]
    }
  </script>
</head>
<body>
  <h1>Katalog firm IT - Producenci i integratorzy systemów ERP</h1>
  <div>
    ${Object.entries(companiesByCategory).map(([category, categoryCompanies]) => `
      <section>
        <h2>${category} (${categoryCompanies.length})</h2>
        <ul>
          ${categoryCompanies.map(company => `
            <li>
              <h3>${company.name}</h3>
              <p>${company.description}</p>
            </li>
          `).join('')}
        </ul>
      </section>
    `).join('')}
  </div>
</body>
</html>`;

    // Create the output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'public', 'seo', 'firmy-it');
    await fs.mkdir(outputDir, { recursive: true });

    // Write the HTML file
    const outputPath = path.join(outputDir, 'index.html');
    await fs.writeFile(outputPath, template);

    console.log('✅ Generated main companies index SEO page');
    return true;
  } catch (error) {
    console.error('❌ Error generating companies index SEO page:', error);
    return false;
  }
}

// Run the script
generateCompaniesIndexSEO().catch(console.error);
