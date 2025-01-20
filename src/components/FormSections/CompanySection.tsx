import React from 'react';
import { Building2, Users, Briefcase, Monitor, ChevronDown } from 'lucide-react';
import { INDUSTRY_OPTIONS } from '../../constants/industry';

interface CompanySectionProps {
  companyName: string;
  employees: string;
  industry: string;
  currentSystem: string;
  onChange: (field: 'companyName' | 'employees' | 'industry' | 'currentSystem', value: string) => void;
}

export const CompanySection: React.FC<CompanySectionProps> = ({
  companyName,
  employees,
  industry,
  currentSystem,
  onChange
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="w-6 h-6 text-[#2c3b67]" />
        <h3 className="text-[21px] font-semibold text-[#1d1d1f]">
          Informacje o firmie
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
            Nazwa firmy *
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
            <input
              required
              type="text"
              value={companyName}
              onChange={(e) => onChange('companyName', e.target.value)}
              className="sf-input pl-10 w-full"
              placeholder="Wprowadź nazwę firmy"
            />
          </div>
        </div>

        <div>
          <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
            Liczba pracowników *
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5 pointer-events-none" />
            <select
              required
              value={employees}
              onChange={(e) => onChange('employees', e.target.value)}
              className="sf-input pl-10 pr-10 w-full appearance-none bg-white cursor-pointer hover:bg-[#F5F5F7] transition-colors duration-200"
            >
              <option value="" disabled>Wybierz przedział</option>
              <option value="1-10">1-10 pracowników</option>
              <option value="11-50">11-50 pracowników</option>
              <option value="51-200">51-200 pracowników</option>
              <option value="201-500">201-500 pracowników</option>
              <option value="501+">Ponad 500 pracowników</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
            Branża *
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5 pointer-events-none" />
            <select
              required
              value={industry}
              onChange={(e) => onChange('industry', e.target.value)}
              className="sf-input pl-10 pr-10 w-full appearance-none bg-white cursor-pointer hover:bg-[#F5F5F7] transition-colors duration-200"
            >
              <option value="" disabled>Wybierz branżę</option>
              {INDUSTRY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
            Obecnie używany system
          </label>
          <div className="relative">
            <Monitor className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
            <input
              type="text"
              value={currentSystem}
              onChange={(e) => onChange('currentSystem', e.target.value)}
              className="sf-input pl-10 w-full"
              placeholder="np. SAP, Comarch ERP"
            />
          </div>
        </div>
      </div>
    </div>
  );
};