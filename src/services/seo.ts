import { supabase } from '../config/supabase';
import { SEOData, DynamicSEOData, ProcessedSEOData } from '../types/seo';

const DEFAULT_SEO_TEMPLATES = {
  '': {
    id: 'default-home',
    page_identifier: '',
    is_dynamic: false,
    title_template: 'Raport ERP - systemy ERP - dostawcy ERP - przewodnik po systemach ERP',
    description_template: 'Poznaj najnowszy raport o systemach ERP w Polsce. Sprawdź ranking, porównaj funkcjonalności wiodących systemów ERP.',
    keywords_template: 'erp, system erp, zarządzanie przedsiębiorstwem, oprogramowanie dla firm, raport erp, ranking erp',
    structured_data_template: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "name": "Raport ERP by ERP-VIEW.PL",
          "applicationCategory": "BusinessApplication",
          "description": "Kompleksowy przewodnik i raport o systemach ERP w Polsce. Porównaj funkcjonalności, sprawdź ranking i znajdź najlepsze rozwiązanie dla swojej firmy.",
          "url": "https://www.raport-erp.pl",
          "operatingSystem": "All",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": 4.9,
            "ratingCount": 15420
          },
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "PLN"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Raport ERP by ERP-VIEW.PL",
            "url": "https://www.raport-erp.pl"
          }
        }
      ]
    },
    robots: 'index, follow'
  },
  'home': {
    id: 'default-home',
    page_identifier: 'home',
    is_dynamic: false,
    title_template: 'Raport ERP - systemy ERP - dostawcy ERP - przewodnik po systemach ERP',
    title_fallback_template: 'Raport ERP - systemy ERP - dostawcy ERP - przewodnik po systemach ERP',
    description_template: 'RAPORT ERP - zestawienie i porównanie 70 dostępnych na polskim rynku systemów ERP, opisanych przez 565 kluczowych funkcjonalności ERP. Kalkulator kosztów wdrożenia systemów ERP.',
    description_fallback_template: 'RAPORT ERP - zestawienie i porównanie 70 dostępnych na polskim rynku systemów ERP, opisanych przez 565 kluczowych funkcjonalności ERP. Kalkulator kosztów wdrożenia systemów ERP.',
    keywords_template: 'erp, system erp, zarządzanie przedsiębiorstwem, oprogramowanie dla firm, raport erp, ranking erp, wdrożenie erp, koszt wdrożenia erp,IT INTEGRO,SAP, COMARCH,BPSC ,UNIT4TETA,ABAS ERP,ASSECO SOFTLAB ERP, ERP BERBERIS,COMARCH CDN XL, EPICOR,HORNET,IMPULS 5 | INFOR10 ERP ENTERPRISE  (LN),INFOR ERP SL, INFOR LOWSON, ISCALA,ISOF,JDE,MAAT,MICROSOFT DYNAMICS NAV | MICROSOFT DYNAMIX AX,MADAR ERP,NAVIREO,ORACLE E-BUSINESS SUITE,QAD ENTERPRISE APPLICATIONS,SAGE ERP,SAP ERP,SENTE,SIMPLE.ERP,SZYK2,TETA ERP,MACROLOGIC ERP, MACROLOGIC MERIT',
    structured_data_template: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "name": "Raport ERP by ERP-VIEW.PL",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "All",
          "offers": {
            "@type": "Offer",
            "price": "0"
          }
        }
      ]
    },
    robots: 'index, follow'
  },
  '/slownik-erp': {
    id: 'dictionary',
    page_identifier: '/slownik-erp',
    is_dynamic: false,
    title_template: 'Słownik ERP - Definicje i pojęcia systemów ERP | Raport ERP 2025',
    description_template: 'Kompleksowy słownik terminów i pojęć związanych z systemami ERP. Poznaj znaczenie kluczowych terminów używanych w systemach zarządzania przedsiębiorstwem.',
    keywords_template: 'słownik erp, definicje erp, pojęcia erp, terminologia erp, system erp definicja',
    structured_data_template: {
      "@context": "https://schema.org",
      "@type": "DefinedTermSet",
      "name": "Słownik ERP",
      "description": "Kompleksowy słownik terminów i pojęć związanych z systemami ERP"
    },
    robots: 'index, follow'
  },
  '/systemy-erp': {
    id: 'systems',
    page_identifier: '/systemy-erp',
    is_dynamic: false,
    title_template: 'Systemy ERP w Polsce - Porównanie i Ranking 2025 | Raport ERP',
    description_template: 'Kompleksowy przegląd systemów ERP dostępnych w Polsce. Porównaj funkcjonalności, ceny i opinie o najpopularniejszych systemach ERP na rynku.',
    keywords_template: 'systemy erp, porównanie systemów erp, ranking erp, oprogramowanie erp polska, wdrożenie erp',
    structured_data_template: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Systemy ERP w Polsce",
      "description": "Kompleksowy przegląd i porównanie systemów ERP dostępnych na polskim rynku",
      "publisher": {
        "@type": "Organization",
        "name": "ERP-VIEW.PL",
        "url": "https://www.raport-erp.pl"
      },
      "inLanguage": "pl-PL"
    },
    robots: 'index, follow'
  },
  '/kalkulator': {
    id: 'calculator',
    page_identifier: '/kalkulator',
    is_dynamic: false,
    title_template: 'Kalkulator ERP - Oszacuj koszt wdrożenia systemu ERP | Raport ERP 2025',
    description_template: 'Bezpłatny kalkulator kosztów wdrożenia systemu ERP. Otrzymaj spersonalizowaną wycenę dostosowaną do potrzeb Twojej firmy. Sprawdź koszty modułów i licencji.',
    keywords_template: 'kalkulator erp, koszt systemu erp, wycena erp, cena wdrożenia erp, koszty licencji erp',
    structured_data_template: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Kalkulator ERP",
      "description": "Kalkulator kosztów wdrożenia systemu ERP",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "PLN"
      }
    },
    robots: 'index, follow'
  },
  '/partnerzy': {
    id: 'partners',
    page_identifier: '/partnerzy',
    is_dynamic: false,
    title_template: 'Partnerzy ERP - Zaufani dostawcy systemów ERP | Raport ERP 2025',
    description_template: 'Poznaj naszych zaufanych partnerów dostarczających systemy ERP. Sprawdź oferty, referencje i doświadczenie wiodących firm wdrażających systemy ERP w Polsce.',
    keywords_template: 'partnerzy erp, dostawcy erp, wdrożeniowcy erp, firmy wdrażające erp, integratorzy systemów erp',
    structured_data_template: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Partnerzy ERP",
      "description": "Lista zaufanych partnerów dostarczających systemy ERP",
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": []
      }
    },
    robots: 'index, follow'
  },
  '/firmy-it': {
    id: 'it-companies',
    page_identifier: '/firmy-it',
    is_dynamic: false,
    title_template: 'Firmy IT - Dostawcy i Wdrożeniowcy Systemów ERP | Raport ERP 2025',
    description_template: 'Kompleksowy katalog firm IT specjalizujących się we wdrożeniach systemów ERP. Znajdź zaufanego partnera do wdrożenia systemu ERP w Twojej firmie.',
    keywords_template: 'firmy it, dostawcy erp, wdrożeniowcy erp, integratorzy systemów erp, firmy wdrażające erp',
    structured_data_template: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Firmy IT - Dostawcy Systemów ERP",
      "description": "Katalog firm IT specjalizujących się we wdrożeniach systemów ERP",
      "publisher": {
        "@type": "Organization",
        "name": "ERP-VIEW.PL",
        "url": "https://www.raport-erp.pl"
      },
      "inLanguage": "pl-PL"
    },
    robots: 'index, follow'
  },
  'partner': {
    id: 'partner',
    page_identifier: 'partner',
    is_dynamic: true,
    title_template: '{meta_title}',
    title_fallback_template: '{name} | Partner Raportu ERP by ERP-VIEW.PL',
    description_template: '{meta_description}',
    description_fallback_template: 'Poznaj {name} - partnera Raportu ERP przygotowanego przez portal ERP-VIEW.PL. {description}',
    keywords_template: '{meta_keywords}',
    keywords_fallback_template: 'partner erp, wdrożenie erp, {name}, systemy erp, implementacja erp',
    structured_data_template: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "{name}",
      "description": "{description}",
      "url": "https://www.raport-erp.pl/partnerzy/{slug}",
      "sameAs": [
        "{website_url}"
      ],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "PL"
      },
      "parentOrganization": {
        "@type": "Organization",
        "name": "ERP-VIEW.PL",
        "url": "https://erp-view.pl"
      },
      "memberOf": {
        "@type": "Organization",
        "name": "Raport ERP",
        "url": "https://www.raport-erp.pl"
      },
      "knowsAbout": [
        "Enterprise Resource Planning",
        "ERP Implementation",
        "Business Software",
        "Digital Transformation"
      ]
    },
    robots: 'index, follow'
  },
  'dictionary-term': {
    id: 'dictionary-term',
    page_identifier: 'dictionary-term',
    is_dynamic: true,
    title_template: '{term} - Definicja w Słowniku ERP | ERP-VIEW.PL',
    title_fallback_template: '{term} - Pojęcie z zakresu systemów ERP',
    description_template: '{definition}',
    description_fallback_template: 'Poznaj znaczenie terminu {term} w kontekście systemów ERP. Definicja i wyjaśnienie pojęcia z dziedziny zarządzania przedsiębiorstwem.',
    keywords_template: '{term}, definicja {term}, {term} erp, znaczenie {term}, system erp {term}',
    structured_data_template: {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      "name": "{term}",
      "description": "{definition}",
      "inDefinedTermSet": {
        "@type": "DefinedTermSet",
        "name": "Słownik ERP",
        "url": "https://www.raport-erp.pl/slownik-erp"
      },
      "url": "https://www.raport-erp.pl/slownik-erp/{slug}"
    },
    robots: 'index, follow'
  }
};

export const seoService = {
  async getSEOTemplate(pageIdentifier: string): Promise<SEOData | null> {
    try {
      // Handle partner pages
      if (pageIdentifier.startsWith('partner-')) {
        const { data, error } = await supabase
          .from('page_seo')
          .select('*')
          .eq('page_identifier', 'partner')
          .single();

        if (error) {
          console.error('Error fetching partner SEO template:', error);
          return null;
        }

        return data;
      }

      // Handle other pages
      const { data, error } = await supabase
        .from('page_seo')
        .select('*')
        .eq('page_identifier', pageIdentifier);

      if (error) {
        console.error('Error fetching SEO template:', error);
        return DEFAULT_SEO_TEMPLATES[pageIdentifier as keyof typeof DEFAULT_SEO_TEMPLATES] || null;
      }

      // Return first matching template or default
      return (data && data[0]) || DEFAULT_SEO_TEMPLATES[pageIdentifier as keyof typeof DEFAULT_SEO_TEMPLATES] || null;
    } catch (error) {
      console.error('Error in getSEOTemplate:', error);
      return DEFAULT_SEO_TEMPLATES[pageIdentifier as keyof typeof DEFAULT_SEO_TEMPLATES] || null;
    }
  },

  processTemplate(template: string, data: Record<string, any>): string {
    if (!template || !data) return template;
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  },

  async processSEOData(
    pageIdentifier: string,
    dynamicData?: Record<string, any>
  ): Promise<ProcessedSEOData | null> {
    try {
      const template = await this.getSEOTemplate(pageIdentifier);
      if (!template) {
        console.error('No SEO template found for:', pageIdentifier);
        return null;
      }

      const processed: ProcessedSEOData = {
        title: dynamicData ? 
          this.processTemplate(
            dynamicData.meta_title || 
            template.title_fallback_template || 
            template.title_template, 
            dynamicData
          ) : template.title_template,
        description: dynamicData ? 
          this.processTemplate(
            dynamicData.meta_description || 
            template.description_fallback_template || 
            template.description_template, 
            dynamicData
          ) : template.description_template,
      };

      if (template.keywords_template || template.keywords_fallback_template) {
        processed.keywords = dynamicData ? 
          this.processTemplate(
            dynamicData.meta_keywords || 
            template.keywords_fallback_template || 
            template.keywords_template || '',
            dynamicData
          ) : (template.keywords_template || '');
      }

      if (template.canonical_url_template) {
        processed.canonicalUrl = dynamicData
          ? this.processTemplate(template.canonical_url_template, dynamicData)
          : template.canonical_url_template;
      }

      if (template.og_title_template) {
        processed.ogTitle = dynamicData
          ? this.processTemplate(template.og_title_template, dynamicData)
          : template.og_title_template;
      }

      if (template.og_description_template) {
        processed.ogDescription = dynamicData
          ? this.processTemplate(template.og_description_template, dynamicData)
          : template.og_description_template;
      }

      if (template.og_image_field && dynamicData?.[template.og_image_field]) {
        processed.ogImage = dynamicData[template.og_image_field];
      }

      if (template.structured_data_template) {
        try {
          const structuredData = typeof template.structured_data_template === 'string'
            ? JSON.parse(template.structured_data_template)
            : template.structured_data_template;

          if (dynamicData) {
            const processedJson = this.processTemplate(
              JSON.stringify(structuredData),
              dynamicData
            );
            processed.structuredData = JSON.parse(processedJson);
          } else {
            processed.structuredData = structuredData;
          }
        } catch (error) {
          console.error('Error processing structured data:', error);
        }
      }

      if (template.robots) {
        processed.robots = template.robots;
      }

      return processed;
    } catch (error) {
      console.error('Error processing SEO data:', error);
      return null;
    }
  }
};
