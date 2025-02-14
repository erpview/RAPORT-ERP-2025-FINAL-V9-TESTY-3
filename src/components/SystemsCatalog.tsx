import React, { useState, useEffect } from 'react';
import { Search, Building2, Globe, Filter, ChevronDown, X, Loader2, Scale, FileText } from 'lucide-react';
import { useSystems } from '../hooks/useSystems';
import { useComparison } from '../context/ComparisonContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { System } from '../types/system';
import { MultiSelectValue } from './ui/MultiSelectValue';
import { normalizeMultiselectValue } from '../utils/fieldUtils';
import { Link } from 'react-router-dom';
import { adminSupabase as supabase } from '../config/supabase';
import { SurveyModal } from './SurveyModal';

const SystemsCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSize, setSelectedSize] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const { systems, loading, error } = useSystems();
  const { selectedSystems, addSystem, removeSystem } = useComparison();
  const { user, isAdmin, isEditor } = useAuth();
  const canSubmitSurvey = user && (isAdmin || (!isAdmin && !isEditor));
  const isRegularUser = user && !isAdmin && !isEditor;
  const [systemSurveys, setSystemSurveys] = useState<Record<string, any>>({});
  const [surveyAssignments, setSurveyAssignments] = useState<Record<string, string>>({});
  const [showSurvey, setShowSurvey] = useState(false);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);

  useEffect(() => {
    loadSurveyAssignments();
  }, [systems]);

  const loadSurveyAssignments = async () => {
    try {
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

      console.log('Survey assignments data:', data);

      const surveyMap: Record<string, any> = {};
      const assignmentMap: Record<string, string> = {};
      data?.forEach(assignment => {
        if (assignment.form) {
          surveyMap[assignment.target_id] = assignment.form;
          assignmentMap[assignment.target_id] = assignment.id;
        }
      });

      console.log('Survey map:', surveyMap);
      console.log('Assignment map:', assignmentMap);
      setSystemSurveys(surveyMap);
      setSurveyAssignments(assignmentMap);
    } catch (error) {
      console.error('Error loading survey assignments:', error);
    }
  };

  // Sort vendors alphabetically
  const vendors = Array.from(new Set(systems.map(system => system.vendor))).sort();
  
  // Get unique sizes from all systems with custom sort order
  const sizeOrder = ['Małe', 'Średnie', 'Duże'];
  const sizes = Array.from(new Set(
    systems.flatMap(system => normalizeMultiselectValue(system.size))
  )).sort((a, b) => {
    const indexA = sizeOrder.indexOf(a);
    const indexB = sizeOrder.indexOf(b);
    return indexA - indexB;
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const maxSystems = isMobile ? 2 : 4;

  // Add resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredSystems = systems.filter(system => {
    const matchesSearch = system.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         system.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         system.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const systemSizes = normalizeMultiselectValue(system.size);
    const matchesSize = selectedSize.length === 0 || 
                       systemSizes.some(size => selectedSize.includes(size));
    
    const matchesVendor = !selectedVendor || system.vendor === selectedVendor;

    return matchesSearch && matchesSize && matchesVendor;
  });

  const toggleSize = (size: string) => {
    setSelectedSize(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const handleCompareToggle = (system: System) => {
    const isSelected = selectedSystems.some(s => s.id === system.id);
    if (isSelected) {
      removeSystem(system.id);
    } else if (selectedSystems.length < maxSystems) {
      addSystem(system);
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
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
          <input
            type="text"
            placeholder="Szukaj systemu ERP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sf-input pl-10 w-full"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#1d1d1f]">
            <Filter className="w-5 h-5" />
            <h3 className="text-[17px] font-medium">Filtry</h3>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-[15px] font-medium text-[#1d1d1f] mb-2">
                Wielkość firmy
              </h4>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <MultiSelectValue
                    key={size}
                    value={size}
                    onClick={toggleSize}
                    isHighlighted={selectedSize.includes(size)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[15px] font-medium text-[#1d1d1f] mb-2">
                Dostawca
              </h4>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5 pointer-events-none" />
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="sf-input pl-10 pr-16 w-full appearance-none bg-white cursor-pointer hover:bg-[#F5F5F7] transition-colors duration-200"
                >
                  <option value="">Wszyscy dostawcy</option>
                  {vendors.map(vendor => (
                    <option key={vendor} value={vendor}>
                      {vendor}
                    </option>
                  ))}
                </select>
                {selectedVendor && (
                  <button
                    onClick={() => setSelectedVendor('')}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#F5F5F7] rounded-full transition-colors duration-200"
                    title="Resetuj wybór dostawcy"
                  >
                    <X className="w-4 h-4 text-[#86868b]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredSystems.map((system) => {
          const isSelected = selectedSystems.some(s => s.id === system.id);
          const systemSizes = normalizeMultiselectValue(system.size);
          const hasSurvey = systemSurveys[system.id];
          
          return (
            <div 
              key={system.id} 
              className="sf-card p-6 space-y-4 hover:shadow-md transition-all duration-200 cursor-pointer relative"
              onClick={(e) => {
                // Don't navigate if clicked on buttons or their children
                const target = e.target as HTMLElement;
                if (target.closest('button') || target.closest('.sf-button')) {
                  return;
                }
                // Navigate if clicked on the card or its non-interactive content
                if (target === e.currentTarget || target.closest('.card-content')) {
                  navigate(`/systemy-erp/${encodeURIComponent(system.name.toLowerCase().replace(/ /g, '-'))}`);
                }
              }}
            >
              <div className="flex justify-between items-start card-content">
                <div className="card-content">
                  <Link 
                    to={`/systemy-erp/${encodeURIComponent(system.name.toLowerCase().replace(/ /g, '-'))}`}
                    className="text-[24px] font-semibold text-[#1d1d1f] hover:text-[#007AFF] transition-colors"
                  >
                    {system.name}
                  </Link>
                  <p className="text-[15px] text-[#86868b] mt-1">
                    {system.vendor}
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
                      className="sf-button h-10 text-[15px] font-medium flex items-center bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED] px-4"
                      aria-label="Oceń system ERP"
                      title="Oceń system ERP"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      <span className="hidden sm:inline">Oceń system ERP</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleCompareToggle(system)}
                    disabled={!isSelected && selectedSystems.length >= maxSystems}
                    className={`sf-button h-10 text-[15px] font-medium flex items-center px-4
                      ${isSelected 
                        ? 'bg-[#2c3b67] text-white hover:bg-[#2c3b67]/90'
                        : selectedSystems.length >= maxSystems
                          ? 'bg-[#F5F5F7] text-[#86868b] cursor-not-allowed'
                          : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]'
                      }`}
                  >
                    <Scale className="w-5 h-5 mr-2" />
                    <span className="hidden sm:inline">
                      {isSelected ? 'Usuń z raportu ERP' : 'Dodaj do raportu ERP'}
                    </span>
                  </button>
                </div>
              </div>

              <p className="text-[17px] leading-relaxed text-[#1d1d1f]">
                {system.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {normalizeMultiselectValue(system.size).map((size, index) => (
                  <MultiSelectValue
                    key={`${size}-${index}`}
                    value={size}
                    onClick={toggleSize}
                    isHighlighted={selectedSize.includes(size)}
                  />
                ))}
              </div>

            </div>
          );
        })}
        
        {filteredSystems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[17px] text-[#86868b]">
              Nie znaleziono systemów spełniających kryteria wyszukiwania.
            </p>
          </div>
        )}
      </div>

      {/* Mobile Floating Bar */}
      {selectedSystems.length > 0 && isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-t border-[#d2d2d7]/30">
          <div className="p-4">
            {/* Counter and Compare Button */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#2c3b67]" />
                <span className="text-[15px] font-medium text-[#1d1d1f]">
                  {selectedSystems.length}/{maxSystems} systemów
                </span>
              </div>
              <Link
                to="/porownaj-systemy-erp?compare=true"
                className={`sf-button-primary text-[15px] py-2
                  ${selectedSystems.length < 2 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''}`}
                onClick={(e) => {
                  if (selectedSystems.length < 2) {
                    e.preventDefault();
                  }
                }}
              >
                Porównaj systemy
              </Link>
            </div>
            
            {/* Selected Systems Chips */}
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
                    onClick={() => handleCompareToggle(system)}
                    className="p-0.5 hover:bg-[#E8E8ED] rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-[#86868b]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {showSurvey && selectedSystemId && (
        <SurveyModal
          isOpen={showSurvey}
          onClose={() => {
            setShowSurvey(false);
            setSelectedSystemId(null);
          }}
          surveyForm={systemSurveys[selectedSystemId]}
          assignmentId={surveyAssignments[selectedSystemId]}
        />
      )}
    </div>
  );
};

export default SystemsCatalog;