import fs from 'fs/promises';
import path from 'path';

// Define a minimal interface for SEO generation
interface PartnerSEOData {
  name: string;
  slug: string;
  website_url?: string;
  meta_keywords?: string;
}

export async function generatePartnerSEO(partner: PartnerSEOData) {
  try {
    // Read the template
    const templatePath = path.join(process.cwd(), 'templates', 'partner-seo.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    // Replace placeholders with partner data
    template = template
      .replace(/{{partnerName}}/g, partner.name)
      .replace(/{{partnerSlug}}/g, partner.slug)
      .replace(/{{partnerWebsite}}/g, partner.website_url || '')
      .replace(/{{partnerKeywords}}/g, partner.meta_keywords || `${partner.name}, partner erp, wdrożenie erp`);

    // Create directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'public', 'seo', 'partnerzy', partner.slug);
    await fs.mkdir(outputDir, { recursive: true });

    // Write the SEO file
    const outputPath = path.join(outputDir, 'index.html');
    await fs.writeFile(outputPath, template);

    console.log(`✅ Generated SEO page for ${partner.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Error generating SEO page for ${partner.name}:`, error);
    return false;
  }
}
