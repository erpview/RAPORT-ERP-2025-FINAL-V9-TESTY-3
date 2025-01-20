import fs from 'fs/promises';
import path from 'path';
import { stripHtmlAndTruncate } from './textHelpers';

interface TermSEOData {
  term: string;
  slug: string;
  explanation: string;
  letter: string;
}

export async function generateTermSEO(term: TermSEOData) {
  try {
    // Read the template
    const templatePath = path.join(process.cwd(), 'templates', 'term-seo.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    // Strip HTML and truncate explanation for meta description
    const plainTextExplanation = stripHtmlAndTruncate(term.explanation, 160);

    // Replace placeholders with term data
    template = template
      .replace(/{Term Name}/g, term.term)
      .replace(/{term-slug}/g, term.slug)
      .replace(/{Term Definition}/g, plainTextExplanation);

    // Create directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'slownik-erp', term.slug);
    await fs.mkdir(outputDir, { recursive: true });

    // Write the SEO file
    const outputPath = path.join(outputDir, 'index.html');
    await fs.writeFile(outputPath, template);

    console.log(`✅ Generated SEO page for term: ${term.term}`);
    return true;
  } catch (error) {
    console.error(`❌ Error generating SEO page for term ${term.term}:`, error);
    return false;
  }
}

// Function to generate index page for dictionary
export async function generateDictionaryIndexSEO(terms: TermSEOData[]) {
  try {
    // Sort terms by letter
    const termsByLetter = terms.reduce((acc, term) => {
      if (!acc[term.letter]) {
        acc[term.letter] = [];
      }
      acc[term.letter].push(term);
      return acc;
    }, {} as Record<string, TermSEOData[]>);

    // Create the dictionary index page
    const outputDir = path.join(process.cwd(), 'slownik-erp');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Generate structured data for all terms
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "DefinedTermSet",
      "name": "Słownik ERP",
      "description": "Kompletny słownik terminów i definicji związanych z systemami ERP",
      "url": "https://www.raport-erp.pl/slownik-erp",
      "hasPart": terms.map(term => ({
        "@type": "DefinedTerm",
        "name": term.term,
        "description": stripHtmlAndTruncate(term.explanation, 160),
        "url": `https://www.raport-erp.pl/slownik-erp/${term.slug}`
      }))
    };

    await fs.writeFile(
      path.join(outputDir, 'structured-data.json'),
      JSON.stringify(structuredData, null, 2)
    );

    return true;
  } catch (error) {
    console.error('Error generating dictionary index:', error);
    return false;
  }
}
