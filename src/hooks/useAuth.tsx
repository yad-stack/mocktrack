import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  onboardingComplete: boolean;
  setOnboardingComplete: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  onboardingComplete: true,
  setOnboardingComplete: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingCompleteState] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        fetchOnboardingState(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchOnboardingState(session.user.id);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchOnboardingState = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('onboarding_complete')
        .eq('id', userId)
        .single();
      setOnboardingCompleteState(data?.onboarding_complete ?? false);
    } catch {
      // Profile doesn't exist yet — treat as needing onboarding
      setOnboardingCompleteState(false);
    } finally {
      setLoading(false);
    }
  };

  const setOnboardingComplete = async () => {
    if (!session?.user) return;
    await supabase
      .from('user_profiles')
      .upsert({ id: session.user.id, onboarding_complete: true });
    setOnboardingCompleteState(true);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setOnboardingCompleteState(true);
  };

  return (
    <AuthContext.Provider value={{
      session, user: session?.user ?? null, loading,
      onboardingComplete, setOnboardingComplete, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
