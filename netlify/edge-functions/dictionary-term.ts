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

export default async function handler(request: Request, context: Context) {
  const url = new URL(request.url);
  const slug = url.pathname === '/slownik-erp' ? '' : url.pathname.split('/slownik-erp/')[1]?.replace(/\/$/, '');
  
  if (slug === undefined) {
    return;
  }

  // Format the term name for display
  const termName = slug
    ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Słownik ERP';

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
  <title>${slug ? `${termName} - Słownik ERP | Raport ERP by ERP-VIEW.PL` : 'Słownik ERP - Terminologia systemów ERP | Raport ERP by ERP-VIEW.PL'}</title>
  <meta name="description" content="${slug ? `Poznaj definicję terminu ${termName} w kontekście systemów ERP. Dowiedz się więcej o tym pojęciu w systemach zarządzania przedsiębiorstwem.` : 'Poznaj terminologię związaną z systemami ERP. Kompleksowy słownik pojęć i definicji z zakresu systemów ERP, który pomoże Ci lepiej zrozumieć ten obszar.'}">
  <meta name="keywords" content="${slug ? `${termName}, definicja ${termName}, ${termName} erp, znaczenie ${termName}, system erp ${termName}` : 'słownik erp, terminologia erp, pojęcia erp, definicje erp, system erp, słowniczek erp'}">
  <meta name="robots" content="index, follow">
  
  <!-- OpenGraph Tags -->
  <meta property="og:title" content="${slug ? `${termName} - Słownik ERP | Raport ERP by ERP-VIEW.PL` : 'Słownik ERP - Terminologia systemów ERP | Raport ERP by ERP-VIEW.PL'}">
  <meta property="og:description" content="${slug ? `Poznaj definicję terminu ${termName} w kontekście systemów ERP. Dowiedz się więcej o tym pojęciu w systemach zarządzania przedsiębiorstwem.` : 'Poznaj terminologię związaną z systemami ERP. Kompleksowy słownik pojęć i definicji z zakresu systemów ERP, który pomoże Ci lepiej zrozumieć ten obszar.'}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://www.raport-erp.pl${slug ? `/slownik-erp/${slug}` : '/slownik-erp'}">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    ${slug ? `
    "@type": "DefinedTerm",
    "name": "${termName}",
    "description": "Definicja terminu ${termName} w kontekście systemów ERP",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Słownik ERP",
      "url": "https://www.raport-erp.pl/slownik-erp"
    }` : `
    "@type": "DefinedTermSet",
    "name": "Słownik ERP",
    "description": "Kompleksowy słownik pojęć i terminów związanych z systemami ERP",
    "url": "https://www.raport-erp.pl/slownik-erp"`}
  }
  </script>

  <!-- App Resources -->
  <script type="module" crossorigin src="/assets/js/vendor-oyeZ1I31.js"></script>
  <script type="module" crossorigin src="/assets/js/main-D-Laz3Bo.js"></script>
  <link rel="stylesheet" crossorigin href="/assets/css/style-Bo9wvlM9.css">
</head>
<body>
  <div id="root"></div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      'x-robots-tag': 'index,follow'
    }
  });
}
