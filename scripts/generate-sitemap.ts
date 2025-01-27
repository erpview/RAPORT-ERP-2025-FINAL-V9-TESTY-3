import { writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://raport-erp.pl';

// List of public routes that don't require authentication
const publicRoutes = [
  '/',
  '/firmy-it',
  '/systemy',
  '/koszty',
  '/kalkulator',
  '/slownik-erp',
  '/porownaj',
  '/partnerzy'
];

// Get all dictionary term routes
const dictionaryTerms = [
  'erp',
  'mrp',
  'mrp-ii',
  'crm',
  'bi',
  'scm',
  'wms',
  'mes',
  'ecm',
  'plm',
  'ppm',
  'eam',
  'hcm',
  'bpm'
]; // Add all your dictionary terms

// Get partner routes
const partners = [
  'sente',
  'rambase',
  'axians',
  'ipcc',
  'sygrnity-business-solutions',
  'deveho-consulting',
  'anegis',
  'simple',
  'bpsc',
  'proalpha',
  'asseco-business-solutions',
  'streamsoft',
  'digitland',
  'soneta',
  'vendo.erp',
  'symfonia',
  'sygnity-business-solutions',
  'rho-software',
  'it.integro'
];

function generateSitemapXML(): string {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add main public routes
  publicRoutes.forEach(route => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${route}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  });

  // Add dictionary term pages
  dictionaryTerms.forEach(term => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/slownik-erp/${term}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  });

  // Add partner pages
  partners.forEach(partner => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/partnerzy/${partner}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += '</urlset>';
  return xml;
}

try {
  const sitemap = generateSitemapXML();
  const outputPath = join(process.cwd(), 'public', 'sitemap.xml');
  writeFileSync(outputPath, sitemap);
  console.log('✅ Successfully generated sitemap.xml');
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
}
