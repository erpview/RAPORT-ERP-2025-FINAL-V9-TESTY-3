import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Globe, GripHorizontal, Loader2, FileText } from 'lucide-react';
import { System } from '../types/system';
import { useSystems } from '../hooks/useSystems';
import { MultiSelectValue } from './ui/MultiSelectValue';
import { normalizeMultiselectValue } from '../utils/fieldUtils';
import { useAuth } from '../context/AuthContext';
import { SurveyModal } from './SurveyModal'; // Update import to use correct SurveyModal
import { supabase } from '../config/supabase';

interface SystemGridProps {
  onSystemSelect: (system: System) => void;
  selectedSystems: System[];
}

interface DraggableSystemCardProps {
  system: System;
  isSelected: boolean;
  onSelect: (system: System) => void;
  hasSurvey: boolean;
  setShowSurvey: (show: boolean) => void;
  setSelectedSystemId: (id: string | null) => void;
}

const DraggableSystemCard: React.FC<DraggableSystemCardProps> = ({ system, isSelected, onSelect, hasSurvey, setShowSurvey, setSelectedSystemId }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'system',
    item: system,
    canDrag: !isSelected,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const { user, isAdmin, isEditor } = useAuth();

  // Show survey for admin and regular users, hide for editors
  const canSubmitSurvey = user && (isAdmin || (!isAdmin && !isEditor));

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
        <div className="flex gap-2">
          {hasSurvey && !isEditor && (
            <button
              onClick={() => {
                if (canSubmitSurvey) {
                  setSelectedSystemId(system.id);
                  setShowSurvey(true);
                } else {
                  // If not logged in, show the survey modal with login prompt
                  setSelectedSystemId(system.id);
                  setShowSurvey(true);
                }
              }}
              className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED] p-2"
              aria-label="Oceń system ERP"
              title="Oceń system ERP"
            >
              <FileText className="w-5 h-5" />
            </button>
          )}
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
        <span className="text-[15px] font-medium">
          {isSelected ? 'System wybrany' : 'Wybierz do porównania'}
        </span>
      </button>
    </div>
  );
};

export const SystemGrid: React.FC<SystemGridProps> = ({ onSystemSelect, selectedSystems }) => {
  const { systems, loading, error } = useSystems();
  const [systemSurveys, setSystemSurveys] = useState<Record<string, { form: any, assignment_id: string }>>({});
  const [showSurvey, setShowSurvey] = useState(false);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);

  useEffect(() => {
    if (systems.length > 0) {
      loadSurveyAssignments();
    }
  }, [systems]);

  const loadSurveyAssignments = async () => {
    try {
      console.log('Loading survey assignments...');
      const { data, error } = await supabase
        .from('survey_assignments')
        .select(`
          id,
          target_id,
          form:survey_forms!inner (
            id,
            name,
            description,
            modules:survey_modules!inner (
              id,
              name,
              description,
              fields:survey_fields!inner (
                id,
                name,
                label,
                field_type,
                options,
                required
              )
            )
          )
        `)
        .eq('target_type', 'system');

      if (error) throw error;

      console.log('Survey assignments raw data:', data);

      const surveyMap: Record<string, { form: any, assignment_id: string }> = {};
      data?.forEach(assignment => {
        if (assignment.form) {
          surveyMap[assignment.target_id] = {
            form: assignment.form,
            assignment_id: assignment.id
          };
        }
      });

      console.log('Survey map:', surveyMap);
      setSystemSurveys(surveyMap);
    } catch (error) {
      console.error('Error loading survey assignments:', error);
    }
  };

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
      {systems.map((system) => {
        const isSelected = selectedSystems.some(s => s.id === system.id);
        const hasSurvey = systemSurveys[system.id]?.form;
        
        console.log('System survey data:', system.id, systemSurveys[system.id]);
        
        return (
          <DraggableSystemCard
            key={system.id}
            system={system}
            isSelected={isSelected}
            onSelect={onSystemSelect}
            hasSurvey={!!hasSurvey}
            setShowSurvey={setShowSurvey}
            setSelectedSystemId={setSelectedSystemId}
          />
        );
      })}
      {showSurvey && selectedSystemId && systemSurveys[selectedSystemId] && (
        <SurveyModal
          isOpen={showSurvey}
          onClose={() => {
            setShowSurvey(false);
            setSelectedSystemId(null);
          }}
          surveyForm={systemSurveys[selectedSystemId].form}
          assignmentId={systemSurveys[selectedSystemId].assignment_id}
        />
      )}
    </div>
  );
};

export default SystemGrid;