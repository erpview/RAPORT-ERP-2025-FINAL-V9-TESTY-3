import React, { useState, useEffect } from 'react';
import { Search, Building2, Filter, ChevronDown, X, Loader2, Scale, FileText } from 'lucide-react';
import { useSystems } from '../hooks/useSystems';
import { useComparison } from '../context/ComparisonContext';
import { useAuth } from '../context/AuthContext';
import { SurveyModal } from './SurveyModal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

export const SystemsCatalog = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isEditor } = useAuth();
  const { selectedSystems, toggleSystem, maxSystems } = useComparison();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [surveyAssignment, setSurveyAssignment] = useState<any>(null);
  const [surveyForm, setSurveyForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { systems, isLoading, error } = useSystems();
  const canSubmitSurvey = user && (isAdmin || (!isAdmin && !isEditor));

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
      setSurveyForm(surveyMap);
      setSurveyAssignment(assignmentMap);
    } catch (error) {
      console.error('Error loading survey assignments:', error);
    }
  };

  // Sort vendors alphabetically
  const vendors = Array.from(new Set(systems.map(system => system.vendor))).sort();
  
  // Get unique sizes from all systems with custom sort order
  const sizeOrder = ['Małe', 'Średnie', 'Duże'];
  const sizes = Array.from(new Set(
    systems.flatMap(system => system.size)
  )).sort((a, b) => {
    const indexA = sizeOrder.indexOf(a);
    const indexB = sizeOrder.indexOf(b);
    return indexA - indexB;
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

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
    
    const systemSizes = system.size;
    const matchesSize = selectedFilters.length === 0 || 
                       systemSizes.some(size => selectedFilters.includes(size));
    
    const matchesVendor = !selectedFilters.includes('vendor') || system.vendor === selectedFilters.find(filter => filter.startsWith('vendor:'))?.split(':')[1];

    return matchesSearch && matchesSize && matchesVendor;
  });

  const toggleSize = (size: string) => {
    setSelectedFilters(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const handleCompareToggle = (system: any) => {
    const isSelected = selectedSystems.some(s => s.id === system.id);
    if (isSelected) {
      toggleSystem(system.id);
    } else if (selectedSystems.length < maxSystems) {
      toggleSystem(system.id);
    }
  };

  if (isLoading) {
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
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`sf-button h-10 text-[15px] font-medium flex items-center bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED] px-4
                      ${selectedFilters.includes(size) ? 'bg-[#2c3b67] text-white hover:bg-[#2c3b67]/90' : ''}
                    `}
                  >
                    {size}
                  </button>
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
                  value={selectedFilters.find(filter => filter.startsWith('vendor:'))?.split(':')[1] || ''}
                  onChange={(e) => setSelectedFilters(prev => [...prev.filter(filter => !filter.startsWith('vendor:')), `vendor:${e.target.value}`])}
                  className="sf-input pl-10 pr-16 w-full appearance-none bg-white cursor-pointer hover:bg-[#F5F5F7] transition-colors duration-200"
                >
                  <option value="">Wszyscy dostawcy</option>
                  {vendors.map(vendor => (
                    <option key={vendor} value={vendor}>
                      {vendor}
                    </option>
                  ))}
                </select>
                {selectedFilters.find(filter => filter.startsWith('vendor:')) && (
                  <button
                    onClick={() => setSelectedFilters(prev => prev.filter(filter => !filter.startsWith('vendor:')))}
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
          const hasSurvey = surveyForm && surveyForm[system.id];
          
          return (
            <div key={system.id} className="sf-card p-6 space-y-4 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-[24px] font-semibold text-[#1d1d1f]">
                    {system.name}
                  </h2>
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
                {system.size.map((size, index) => (
                  <button
                    key={`${size}-${index}`}
                    onClick={() => toggleSize(size)}
                    className={`sf-button h-10 text-[15px] font-medium flex items-center bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED] px-4
                      ${selectedFilters.includes(size) ? 'bg-[#2c3b67] text-white hover:bg-[#2c3b67]/90' : ''}
                    `}
                  >
                    {size}
                  </button>
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
              <button
                onClick={() => navigate('/porownaj-systemy-erp?compare=true')}
                className={`sf-button-primary text-[15px] py-2
                  ${selectedSystems.length < 2 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''}`}
              >
                Porównaj systemy
              </button>
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
          surveyForm={surveyForm[selectedSystemId]}
          assignmentId={surveyAssignment[selectedSystemId]}
        />
      )}
    </div>
  );
};