import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  account_type: 'reporter' | 'municipal';
  municipal_name: string | null;
  municipal_address: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  avatar_url: string | null;
  points: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
  setUserLocation: (location: { latitude: number; longitude: number } | null) => void;
  refreshProfile: () => Promise<void>;
}

interface SignupData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  accountType: 'reporter' | 'municipal';
  municipalName?: string;
  municipalAddress?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile | null;
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsGuest(false);
        
        // Defer profile fetch with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id).then(setProfile);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Check if municipal account is approved
    if (data.user) {
      const profileData = await fetchProfile(data.user.id);
      if (profileData?.account_type === 'municipal' && profileData.approval_status === 'pending') {
        await supabase.auth.signOut();
        return { success: false, error: 'Your municipal account is pending approval. Please wait for an existing municipal body to approve your request.' };
      }
      if (profileData?.account_type === 'municipal' && profileData.approval_status === 'rejected') {
        await supabase.auth.signOut();
        return { success: false, error: 'Your municipal account request was rejected.' };
      }
    }

    return { success: true };
  };

  const signup = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email: data.email.trim(),
      password: data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: data.fullName,
          phone: data.phone,
          account_type: data.accountType,
          municipal_name: data.municipalName || null,
          municipal_address: data.municipalAddress || null,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { success: false, error: 'An account with this email already exists. Please login instead.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsGuest(false);
    setUserLocation(null);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      profile,
      isAuthenticated: !!user || isGuest, 
      isGuest,
      isLoading,
      userLocation,
      login, 
      signup, 
      logout,
      continueAsGuest,
      setUserLocation,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
