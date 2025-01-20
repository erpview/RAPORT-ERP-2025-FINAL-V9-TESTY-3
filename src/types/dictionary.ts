export interface DictionaryTerm {
  id: number;
  term: string;
  slug: string;
  explanation: string;
  letter: string;
  created_at: string;
  updated_at: string;
}

export interface DictionaryBanner {
  id: number;
  term_id: number | null;
  image_url: string;
  link_url: string | null;
  active: boolean;
  display_on_all: boolean;
  created_at: string;
  updated_at: string;
}
