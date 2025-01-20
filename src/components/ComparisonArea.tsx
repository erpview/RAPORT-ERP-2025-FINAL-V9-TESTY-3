import React from 'react';
import { useDrop } from 'react-dnd';
import { X, Scale } from 'lucide-react';
import { System } from '../types/system';
import { MultiSelectValue } from './ui/MultiSelectValue';
import { normalizeMultiselectValue } from '../utils/fieldUtils';

interface ComparisonAreaProps {
  selectedSystems: System[];
  onSystemRemove: (systemId: string) => void;
  onCompare: () => void;
  onDrop: (system: System) => void;
  isMobile?: boolean;
}

const ComparisonArea: React.FC<ComparisonAreaProps> = ({
  selectedSystems,
  onSystemRemove,
  onCompare,
  onDrop,
  isMobile = false
}) => {
  const maxSystems = isMobile ? 2 : 4;

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'system',
    drop: (item: System) => {
      onDrop(item);
      return undefined;
    },
    canDrop: () => selectedSystems.length < maxSystems,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop() && selectedSystems.length < maxSystems,
    }),
  });

  if (isMobile) {
    return (
      <div
        ref={drop}
        className={`transition-colors duration-200
          ${isOver && canDrop ? 'bg-[#F5F5F7]' : ''}
          ${!canDrop && isOver ? 'bg-[#FF3B30]/5' : ''}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#2c3b67]" />
            <span className="text-[15px] font-medium text-[#1d1d1f]">
              {selectedSystems.length}/{maxSystems} systemów
            </span>
          </div>
          
          <button
            onClick={onCompare}
            disabled={selectedSystems.length < 2}
            className={`sf-button-primary text-[15px] py-2
              ${selectedSystems.length < 2 
                ? 'opacity-50 cursor-not-allowed' 
                : ''}`}
          >
            Porównaj systemy
          </button>
        </div>

        {selectedSystems.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {selectedSystems.map((system) => (
              <div
                key={system.id}
                className="flex items-center gap-2 bg-[#F5F5F7] px-3 py-1.5 rounded-full flex-shrink-0"
              >
                <span className="text-[13px] font-medium text-[#1d1d1f]">
                  {system.name}
                </span>
                <button
                  onClick={() => onSystemRemove(system.id)}
                  className="p-0.5 hover:bg-[#E8E8ED] rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-[#86868b]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={drop}
      className={`sf-card p-6 transition-colors duration-200
        ${isOver && canDrop ? 'border-[#2c3b67] bg-[#F5F5F7]' : ''}
        ${!canDrop && isOver ? 'border-[#FF3B30] bg-[#FF3B30]/5' : ''}`}
    >
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-[#2c3b67]" />
            <h2 className="text-[21px] font-semibold text-[#1d1d1f]">
              Obszar porównania
            </h2>
          </div>
          <span className="text-[15px] text-[#86868b]">
            {selectedSystems.length}/{maxSystems}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: maxSystems }).map((_, index) => {
            const system = selectedSystems[index];
            return (
              <div
                key={index}
                className={`sf-card p-4 flex flex-col justify-center items-center min-h-[100px] transition-all duration-200
                  ${!system ? 'border-dashed' : ''}`}
              >
                {system ? (
                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[17px] font-medium text-[#1d1d1f]">
                          {system.name}
                        </h3>
                        <p className="text-[13px] text-[#86868b]">
                          {system.vendor}
                        </p>
                      </div>
                      <button
                        onClick={() => onSystemRemove(system.id)}
                        className="p-1 hover:bg-[#F5F5F7] rounded-full transition-colors"
                        aria-label={`Usuń system ${system.name}`}
                      >
                        <X className="w-5 h-5 text-[#86868b]" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {normalizeMultiselectValue(system.size).map((size, index) => (
                        <MultiSelectValue
                          key={`${size}-${index}`}
                          value={size}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-[15px] text-[#86868b]">
                      Przeciągnij system tutaj
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={onCompare}
          disabled={selectedSystems.length < 2}
          className={`sf-button-primary w-full justify-center
            ${selectedSystems.length < 2 
              ? 'opacity-50 cursor-not-allowed' 
              : ''}`}
        >
          <Scale className="w-5 h-5 mr-2" />
          Porównaj systemy
        </button>
      </div>
    </div>
  );
};

export default ComparisonArea;