import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import type { TeamRoleRow } from '../types/teams';

export function useTeamRoles() {
  const queryClient = useQueryClient();

  const rolesQuery = useQuery<TeamRoleRow[]>({
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

  const createRoleMutation = useMutation({
    mutationFn: async (name: string) => {
      const currentRoles = rolesQuery.data ?? [];
      const nextSortOrder =
        currentRoles.reduce((max, r) => Math.max(max, r.sort_order), 0) + 1;

      const { data, error } = await supabase
        .from('team_roles')
        .insert({ name: name.trim(), sort_order: nextSortOrder })
        .select('id')
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Já existe uma equipe com esse nome.');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team-roles'] });
    },
  });

  const renameRoleMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from('team_roles')
        .update({ name: name.trim() })
        .eq('id', id);

      if (error) {
        if (error.code === '23505') {
          throw new Error('Já existe uma equipe com esse nome.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team-roles'] });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('team_roles').delete().eq('id', id);

      if (error) {
        if (error.code === '23503') {
          throw new Error(
            'Não é possível excluir: esta equipe possui membros vinculados. Mova ou remova os membros primeiro.'
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team-roles'] });
    },
  });

  return {
    roles: rolesQuery.data ?? [],
    isLoading: rolesQuery.isLoading,
    isError: rolesQuery.isError,
    error: rolesQuery.error,
    refetch: rolesQuery.refetch,
    createRole: createRoleMutation.mutateAsync,
    isCreating: createRoleMutation.isPending,
    renameRole: renameRoleMutation.mutateAsync,
    isRenaming: renameRoleMutation.isPending,
    deleteRole: deleteRoleMutation.mutateAsync,
    isDeleting: deleteRoleMutation.isPending,
  };
}
