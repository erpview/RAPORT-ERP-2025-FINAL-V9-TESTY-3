import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';
import { OnboardingSurveyModal } from '../components/OnboardingSurveyModal';

interface OnboardingContextType {
  showOnboardingSurvey: boolean;
  closeOnboardingSurvey: () => void;
}

const OnboardingContext = createContext<OnboardingContextType>({
  showOnboardingSurvey: false,
  closeOnboardingSurvey: () => {},
});

export const useOnboarding = () => useContext(OnboardingContext);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [showOnboardingSurvey, setShowOnboardingSurvey] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user?.id) return;

      try {
        // Check if user is a regular user and if they have completed the onboarding survey
        const { data: userData, error: userError } = await supabase
          .from('user_management')
          .select('role, status')
          .eq('user_id', user.id)
          .single();

        if (userError) {
          console.error('Error checking user role:', userError);
          return;
        }

        // Only show survey for regular users who are approved (status === 'active')
        if (userData.role !== 'user' || userData.status !== 'active') return;

        // Check if profile fields are null
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('czy_korzysta_z_erp, czy_zamierza_wdrozyc_erp, czy_dokonal_wyboru_erp')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error checking profile:', profileError);
          return;
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

    checkOnboardingStatus();
  }, [user]);

  const closeOnboardingSurvey = () => {
    setShowOnboardingSurvey(false);
  };

  return (
    <OnboardingContext.Provider value={{ showOnboardingSurvey, closeOnboardingSurvey }}>
      {children}
      <OnboardingSurveyModal
        isOpen={showOnboardingSurvey}
        onClose={closeOnboardingSurvey}
      />
    </OnboardingContext.Provider>
  );
};
