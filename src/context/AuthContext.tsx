import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isEditor: boolean;
  canViewUsers: boolean;
  canViewSystems: boolean;
  canViewCompanies: boolean;
  loading: boolean;
  showSurvey: boolean;
  isLinkedInUser: boolean;
  isProfileComplete: boolean;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signOut: (silent?: boolean) => Promise<void>;
  closeSurvey: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isEditor: false,
  canViewUsers: false,
  canViewSystems: false,
  canViewCompanies: false,
  loading: true,
  showSurvey: false,
  isLinkedInUser: false,
  isProfileComplete: false,
  signIn: async () => ({ data: null, error: new Error('AuthContext not initialized') }),
  signOut: async () => {},
  closeSurvey: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [canViewUsers, setCanViewUsers] = useState(false);
  const [canViewSystems, setCanViewSystems] = useState(false);
  const [canViewCompanies, setCanViewCompanies] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSurvey, setShowSurvey] = useState(false);
  const [isLinkedInUser, setIsLinkedInUser] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const navigate = useNavigate();

  const handleLinkedInUser = async (user: User) => {
    try {
      console.log('Handling LinkedIn user:', user);
      
      // Check if user exists in user_management
      const { data: existingUser, error: userError } = await supabase
        .from('user_management')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error checking user existence:', userError);
        return;
      }

      if (!existingUser) {
        console.log('Creating new user in user_management...');
        
        // Create new user_management entry
        const { error: insertError } = await supabase.from('user_management').insert({
          user_id: user.id,
          role: 'user',
          is_active: true,
          status: 'active',
          auth_provider: 'linkedin_oidc'
        });

        if (insertError) {
          console.error('Error creating user_management entry:', insertError);
          return;
        }

        // Get LinkedIn profile data
        const metadata = user.user_metadata;
        console.log('LinkedIn user metadata:', metadata);

        // Create profile entry with LinkedIn data
        const { error: profileError } = await supabase.from('profiles').insert({
          id: user.id,
          full_name: metadata.name || metadata.full_name || '',
          email: user.email,
          company_name: metadata.company || '',
          position: metadata.position || metadata.title || '',
          linkedin_profile_link: metadata.linkedin_url || metadata.sub || '',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          czy_korzysta_z_erp: null,
          czy_zamierza_wdrozic_erp: null,
          czy_dokonal_wyboru_erp: null
        });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          return;
        }

        console.log('Successfully created user and profile');
      } else {
        console.log('User already exists:', existingUser);
      }
    } catch (error) {
      console.error('Error handling LinkedIn user:', error);
      toast.error('Wystąpił błąd podczas tworzenia konta');
    }
  };

  const checkUserRole = async (user: User | null) => {
    if (!user) {
      setIsAdmin(false);
      setIsEditor(false);
      setCanViewUsers(false);
      setCanViewSystems(false);
      setCanViewCompanies(false);
      setLoading(false);
      return;
    }

    try {
      // Check user_management table first
      const { data: userData, error: userError } = await supabase
        .from('user_management')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        await signOut(true);
        return;
      }

      // Important security checks
      if (!userData) {
        console.log('No user data found, signing out');
        await signOut(true);
        return;
      }

      if (userData.status === 'pending') {
        console.log('User account is pending approval');
        await signOut(true);
        return;
      }

      if (!userData.is_active) {
        console.log('User account is inactive');
        toast.error('Twoje konto zostało dezaktywowane');
        await signOut(true);
        return;
      }

      const isUserAdmin = userData.role === 'admin';
      const isUserEditor = userData.role === 'editor';
      
      setIsAdmin(isUserAdmin);
      setIsEditor(isUserEditor);
      setCanViewUsers(userData.can_view_users || isUserAdmin);
      setCanViewSystems(userData.can_view_systems || isUserAdmin || isUserEditor);
      setCanViewCompanies(userData.can_view_companies || isUserAdmin);

      // Set LinkedIn user status
      setIsLinkedInUser(userData.auth_provider === 'linkedin_oidc');

      // Check profile completion and survey visibility
      if (userData.role === 'user' && userData.is_active && userData.status === 'active') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          if (userData.auth_provider === 'linkedin_oidc') {
            // For LinkedIn users, never show the feedback survey
            const isComplete = Boolean(
              profile.full_name &&
              profile.company_name &&
              profile.position
            );
            setIsProfileComplete(isComplete);
            setShowSurvey(false); // Never show feedback survey for LinkedIn users
          } else {
            // For regular users, always show survey if fields are null
            if (profile.czy_korzysta_z_erp === null ||
                profile.czy_zamierza_wdrozic_erp === null ||
                profile.czy_dokonal_wyboru_erp === null) {
              setShowSurvey(true);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      checkUserRole(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;
      setUser(user);

      if (event === 'SIGNED_IN' && user?.app_metadata?.provider === 'linkedin') {
        await handleLinkedInUser(user);
      }

      await checkUserRole(user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Replace Supabase's default error message
        if (error.message === 'Invalid login credentials') {
          return { error: new Error('Nieprawidłowy login lub hasło') };
        }
        return { error };
      }

      if (data?.user) {
        // Check user_management table first
        const { data: userData, error: userError } = await supabase
          .from('user_management')
          .select('role, is_active, status')
          .eq('user_id', data.user.id)
          .single();

        if (userError) {
          await supabase.auth.signOut();
          return { error: userError };
        }

        // Check if user exists and is active
        if (!userData) {
          await supabase.auth.signOut();
          return { error: new Error('Konto nie zostało znalezione') };
        }

        // Check if user is pending
        if (userData.status === 'pending') {
          await supabase.auth.signOut();
          navigate('/rejestracja/oczekujace');
          return { error: new Error('Twoje konto oczekuje na zatwierdzenie') };
        }

        // Check if user is inactive
        if (!userData.is_active) {
          await supabase.auth.signOut();
          return { error: new Error('Twoje konto zostało dezaktywowane') };
        }

        // Handle different roles
        if (userData.role === 'admin') {
          navigate('/admin/home');
        } else if (userData.role === 'editor') {
          navigate('/systemy-erp');
        } else {
          navigate('/porownaj-systemy-erp');
        }
        
        toast.success('Zalogowano pomyślnie');
        return { data };
      }

      return { error: new Error('Nieprawidłowy login lub hasło') };
    } catch (error: any) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  const signOut = async (silent = false) => {
    try {
      const isRegistrationFlow = window.location.pathname.includes('/rejestracja');

      // Clear browser storage first
      localStorage.clear();
      sessionStorage.clear();

      // Attempt to sign out from Supabase
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (e) {
        console.warn('Error during Supabase signout:', e);
      }

      // Clear all auth state
      setUser(null);
      setIsAdmin(false);
      setIsEditor(false);
      setCanViewUsers(false);
      setCanViewSystems(false);
      setCanViewCompanies(false);

      // Only navigate and show toast for explicit logout (not silent, not registration)
      if (!silent && !isRegistrationFlow) {
        navigate('/');
        toast.success('Wylogowano pomyślnie');
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      
      // Still clear state even if there's an error
      setUser(null);
      setIsAdmin(false);
      setIsEditor(false);
      setCanViewUsers(false);
      setCanViewSystems(false);
      setCanViewCompanies(false);
    }
  };

  const closeSurvey = () => {
    setShowSurvey(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isEditor,
        canViewUsers,
        canViewSystems,
        canViewCompanies,
        loading,
        showSurvey,
        isLinkedInUser,
        isProfileComplete,
        signIn,
        signOut,
        closeSurvey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);