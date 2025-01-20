import fs from 'fs/promises';
import path from 'path';

interface Partner {
  name: string;
  slug: string;
  website: string;
  keywords?: string[];
}

async function generatePartnerSEO(partner: Partner) {
  try {
    // Read the template
    const templatePath = path.join(process.cwd(), 'templates', 'partner-seo.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    // Replace placeholders with partner data
    template = template
      .replace(/{{partnerName}}/g, partner.name)
      .replace(/{{partnerSlug}}/g, partner.slug)
      .replace(/{{partnerWebsite}}/g, partner.website)
      .replace(/{{partnerKeywords}}/g, (partner.keywords || []).join(', '));

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

// Example usage:
async function main() {
  const partners: Partner[] = [
    {
      name: 'Example Partner',
      slug: 'example-partner',
      website: 'https://example.com',
      keywords: ['example', 'partner', 'erp solutions']
    }
    // Add more partners here
  ];

  console.log('🚀 Starting SEO generation for partners...');
  
  for (const partner of partners) {
    await generatePartnerSEO(partner);
  }
  
  console.log('✨ Finished generating partner SEO pages');
}

// Run the script if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { generatePartnerSEO, Partner };
