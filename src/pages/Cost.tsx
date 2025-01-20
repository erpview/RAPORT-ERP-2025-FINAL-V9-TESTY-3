import React from 'react';
import { Helmet } from 'react-helmet-async';
import Logo from '../components/Logo';
import CostArticle from '../components/CostArticle';

export const Cost: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Ile kosztuje wdrożenie ERP? Kompleksowy przewodnik po kosztach wdrożenia ERP | Kalkulator ERP</title>
        <meta name="description" content="Sprawdź, ile kosztuje wdrożenie systemu ERP. Poznaj wszystkie składniki kosztów, porównaj modele wdrożenia i dowiedz się, jak zaplanować budżet na system ERP." />
        <meta property="og:title" content="Ile kosztuje wdrożenie ERP? Kompleksowy przewodnik po kosztach wdrożenia ERP | Kalkulator ERP" />
        <meta property="og:description" content="Sprawdź, ile kosztuje wdrożenie systemu ERP. Poznaj wszystkie składniki kosztów i dowiedz się, jak zaplanować budżet." />
        <meta property="og:url" content="https://kalkulator-erp.com/koszt-wdrozenia-erp" />
        <link rel="canonical" href="https://kalkulator-erp.com/koszt-wdrozenia-erp" />
      </Helmet>

      <div className="min-h-screen bg-[#F5F5F7] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-[300px] h-[150px] mx-auto mb-8">
              <Logo />
            </div>
            <h1 className="text-[#1d1d1f] mb-4">Koszt wdrożenia systemu ERP</h1>
            <p className="text-[21px] leading-relaxed text-[#86868b]">
              Kompleksowy przewodnik po kosztach wdrożenia systemu ERP
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#d2d2d7]/30 overflow-hidden">
            <div className="p-8 sm:p-12">
              <CostArticle />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};