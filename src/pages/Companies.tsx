import React from 'react';
import { CompaniesCatalogContainer } from '../components/CompaniesCatalog';
import { MetaTags } from '../components/MetaTags';

export const Companies: React.FC = () => {
  return (
    <>
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
