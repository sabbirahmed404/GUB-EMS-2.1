import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle hash fragment from OAuth redirect
    const handleHashFragment = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        if (accessToken) {
          console.log('Received access token from redirect');
          // Set the session using the access token
          const { data: { user }, error } = await supabase.auth.getUser(accessToken);
          if (error) throw error;
          setUser(user);
          // Clear the hash without triggering a reload
          window.history.replaceState(null, '', window.location.pathname);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error handling hash fragment:', error);
        return false;
      }
    };
  
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const hasHandledRedirect = await handleHashFragment();
        if (!hasHandledRedirect) {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;
          console.log('Session state:', session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };
  
    initializeAuth();
  
    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user);
      if (session?.user) {
        setUser(session.user);
      }
    });
  
    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const redirectURL = window.location.origin + '/dashboard';

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectURL,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};