import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type Role = 'organizer' | 'visitor';

export interface UserProfile {
  user_id: string;
  auth_id: string;
  username: string;
  full_name: string;
  email: string;
  role: Role;
  phone: string | null;
  avatar_url?: string;
  organizer_code?: string;
  role_in_institute?: string;
  description?: string;
  club?: string;
  club_position?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  signInWithGoogle: () => Promise<{ success: boolean }>;
  updateUserRole: (role: Role) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  useEffect(() => {
    let mounted = true;
    let profileTimeout: NodeJS.Timeout;

    const fetchProfile = async (userId: string) => {
      if (profile?.auth_id === userId) {
        return;
      }

      try {
        if (isFetchingProfile) return;
        setIsFetchingProfile(true);
        console.log('Fetching profile for user:', userId);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          throw error;
        }

        if (!data) {
          console.error('No profile found for user:', userId);
          throw new Error('No profile found');
        }

        console.log('Profile fetched successfully:', data);
        if (mounted) {
          setProfile(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch user profile'));
          setLoading(false);
        }
      } finally {
        setIsFetchingProfile(false);
      }
    };

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Auth Check:', {
          hasSession: !!session,
          error: error?.message,
          user: session?.user?.id,
          role: session?.user?.role
        });

        if (session?.user) {
          setUser(session.user);
          if (!profile || profile.auth_id !== session.user.id) {
            await fetchProfile(session.user.id);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize auth'));
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', { event, userId: session?.user?.id });
      
      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          
          if (!profile || profile.auth_id !== session.user.id) {
            if (profileTimeout) clearTimeout(profileTimeout);
            
            profileTimeout = setTimeout(() => {
              fetchProfile(session.user.id);
            }, 1000);
          } else {
            setLoading(false);
          }
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      if (profileTimeout) clearTimeout(profileTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error signing in with Google:', err);
      setError(err instanceof Error ? err : new Error('Error signing in with Google'));
      setLoading(false);
      return { success: false };
    }
  };

  const updateUserRole = async (role: Role) => {
    if (!user || !profile) {
      throw new Error('No user or profile found');
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('auth_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, role } : null);
    } catch (err) {
      console.error('Error updating user role:', err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Error signing out:', err);
      throw err;
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signInWithGoogle,
    updateUserRole,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 