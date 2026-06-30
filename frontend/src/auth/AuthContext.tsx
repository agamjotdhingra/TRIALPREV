import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/api/supabase';
import { get } from '@/api/client';

export type UserRole = 'patient' | 'doctor' | 'hospital_admin' | 'lab_admin' | 'platform_admin';

interface UserProfile {
  id: string;
  role: UserRole;
  entity_id: number | null;
  full_name: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  entityId: number | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loadedUserIdRef = useRef<string | null>(null);

  async function loadProfile(userId: string) {
    if (loadedUserIdRef.current === userId) {
      setIsLoading(false);
      return;
    }
    loadedUserIdRef.current = userId;
    setIsLoading(true);
    try {
      const data = await get<UserProfile>('/auth/me');
      setProfile(data);
    } catch {
      setProfile(null);
      loadedUserIdRef.current = null;
    } finally {
      setIsLoading(false);
    }
  }

  function clearAuth() {
    setProfile(null);
    setSession(null);
    loadedUserIdRef.current = null;
    setIsLoading(false);
  }

  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadProfile(session.user.id);
      } else {
        clearAuth();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadProfile(session.user.id);
      } else {
        clearAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } finally {
      clearAuth();
    }
  }

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      entityId: profile?.entity_id ?? null,
      isLoading,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
