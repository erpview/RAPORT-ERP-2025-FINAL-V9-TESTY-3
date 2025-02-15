import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSystemFields, type SystemFieldValue } from '../hooks/useSystemFields';
import { MultiSelectDisplay } from './ui/MultiSelectDisplay';
import { isMultiselectField } from '../utils/fieldUtils';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserCog } from 'lucide-react';
import { useComparisonTracking } from '../hooks/useComparisonTracking';

interface ComparisonModalProps {
  systems: Array<{
    id: string;
    name: string;
  }>;
  isOpen: boolean;
  onClose: () => void;
}

interface SystemDetails {
  id: string;
  name: string;
  vendor: string;
  website: string;
  description: string;
  size: string[];
}

export default function ComparisonModal({ systems, isOpen, onClose }: ComparisonModalProps) {
  const { user, isAdmin, isEditor, canViewUsers, canViewSystems } = useAuth();
  const navigate = useNavigate();
  const { getModuleFields, getFieldValues, loading: fieldsLoading } = useSystemFields();
  const { startTracking, endTracking } = useComparisonTracking(user?.id);
  const [fieldValues, setFieldValues] = useState<Record<string, SystemFieldValue[]>>({});
  const [loading, setLoading] = useState(true);
  const [moduleFields, setModuleFields] = useState<ReturnType<typeof getModuleFields>>([]);
  const [systemDetails, setSystemDetails] = useState<SystemDetails[]>([]);
  const [highlightDifferences, setHighlightDifferences] = useState(false);

  // Check if user has full access to comparison
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [isLinkedInUser, setIsLinkedInUser] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (isAdmin || (isEditor && (canViewUsers || canViewSystems))) {
        setHasFullAccess(true);
        return;
      }

      if (!user) {
        setHasFullAccess(false);
        return;
      }

      try {
        // Check if user is LinkedIn user and if their profile is complete
        const { data: userData, error: userError } = await supabase
          .from('user_management')
          .select('auth_provider')
          .eq('user_id', user.id)
          .single();

        if (userError) throw userError;

        const isLinkedIn = userData.auth_provider === 'linkedin_oidc';
        setIsLinkedInUser(isLinkedIn);

        if (isLinkedIn) {
          // For LinkedIn users, check if profile is complete
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('company_name, phone_number, nip, position, industry, company_size')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;

          const profileComplete = Boolean(
            profile.company_name &&
            profile.phone_number &&
            profile.nip &&
            profile.position &&
            profile.industry &&
            profile.company_size
          );
          setIsProfileComplete(profileComplete);
          setHasFullAccess(profileComplete);
        } else {
          // Regular users have full access
          setHasFullAccess(true);
          setIsProfileComplete(true);
        }
      } catch (error) {
        console.error('Error checking user access:', error);
        setHasFullAccess(false);
        setIsProfileComplete(false);
      }
    };

    checkAccess();
  }, [isAdmin, isEditor, canViewUsers, canViewSystems, user]);

  useEffect(() => {
    if (isOpen) {
      console.log('ComparisonModal opened with user:', user?.id);
      loadSystemDetails();
      loadFieldValues();
      const allModules = getModuleFields();
      
      // Filter modules based on authentication status and permissions
      const filteredModules = allModules.filter(({ module }) => {
        const isBasicInfo = module.name.toLowerCase().includes('podstawowe');
        const isPublic = Boolean(module.is_public);
        
        console.log(`Module "${module.name}":`, {
          isBasicInfo,
          isPublic,
          moduleData: module
        });
        
        // Show only basic info and public modules for users without full access
        if (!hasFullAccess) {
          return isBasicInfo || isPublic;
        }
        
        return true;
      });
      
      console.log('ComparisonModal - Filtered modules:', filteredModules);
      setModuleFields(filteredModules);
    }
  }, [isOpen]);

  // Separate effect for tracking
  useEffect(() => {
    if (isOpen && user?.id) {
      console.log('Starting comparison tracking for systems:', systems.map(s => s.id));
      startTracking(systems.map(s => s.id));
    }
  }, [isOpen, user?.id]);

  const loadSystemDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('systems')
        .select('id, name, vendor, website, description, size')
        .in('id', systems.map(s => s.id));

      if (error) throw error;
      
      // Create a map for ordering based on the input systems array
      const systemPositions = systems.reduce((acc, sys, index) => {
        acc[sys.id] = index;
        return acc;
      }, {} as Record<string, number>);
      
      // Sort the data to match the input order
      const orderedData = [...(data || [])].sort((a, b) => {
        const posA = systemPositions[a.id] ?? 0;
        const posB = systemPositions[b.id] ?? 0;
        return posA - posB;
      });
      
      console.log('Systems to compare:', systems.map(s => s.id));
      console.log('Ordered system details:', orderedData.map(s => s.id));
      setSystemDetails(orderedData);
    } catch (error) {
      console.error('Error loading system details:', error);
    }
  };

  const loadFieldValues = async () => {
    setLoading(true);
    try {
      // Create a map of system IDs to their position in the systems array
      const systemPositions = systems.reduce((acc, sys, index) => {
        acc[sys.id] = index;
        return acc;
      }, {} as Record<string, number>);

      // Load all field values at once
      const { data: allValues, error } = await supabase
        .from('system_field_values')
        .select('*')
        .in('system_id', systems.map(s => s.id));

      if (error) throw error;

      // Group values by field_id, maintaining system order
      const groupedValues: Record<string, SystemFieldValue[]> = {};
      
      // First, initialize arrays for all fields
      const uniqueFieldIds = [...new Set(allValues?.map(v => v.field_id) || [])];
      uniqueFieldIds.forEach(fieldId => {
        groupedValues[fieldId] = new Array(systems.length).fill(null);
      });

      // Then fill in the values in their correct positions
      allValues?.forEach(value => {
        const systemPosition = systemPositions[value.system_id];
        if (typeof systemPosition === 'number') {
          groupedValues[value.field_id][systemPosition] = value;
        }
      });

      console.log('Loaded field values:', allValues);
      console.log('Grouped values:', groupedValues);
      setFieldValues(groupedValues);
    } catch (error) {
      console.error('Error loading field values:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFieldValue = (fieldValue: SystemFieldValue | null, field: { field_type?: string, field_key?: string }) => {
    if (!fieldValue || !fieldValue.value) return '-';
    
    if (field.field_type === 'boolean') {
      return fieldValue.value === 'true' ? 'Tak' : 'Nie';
    }

    if (isMultiselectField(field)) {
      return <MultiSelectDisplay value={fieldValue.value} />;
    }
    
    return fieldValue.value;
  };

  const hasDifferentValues = (values: (SystemFieldValue | null)[]) => {
    if (values.length < 2) return false;
    
    // Get the first non-null value to compare against
    const firstValue = values[0]?.value || null;
    
    // Compare all values against the first one, treating null as a difference
    return values.some(v => {
      const currentValue = v?.value || null;
      return currentValue !== firstValue;
    });
  };

  const getRowClassName = (values: (SystemFieldValue | null)[] | string[] | string[][]) => {
    // Only show highlighting if user is logged in and has full access
    if (!highlightDifferences || !hasFullAccess || !user) return '';
    
    // Return empty string if values is undefined or empty
    if (!values || values.length < 2) return '';
    
    // For basic info (strings)
    if (typeof values[0] === 'string') {
      const firstValue = values[0] || '-';
      const hasDiff = values.some(v => (v || '-') !== firstValue);
      return hasDiff ? 'bg-yellow-50' : '';
    }

    // For arrays of strings (like size)
    if (Array.isArray(values[0])) {
      const firstValue = (values[0] as string[])?.join(',') || '';
      const hasDiff = values.some(v => ((v as string[])?.join(',') || '') !== firstValue);
      return hasDiff ? 'bg-yellow-50' : '';
    }
    
    // For field values
    if (values.every(v => v === null || v === undefined)) return '';
    return hasDifferentValues(values as SystemFieldValue[]) ? 'bg-yellow-50' : '';
  };

  // Check if we have custom fields available
  const hasCustomFields = moduleFields && moduleFields.length > 0;

  // Basic fields that might appear in both basic info and custom fields
  const basicFieldKeys = ['vendor', 'size', 'website', 'description'];

  // Handle modal close and cleanup
  const handleClose = () => {
    console.log('Modal closing, ending tracking for user:', user?.id);
    if (user?.id) {
      endTracking();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <Dialog.Panel className="relative w-full max-w-7xl mx-4 rounded-lg bg-white p-6 shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <Dialog.Title className="text-2xl font-bold">
                Raport ERP: Porównanie
              </Dialog.Title>
              {hasFullAccess && user && (
                <button
                  onClick={() => setHighlightDifferences(!highlightDifferences)}
                  className={`sf-button-secondary text-sm px-3 py-1.5 ${
                    highlightDifferences 
                      ? 'bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {highlightDifferences ? 'Usuń podświetlenie' : 'Podświetl różnice'}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className={`overflow-x-auto ${hasFullAccess ? 'max-h-[calc(100vh-120px)]' : 'max-h-[calc(80vh-120px)]'}`}>
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="text-left py-2 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-200 w-1/4 shadow-sm"></th>
                  {systemDetails.map(system => (
                    <th
                      key={system.id}
                      className="text-left py-2 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"
                    >
                      {system.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Basic information section */}
                <tr>
                  <td colSpan={systems.length + 1} className="py-4 px-4 bg-gray-100 font-semibold">
                    Podstawowe informacje
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Dostawca</td>
                  {systemDetails.map(system => (
                    <td key={system.id} className={`py-2 px-4 border-b ${getRowClassName(systemDetails.map(s => s.vendor))}`}>
                      {system.vendor}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Wielkość firmy</td>
                  {systemDetails.map(system => (
                    <td key={system.id} className={`py-2 px-4 border-b ${getRowClassName(systemDetails.map(s => s.size))}`}>
                      <MultiSelectDisplay value={system.size} />
                    </td>
                  ))}
                </tr>
                {hasFullAccess && (
                  <tr>
                    <td className="py-2 px-4 border-b">Strona internetowa</td>
                    {systemDetails.map(system => (
                      <td key={system.id} className={`py-2 px-4 border-b ${getRowClassName(systemDetails.map(s => s.website))}`}>
                        <a 
                          href={system.website}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="text-blue-600 hover:underline"
                        >
                          Odwiedź stronę
                        </a>
                      </td>
                    ))}
                  </tr>
                )}
                <tr>
                  <td className="py-2 px-4 border-b">Opis</td>
                  {systemDetails.map(system => (
                    <td key={system.id} className={`py-2 px-4 border-b ${getRowClassName(systemDetails.map(s => s.description))}`}>
                      {system.description}
                    </td>
                  ))}
                </tr>

                {/* Custom Fields */}
                {hasCustomFields && moduleFields
                  .filter(({ module }) => !module.name.toLowerCase().includes('podstawowe'))
                  .map(({ module, fields }) => (
                  <React.Fragment key={module.id}>
                    <tr>
                      <td
                        colSpan={systems.length + 1}
                        className="py-4 px-4 bg-gray-100 font-semibold"
                      >
                        {module.name}
                      </td>
                    </tr>
                    {fields
                      .filter(field => !basicFieldKeys.includes(field.field_key))
                      .map(field => (
                        <tr key={field.id}>
                          <td className="py-2 px-4 border-b">
                            {field.name}
                            {field.description && (
                              <p className="text-sm text-gray-500">
                                {field.description}
                              </p>
                            )}
                          </td>
                          {systems.map((system, index) => {
                            const value = fieldValues[field.id]?.[index];
                            const values = fieldValues[field.id];
                            return (
                              <td
                                key={system.id}
                                className={`py-2 px-4 border-b ${getRowClassName(values)}`
                              }
                              >
                                {formatFieldValue(value, field)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          {!hasFullAccess && !isAdmin && (
            <div className="mt-8 p-6 bg-[#F5F5F7] rounded-lg">
              <div className="flex flex-col items-center text-center space-y-4">
                <p className="text-lg text-[#1d1d1f]">
                  {!user ? (
                    "Zarejestruj się lub zaloguj, aby zobaczyć pełną treść raportu."
                  ) : isLinkedInUser && !isProfileComplete ? (
                    "Uzupełnij wszystkie dane w profilu, aby uzyskać dostęp do pełnego raportu."
                  ) : (
                    "Nie masz wystarczających uprawnień, aby zobaczyć pełną treść raportu. Skontaktuj się z administratorem."
                  )}
                </p>
                {!user && (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        handleClose();
                        navigate('/admin/register');
                      }}
                      className="sf-button-primary inline-flex items-center"
                    >
                      <UserCog className="w-5 h-5 mr-2" />
                      Zarejestruj się
                    </button>
                    <button 
                      onClick={() => {
                        handleClose();
                        navigate('/admin/login');
                      }}
                      className="sf-button-primary inline-flex items-center"
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      Zaloguj się
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}