import React, { useEffect } from 'react';
import { Users, Boxes } from 'lucide-react';
import { useUsers } from '../../context/UsersContext';

interface Module {
  id: string;
  title: string;
  description: string[];
}

interface ModulesSectionProps {
  selectedModules: string[];
  onModuleToggle: (module: string) => void;
  userCounts: Record<string, number>;
  onUserCountChange: (moduleId: string, count: number) => void;
}

const modules: Module[] = [
  {
    id: 'finance',
    title: 'Finanse',
    description: [
      'Zarządzanie finansami i księgowością',
      'Planowanie budżetu i kontrola kosztów',
      'Rozliczenia, fakturowanie, raportowanie finansowe',
      'Analiza przepływów pieniężnych i zarządzanie płynnością',
      'Zgodność z przepisami (np. JPK, e-faktury)'
    ]
  },
  {
    id: 'supply_chain',
    title: 'Zarządzanie łańcuchem dostaw',
    description: [
      'Zakupy i zaopatrzenie',
      'Zarządzanie zapasami i magazynem',
      'Śledzenie dostaw i optymalizacja tras transportu',
      'Zarządzanie relacjami z dostawcami',
      'Prognozowanie popytu i zarządzanie zamówieniami'
    ]
  },
  {
    id: 'production',
    title: 'Zarządzanie produkcją',
    description: [
      'Planowanie i harmonogramowanie produkcji',
      'Zarządzanie zleceniami produkcyjnymi',
      'Kontrola jakości',
      'Śledzenie kosztów produkcji',
      'Zarządzanie zasobami produkcyjnymi'
    ]
  },
  {
    id: 'crm',
    title: 'CRM – zarządzanie relacjami z klientami',
    description: [
      'Zarządzanie lejkiem sprzedaży i ofertami',
      'Automatyzacja procesu sprzedaży',
      'Zarządzanie kampaniami marketingowymi',
      'Obsługa zgłoszeń serwisowych i wsparcie klienta',
      'Analiza danych o klientach i personalizacja ofert'
    ]
  },
  {
    id: 'hr',
    title: 'Zarządzanie zasobami ludzkimi',
    description: [
      'Administracja kadrowa',
      'Zarządzanie czasem pracy, urlopami, nieobecnościami',
      'Rekrutacja i onboarding pracowników',
      'Szkolenia, oceny pracownicze i rozwój kompetencji',
      'Naliczanie wynagrodzeń i zarządzanie benefitami'
    ]
  },
  {
    id: 'project',
    title: 'Zarządzanie projektami',
    description: [
      'Planowanie i zarządzanie projektami',
      'Śledzenie budżetów i kosztów projektów',
      'Zarządzanie harmonogramami, zadaniami i zasobami',
      'Monitorowanie postępów i zarządzanie ryzykiem'
    ]
  },
  {
    id: 'service',
    title: 'Zarządzanie serwisem',
    description: [
      'Zarządzanie zleceniami serwisowymi',
      'Harmonogramowanie i optymalizacja pracy zespołów',
      'Zarządzanie częściami zamiennymi i magazynem',
      'Wsparcie mobilne dla techników w terenie'
    ]
  },
  {
    id: 'commerce',
    title: 'Handel i E-commerce',
    description: [
      'Zarządzanie kanałami sprzedaży',
      'Integracja z platformami sprzedażowymi',
      'Zarządzanie promocjami i kampaniami',
      'Analiza zachowań klientów i personalizacja'
    ]
  },
  {
    id: 'document',
    title: 'Zarządzanie dokumentami',
    description: [
      'Automatyzacja obiegu dokumentów',
      'Przechowywanie, archiwizacja i wyszukiwanie',
      'Zarządzanie przepływami pracy (workflow)'
    ]
  },
  {
    id: 'analytics',
    title: 'Analizy i raportowanie',
    description: [
      'Generowanie raportów w czasie rzeczywistym',
      'Wizualizacja danych (dashboardy)',
      'Analiza KPI i wskaźników efektywności',
      'Prognozowanie i analizy predykcyjne'
    ]
  },
  {
    id: 'risk',
    title: 'Zarządzanie ryzykiem i zgodnością',
    description: [
      'Monitorowanie zgodności z przepisami',
      'Zarządzanie ryzykiem operacyjnym i finansowym',
      'Śledzenie audytów wewnętrznych'
    ]
  },
  {
    id: 'ai',
    title: 'AI i automatyzacja',
    description: [
      'Wykorzystanie AI do automatyzacji procesów',
      'Analiza predykcyjna i rekomendacje',
      'Automatyczne przetwarzanie faktur i danych'
    ]
  },
  {
    id: 'contact_center',
    title: 'Contact Center i Customer Service',
    description: [
      'Wsparcie kontaktów z klientami',
      'Automatyzacja procesów obsługi klienta',
      'Analiza rozmów i zgłoszeń'
    ]
  }
];

export const ModulesSection: React.FC<ModulesSectionProps> = ({
  selectedModules,
  onModuleToggle,
  userCounts,
  onUserCountChange
}) => {
  const { setTotalUsers } = useUsers();

  const handleUserCountChange = (e: React.ChangeEvent<HTMLInputElement>, moduleId: string) => {
    e.stopPropagation();
    onUserCountChange(moduleId, parseInt(e.target.value) || 0);
  };

  useEffect(() => {
    const total = Object.values(userCounts).reduce((sum, count) => sum + (count || 0), 0);
    setTotalUsers(total);
  }, [userCounts, setTotalUsers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Boxes className="w-6 h-6 text-[#2c3b67]" />
        <h3 className="text-[21px] font-semibold text-[#1d1d1f]">
          Wybierz obszary, w których chcesz wdrożyć nowy system *
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map(({ id, title, description }) => {
          const isSelected = selectedModules.includes(id);
          return (
            <div
              key={id}
              onClick={() => onModuleToggle(id)}
              className={`
                sf-card p-4 transition-all duration-200 cursor-pointer
                ${isSelected ? 'border-[#2c3b67] bg-[#F5F5F7]' : 'border-[#d2d2d7] hover:border-[#2c3b67]/30 hover:bg-[#F5F5F7]'}
              `}
            >
              <div className="flex flex-col space-y-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onModuleToggle(id)}
                    className="sf-checkbox mt-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="ml-3">
                    <span className="block text-[15px] font-medium text-[#1d1d1f] mb-2">{title}</span>
                    <ul className="list-disc list-inside space-y-1">
                      {description.map((item, index) => (
                        <li key={index} className="text-[13px] text-[#86868b]">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {isSelected && (
                  <div className="ml-8 mt-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 bg-white/50 p-3 rounded-xl border border-[#d2d2d7]">
                      <Users className="w-5 h-5 text-[#2c3b67]" />
                      <input
                        type="number"
                        min="1"
                        value={userCounts[id] || ''}
                        onChange={(e) => handleUserCountChange(e, id)}
                        placeholder="Liczba użytkowników"
                        className="sf-input flex-1 text-[15px]"
                        required={isSelected}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};