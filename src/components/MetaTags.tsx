import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { systems } from '../data/systems';

interface MetaTagsProps {
  pageData?: any;
  title?: string;
  description?: string;
  canonicalUrl?: string;
}

export const MetaTags: React.FC<MetaTagsProps> = ({ pageData, title, description, canonicalUrl }) => {
  const location = useLocation();
  const path = location.pathname;
  const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;

  // Base meta tags that are common across all pages
  const baseMetaTags = {
    siteName: "Raport ERP by ERP-VIEW.PL",
    image: "https://erp-view.pl/images/artykuly/zdjecia/raport-erp-share.jpg",
    twitterSite: "@erpview"
  };

  // Page-specific meta data
  const pageMetaData: Record<string, { title: string; description: string; schema: any; canonicalUrl?: string }> = {
    '/': {
      title: "Raport ERP 2025 - Ranking systemów ERP | ERP-VIEW.PL",
      description: "Poznaj najlepsze systemy ERP w Polsce. Sprawdź ranking ERP 2025, porównaj ceny i funkcjonalności. Wybierz idealny system dla swojej firmy!",
      schema: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "https://www.raport-erp.pl",
        "name": "Raport ERP by ERP-VIEW.PL",
        "description": "Kompleksowy przewodnik po systemach ERP",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://www.raport-erp.pl/slownik-erp?search={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Raport ERP by ERP-VIEW.PL",
          "url": "https://www.raport-erp.pl"
        },
        "inLanguage": "pl-PL",
        "datePublished": "2024-01-01",
        "dateModified": "2024-12-13"
      }
    },
    '/koszt-wdrozenia-erp': {
      title: "Koszty wdrożenia systemu ERP 2025 | ERP-VIEW.PL",
      description: "Sprawdź, ile kosztuje wdrożenie systemu ERP w 2025 roku. Poznaj ceny, składowe kosztów i sposoby finansowania.",
      schema: {
        "@context": "https://schema.org",
        "@type": "Article",
        "name": "Koszty wdrożenia systemu ERP 2025 | ERP-VIEW.PL",
        "headline": "Koszty wdrożenia systemu ERP w 2025 roku",
        "description": "Sprawdź, ile kosztuje wdrożenie systemu ERP w 2025 roku. Poznaj ceny, składowe kosztów i sposoby finansowania.",
        "author": {
          "@type": "Organization",
          "name": baseMetaTags.siteName
        },
        "publisher": {
          "@type": "Organization",
          "name": baseMetaTags.siteName,
          "url": "https://www.raport-erp.pl"
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "https://www.raport-erp.pl/koszt-wdrozenia-erp"
        }
      }
    },
    '/systemy-erp': {
      title: "Systemy ERP - Lista producentów i dostawców | ERP-VIEW.PL",
      description: "Kompleksowa lista systemów ERP dostępnych w Polsce. Poznaj producentów, funkcjonalności i znajdź idealny system dla swojej firmy.",
      schema: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Systemy ERP - Lista producentów i dostawców | ERP-VIEW.PL",
        "description": "Kompleksowa lista systemów ERP dostępnych w Polsce",
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": systems.map((system, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "SoftwareApplication",
              "name": system.name,
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "description": system.description || ""
            }
          }))
        },
        "publisher": {
          "@type": "Organization",
          "name": "Raport ERP by ERP-VIEW.PL",
          "url": "https://www.raport-erp.pl"
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Strona główna",
              "item": "https://www.raport-erp.pl"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Systemy ERP",
              "item": "https://www.raport-erp.pl/systemy-erp"
            }
          ]
        }
      }
    },
    '/porownaj-systemy-erp': {
      title: "Porównanie systemów ERP - Zestawienie 2025 | ERP-VIEW.PL",
      description: "Porównaj systemy ERP i ich funkcjonalności. Sprawdź, który system najlepiej spełni potrzeby Twojej firmy.",
      schema: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Porównanie systemów ERP - Zestawienie 2025 | ERP-VIEW.PL",
        "applicationCategory": "BusinessApplication",
        "description": "Porównaj systemy ERP i ich funkcjonalności. Sprawdź, który system najlepiej spełni potrzeby Twojej firmy.",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "PLN"
        },
        "publisher": {
          "@type": "Organization",
          "name": baseMetaTags.siteName,
          "url": "https://www.raport-erp.pl"
        }
      }
    },
    '/partnerzy': {
      title: "Partnerzy Wdrożeniowi - Dostawcy systemów ERP | ERP-VIEW.PL",
      description: "Lista certyfikowanych partnerów wdrożeniowych systemów ERP. Znajdź sprawdzonego dostawcę dla swojej firmy.",
      schema: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Partnerzy Wdrożeniowi - Dostawcy systemów ERP | ERP-VIEW.PL",
        "description": "Lista certyfikowanych partnerów wdrożeniowych systemów ERP",
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Partnerzy główni",
              "item": {
                "@type": "ItemList",
                "name": "Partnerzy główni Raportu ERP",
                "description": "Główni partnerzy strategiczni Raportu ERP"
              }
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Partnerzy technologiczni",
              "item": {
                "@type": "ItemList",
                "name": "Partnerzy technologiczni Raportu ERP",
                "description": "Partnerzy technologiczni wspierający Raport ERP"
              }
            }
          ]
        },
        "publisher": {
          "@type": "Organization",
          "name": "Raport ERP by ERP-VIEW.PL",
          "url": "https://www.raport-erp.pl"
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Strona główna",
              "item": "https://www.raport-erp.pl"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Partnerzy",
              "item": "https://www.raport-erp.pl/partnerzy"
            }
          ]
        }
      }
    },
    '/firmy-it': {
      title: "Firmy IT - Integratorzy systemów ERP | ERP-VIEW.PL",
      description: "Katalog firm IT specjalizujących się we wdrożeniach systemów ERP. Wybierz doświadczonego integratora.",
      schema: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Firmy IT - Integratorzy systemów ERP | ERP-VIEW.PL",
        "description": "Katalog firm IT specjalizujących się we wdrożeniach systemów ERP",
        "mainEntity": {
          "@type": "ItemList",
          "name": "Katalog Firm IT",
          "description": "Lista firm IT specjalizujących się we wdrożeniach systemów ERP",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Producenci systemów ERP",
              "item": {
                "@type": "ItemList",
                "name": "Producenci systemów ERP",
                "description": "Firmy tworzące i rozwijające systemy ERP"
              }
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Integratorzy systemów",
              "item": {
                "@type": "ItemList",
                "name": "Integratorzy systemów ERP",
                "description": "Firmy specjalizujące się we wdrożeniach i integracji systemów ERP"
              }
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Firmy konsultingowe",
              "item": {
                "@type": "ItemList",
                "name": "Firmy konsultingowe IT",
                "description": "Firmy świadczące usługi doradcze w zakresie systemów ERP"
              }
            }
          ]
        },
        "publisher": {
          "@type": "Organization",
          "name": "Raport ERP by ERP-VIEW.PL",
          "url": "https://www.raport-erp.pl"
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Strona główna",
              "item": "https://www.raport-erp.pl"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Katalog Firm IT",
              "item": "https://www.raport-erp.pl/firmy-it"
            }
          ]
        }
      }
    },
    '/slownik-erp': {
      title: "Słownik ERP - Kompendium wiedzy o systemach ERP | ERP-VIEW.PL",
      description: "Kompleksowy słownik pojęć i terminów związanych z systemami ERP. Poznaj znaczenie i zastosowanie terminologii ERP.",
      schema: (pageData?: any) => {
        const baseSchema = {
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          "name": "Słownik ERP - Kompendium wiedzy o systemach ERP | ERP-VIEW.PL",
          "description": "Kompleksowy słownik pojęć i terminów związanych z systemami ERP",
          "publisher": {
            "@type": "Organization",
            "name": "Raport ERP by ERP-VIEW.PL",
            "url": "https://www.raport-erp.pl"
          },
          "inLanguage": "pl-PL",
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Strona główna",
                "item": "https://www.raport-erp.pl"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Słownik ERP",
                "item": "https://www.raport-erp.pl/slownik-erp"
              }
            ]
          }
        };

        if (pageData?.terms?.length > 0) {
          return {
            ...baseSchema,
            "hasPart": pageData.terms.map((term: any) => ({
              "@type": "DefinedTerm",
              "name": term.term,
              "description": term.explanation,
              "inDefinedTermSet": "https://www.raport-erp.pl/slownik-erp",
              "url": `https://www.raport-erp.pl/slownik-erp/${term.slug}`
            }))
          };
        }

        return baseSchema;
      }
    },
  };

  const currentPage = pageMetaData[normalizedPath as keyof typeof pageMetaData];
  
  // Use provided title/description or fall back to page metadata
  const finalTitle = title || (currentPage?.title) || "Raport ERP 2025 | ERP-VIEW.PL";
  const finalDescription = description || (currentPage?.description) || "Poznaj najlepsze systemy ERP w Polsce. Sprawdź ranking ERP 2025, porównaj ceny i funkcjonalności.";
  const finalCanonicalUrl = canonicalUrl || currentPage?.canonicalUrl || `https://www.raport-erp.pl${normalizedPath}`;

  if (!currentPage && !title) return null;

  return (
    <Helmet>
      {/* Title */}
      <title>{finalTitle}</title>
      
      {/* Basic Meta Tags */}
      <meta name="description" content={finalDescription} />
      
      {/* Viewport and Mobile Settings */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-touch-fullscreen" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="HandheldFriendly" content="true" />
      
      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={`https://www.raport-erp.pl${normalizedPath}`} />
      <meta property="og:image" content={baseMetaTags.image} />
      <meta property="og:site_name" content={baseMetaTags.siteName} />
      
      {/* Twitter */}
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={baseMetaTags.image} />
      <meta name="twitter:site" content={baseMetaTags.twitterSite} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={finalCanonicalUrl} />
      
      {/* Schema.org */}
      {currentPage?.schema && (
        <script type="application/ld+json">
          {JSON.stringify(typeof currentPage.schema === 'function' ? currentPage.schema(pageData) : currentPage.schema)}
        </script>
      )}
    </Helmet>
  );
};