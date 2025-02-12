/// <reference lib="deno.ns" />
import { Config, Context } from '@netlify/edge-functions';
import { createClient } from '@supabase/supabase-js';

export default async (request: Request, context: Context) => {
  try {
    // Extract system name from URL
    const url = new URL(request.url);
    const systemName = decodeURIComponent(url.pathname.split('/').pop()?.replace(/-/g, ' ') || '');

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('VITE_SUPABASE_URL') || '',
      Deno.env.get('VITE_SUPABASE_ANON_KEY') || ''
    );

    // Fetch system data
    const { data: system, error } = await supabase
      .from('systems')
      .select(`
        *,
        features:system_features(name),
        industries:system_industries(name),
        pricing:system_pricing(*)
      `)
      .eq('name', systemName)
      .single();

    if (error || !system) {
      return context.next();
    }

    // Transform data for SEO
    const seoData = {
      systemName: system.name,
      systemDescription: system.description,
      vendor: system.vendor,
      keywords: [
        ...(system.features?.map((f: any) => f.name) || []),
        ...(system.industries?.map((i: any) => i.name) || [])
      ].join(', ')
    };

    // Get HTML template
    const response = await context.next();
    const page = await response.text();

    // Replace SEO placeholders
    const titleRegex = /<title>[^<]*<\/title>/;
    const ogTitleRegex = /<meta\s+property="og:title"\s+content="[^"]*"/;
    const descriptionRegex = /<meta\s+name="description"\s+content="[^"]*"/;
    const ogDescriptionRegex = /<meta\s+property="og:description"\s+content="[^"]*"/;
    const keywordsRegex = /<meta\s+name="keywords"\s+content="[^"]*"/;
    const canonicalRegex = /<link\s+rel="canonical"\s+href="[^"]*"/;
    const ogUrlRegex = /<meta\s+property="og:url"\s+content="[^"]*"/;
    const jsonLdRegex = /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/;

    const updatedPage = page
      .replace(titleRegex, `<title>System ERP ${seoData.systemName} | Raport ERP by ERP-VIEW.PL</title>`)
      .replace(ogTitleRegex, `<meta property="og:title" content="System ERP ${seoData.systemName} | Raport ERP by ERP-VIEW.PL"`)
      .replace(descriptionRegex, `<meta name="description" content="System ERP ${seoData.systemName} od ${seoData.vendor}. ${seoData.systemDescription} Sprawdź opinie, funkcjonalności i porównaj z innymi systemami ERP."`)
      .replace(ogDescriptionRegex, `<meta property="og:description" content="System ERP ${seoData.systemName} od ${seoData.vendor}. ${seoData.systemDescription} Sprawdź opinie, funkcjonalności i porównaj z innymi systemami ERP."`)
      .replace(keywordsRegex, `<meta name="keywords" content="${seoData.systemName}, System ERP, ${seoData.vendor}, opinie, funkcjonalności, porównanie systemów ERP, raport ERP, ERP-VIEW.PL, ${seoData.keywords}"`)
      .replace(canonicalRegex, `<link rel="canonical" href="https://raport-erp.pl/systemy-erp/${systemName.toLowerCase().replace(/ /g, '-')}"`)
      .replace(ogUrlRegex, `<meta property="og:url" content="https://raport-erp.pl/systemy-erp/${systemName.toLowerCase().replace(/ /g, '-')}"`)
      .replace(jsonLdRegex, `<script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "${seoData.systemName}",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "description": "${seoData.systemDescription}",
        "offers": {
          "@type": "Offer",
          "price": "Contact for Pricing",
          "priceCurrency": "PLN"
        },
        "publisher": {
          "@type": "Organization",
          "name": "${seoData.vendor}"
        }
      }
      </script>`);

    return new Response(updatedPage, response);
  } catch (error) {
    console.error('Edge function error:', error);
    return context.next();
  }
};
