import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xml2js from 'xml2js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read sitemap.xml
const sitemapContent = fs.readFileSync(path.join(__dirname, '../public/sitemap.xml'), 'utf8');
const dictionaryDir = path.join(__dirname, '../public/seo/slownik-erp');

// Parse XML
xml2js.parseString(sitemapContent, (err, result) => {
    if (err) {
        console.error('Error parsing sitemap:', err);
        return;
    }

    // Get all dictionary URLs from sitemap
    const dictionaryUrls = result.urlset.url
        .map(url => url.loc[0])
        .filter(url => url.includes('/slownik-erp/'))
        .map(url => url.split('/slownik-erp/')[1]);

    // Get all existing dictionary terms
    const existingTerms = fs.readdirSync(dictionaryDir)
        .filter(file => fs.statSync(path.join(dictionaryDir, file)).isDirectory());

    console.log('Checking sitemap URLs against existing files...\n');

    // Check each URL from sitemap
    dictionaryUrls.forEach(url => {
        if (!existingTerms.includes(url)) {
            console.log(`❌ Term in sitemap but not in filesystem: ${url}`);
        }
    });

    // Check each directory
    existingTerms.forEach(term => {
        if (!dictionaryUrls.includes(term)) {
            console.log(`⚠️ Term in filesystem but not in sitemap: ${term}`);
        }
    });
});
