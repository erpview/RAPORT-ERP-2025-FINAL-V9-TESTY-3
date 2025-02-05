interface Context {
  ip: string;
  requestId: string;
  geo: {
    city?: string;
    country?: {
      code?: string;
      name?: string;
    };
  };
}

// Polish character mapping
const POLISH_CHARS_MAP: { [key: string]: string } = {
  'ą': 'a',
  'ć': 'c',
  'ę': 'e',
  'ł': 'l',
  'ń': 'n',
  'ó': 'o',
  'ś': 's',
  'ź': 'z',
  'ż': 'z',
  'Ą': 'A',
  'Ć': 'C',
  'Ę': 'E',
  'Ł': 'L',
  'Ń': 'N',
  'Ó': 'O',
  'Ś': 'S',
  'Ź': 'Z',
  'Ż': 'Z'
};

// URL cleanup function
function cleanupSlug(slug: string): string {
  // Remove any trailing special characters and query parameters
  slug = slug.split(/[?&]/)[0];
  
  // Double decode to handle double-encoded characters
  let decodedSlug = decodeURIComponent(decodeURIComponent(slug));
  
  // Normalize Polish characters
  decodedSlug = decodedSlug
    .split('')
    .map(char => POLISH_CHARS_MAP[char] || char)
    .join('');
  
  // Replace spaces with hyphens and handle multiple hyphens
  decodedSlug = decodedSlug
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/-+/g, '-')            // Replace multiple hyphens with single hyphen
    .replace(/(\w)-(\w)/g, '$1---$2')  // Replace single hyphens between words with triple hyphens
    .toLowerCase();                  // Convert to lowercase
    
  return decodedSlug;
}

export default async function handler(request: Request, context: Context) {
  const url = new URL(request.url);
  const pathPart = url.pathname.split('/slownik-erp/')[1]?.replace(/\/$/, '');
  
  if (!pathPart) {
    return;
  }

  // Clean up the slug
  const cleanSlug = cleanupSlug(pathPart);
  
  // If the path is different after cleanup, redirect
  if (pathPart !== cleanSlug) {
    return Response.redirect(`${url.origin}/slownik-erp/${cleanSlug}`, 301);
  }

  // Check if it's a legacy URL format (ID-slug.html)
  const legacyMatch = cleanSlug.match(/^\d+-(.+?)(?:\.html)?$/);
  if (legacyMatch) {
    const newSlug = cleanupSlug(legacyMatch[1]);
    return Response.redirect(`${url.origin}/slownik-erp/${newSlug}`, 301);
  }

  // Check if it's a simple .html extension
  if (cleanSlug.endsWith('.html')) {
    const newSlug = cleanupSlug(cleanSlug.replace(/\.html$/, ''));
    return Response.redirect(`${url.origin}/slownik-erp/${newSlug}`, 301);
  }

  const slug = cleanSlug;

  // Format the term name for display
  const termName = slug
    .split('-')
    .map(word => {
      // Special case for ABC
      if (word.toLowerCase() === 'abc') return 'ABC';
      // Special case for ERP
      if (word.toLowerCase() === 'erp') return 'ERP';
      // Special case for IT
      if (word.toLowerCase() === 'it') return 'IT';
      // For other words, just capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  const html = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Icons -->
  <link rel="icon" href="https://erp-view.pl/images/icony/favicon.png" />
  <link rel="shortcut icon" href="https://erp-view.pl/images/icony/favicon.png" />
  <link rel="apple-touch-icon" href="https://erp-view.pl/images/icony/icon-192.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="https://erp-view.pl/images/icony/icon-192.png" />
  <link rel="icon" sizes="192x192" href="https://erp-view.pl/images/icony/icon-192.png" />
  <link rel="icon" sizes="512x512" href="https://erp-view.pl/images/icony/icon-512.png" />
  
  <!-- PWA -->
  <link rel="manifest" href="/manifest.webmanifest" />
  
  <!-- Mobile Settings -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-touch-fullscreen" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="format-detection" content="telephone=no">
  <meta name="HandheldFriendly" content="true">
  
  <!-- SEO Meta Tags -->
  <title>Słownik ERP - ${termName} | ERP-VIEW.PL</title>
  <meta name="description" content="Poznaj definicję terminu ${termName} w kontekście systemów ERP. Dowiedz się więcej na ERP-VIEW.PL">
  <meta name="keywords" content="${termName}, definicja ${termName}, ${termName} ERP, znaczenie ${termName}, system ERP ${termName}">
  <meta name="robots" content="index, follow">
  
  <!-- OpenGraph Tags -->
  <meta property="og:title" content="Słownik ERP - ${termName} | ERP-VIEW.PL">
  <meta property="og:description" content="Poznaj definicję terminu ${termName} w kontekście systemów ERP. Dowiedz się więcej na ERP-VIEW.PL">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://www.raport-erp.pl/slownik-erp/${slug}">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": "${termName}",
    "description": "Definicja terminu ${termName} w kontekście systemów ERP",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Słownik ERP",
      "url": "https://www.raport-erp.pl/slownik-erp"
    }
  }
  </script>

  <!-- Initial State -->
  <script>
    window.__PRELOADED_STATE__ = {
      dictionary: {
        currentTerm: {
          slug: "${slug}",
          name: "${termName}"
        }
      }
    };
  </script>

  <!-- App Resources -->
  <script type="module">
    // Import vendor chunk first
    import('/assets/js/vendor.js');
    // Import main chunk
    import('/assets/js/main2.js');
  </script>
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <div id="root"></div>
</body>
</html>`;

  return new Response(html.trim(), {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      'x-robots-tag': 'index,follow',
      'cache-control': 'no-cache, no-store, must-revalidate'
    }
  });
}
