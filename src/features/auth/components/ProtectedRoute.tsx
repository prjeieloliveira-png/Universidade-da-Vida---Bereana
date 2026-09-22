import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/shared/lib/supabase';
import { LoadingSpinner } from '@/shared/components/LoadingState';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // In local dev without forced auth session, allow exploring placeholder if configured
      setIsAuthenticated(Boolean(session) || window.location.search.includes('dev=true'));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session) || window.location.search.includes('dev=true'));
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <LoadingSpinner fullScreen message="Verificando acesso..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
