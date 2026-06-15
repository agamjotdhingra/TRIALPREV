import { useLocation, Redirect } from 'wouter';
import { useAuth, type UserRole } from './AuthContext';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { session, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading HealthOS...</p>
        </div>
      </div>
    );
  }

  if (!session) return <Redirect to="/auth/login" />;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Redirect to="/unauthorized" />;
  }

  return <>{children}</>;
}
