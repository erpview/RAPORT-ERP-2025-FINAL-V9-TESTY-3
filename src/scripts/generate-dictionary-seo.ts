import { dictionaryService } from '../services/dictionary';
import { generateTermSEO, generateDictionaryIndexSEO } from '../utils/termSeoGenerator';
import { stripHtmlAndTruncate } from '../utils/textHelpers';

async function generateAllTermSEOPages() {
  try {
    // Get all dictionary terms
    const terms = await dictionaryService.getAllTerms();
    console.log(` Found ${terms.length} dictionary terms`);

    // Generate SEO pages for each term
    let successCount = 0;
    let errorCount = 0;

    for (const term of terms) {
      try {
        const success = await generateTermSEO({
          term: term.term,
          slug: term.slug,
          explanation: term.explanation,
          letter: term.letter
        });

        if (success) {
          successCount++;
          console.log(` Generated SEO page for: ${term.term}`);
        } else {
          errorCount++;
          console.error(` Failed to generate SEO page for: ${term.term}`);
        }
      } catch (error) {
        errorCount++;
        console.error(` Error generating SEO for ${term.term}:`, error);
      }
    }

    // Generate index page for all terms
    await generateDictionaryIndexSEO(terms);

    console.log('\n=== Summary ===');
    console.log(`Total terms processed: ${terms.length}`);
    console.log(`Successfully generated: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
  } catch (error) {
    console.error(' Error in main process:', error);
  }
}

// Run the script
generateAllTermSEOPages();
