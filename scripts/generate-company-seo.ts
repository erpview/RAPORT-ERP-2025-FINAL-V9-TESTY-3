import fs from 'fs/promises';
import path from 'path';
import { supabase } from '../src/config/supabase';
import { Company } from '../src/types/company';

async function generateCompanySEO(company: Company) {
  try {
    // Create SEO-friendly title and description
    const title = `${company.name} - ${company.category} | Raport ERP by ERP-VIEW.PL`;
    const description = company.meta_description || 
      `${company.name} - ${company.category}. Sprawdź szczegółowe informacje, opinie i funkcjonalności w Raporcie ERP. Poznaj możliwości i zakres usług IT.`;

    const template = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${company.name}, ${company.category}, firma IT, systemy ERP, wdrożenia IT, konsulting IT">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://www.raport-erp.pl/firmy-it/${company.slug}">
  
  <!-- OpenGraph Tags -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="https://www.raport-erp.pl/firmy-it/${company.slug}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${company.logo_url || 'https://www.raport-erp.pl/images/default-company.png'}">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "${company.name}",
      "url": "https://www.raport-erp.pl/firmy-it/${company.slug}",
      "logo": "${company.logo_url || 'https://www.raport-erp.pl/images/default-company.png'}",
      "description": "${description}",
      ${company.website ? `"sameAs": ["${company.website}"],` : ''}
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "${company.street || ''}",
        "postalCode": "${company.postal_code || ''}",
        "addressLocality": "${company.city || ''}",
        "addressCountry": "PL"
      },
      ${company.email ? `"email": "${company.email}",` : ''}
      ${company.phone ? `"telephone": "${company.phone}",` : ''}
      "category": "${company.category}"
    }
  </script>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;

    // Create directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'public', 'seo', 'firmy-it', company.slug);
    await fs.mkdir(outputDir, { recursive: true });

    // Write the SEO file
    const outputPath = path.join(outputDir, 'index.html');
    await fs.writeFile(outputPath, template);

    console.log(`✅ Generated SEO page for ${company.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Error generating SEO page for ${company.name}:`, error);
    return false;
  }
}

async function main() {
  try {
    // Fetch all published companies
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .eq('status', 'published');

    if (error) throw error;
    if (!companies) {
      console.log('No companies found');
      return;
    }

    console.log(`Found ${companies.length} companies to generate SEO pages for`);

    // Generate SEO pages for each company
    const results = await Promise.all(companies.map(generateCompanySEO));
    
    const successful = results.filter(Boolean).length;
    console.log(`\nGeneration complete:`);
    console.log(`✅ Successfully generated: ${successful}`);
    console.log(`❌ Failed: ${results.length - successful}`);
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}
