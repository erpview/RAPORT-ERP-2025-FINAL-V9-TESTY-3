import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const currentTime = new Date().toISOString().split('.')[0]+'+01:00';

// Function to generate sitemap XML
function generateSitemap(dictionaryTerms) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
  http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>https://raport-erp.pl/</loc>
    <lastmod>${currentTime}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://raport-erp.pl/firmy-it</loc>
    <lastmod>${currentTime}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://raport-erp.pl/systemy-erp</loc>
    <lastmod>${currentTime}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://raport-erp.pl/kalkulator</loc>
    <lastmod>${currentTime}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://raport-erp.pl/slownik-erp</loc>
    <lastmod>${currentTime}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://raport-erp.pl/porownaj-systemy-erp</loc>
    <lastmod>${currentTime}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://raport-erp.pl/partnerzy</loc>
    <lastmod>${currentTime}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

    // Add dictionary terms
    dictionaryTerms.forEach(term => {
        xml += `
  <url>
    <loc>https://raport-erp.pl/slownik-erp/${term}</loc>
    <lastmod>${currentTime}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    xml += '\n</urlset>';
    return xml;
}

// Get all dictionary terms
const dictionaryDir = path.join(__dirname, '../public/seo/slownik-erp');
const terms = fs.readdirSync(dictionaryDir)
    .filter(file => fs.statSync(path.join(dictionaryDir, file)).isDirectory());

// Generate new sitemap
const newSitemap = generateSitemap(terms);

// Write the new sitemap
fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), newSitemap);

console.log(`Sitemap updated with ${terms.length} dictionary terms.`);
