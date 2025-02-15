import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';
import { OnboardingSurveyModal } from '../components/OnboardingSurveyModal';

interface OnboardingContextType {
  showOnboardingSurvey: boolean;
  closeOnboardingSurvey: () => void;
  checkOnboardingStatus: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType>({
  showOnboardingSurvey: false,
  closeOnboardingSurvey: () => {},
  checkOnboardingStatus: async () => {},
});

export const useOnboarding = () => useContext(OnboardingContext);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [showOnboardingSurvey, setShowOnboardingSurvey] = useState(false);

  const checkOnboardingStatus = async () => {
      if (!user?.id) return;

      try {
        // Check user type and status
        const { data: userData, error: userError } = await supabase
          .from('user_management')
          .select('role, status, auth_provider')
          .eq('user_id', user.id)
          .single();

        if (userError) {
          console.error('Error checking user role:', userError);
          return;
        }

        // Only show survey for regular users who are approved (status === 'active')
        if (userData.role !== 'user' || userData.status !== 'active') return;

        // Get complete profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error checking profile:', profileError);
          return;
        }

        // For LinkedIn users, only show survey if profile is complete but ERP fields are null
        if (userData.auth_provider === 'linkedin_oidc') {
          const isProfileComplete = Boolean(
            profile.company_name &&
            profile.phone_number &&
            profile.nip &&
            profile.position &&
            profile.industry &&
            profile.company_size
          );

          // Only show survey if profile is complete
          if (!isProfileComplete) return;
        }

        // Show survey if any of the required fields are null
        if (
          profile.czy_korzysta_z_erp === null ||
          profile.czy_zamierza_wdrozyc_erp === null ||
          profile.czy_dokonal_wyboru_erp === null
        ) {
          setShowOnboardingSurvey(true);
        }
      } catch (error) {
        console.error('Error in checkOnboardingStatus:', error);
      }
    };

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);


  const closeOnboardingSurvey = () => {
    setShowOnboardingSurvey(false);
  };

  return (
    <OnboardingContext.Provider value={{ showOnboardingSurvey, closeOnboardingSurvey, checkOnboardingStatus }}>
      {children}
      <OnboardingSurveyModal
        isOpen={showOnboardingSurvey}
        onClose={closeOnboardingSurvey}
      />
    </OnboardingContext.Provider>
  );
};
