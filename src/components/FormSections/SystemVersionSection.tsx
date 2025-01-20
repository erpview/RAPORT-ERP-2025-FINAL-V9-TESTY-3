import React from 'react';
import { Cloud, Server, GitCompare, HelpCircle, Settings } from 'lucide-react';

interface Version {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

interface SystemVersionSectionProps {
  selectedVersion: string;
  onVersionChange: (version: string) => void;
}

const versions: Version[] = [
  {
    id: 'cloud',
    name: 'Cloud',
    icon: Cloud,
    description: 'System w chmurze z miesięczną subskrypcją, automatycznymi aktualizacjami i dostępem z dowolnego miejsca.'
  },
  {
    id: 'onpremise',
    name: 'On-Premise',
    icon: Server,
    description: 'Instalacja na własnych serwerach z pełną kontrolą nad danymi i infrastrukturą.'
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    icon: GitCompare,
    description: 'Połączenie rozwiązania chmurowego z lokalnymi komponentami dla większej elastyczności.'
  },
  {
    id: 'undecided',
    name: 'Nie wiem',
    icon: HelpCircle,
    description: 'Potrzebuję pomocy w wyborze najlepszego rozwiązania dla mojej firmy.'
  }
];

export const SystemVersionSection: React.FC<SystemVersionSectionProps> = ({
  selectedVersion,
  onVersionChange
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-[#0066CC]" />
        <h3 className="text-[21px] font-semibold text-[#1d1d1f]">
          Wybierz jaka wersja systemu Cię interesuje *
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {versions.map(({ id, name, icon: Icon, description }) => (
          <label
            key={id}
            className={`
              relative flex flex-col p-4 cursor-pointer sf-rounded border-2 transition-all
              ${selectedVersion === id 
                ? 'border-apple-blue bg-blue-50/50 backdrop-blur-sm' 
                : 'border-gray-200 hover:border-apple-blue/30 hover:bg-gray-50/50'}
            `}
          >
            <input
              type="radio"
              name="systemVersion"
              value={id}
              checked={selectedVersion === id}
              onChange={(e) => onVersionChange(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center mb-3">
              <Icon className={`w-6 h-6 ${selectedVersion === id ? 'text-apple-blue' : 'text-apple-gray-400'}`} />
              <span className="ml-2 font-medium text-apple-gray-600">{name}</span>
            </div>
            <p className="text-sm text-apple-gray-500">{description}</p>
          </label>
        ))}
      </div>
    </div>
  );
};