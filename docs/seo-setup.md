# SEO Setup Guide

This document explains how to set up SEO for new routes in the Raport ERP application.

## Architecture Overview

The SEO system consists of several components:
1. Static SEO HTML files in `public/seo/`
2. Route entry points in the root directory
3. Vite SEO plugin for meta tag injection
4. SEO service for template management

## Adding a New Route with SEO

To add a new route with SEO support, follow these steps:

### 1. Create Entry Point

Create an HTML entry point in the root directory:
```html
<!-- your-route/index.html -->
<!DOCTYPE html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Page Title | Raport ERP by ERP-VIEW.PL</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 2. Add SEO Content

Create an SEO file in `public/seo/`:
```html
<!-- public/seo/your-route/index.html -->
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your SEO Title</title>
  <meta name="description" content="Your meta description">
  <meta name="keywords" content="your, keywords">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://www.raport-erp.pl/your-route">
  
  <!-- OpenGraph Tags -->
  <meta property="og:title" content="Your OG Title">
  <meta property="og:description" content="Your OG description">
  <meta property="og:url" content="https://www.raport-erp.pl/your-route">
  <meta property="og:type" content="website">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Your Page Name",
      "description": "Your page description"
    }
  </script>
</head>
<body>
  <!-- This is a SEO-only page -->
</body>
</html>
```

### 3. Update Vite Config

Add the route to `vite.config.ts`:
```typescript
export default defineConfig(async (): Promise<UserConfig> => {
  return {
    // ...
    build: {
      rollupOptions: {
        input: {
          // ...
          yourRoute: resolve(__dirname, 'your-route/index.html'),
        }
      }
    }
  };
});
```

### 4. Update Route Map

Add the route to `vite-seo-plugin.ts`:
```typescript
const ROUTES_MAP: RouteMap = {
  // ...
  'your-route/index.html': 'your-route',
  'your-route.html': 'your-route'
};
```

### 5. Add SEO Template

Add the template to `src/services/seo.ts`:
```typescript
const DEFAULT_SEO_TEMPLATES = {
  // ...
  '/your-route': {
    id: 'your-route',
    page_identifier: '/your-route',
    is_dynamic: false,
    title_template: 'Your Title Template',
    description_template: 'Your Description Template',
    keywords_template: 'your, keywords, template',
    structured_data_template: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Your Page Name",
      "description": "Your page description"
    },
    robots: 'index, follow'
  }
};
```

## Important Notes

1. **Route Consistency**: Make sure the route path is consistent across all files:
   - Entry point file location
   - SEO file location
   - Route map in Vite plugin
   - SEO template identifier

2. **Build Process**: The SEO files are:
   - Read during development by the Vite plugin
   - Copied to `dist/seo/` during build
   - Served by Netlify based on the redirect rules

3. **Debugging**: Check the console logs from the SEO plugin if meta tags aren't appearing correctly. The plugin logs:
   - Route mapping
   - File paths
   - Meta tag extraction
   - Injection process

## Example: Adding the /firmy-it Route

Here's a real example of how we added the `/firmy-it` route:

1. Created `firmy-it/index.html` entry point
2. Created `public/seo/firmy-it/index.html` with SEO content
3. Added to `vite.config.ts`:
   ```typescript
   companies: resolve(__dirname, 'firmy-it/index.html')
   ```
4. Added to `vite-seo-plugin.ts`:
   ```typescript
   'firmy-it/index.html': 'firmy-it',
   'firmy-it.html': 'firmy-it'
   ```
5. Added template to `src/services/seo.ts`

## Troubleshooting

If SEO content isn't appearing:
1. Check that the entry point HTML file exists
2. Verify the SEO HTML file path
3. Ensure route mappings are consistent
4. Check Netlify redirect rules
5. Look for build errors in the Netlify deploy logs
