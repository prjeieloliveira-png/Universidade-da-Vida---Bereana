import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { unmaskPhone } from '@/shared/utils/phone';
import type {
  TeamMemberWithDetails,
  CreateTeamMemberInput,
  UpdateTeamMemberInput,
} from '../types/teams';

import { fetchTeamMembersWithDetails } from '../api/fetchTeamMembers';

export function useTeamMembers(editionId: string | undefined) {
  const queryClient = useQueryClient();

  const membersQuery = useQuery<TeamMemberWithDetails[]>({
    queryKey: ['team-members', editionId],
    queryFn: async () => {
      if (!editionId) return [];
      return fetchTeamMembersWithDetails(editionId);
    },
    enabled: !!editionId,
    staleTime: 30_000,
  });

  const addMemberMutation = useMutation({
    mutationFn: async (input: CreateTeamMemberInput) => {
      if (!editionId) throw new Error('Turma ativa não selecionada');
      const cleanPhone = unmaskPhone(input.phone);
      let targetPersonId = input.personId;

      // Se personId não foi passado, verificar se já existe pessoa com este telefone
      if (!targetPersonId) {
        const { data: existingPeople } = await supabase
          .from('people')
          .select('id, full_name, phone')
          .eq('phone', cleanPhone)
          .limit(1);

        if (existingPeople && existingPeople.length > 0 && existingPeople[0]) {
          targetPersonId = existingPeople[0].id;
        } else {
          // Inserir nova pessoa
          const { data: newPerson, error: insertPersonError } = await supabase
            .from('people')
            .insert({
              full_name: input.fullName.trim(),
              phone: cleanPhone,
            })
            .select('id')
            .single();

          if (insertPersonError) throw insertPersonError;
          targetPersonId = newPerson.id;
        }
      }

      // Inserir o membro na equipe da turma
      const { data: newMember, error: insertMemberError } = await supabase
        .from('team_members')
        .insert({
          edition_id: editionId,
          team_role_id: input.teamRoleId,
          person_id: targetPersonId,
          notes: input.notes?.trim() || null,
          active: true,
          is_courtesy: input.isCourtesy ?? false,
        })
        .select('id')
        .single();

      if (insertMemberError) {
        if (insertMemberError.code === '23505') {
          throw new Error('Esta pessoa já está cadastrada nesta equipe para esta turma.');
        }
        throw insertMemberError;
      }

      return newMember;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team-members', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['team-attendance-summary', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['team-member-payment-statuses', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['cash-summary', editionId] });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: async (input: UpdateTeamMemberInput) => {
      const cleanPhone = unmaskPhone(input.phone);

      // Buscar person_id do membro
      const { data: memberData, error: fetchError } = await supabase
        .from('team_members')
        .select('person_id')
        .eq('id', input.id)
        .single();

      if (fetchError) throw fetchError;

      // Atualizar dados da pessoa
      const { error: personError } = await supabase
        .from('people')
        .update({
          full_name: input.fullName.trim(),
          phone: cleanPhone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memberData.person_id);

      if (personError) throw personError;

      // Atualizar dados do membro na equipe
      const updatePayload: {
        team_role_id: string;
        notes: string | null;
        active: boolean;
        updated_at: string;
        is_courtesy?: boolean;
      } = {
        team_role_id: input.teamRoleId,
        notes: input.notes?.trim() || null,
        active: input.active ?? true,
        updated_at: new Date().toISOString(),
      };
      if (input.isCourtesy !== undefined) {
        updatePayload.is_courtesy = input.isCourtesy;
      }

      const { error: memberError } = await supabase
        .from('team_members')
        .update(updatePayload)
        .eq('id', input.id);

      if (memberError) throw memberError;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team-members', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['team-member-payment-statuses', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['cash-summary', editionId] });
    },
  });

  const toggleCourtesyMutation = useMutation({
    mutationFn: async ({ memberId, isCourtesy }: { memberId: string; isCourtesy: boolean }) => {
      const { error } = await supabase.rpc('set_team_member_courtesy', {
        p_team_member_id: memberId,
        p_is_courtesy: isCourtesy,
      });
      if (error) {
        // Fallback direto caso a RPC ainda não esteja disponível no backend
        const { error: directError } = await supabase
          .from('team_members')
          .update({ is_courtesy: isCourtesy, updated_at: new Date().toISOString() })
          .eq('id', memberId);
        if (directError) throw error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team-members', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['team-member-payment-statuses', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['cash-summary', editionId] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ memberId, active }: { memberId: string; active: boolean }) => {
      const { data, error } = await supabase
        .from('team_members')
        .update({ active, updated_at: new Date().toISOString() })
        .eq('id', memberId)
        .select('id, active');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Membro não encontrado ou sem permissão para atualizar.');
      }
      return data[0];
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team-members', editionId] });
    },
  });

  const moveTeamMutation = useMutation({
    mutationFn: async ({
      memberId,
      newTeamRoleId,
    }: {
      memberId: string;
      newTeamRoleId: string;
    }) => {
      const { data, error } = await supabase
        .from('team_members')
        .update({
          team_role_id: newTeamRoleId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memberId)
        .select('id');

      if (error) {
        if (error.code === '23505') {
          throw new Error('A pessoa já possui cadastro nesta equipe de destino.');
        }
        throw error;
      }
      if (!data || data.length === 0) {
        throw new Error('Membro não encontrado para transferência.');
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team-members', editionId] });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from('team_members').delete().eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team-members', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['team-attendance-matrix', editionId] });
    },
  });

  return {
    members: membersQuery.data ?? [],
    isLoading: membersQuery.isLoading,
    isError: membersQuery.isError,
    error: membersQuery.error,
    refetch: membersQuery.refetch,
    addMember: addMemberMutation.mutateAsync,
    isAdding: addMemberMutation.isPending,
    updateMember: updateMemberMutation.mutateAsync,
    isUpdating: updateMemberMutation.isPending,
    toggleActive: toggleActiveMutation.mutateAsync,
    isTogglingActive: toggleActiveMutation.isPending,
    toggleCourtesy: toggleCourtesyMutation.mutateAsync,
    isTogglingCourtesy: toggleCourtesyMutation.isPending,
    moveTeam: moveTeamMutation.mutateAsync,
    isMoving: moveTeamMutation.isPending,
    deleteMember: deleteMemberMutation.mutateAsync,
    isDeleting: deleteMemberMutation.isPending,
  };
}

export { searchPersonByPhone } from '../utils/personSearch';
