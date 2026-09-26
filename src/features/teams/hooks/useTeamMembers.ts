import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { unmaskPhone } from '@/shared/utils/phone';
import type {
  TeamMemberWithDetails,
  CreateTeamMemberInput,
  UpdateTeamMemberInput,
} from '../types/teams';

interface RawMemberData {
  id: string;
  edition_id: string;
  team_role_id: string;
  person_id: string;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  people: {
    id: string;
    full_name: string;
    phone: string;
  } | null;
  team_roles: {
    id: string;
    name: string;
    sort_order: number;
  } | null;
}

export function useTeamMembers(editionId: string | undefined) {
  const queryClient = useQueryClient();

  const membersQuery = useQuery<TeamMemberWithDetails[]>({
    queryKey: ['team-members', editionId],
    queryFn: async () => {
      if (!editionId) return [];

      // 1. Buscar membros com relacionamentos em people e team_roles (sem select(*))
      const { data: rawMembers, error: membersError } = await supabase
        .from('team_members')
        .select(
          `
          id, edition_id, team_role_id, person_id, active, notes, created_at, updated_at,
          people!team_members_person_id_fkey(id, full_name, phone),
          team_roles!team_members_team_role_id_fkey(id, name, sort_order)
        `
        )
        .eq('edition_id', editionId)
        .order('created_at', { ascending: true });

      if (membersError) throw membersError;

      // 2. Buscar dados agregados de presença na view
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('v_team_member_attendance')
        .select(
          'team_member_id, total_called_meetings, attended_meetings, attendance_percentage, attendance_fraction'
        )
        .eq('edition_id', editionId);

      if (attendanceError) throw attendanceError;

      const attendanceMap = new Map<
        string,
        { totalCalled: number; attended: number; percentage: number; fraction: string }
      >();

      (attendanceData ?? []).forEach((att) => {
        if (att.team_member_id) {
          attendanceMap.set(att.team_member_id, {
            totalCalled: att.total_called_meetings ?? 0,
            attended: att.attended_meetings ?? 0,
            percentage: att.attendance_percentage ?? 0,
            fraction: att.attendance_fraction ?? '0/0',
          });
        }
      });

      const members = ((rawMembers ?? []) as unknown as RawMemberData[]).map((row) => {
        const att = attendanceMap.get(row.id) ?? {
          totalCalled: 0,
          attended: 0,
          percentage: 0,
          fraction: '0/0',
        };

        return {
          id: row.id,
          editionId: row.edition_id,
          teamRoleId: row.team_role_id,
          personId: row.person_id,
          active: row.active,
          notes: row.notes,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          person: {
            id: row.people?.id ?? row.person_id,
            fullName: row.people?.full_name ?? 'Sem nome',
            phone: row.people?.phone ?? '',
          },
          teamRole: {
            id: row.team_roles?.id ?? row.team_role_id,
            name: row.team_roles?.name ?? 'Equipe',
            sortOrder: row.team_roles?.sort_order ?? 999,
          },
          attendance: att,
        };
      });

      return members;
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
      const { error: memberError } = await supabase
        .from('team_members')
        .update({
          team_role_id: input.teamRoleId,
          notes: input.notes?.trim() || null,
          active: input.active ?? true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id);

      if (memberError) throw memberError;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team-members', editionId] });
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
    moveTeam: moveTeamMutation.mutateAsync,
    isMoving: moveTeamMutation.isPending,
    deleteMember: deleteMemberMutation.mutateAsync,
    isDeleting: deleteMemberMutation.isPending,
  };
}

/**
 * Função utilitária para busca debounced de pessoas por telefone
 */
export async function searchPersonByPhone(phoneDigits: string) {
  const digits = unmaskPhone(phoneDigits);
  if (digits.length < 8) return null;

  const { data, error } = await supabase
    .from('people')
    .select('id, full_name, phone')
    .ilike('phone', `%${digits}%`)
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}
