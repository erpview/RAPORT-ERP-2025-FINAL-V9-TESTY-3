import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    isLoading: true,
  });

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setAuthState({
          user,
          isAdmin: user?.app_metadata?.role === 'admin',
          isLoading: false,
        });
      } catch (error) {
        console.error('Error loading user:', error);
        setAuthState({
          user: null,
          isAdmin: false,
          isLoading: false,
        });
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        setAuthState({
          user,
          isAdmin: user?.app_metadata?.role === 'admin',
          isLoading: false,
        });
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user: authState.user,
    isAdmin: authState.isAdmin,
    isLoading: authState.isLoading,
    isAuthenticated: !!authState.user,
  };
};
