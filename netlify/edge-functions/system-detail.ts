import { Config, Context } from '@netlify/edge-functions';
import { createClient } from '@supabase/supabase-js';

// Extend Context type to include env
type NetlifyContext = Context & {
  env: {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    [key: string]: string;
  };
};

export default async (request: Request, context: NetlifyContext) => {
  try {
    // Extract system name from URL
    const url = new URL(request.url);
    const systemName = decodeURIComponent(url.pathname.split('/').pop()?.replace(/-/g, ' ') || '');

    // Initialize Supabase client
    const supabase = createClient(
      context.env.VITE_SUPABASE_URL,
      context.env.VITE_SUPABASE_ANON_KEY
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
    const updatedPage = page
      .replace('{meta_title}', `System ERP ${seoData.systemName} | Raport ERP by ERP-VIEW.PL`)
      .replace('{meta_description}', `System ERP ${seoData.systemName} od ${seoData.vendor}. ${seoData.systemDescription} Sprawdź opinie, funkcjonalności i porównaj z innymi systemami ERP.`)
      .replace('{meta_keywords}', `${seoData.systemName}, System ERP, ${seoData.vendor}, opinie, funkcjonalności, porównanie systemów ERP, raport ERP, ERP-VIEW.PL, ${seoData.keywords}`)
      .replace('{meta_canonical}', `https://raport-erp.pl/systemy-erp/${systemName.toLowerCase().replace(/ /g, '-')}`)
      .replace('{meta_og_url}', `https://raport-erp.pl/systemy-erp/${systemName.toLowerCase().replace(/ /g, '-')}`)
      .replace('{meta_json_ld}', JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": seoData.systemName,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "description": seoData.systemDescription,
        "offers": {
          "@type": "Offer",
          "price": "Contact for Pricing",
          "priceCurrency": "PLN"
        },
        "publisher": {
          "@type": "Organization",
          "name": seoData.vendor
        }
      }, null, 2));

    return new Response(updatedPage, response);
  } catch (error) {
    console.error('Edge function error:', error);
    return context.next();
  }
};
