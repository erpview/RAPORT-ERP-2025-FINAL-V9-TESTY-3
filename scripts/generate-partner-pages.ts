import fs from 'fs/promises';
import path from 'path';

const PARTNER_SLUGS = [
  'anegis',
  'asseco-business-solutions',
  'axians',
  'bpsc',
  'deveho-consulting',
  'digitland',
  'soneta',
  'ipcc',
  'it.integro',
  'proalpha',
  'rambase',
  'rho-software',
  'sente',
  'simple',
  'streamsoft',
  'sygnity-business-solutions',
  'symfonia',
  'vendo.erp'
];

const template = `<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Icons -->
    <link rel="icon" href="https://erp-view.pl/images/icony/favicon.png" />
    <link rel="shortcut icon" href="https://erp-view.pl/images/icony/favicon.png" />
    <link rel="apple-touch-icon" href="https://erp-view.pl/images/icony/icon-192.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="https://erp-view.pl/images/icony/icon-192.png" />
    <link rel="icon" sizes="192x192" href="https://erp-view.pl/images/icony/icon-192.png" />
    <link rel="icon" sizes="512x512" href="https://erp-view.pl/images/icony/icon-512.png" />
    
    <!-- PWA -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Raport ERP by ERP-VIEW.PL" />
    <link rel="manifest" href="/manifest.webmanifest" />
    
    <script type="module" crossorigin src="/assets/main-CWC8S_50.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/main-DFBtaBFs.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

async function generatePartnerPages() {
  for (const slug of PARTNER_SLUGS) {
    const dir = path.join(process.cwd(), 'partnerzy', slug);
    const file = path.join(dir, 'index.html');
    
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(file, template);
      console.log(`Generated ${file}`);
    } catch (error) {
      console.error(`Error generating ${file}:`, error);
    }
  }
}

generatePartnerPages().catch(console.error);
