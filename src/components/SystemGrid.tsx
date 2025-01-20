import React from 'react';
import { useDrag } from 'react-dnd';
import { Globe, GripHorizontal, Loader2 } from 'lucide-react';
import { System } from '../types/system';
import { useSystems } from '../hooks/useSystems';
import { MultiSelectValue } from './ui/MultiSelectValue';
import { normalizeMultiselectValue } from '../utils/fieldUtils';
import { useAuth } from '../context/AuthContext';

interface SystemGridProps {
  onSystemSelect: (system: System) => void;
  selectedSystems: System[];
}

interface DraggableSystemCardProps {
  system: System;
  isSelected: boolean;
  onSelect: (system: System) => void;
}

const DraggableSystemCard: React.FC<DraggableSystemCardProps> = ({ system, isSelected, onSelect }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'system',
    item: system,
    canDrag: !isSelected,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const { user, isAdmin, isEditor } = useAuth();

  return (
    <div
      ref={drag}
      className={`sf-card p-6 space-y-4 transition-all duration-200
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${isSelected ? 'border-[#2c3b67] bg-[#F5F5F7]' : 'hover:shadow-md'}
        ${!isSelected ? 'cursor-move' : 'cursor-default'}`}
      aria-label={isSelected ? `${system.name} (wybrany)` : `Przeciągnij ${system.name} do obszaru porównania`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {!isSelected && <GripHorizontal className="w-5 h-5 text-[#86868b]" />}
            <h3 className="text-[19px] font-semibold text-[#1d1d1f]">
              {system.name}
            </h3>
          </div>
          <p className="text-[15px] text-[#86868b] mt-1">
            {system.vendor}
          </p>
        </div>
        {(user || isAdmin || isEditor) && (
          <a
            href={system.website}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED] p-2"
            aria-label={`Odwiedź stronę ${system.vendor}`}
            title="Strona dostawcy"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="w-5 h-5" />
          </a>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {normalizeMultiselectValue(system.size).map((size, index) => (
          <MultiSelectValue
            key={`${size}-${index}`}
            value={size}
          />
        ))}
      </div>

      <button
        onClick={() => onSelect(system)}
        disabled={isSelected}
        className={`sf-button w-full justify-center text-[15px] font-medium
          ${isSelected 
            ? 'bg-[#E8E8ED] text-[#86868b] cursor-not-allowed'
            : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]'
          }`}
        aria-label={isSelected ? 'System już wybrany' : 'Wybierz do porównania'}
      >
        {isSelected ? 'System wybrany' : 'Wybierz do porównania'}
      </button>
    </div>
  );
};

export const SystemGrid: React.FC<SystemGridProps> = ({ onSystemSelect, selectedSystems }) => {
  const { systems, loading, error } = useSystems();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-[#86868b]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-[17px]">Ładowanie systemów...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sf-card p-8 text-center">
        <p className="text-[17px] text-[#FF3B30]">
          Nie udało się załadować listy systemów. Spróbuj odświeżyć stronę.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {systems.map((system) => (
        <DraggableSystemCard
          key={system.id}
          system={system}
          isSelected={selectedSystems.some(s => s.id === system.id)}
          onSelect={onSystemSelect}
        />
      ))}
    </div>
  );
};

export default SystemGrid;