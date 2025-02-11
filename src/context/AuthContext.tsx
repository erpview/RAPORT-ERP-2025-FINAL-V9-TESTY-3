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
  const navigate = useNavigate();

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

      // Check if we need to show the survey for regular users
      if (userData.role === 'user' && userData.is_active && userData.status === 'active') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('czy_korzysta_z_erp, czy_zamierza_wdrozic_erp, czy_dokonal_wyboru_erp')
          .eq('id', user.id)
          .single();

        // Show survey if any of the fields are null
        if (profile && (profile.czy_korzysta_z_erp === null || 
            profile.czy_zamierza_wdrozic_erp === null || 
            profile.czy_dokonal_wyboru_erp === null)) {
          setShowSurvey(true);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      checkUserRole(session?.user ?? null);
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