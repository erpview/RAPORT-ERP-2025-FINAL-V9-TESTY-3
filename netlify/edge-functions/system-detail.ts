import type { Context } from '@netlify/edge-functions';
import { getRuntime } from '@netlify/edge-functions';
import { createClient } from '@supabase/supabase-js';

export default async (request: Request, context: Context) => {
  try {
    // Extract system name from URL
    const url = new URL(request.url);
    const systemName = decodeURIComponent(url.pathname.split('/').pop()?.replace(/-/g, ' ') || '');

    // Initialize Supabase client
    const supabase = createClient(
      context.env.VITE_SUPABASE_URL || '',
      context.env.VITE_SUPABASE_ANON_KEY || ''
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
      .replace(/<title>.*?<\/title>/, `<title>${seoData.systemName} - System ERP | Raport ERP 2025</title>`)
      .replace(/<meta\s+property="og:title"\s+content=".*?"/, `<meta property="og:title" content="${seoData.systemName} - System ERP | Raport ERP 2025"`)
      .replace(/<meta\s+name="description"\s+content=".*?"/, `<meta name="description" content="System ERP ${seoData.systemName} od ${seoData.vendor}. ${seoData.systemDescription} Sprawdź opinie, funkcjonalności i porównaj z innymi systemami ERP."`)
      .replace(/<meta\s+property="og:description"\s+content=".*?"/, `<meta property="og:description" content="System ERP ${seoData.systemName} od ${seoData.vendor}. ${seoData.systemDescription} Sprawdź opinie, funkcjonalności i porównaj z innymi systemami ERP."`)
      .replace(/<meta\s+name="keywords"\s+content=".*?"/, `<meta name="keywords" content="${seoData.systemName}, System ERP, ${seoData.vendor}, opinie, funkcjonalności, porównanie systemów ERP, raport ERP, ERP-VIEW.PL, ${seoData.keywords}"`);

    return new Response(updatedPage, response);
  } catch (error) {
    console.error('Edge function error:', error);
    return context.next();
  }
};
