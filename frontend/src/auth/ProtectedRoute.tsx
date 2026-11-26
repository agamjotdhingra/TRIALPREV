import { Redirect } from 'wouter';
import { useAuth, type UserRole } from './AuthContext';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { session, role, isLoading, isDemo } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center glow-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
          <p className="text-sm font-medium text-ink-3">Loading Prevntiv…</p>
        </div>
      </div>
    );
  }

  if (!session && !isDemo) return <Redirect to="/welcome" />;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Redirect to="/unauthorized" />;
  }

  return <>{children}</>;
}
