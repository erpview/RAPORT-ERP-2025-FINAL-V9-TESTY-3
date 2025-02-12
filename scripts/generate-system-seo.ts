import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function generateSystemSEO() {
  try {
    // Create the systems SEO directory if it doesn't exist
    const seoDir = path.join(process.cwd(), 'public/seo/systemy-erp');
    await fs.mkdir(seoDir, { recursive: true });

    // Fetch all systems from Supabase
    const { data: systems, error } = await supabase
      .from('systems')
      .select('*');

    if (error) {
      throw error;
    }

    // Generate SEO files for each system
    for (const system of systems) {
      let systemSlug = system.name.toLowerCase().replace(/ /g, '-');
      // Special case for SAP S/4 HANA
      if (systemSlug === 'sap-s/4-hana' || systemSlug === 'sap-s/4hana' || systemSlug === 'sap-s/4') {
        systemSlug = 'sap-s-4-hana';
      }
      // Remove any remaining slashes
      systemSlug = systemSlug.replace(/\//g, '-');
      const systemDir = path.join(seoDir, systemSlug);
      await fs.mkdir(systemDir, { recursive: true });

      // Create the SEO template
      const seoHtml = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>System ERP ${system.name} | Raport ERP by ERP-VIEW.PL</title>
  <meta name="description" content="System ERP ${system.name} od ${system.vendor}. ${system.description} Sprawdź opinie, funkcjonalności i porównaj z innymi systemami ERP.">
  <meta name="keywords" content="${system.name}, System ERP, ${system.vendor}, opinie, funkcjonalności, porównanie systemów ERP, raport ERP, ERP-VIEW.PL, ${system.keywords}">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="System ERP ${system.name} | Raport ERP by ERP-VIEW.PL">
  <meta property="og:description" content="System ERP ${system.name} od ${system.vendor}. ${system.description} Sprawdź opinie, funkcjonalności i porównaj z innymi systemami ERP.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://raport-erp.pl/systemy-erp/${systemSlug}">
  <link rel="canonical" href="https://raport-erp.pl/systemy-erp/${systemSlug}">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "${system.name}",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "description": "${system.description}",
    "offers": {
      "@type": "Offer",
      "price": "Contact for Pricing",
      "priceCurrency": "PLN"
    },
    "publisher": {
      "@type": "Organization",
      "name": "${system.vendor}"
    }
  }
  </script>
</head>
<body>
  <!-- This file is used for SEO purposes only -->
</body>
</html>`;

      await fs.writeFile(path.join(systemDir, 'index.html'), seoHtml);
      console.log(`Generated SEO file for ${system.name}`);
    }

    console.log('Successfully generated all system SEO files');
  } catch (error) {
    console.error('Error generating system SEO files:', error);
    process.exit(1);
  }
}

generateSystemSEO();
