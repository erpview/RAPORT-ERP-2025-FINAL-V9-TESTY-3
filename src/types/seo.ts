export interface SEOData {
  id: string;
  page_identifier: string;
  is_dynamic: boolean;
  parent_page?: string;
  dynamic_field?: string;
  title_template: string;
  title_fallback_template?: string;
  description_template: string;
  description_fallback_template?: string;
  keywords_template?: string;
  keywords_fallback_template?: string;
  canonical_url_template?: string;
  canonical_url_fallback_template?: string;
  og_title_template?: string;
  og_description_template?: string;
  og_image_field?: string;
  structured_data_template?: any;
  robots?: string;
}

export interface DynamicSEOData {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  custom_canonical_url?: string;
  custom_structured_data?: any;
}

export interface ProcessedSEOData {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  structuredData?: any;
  robots?: string;
}
