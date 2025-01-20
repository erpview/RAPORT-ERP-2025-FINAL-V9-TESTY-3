import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { dictionaryService } from '../src/services/dictionary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.join(__dirname, '..');

interface Term {
  slug: string;
  name: string;
  definition: string;
}

async function generateTermSEO(term: Term) {
  try {
    // Read the template
    const template = await fs.readFile(
      path.join(projectRoot, 'templates/term-seo.html'),
      'utf-8'
    );

    // Replace placeholders with actual content
    const seoContent = template
      .replace(/{Term Name}/g, term.name)
      .replace(/{Term Definition}/g, term.definition)
      .replace(/{term-slug}/g, term.slug);

    // Create the output directory
    const outputDir = path.join(projectRoot, 'public/seo/slownik-erp', term.slug);
    await fs.mkdir(outputDir, { recursive: true });

    // Write the SEO file
    await fs.writeFile(path.join(outputDir, 'index.html'), seoContent);
    console.log(`Generated SEO file for term: ${term.name}`);
  } catch (error) {
    console.error(`Error generating SEO file for term ${term.name}:`, error);
  }
}

// Function to sanitize the definition (remove HTML tags, normalize whitespace)
function sanitizeDefinition(definition: string): string {
  return definition
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Main function to generate SEO files for all terms
async function generateAllTermsSEO() {
  try {
    // Get terms from the dictionary service
    const terms = await dictionaryService.getAllTerms();

    // Generate SEO files for each term
    for (const term of terms) {
      await generateTermSEO({
        slug: term.slug,
        name: term.term,
        definition: sanitizeDefinition(term.explanation)
      });
    }

    console.log('Finished generating SEO files for all terms');
  } catch (error) {
    console.error('Error generating term SEO files:', error);
  }
}

// Run the script
generateAllTermsSEO();
