# Edge Function Setup for Dictionary Terms SEO

This guide explains how to implement Netlify Edge Functions for SEO optimization of dictionary term pages.

## Project Structure Reference
Here's how the project should be structured for the edge function to work properly:

```
project/
├── netlify/
│   └── edge-functions/
│       └── dictionary-term.ts      # Edge function for SEO
├── public/
│   └── manifest.webmanifest       # PWA manifest
├── src/
│   ├── components/
│   │   └── seo/
│   │       └── SEOHead.tsx        # SEO component for meta tags
│   ├── pages/
│   │   └── SlownikErpTerm.tsx    # Dictionary term page component
│   ├── services/
│   │   └── seo.ts                # SEO service functions
│   ├── App.tsx                   # Main app component with routes
│   └── main.tsx                  # Entry point
├── netlify.toml                  # Netlify configuration
├── package.json                  # Project dependencies
└── vite.config.ts               # Vite configuration
```

### Key Files and Their Purposes

1. **Edge Function Files**:
   - `netlify/edge-functions/dictionary-term.ts`: Handles SEO-optimized HTML generation for dictionary terms
   - `netlify.toml`: Configures edge function routing and build settings

2. **React Components**:
   - `src/pages/SlownikErpTerm.tsx`: Main component for dictionary term pages
   - `src/components/seo/SEOHead.tsx`: Handles dynamic meta tags for SEO

3. **Configuration Files**:
   - `vite.config.ts`: Configures build process and asset handling
   - `package.json`: Defines project dependencies and scripts

4. **Service Files**:
   - `src/services/seo.ts`: Contains SEO-related utility functions

### Required Routes
Your application should have these routes configured:

```typescript
// In App.tsx or your router configuration
const routes = [
  {
    path: '/slownik-erp/:term',
    component: SlownikErpTerm
  },
  // ... other routes
];
```

### SEO Component Structure
Your SEO component should handle these meta tags:

```typescript
// In SEOHead.tsx
interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogType?: string;
  // ... other props
}
```

### Build Output Structure
After building, your `dist` directory should look like:

```
dist/
├── assets/
│   ├── js/
│   │   ├── vendor-[hash].js
│   │   └── main-[hash].js
│   └── css/
│       └── main-[hash].css
└── index.html
```

## Prerequisites
Before implementing the edge function, verify that your project has:

1. **Required Routes and Components**:
   - Check that you have a dictionary term route (e.g., `/slownik-erp/:term`)
   - Verify your React component for displaying dictionary terms exists (e.g., `SlownikErpTerm.tsx`)

2. **Build Configuration**:
   - Verify your `vite.config.ts` is set up for SPA and handles asset paths correctly
   - Check that your build command in `package.json` is correct (should be `npm run build` or similar)

3. **Asset Files**:
   - Note the names of your built JavaScript and CSS files in the `dist/assets` directory after building
   - You'll need these names to update the edge function's HTML template

4. **SEO Components**:
   - Check if you have existing SEO components (like `SEOHead.tsx`)
   - Make sure your dictionary term pages are already set up to handle meta tags

5. **Required Dependencies**:
   - Verify your project has all necessary dependencies installed
   - Check that Node.js version matches (v18 recommended)

6. **Netlify Setup**:
   - Ensure your project is properly connected to Netlify
   - Verify you have the necessary Netlify build settings configured

## Step 1: Create Edge Functions Directory
```bash
mkdir -p netlify/edge-functions
```

## Step 2: Create Edge Function File
Create a new file `netlify/edge-functions/dictionary-term.ts` with the following content:

```typescript
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
  const slug = url.pathname.split('/slownik-erp/')[1]?.replace(/\/$/, '');
  
  if (!slug) {
    return;
  }

  // Format the term name for display
  const termName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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
  <meta name="keywords" content="${termName}, definicja ${termName}, ${termName} erp, znaczenie ${termName}, system erp ${termName}">
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

  <!-- App Resources -->
  <script type="module" crossorigin src="/assets/js/vendor-O2RIE6o4.js"></script>
  <script type="module" crossorigin src="/assets/js/main-CJpgmRj7.js"></script>
  <link rel="stylesheet" crossorigin href="/assets/main-CBZhq_I6.css">
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
```

## Step 3: Update netlify.toml
Create or update your `netlify.toml` file with the following configuration:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Robots-Tag = "all"

# Dictionary term pages with edge function
[[edge_functions]]
  path = "/slownik-erp/*"
  function = "dictionary-term"

# Dictionary term pages fallback
[[redirects]]
  from = "/slownik-erp/*"
  to = "/index.html"
  status = 200

# Dictionary index page
[[redirects]]
  from = "/slownik-erp"
  to = "/index.html"
  status = 200

# Fallback redirect for SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Step 4: Update Asset References
In the edge function's HTML template, make sure to update:
1. The asset paths (`vendor-O2RIE6o4.js`, `main-CJpgmRj7.js`, `main-CBZhq_I6.css`) to match your actual build output files
2. The icon URLs if they are different in your app
3. The domain name in OpenGraph URLs and structured data if it's different

## Step 5: Deploy to Netlify
1. Commit all changes:
```bash
git add .
git commit -m "feat: add edge function for dictionary terms SEO"
git push origin main
```

2. Make sure your site is connected to Netlify and deploys automatically on push

## Step 6: Verify Installation
1. Visit a dictionary term page on your site (e.g., `https://your-site.netlify.app/slownik-erp/some-term`)
2. View the page source (right-click -> View Page Source)
3. Verify that:
   - The HTML contains all SEO meta tags
   - The term name is properly formatted (capitalized and spaces instead of dashes)
   - The page loads and functions correctly
   - The React app loads and renders properly

## Step 7: Test SEO
1. Use Google's Rich Results Test to verify the structured data
2. Check Google Search Console for any crawling issues
3. Verify that meta tags are being picked up correctly by social media platforms using their respective validation tools

## Important Notes:
- Make sure your React app's routing handles dictionary term pages correctly
- The edge function will only run on Netlify's infrastructure
- Local development might behave differently from production
- Monitor Netlify's function logs for any errors after deployment
- The term name formatting will convert dashes to spaces and capitalize each word (e.g., "adresy-skladowania" becomes "Adresy Skladowania")
