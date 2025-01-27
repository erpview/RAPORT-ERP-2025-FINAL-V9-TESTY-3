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

  // Base meta tags that are common across all pages
  const baseMetaTags = {
    siteName: "Raport ERP by ERP-VIEW.PL",
    image: "https://erp-view.pl/images/artykuly/zdjecia/raport-erp-share.jpg",
    twitterSite: "@erpview"
  };

  // If direct props are provided, use them instead of pageData
  const metaTitle = title || pageData?.title;
  const metaDescription = description || pageData?.description;
  const metaCanonicalUrl = canonicalUrl || pageData?.canonicalUrl;

  // Page-specific meta data
  const pageMetaData = {
    '/': {
      title: "Raport ERP - Kompleksowy przewodnik po systemach ERP",
      description: "Poznaj najnowszy raport o systemach ERP w Polsce. Sprawdź ranking, porównaj ceny i funkcjonalności wiodących systemów ERP.",
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
      title: "Ile kosztuje wdrożenie ERP? Kompleksowy przewodnik po kosztach wdrożenia ERP | Raport ERP",
      description: "Sprawdź, ile kosztuje wdrożenie systemu ERP. Poznaj wszystkie składniki kosztów, porównaj modele wdrożenia i dowiedz się, jak zaplanować budżet na system ERP.",
      schema: {
        "@context": "https://schema.org",
        "@type": "Article",
        "name": "Ile kosztuje wdrożenie ERP? Kompleksowy przewodnik po kosztach wdrożenia ERP | Raport ERP",
        "headline": "Kompleksowy przewodnik po kosztach wdrożenia systemu ERP",
        "description": "Sprawdź, ile kosztuje wdrożenie systemu ERP. Poznaj wszystkie składniki kosztów i dowiedz się, jak zaplanować budżet.",
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
      title: "Systemy ERP w Polsce - Dostawcy ERP | Raport ERP by ERP-VIEW.PL",
      description: "Poznaj najpopularniejsze systemy ERP dostępne w Polsce. Porównaj funkcjonalności, sprawdź opinie i wybierz najlepsze rozwiązanie dla swojej firmy.",
      schema: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Systemy ERP w Polsce | Raport ERP by ERP-VIEW.PL",
        "description": "Kompleksowy przegląd i porównanie systemów ERP dostępnych na polskim rynku",
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
      title: "Porównanie systemów ERP - porównywarka ERP | Raport ERP by ERP-VIEW.PL",
      description: "Porównaj systemy ERP dostępne w Polsce. Zestawienie funkcjonalności, modułów i możliwości najpopularniejszych systemów ERP. Wybierz najlepsze rozwiązanie dla swojej firmy.",
      schema: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Porównanie systemów ERP - porównywarka ERP | Raport ERP",
        "applicationCategory": "BusinessApplication",
        "description": "Porównaj systemy ERP dostępne w Polsce. Zestawienie funkcjonalności i możliwości systemów ERP.",
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
      title: "Partnerzy Raportu ERP | Raport ERP by ERP-VIEW.PL",
      description: "Poznaj partnerów Raportu ERP - firmy wdrożeniowe, dostawców i ekspertów branży ERP. Sprawdź oferty i wybierz najlepszego partnera dla swojej firmy.",
      schema: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Partnerzy Raportu ERP | Raport ERP by ERP-VIEW.PL",
        "description": "Poznaj partnerów Raportu ERP - firmy wdrożeniowe, dostawców i ekspertów branży ERP",
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
      title: "Katalog Firm IT | Raport ERP by ERP-VIEW.PL",
      description: "Poznaj sprawdzone firmy IT w Polsce. Znajdź dostawcę, integratora lub firmę konsultingową dla Twojego projektu ERP.",
      schema: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Katalog Firm IT | Raport ERP by ERP-VIEW.PL",
        "description": "Katalog firm IT - znajdź i porównaj najlepsze firmy informatyczne w Polsce",
        "mainEntity": {
          "@type": "ItemList",
          "name": "Katalog Firm IT",
          "description": "Lista firm IT specjalizujących się w systemach ERP",
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
      title: "Słownik ERP - Terminologia systemów ERP | Raport ERP by ERP-VIEW.PL",
      description: "Poznaj terminologię związaną z systemami ERP. Kompleksowy słownik pojęć i definicji z zakresu systemów ERP, który pomoże Ci lepiej zrozumieć ten obszar.",
      schema: (pageData?: any) => {
        const baseSchema = {
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          "name": "Słownik ERP - Terminologia systemów ERP | Raport ERP by ERP-VIEW.PL",
          "description": "Kompleksowy słownik pojęć i definicji z zakresu systemów ERP",
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

  const currentPage = pageMetaData[path as keyof typeof pageMetaData];
  
  if (!currentPage) return null;

  return (
    <Helmet>
      <title>{metaTitle || baseMetaTags.siteName}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Viewport and mobile settings */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-touch-fullscreen" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="HandheldFriendly" content="true" />
      
      {/* Open Graph */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={`https://www.raport-erp.pl${path}`} />
      <meta property="og:image" content={baseMetaTags.image} />
      <meta property="og:site_name" content={baseMetaTags.siteName} />
      
      {/* Twitter */}
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={baseMetaTags.image} />
      <meta name="twitter:site" content={baseMetaTags.twitterSite} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={metaCanonicalUrl} />
      
      {/* Schema.org */}
      {currentPage.schema && (
        <script type="application/ld+json">
          {JSON.stringify(typeof currentPage.schema === 'function' ? currentPage.schema(pageData) : currentPage.schema)}
        </script>
      )}
    </Helmet>
  );
};