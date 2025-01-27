import React from 'react';
import { CompaniesCatalogContainer } from '../components/CompaniesCatalog';
import { MetaTags } from '../components/MetaTags';
import { Helmet } from 'react-helmet-async';

export const Companies: React.FC = () => {
  return (
    <>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="width" />
      </Helmet>
      
      <MetaTags
        title="Katalog Firm IT | Raport ERP by ERP-VIEW.PL"
        description="Poznaj sprawdzone firmy IT w Polsce. Znajdź dostawcę, integratora lub firmę konsultingową dla Twojego projektu ERP."
        canonicalUrl="/firmy-it"
      />
      
      <div className="min-h-screen bg-[#F5F5F7] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#1d1d1f] mb-4">
              Katalog firm IT
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Znajdź partnera w aktualizowanej na bieżąco bazie dostawców rozwiązań IT wspomagających zarządzanie oraz firm konsultingowych.
            </p>
          </div>

          <CompaniesCatalogContainer />
        </div>
      </div>
    </>
  );
};
