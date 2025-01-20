import { supabase } from '../config/supabase';
import { adminSupabase } from '../config/supabase';
import { DictionaryTerm, DictionaryBanner } from '../types/dictionary';

// Function to generate SEO page for a term
async function generateTermSEO(term: {
  term: string;
  slug: string;
  explanation: string;
  letter: string;
}) {
  // TO DO: implement SEO page generation logic here
  console.log('Generating SEO page for term:', term);
}

export const dictionaryService = {
  // Public functions using regular supabase client
  getAllTerms: async (): Promise<DictionaryTerm[]> => {
    const { data, error } = await supabase
      .from('slownik_erp')
      .select('*')
      .order('term');
    
    if (error) throw error;
    return data;
  },

  getTermBySlug: async (slug: string): Promise<DictionaryTerm | null> => {
    const { data, error } = await supabase
      .from('slownik_erp')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  getTermBanners: async (termId: number): Promise<DictionaryBanner[]> => {
    const { data: termBanners, error: termBannersError } = await supabase
      .from('slownik_erp_banners')
      .select('*')
      .eq('term_id', termId)
      .eq('active', true);

    const { data: globalBanners, error: globalBannersError } = await supabase
      .from('slownik_erp_banners')
      .select('*')
      .eq('display_on_all', true)
      .eq('active', true);

    if (termBannersError || globalBannersError) {
      console.error('Error fetching banners:', termBannersError || globalBannersError);
      return [];
    }

    // If there are term-specific banners, use those. Otherwise, use global banners
    return termBanners?.length ? termBanners : globalBanners || [];
  },

  getAllBanners: async (): Promise<DictionaryBanner[]> => {
    const { data, error } = await supabase
      .from('slownik_erp_banners')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all banners:', error);
      return [];
    }
    return data || [];
  },

  getTermsByLetter: async (letter: string): Promise<DictionaryTerm[]> => {
    const { data, error } = await supabase
      .from('slownik_erp')
      .select('*')
      .eq('letter', letter.toUpperCase())
      .order('term');
    
    if (error) throw error;
    return data;
  },

  // Admin functions using adminSupabase client
  async createTerm(term: Omit<DictionaryTerm, 'id' | 'created_at' | 'updated_at' | 'slug' | 'letter'>) {
    try {
      const slug = term.term.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const letter = term.term.charAt(0).toUpperCase();

      const { data, error } = await adminSupabase
        .from('slownik_erp')
        .insert([{
          ...term,
          slug,
          letter,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Generate SEO page for the new term
      await generateTermSEO({
        term: term.term,
        slug,
        explanation: term.explanation,
        letter
      });

      return data;
    } catch (error) {
      console.error('Error creating term:', error);
      throw error;
    }
  },

  async updateTerm(id: number, term: Partial<DictionaryTerm>) {
    try {
      let updates: Partial<DictionaryTerm> = {
        ...term,
        updated_at: new Date().toISOString()
      };

      // If term name is being updated, update slug and letter
      if (term.term) {
        updates.slug = term.term.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        updates.letter = term.term.charAt(0).toUpperCase();
      }

      const { data, error } = await adminSupabase
        .from('slownik_erp')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Generate SEO page for the updated term
      await generateTermSEO({
        term: data.term,
        slug: data.slug,
        explanation: data.explanation,
        letter: data.letter
      });

      return data;
    } catch (error) {
      console.error('Error updating term:', error);
      throw error;
    }
  },

  async createTerms(terms: Partial<DictionaryTerm>[]) {
    try {
      // Process terms to add slugs and letters
      const processedTerms = terms.map(term => ({
        term: term.term,
        explanation: term.explanation,
        slug: term.term?.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
        letter: term.term?.charAt(0).toUpperCase(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Remove duplicates based on slug
      const uniqueTerms = processedTerms.reduce((acc, current) => {
        const x = acc.find(item => item.slug === current.slug);
        if (!x) {
          return acc.concat([current]);
        } else {
          // Update existing term if it's a duplicate
          return acc.map(item => 
            item.slug === current.slug 
              ? { ...item, ...current, updated_at: new Date().toISOString() }
              : item
          );
        }
        return acc;
      }, [] as any[]);

      const { data, error } = await adminSupabase
        .from('slownik_erp')
        .upsert(uniqueTerms, {
          onConflict: 'slug'
        });

      if (error) throw error;

      // Generate SEO pages for all terms
      await Promise.all(uniqueTerms.map(term => 
        generateTermSEO({
          term: term.term,
          slug: term.slug,
          explanation: term.explanation,
          letter: term.letter
        })
      ));

      return { data, error: null };
    } catch (error) {
      console.error('Error creating terms:', error);
      return { data: null, error };
    }
  },

  deleteTerm: async (id: number): Promise<void> => {
    const { error } = await adminSupabase
      .from('slownik_erp')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Banner management using adminSupabase client
  createBanner: async (banner: Omit<DictionaryBanner, 'id' | 'created_at' | 'updated_at'>): Promise<DictionaryBanner> => {
    const { data, error } = await adminSupabase
      .from('slownik_erp_banners')
      .insert([banner])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateBanner: async (id: number, banner: Partial<DictionaryBanner>): Promise<DictionaryBanner> => {
    const { data, error } = await adminSupabase
      .from('slownik_erp_banners')
      .update(banner)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteBanner: async (id: number): Promise<void> => {
    const { error } = await adminSupabase
      .from('slownik_erp_banners')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
