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
  /** True when exploring the product with sample data (no backend session). */
  isDemo: boolean;
  enterDemo: (role: UserRole) => void;
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  entityId: number | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const DEMO_KEY = 'prevntiv.demo';

export const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  patient: { id: 'demo-patient', role: 'patient', entity_id: 1, full_name: 'Priya Sharma' },
  doctor: { id: 'demo-doctor', role: 'doctor', entity_id: 1, full_name: 'Dr. Aditi Sharma' },
  hospital_admin: { id: 'demo-hospital', role: 'hospital_admin', entity_id: 1, full_name: 'Rajeev Menon' },
  lab_admin: { id: 'demo-lab', role: 'lab_admin', entity_id: 1, full_name: 'Kavya Rao' },
  platform_admin: { id: 'demo-admin', role: 'platform_admin', entity_id: null, full_name: 'Arjun Mehta' },
};

function readDemoRole(): UserRole | null {
  try {
    const r = localStorage.getItem(DEMO_KEY) as UserRole | null;
    return r && r in DEMO_PROFILES ? r : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoRole, setDemoRole] = useState<UserRole | null>(readDemoRole);
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

  function enterDemo(role: UserRole) {
    localStorage.setItem(DEMO_KEY, role);
    setDemoRole(role);
  }

  async function signOut() {
    if (demoRole) {
      localStorage.removeItem(DEMO_KEY);
      setDemoRole(null);
      return;
    }
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } finally {
      clearAuth();
    }
  }

  return (
    <AuthContext.Provider value={(() => {
      const demoProfile = !session && demoRole ? DEMO_PROFILES[demoRole] : null;
      const p = profile ?? demoProfile;
      return {
        isDemo: !!demoProfile,
        enterDemo,
        session,
        user: session?.user ?? null,
        profile: p,
        role: p?.role ?? null,
        entityId: p?.entity_id ?? null,
        isLoading: demoProfile ? false : isLoading,
        signOut,
      };
    })()}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
