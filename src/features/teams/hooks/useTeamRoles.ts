import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import type { TeamRoleRow } from '../types/teams';

export function useTeamRoles() {
  return useQuery<TeamRoleRow[]>({
    queryKey: ['team-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_roles')
        .select('id, name, sort_order, active, created_at')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data ?? []) as TeamRoleRow[];
    },
    staleTime: 10 * 60 * 1000,
  });
}
