import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import type { Database } from '@/shared/types/database';

export type UserRole = Database['public']['Enums']['user_role'];

export interface UserRoleState {
  role: UserRole;
  isCoordOrSec: boolean;
  isCoordinator: boolean;
  isSecretary: boolean;
  isNetworkLeader: boolean;
  isViewer: boolean;
  fullName: string;
  email: string;
  isLoading: boolean;
}

export function useUserRole(): UserRoleState {
  const { data, isLoading } = useQuery({
    queryKey: ['current-user-role'],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const isDev =
        typeof window !== 'undefined' &&
        (window.location.search.includes('dev=true') ||
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1');

      if (!session) {
        if (isDev) {
          return {
            role: 'coordinator' as UserRole,
            fullName: 'Pr. Jeiel Oliveira (Dev)',
            email: 'admin@bereana.com',
          };
        }
        return null;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name, email')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error || !profile) {
        // Fallback para metadata do usuário se o perfil não estiver populado
        const metaRole = (session.user.app_metadata?.role ||
          session.user.user_metadata?.role ||
          (isDev ? 'coordinator' : 'viewer')) as UserRole;

        return {
          role: metaRole,
          fullName:
            (session.user.user_metadata?.full_name as string) ||
            session.user.email ||
            'Usuário',
          email: session.user.email || '',
        };
      }

      return {
        role: profile.role,
        fullName: profile.full_name,
        email: profile.email,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const role: UserRole = data?.role ?? 'coordinator';
  const isCoordOrSec = role === 'coordinator' || role === 'secretary';

  return {
    role,
    isCoordOrSec,
    isCoordinator: role === 'coordinator',
    isSecretary: role === 'secretary',
    isNetworkLeader: role === 'network_leader',
    isViewer: role === 'viewer',
    fullName: data?.fullName ?? 'Usuário',
    email: data?.email ?? '',
    isLoading,
  };
}
