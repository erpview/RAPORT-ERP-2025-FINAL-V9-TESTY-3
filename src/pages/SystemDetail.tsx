import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSystems } from '../hooks/useSystems';
import { Loader2, ChevronLeft, Scale, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useComparison } from '../context/ComparisonContext';
import { useAuth } from '../context/AuthContext';
import { MultiSelectValue } from '../components/ui/MultiSelectValue';
import { normalizeMultiselectValue } from '../utils/fieldUtils';
import { Helmet } from 'react-helmet-async';
import { seoService } from '../services/seo';
import { ProcessedSEOData } from '../types/seo';
import { SurveyModal } from '../components/SurveyModal';
import { adminSupabase as supabase } from '../config/supabase';

const SystemDetail: React.FC = () => {
  const { systemName } = useParams<{ systemName: string }>();
  const { systems, loading, error } = useSystems();
  const { selectedSystems, addSystem, removeSystem } = useComparison();
  const { user, isAdmin, isEditor } = useAuth();
  const canSubmitSurvey = user && (isAdmin || (!isAdmin && !isEditor));
  const isRegularUser = user && !isAdmin && !isEditor;
  const [seoData, setSeoData] = useState<ProcessedSEOData | null>(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [systemSurveys, setSystemSurveys] = useState<Record<string, any>>({});
  const [surveyAssignments, setSurveyAssignments] = useState<Record<string, string>>({});

  const system = systems.find(
    s => s.name.toLowerCase().replace(/ /g, '-') === systemName
  );

  const isSelected = system ? selectedSystems.some(s => s.id === system.id) : false;

  useEffect(() => {
    if (system) {
      loadSurveyAssignments();
      const features = normalizeMultiselectValue(system.size).join(', ');
      seoService.processSEOData('system-detail', {
        systemName: system.name,
        systemDescription: system.description || '',
        vendor: system.vendor,
        keywords: features
      }).then(setSeoData);
    }
  }, [system]);

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

  useEffect(() => {
    if (system) {
      const features = normalizeMultiselectValue(system.size).join(', ');
      seoService.processSEOData('system-detail', {
        systemName: system.name,
        systemDescription: system.description,
        vendor: system.vendor,
        keywords: features
      }).then(setSeoData);
    }
  }, [system]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#007AFF] animate-spin" />
      </div>
    );
  }

  if (error || !system) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center">
        <p className="text-[#FF3B30] mb-4">{error || 'System nie został znaleziony'}</p>
        <Link 
          to="/systemy-erp"
          className="inline-flex items-center text-[#007AFF] hover:text-[#0051CC] transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Powrót do katalogu systemów
        </Link>
      </div>
    );
  }

  const handleCompareToggle = () => {
    if (isSelected) {
      removeSystem(system.id);
    } else {
      addSystem(system);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {seoData && (
        <Helmet>
          <title>{seoData.title}</title>
          <meta name="description" content={seoData.description} />
          <meta name="keywords" content={seoData.keywords} />
          <meta name="robots" content={seoData.robots} />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-touch-fullscreen" content="yes" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="HandheldFriendly" content="true" />
          <meta name="MobileOptimized" content="width" />
          {seoData.structuredData && (
            <script type="application/ld+json">
              {JSON.stringify(seoData.structuredData)}
            </script>
          )}
        </Helmet>
      )}
      <div className="container mx-auto px-8 sm:px-8 lg:px-12 py-8">
        <div className="mb-6">
          <Button component={Link} to="/systemy-erp" variant="ghost">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Powrót do katalogu systemów
          </Button>
        </div>

        <div className="sf-card p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-[24px] font-semibold text-[#1d1d1f]">
                {system.name}
              </h1>
              <p className="text-[15px] text-[#86868b] mt-1">
                {system.vendor}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {system && systemSurveys[system.id] && !isEditor && (
                <button
                  onClick={() => {
                    if (canSubmitSurvey) {
                      setShowSurvey(true);
                    } else {
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
                onClick={handleCompareToggle}
                className={`sf-button h-10 text-[15px] font-medium flex items-center px-4
                  ${isSelected 
                    ? 'bg-[#2c3b67] text-white hover:bg-[#2c3b67]/90'
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
                onClick={() => {}}
                isHighlighted={false}
              />
            ))}
          </div>
        </div>
      </div>
      {system && showSurvey && (
        <SurveyModal
          isOpen={showSurvey}
          onClose={() => setShowSurvey(false)}
          surveyForm={systemSurveys[system.id]}
          assignmentId={surveyAssignments[system.id]}
        />
      )}
    </div>
  );
};

export default SystemDetail;
