import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, adminSupabase } from '../config/supabase';
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
  signIn: (email: string, password: string) => Promise<void>;
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
  signIn: async () => {},
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
      const { data: userData, error: userError } = await supabase
        .from('user_management')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (userError) throw userError;

      // Important security checks
      if (!userData || userData.status === 'pending') {
        await signOut();
        return;
      }

      if (!userData.is_active) {
        toast.error('Twoje konto zostało dezaktywowane');
        await signOut();
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
      if (userData.role === 'user' && userData.is_active && userData.status !== 'pending') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('czy_korzysta_z_erp, czy_zamierza_wdrozyc_erp, czy_dokonal_wyboru_erp')
          .eq('id', user.id)
          .single();

        // Show survey if any of the fields are null
        if (profile && (profile.czy_korzysta_z_erp === null || 
            profile.czy_zamierza_wdrozyc_erp === null || 
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      checkUserRole(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data?.user) {
      // Check role in app_metadata first
      const role = data.user.app_metadata?.role;
      if (role === 'admin' || role === 'service_role') {
        navigate('/admin/systemy');
        toast.success('Zalogowano pomyślnie');
        return;
      }

      if (role === 'editor') {
        navigate('/admin/systemy');
        toast.success('Zalogowano pomyślnie');
        return;
      }

      // Then check user_management table
      const { data: roleData, error: roleError } = await supabase
        .from('user_management')
        .select('role, is_active, status')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (roleError) throw roleError;

      // Check if user exists and is active
      if (!roleData || !roleData.is_active) {
        await supabase.auth.signOut();
        throw new Error('Konto jest nieaktywne');
      }

      // Check if user is pending
      if (roleData.status === 'pending') {
        await supabase.auth.signOut();
        throw new Error('Konto oczekuje na zatwierdzenie');
      }

      // Handle different roles
      if (roleData.role === 'admin' || roleData.role === 'editor') {
        navigate('/admin/systemy');
      } else {
        // For regular users, navigate to the main page
        navigate('/');
      }
      
      toast.success('Zalogowano pomyślnie');
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