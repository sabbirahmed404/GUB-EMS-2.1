import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type Role = 'organizer' | 'visitor';

interface SignOutResult {
  success: boolean;
  error?: unknown;
}

interface UserProfile {
  user_id: string;
  auth_id: string;
  username: string;
  full_name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean }>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ success: boolean }>;
  signOut: () => Promise<SignOutResult>;
  updateUserRole: (newRole: Role) => Promise<void>;
  signInWithGoogle: () => Promise<{ success: boolean }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('auth_user');
    console.log('[Auth] Initial stored user:', !!storedUser);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const storedProfile = localStorage.getItem('auth_profile');
    console.log('[Auth] Initial stored profile:', !!storedProfile);
    return storedProfile ? JSON.parse(storedProfile) : null;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Update localStorage when auth state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem('auth_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('auth_profile');
    }
  }, [profile]);

  // Debug current state
  useEffect(() => {
    console.log('[Auth] Current state:', {
      hasUser: !!user,
      hasProfile: !!profile,
      loading,
      error,
      initialized
    });
  }, [user, profile, loading, error, initialized]);

  const createOrUpdateUserProfile = async (authUser: User) => {
    try {
      console.log('[Auth] Fetching profile for user:', authUser.id);
      
      // Check if user profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

      console.log('[Auth] Profile fetch:', { 
        success: !fetchError, 
        hasProfile: !!existingProfile,
        error: fetchError 
      });

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existingProfile) {
        console.log('[Auth] Creating new profile');
        const newProfile = {
          auth_id: authUser.id,
          username: generateUniqueUsername(authUser.email || ''),
          full_name: authUser.user_metadata.full_name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email,
          role: 'organizer',
          phone: null
        };

        const { data: createdProfile, error: insertError } = await supabase
          .from('users')
          .insert([newProfile])
          .select()
          .single();

        console.log('[Auth] Profile creation:', {
          success: !insertError,
          profile: createdProfile?.user_id,
          error: insertError
        });

        if (insertError) {
          throw insertError;
        }

        setProfile(createdProfile);
        return createdProfile;
      } else {
        console.log('[Auth] Using existing profile:', existingProfile.user_id);
        setProfile(existingProfile);
        return existingProfile;
      }
    } catch (err) {
      console.error('[Auth] Profile error:', err);
      setError(err instanceof Error ? err.message : 'Error setting up user profile');
      throw err;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    let authStateSubscription: { data: { subscription: { unsubscribe: () => void } } } | null = null;

    const initializeAuth = async () => {
      if (!mounted || initialized) {
        console.log('[Auth] Skipping initialization:', { mounted, initialized });
        return;
      }

      try {
        console.log('[Auth] Starting initialization');
        setLoading(true);
        setError(null);

        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        console.log('[Auth] Session check:', {
          hasSession: !!session,
          userId: session?.user?.id
        });

        // Set up auth state change listener
        authStateSubscription = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log('[Auth] State change:', { event, userId: currentSession?.user?.id });
          
          if (!mounted) return;

          try {
            if (event === 'SIGNED_IN' && currentSession?.user) {
              setUser(currentSession.user);
              await createOrUpdateUserProfile(currentSession.user);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setProfile(null);
              localStorage.removeItem('auth_user');
              localStorage.removeItem('auth_profile');
            }
          } catch (err) {
            console.error('[Auth] State change error:', err);
            if (mounted) {
              setError(err instanceof Error ? err.message : 'Error updating auth state');
            }
          }
        });

        // Handle initial session
        if (session?.user) {
          setUser(session.user);
          await createOrUpdateUserProfile(session.user);
        } else {
          setUser(null);
          setProfile(null);
        }

        if (mounted) {
          setInitialized(true);
        }
      } catch (err) {
        console.error('[Auth] Initialization error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Error initializing authentication');
        }
      } finally {
        if (mounted) {
          setLoading(false);
          console.log('[Auth] Initialization complete');
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('[Auth] Cleanup');
      mounted = false;
      if (authStateSubscription) {
        authStateSubscription.data.subscription.unsubscribe();
      }
    };
  }, []); // Only run once on mount

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error signing in with Google:', err);
      setError(err instanceof Error ? err.message : 'Error signing in with Google');
      return { success: false };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err instanceof Error ? err.message : 'Error signing in');
      return { success: false };
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err instanceof Error ? err.message : 'Error signing up');
      return { success: false };
    }
  };

  const signOut = async (): Promise<SignOutResult> => {
    try {
      setError(null);
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all auth state
      setUser(null);
      setProfile(null);
      
      return { success: true };
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err.message : 'Error signing out');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (newRole: Role) => {
    try {
      if (!user || !profile) {
        throw new Error('User not authenticated');
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('user_id', profile.user_id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, role: newRole } : null);
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateUserRole,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to generate a unique username
const generateUniqueUsername = (email: string): string => {
  const baseUsername = email.split('@')[0];
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${baseUsername}_${randomSuffix}`;
};