import React from 'react';
import { Info, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  description?: string;
}

interface BusinessQuestionsSectionProps {
  answers: Record<string, boolean | null>;
  onAnswerChange: (questionId: string, value: boolean) => void;
}

const questions: Question[] = [
  {
    id: 'hasMultipleBranches',
    text: 'Oddziały firmy',
    description: 'Czy firma posiada kilka oddziałów lub planuje ekspansję?'
  },
  {
    id: 'hasMultipleCurrencies',
    text: 'Obsługa walut',
    description: 'Czy prowadzicie lub planujecie sprzedaż w wielu walutach?'
  },
  {
    id: 'hasMultiplePriceLists',
    text: 'Cenniki',
    description: 'Czy posiadacie zróżnicowane cenniki dla różnych grup klientów?'
  },
  {
    id: 'hasMultipleWarehouses',
    text: 'Magazyny',
    description: 'Czy zarządzacie więcej niż jednym magazynem?'
  },
  {
    id: 'hasProjectManager',
    text: 'Project Manager',
    description: 'Czy posiadacie wewnętrznego Project Managera do koordynacji wdrożenia?'
  },
  {
    id: 'wantsNewPartner',
    text: 'Partner wdrożeniowy',
    description: 'Czy rozważacie zmianę obecnego partnera wdrożeniowego bez zmiany systemu?'
  },
  {
    id: 'needsExternalIntegrations',
    text: 'Integracje zewnętrzne',
    description: 'Czy konieczne są integracje z systemami zewnętrznymi (np. systemy kurierskie, e-commerce)?'
  },
  {
    id: 'needsMRP',
    text: 'Planowanie produkcji',
    description: 'Czy firma wymaga wsparcia dla złożonego planowania produkcji (MRP)?'
  },
  {
    id: 'hasIndustryRequirements',
    text: 'Wymagania branżowe',
    description: 'Czy istnieją specyficzne branżowe wymagania, które system musi spełniać?'
  },
  {
    id: 'hasComplexLogistics',
    text: 'Procesy logistyczne',
    description: 'Czy firma posiada złożone procesy logistyczne (np. import/eksport, zarządzanie magazynem)?'
  }
];

export const BusinessQuestionsSection: React.FC<BusinessQuestionsSectionProps> = ({
  answers,
  onAnswerChange
}) => {
  const hasUnansweredQuestions = questions.some(({ id }) => answers[id] === undefined || answers[id] === null);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Info className="w-6 h-6 text-[#2c3b67]" />
        <h3 className="text-[21px] font-semibold text-[#1d1d1f]">
          Dodatkowe informacje o firmie *
        </h3>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {questions.map(({ id, text, description }) => {
          const isUnanswered = answers[id] === undefined || answers[id] === null;
          return (
            <div
              key={id}
              className={`sf-card p-4 hover:shadow-md transition-all duration-200 ${
                isUnanswered ? 'border-[#FF3B30]' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[17px] font-medium text-[#1d1d1f]">
                        {text}
                      </h4>
                      {isUnanswered && (
                        <AlertCircle className="w-5 h-5 text-[#FF3B30]" />
                      )}
                    </div>
                    <p className="text-[15px] text-[#86868b]">
                      {description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 min-w-[120px]">
                    <label className="relative inline-flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name={id}
                        checked={answers[id] === true}
                        onChange={() => onAnswerChange(id, true)}
                        className="sr-only peer"
                        required
                      />
                      <div className={`sf-card px-4 py-2 text-[15px] font-medium 
                                    peer-checked:bg-[#2c3b67] peer-checked:text-white
                                    group-hover:border-[#2c3b67]/30
                                    ${isUnanswered ? 'border-[#FF3B30]' : ''}`}>
                        Tak
                      </div>
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name={id}
                        checked={answers[id] === false}
                        onChange={() => onAnswerChange(id, false)}
                        className="sr-only peer"
                        required
                      />
                      <div className={`sf-card px-4 py-2 text-[15px] font-medium
                                    peer-checked:bg-[#2c3b67] peer-checked:text-white
                                    group-hover:border-[#2c3b67]/30
                                    ${isUnanswered ? 'border-[#FF3B30]' : ''}`}>
                        Nie
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {hasUnansweredQuestions && (
        <p className="text-[15px] text-[#FF3B30] flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Wszystkie pola są wymagane
        </p>
      )}
    </div>
  );
};