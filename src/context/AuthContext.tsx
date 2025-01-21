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
  signIn: (email: string, password: string) => Promise<void>;
  signOut: (silent?: boolean) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isEditor: false,
  canViewUsers: false,
  signIn: async () => {},
  signOut: async () => {},
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [canViewUsers, setCanViewUsers] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkUserRole = async (user: User | null) => {
    if (!user) {
      setIsAdmin(false);
      setIsEditor(false);
      setCanViewUsers(false);
      setLoading(false);
      return;
    }

    try {
      const { data: userData, error: userError } = await supabase
        .from('user_management')
        .select('role, is_active, status, can_view_users')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userError) throw userError;

      if (!userData || userData.status === 'pending') {
        await signOut();
        return;
      }

      if (!userData.is_active) {
        toast.error('Twoje konto zostało dezaktywowane');
        await signOut();
        return;
      }

      setIsAdmin(userData.role === 'admin');
      setIsEditor(userData.role === 'editor');
      setCanViewUsers(userData.can_view_users || userData.role === 'admin');
      setLoading(false);
    } catch (error) {
      console.error('Error checking user role:', error);
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
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isEditor, canViewUsers, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);