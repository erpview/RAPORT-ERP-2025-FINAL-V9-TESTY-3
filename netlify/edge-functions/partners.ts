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
  env: {
    get(key: string): string | undefined;
  };
  next(): Promise<Response>;
}
import { createClient } from '@supabase/supabase-js';

export default async function handler(request: Request, context: Context) {
  try {
    const url = new URL(request.url);
    const pathPart = url.pathname.split('/partnerzy/')[1]?.replace(/\/$/, '');
    
    if (!pathPart) {
      return context.next();
    }

    // Initialize Supabase client
    const supabase = createClient(
      context.env.get('VITE_SUPABASE_URL') || '',
      context.env.get('VITE_SUPABASE_ANON_KEY') || ''
    );

    // Fetch partner data
    const { data: partner, error } = await supabase
      .from('partners')
      .select('*')
      .eq('slug', pathPart)
      .single();

    if (error || !partner) {
      return context.next();
    }

    // Get HTML template
    const response = await context.next();
    const page = await response.text();

    // Replace SEO placeholders
    const updatedPage = page
      .replace('{meta_title}', partner.meta_title || '')
      .replace('{meta_description}', partner.meta_description || '')
      .replace('{meta_keywords}', partner.meta_keywords || '');

    return new Response(updatedPage, response);
  } catch (error) {
    console.error('Edge function error:', error);
    return context.next();
  }
}
