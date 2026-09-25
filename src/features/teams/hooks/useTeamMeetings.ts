import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import type {
  TeamMeetingWithDetails,
  CreateTeamMeetingInput,
  UpdateTeamMeetingInput,
} from '../types/teams';

interface RawMeetingData {
  id: string;
  edition_id: string;
  meeting_date: string;
  title: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  team_meeting_roles: { team_role_id: string }[] | null;
}

export function useTeamMeetings(editionId: string | undefined) {
  const queryClient = useQueryClient();

  const meetingsQuery = useQuery<TeamMeetingWithDetails[]>({
    queryKey: ['team-meetings', editionId],
    queryFn: async () => {
      if (!editionId) return [];

      // 1. Buscar reuniões e as equipes convocadas (sem select(*))
      const { data: rawMeetings, error: meetingsError } = await supabase
        .from('team_meetings')
        .select(
          `
          id, edition_id, meeting_date, title, notes, created_by, created_at,
          team_meeting_roles!team_meeting_roles_meeting_id_fkey(team_role_id)
        `
        )
        .eq('edition_id', editionId)
        .order('meeting_date', { ascending: false });

      if (meetingsError) throw meetingsError;

      // 2. Buscar membros ativos da edição para calcular convocados
      const { data: activeMembers, error: membersError } = await supabase
        .from('team_members')
        .select('id, team_role_id')
        .eq('edition_id', editionId)
        .eq('active', true);

      if (membersError) throw membersError;

      // 3. Buscar todas as presenças marcadas nestas reuniões
      const meetingIds = (rawMeetings ?? []).map((m) => m.id);
      const { data: attendances, error: attendancesError } =
        meetingIds.length > 0
          ? await supabase
              .from('team_meeting_attendances')
              .select('meeting_id, team_member_id, present')
              .in('meeting_id', meetingIds)
          : { data: [], error: null };

      if (attendancesError) throw attendancesError;

      // Mapear presenças por reunião
      const attendanceByMeeting = new Map<string, number>();
      (attendances ?? []).forEach((att) => {
        if (att.present) {
          attendanceByMeeting.set(
            att.meeting_id,
            (attendanceByMeeting.get(att.meeting_id) ?? 0) + 1
          );
        }
      });

      const meetings: TeamMeetingWithDetails[] = (
        (rawMeetings ?? []) as unknown as RawMeetingData[]
      ).map((row) => {
        const convocadasRoleIds = (row.team_meeting_roles ?? []).map((r) => r.team_role_id);
        const calledMembers = (activeMembers ?? []).filter((m) =>
          convocadasRoleIds.includes(m.team_role_id)
        );
        const calledCount = calledMembers.length;
        const attendedCount = attendanceByMeeting.get(row.id) ?? 0;
        const percentage = calledCount > 0 ? Math.round((attendedCount / calledCount) * 100) : 0;

        return {
          id: row.id,
          editionId: row.edition_id,
          meetingDate: row.meeting_date,
          title: row.title,
          notes: row.notes,
          createdBy: row.created_by,
          createdAt: row.created_at,
          convocadasRoleIds,
          attendanceSummary: {
            calledCount,
            attendedCount,
            percentage,
          },
        };
      });

      return meetings;
    },
    enabled: !!editionId,
    staleTime: 30_000,
  });

  const createMeetingMutation = useMutation({
    mutationFn: async (input: CreateTeamMeetingInput) => {
      if (!editionId) throw new Error('Turma ativa não selecionada');

      // 1. Criar reunião
      const { data: newMeeting, error: meetingError } = await supabase
        .from('team_meetings')
        .insert({
          edition_id: editionId,
          meeting_date: input.meetingDate,
          title: input.title?.trim() || null,
          notes: input.notes?.trim() || null,
        })
        .select('id')
        .single();

      if (meetingError) throw meetingError;

      // 2. Conectar equipes convocadas
      if (input.roleIds.length > 0) {
        const rolePayload = input.roleIds.map((roleId) => ({
          meeting_id: newMeeting.id,
          team_role_id: roleId,
        }));

        const { error: rolesError } = await supabase.from('team_meeting_roles').insert(rolePayload);

        if (rolesError) throw rolesError;
      }

      return newMeeting;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team-meetings', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['team-members', editionId] });
    },
  });

  const updateMeetingMutation = useMutation({
    mutationFn: async (input: UpdateTeamMeetingInput) => {
      // 1. Atualizar dados básicos
      const { error: meetingError } = await supabase
        .from('team_meetings')
        .update({
          meeting_date: input.meetingDate,
          title: input.title?.trim() || null,
          notes: input.notes?.trim() || null,
        })
        .eq('id', input.id);

      if (meetingError) throw meetingError;

      // 2. Atualizar equipes convocadas: apaga e recria
      const { error: deleteRolesError } = await supabase
        .from('team_meeting_roles')
        .delete()
        .eq('meeting_id', input.id);

      if (deleteRolesError) throw deleteRolesError;

      if (input.roleIds.length > 0) {
        const rolePayload = input.roleIds.map((roleId) => ({
          meeting_id: input.id,
          team_role_id: roleId,
        }));

        const { error: insertRolesError } = await supabase
          .from('team_meeting_roles')
          .insert(rolePayload);

        if (insertRolesError) throw insertRolesError;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team-meetings', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['team-members', editionId] });
    },
  });

  const deleteMeetingMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      const { error } = await supabase.from('team_meetings').delete().eq('id', meetingId);

      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team-meetings', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['team-members', editionId] });
    },
  });

  return {
    meetings: meetingsQuery.data ?? [],
    isLoading: meetingsQuery.isLoading,
    isError: meetingsQuery.isError,
    error: meetingsQuery.error,
    refetch: meetingsQuery.refetch,
    createMeeting: createMeetingMutation.mutateAsync,
    isCreating: createMeetingMutation.isPending,
    updateMeeting: updateMeetingMutation.mutateAsync,
    isUpdating: updateMeetingMutation.isPending,
    deleteMeeting: deleteMeetingMutation.mutateAsync,
    isDeleting: deleteMeetingMutation.isPending,
  };
}

/**
 * Função utilitária para checar se a reunião já possui presenças marcadas
 */
export async function countMeetingAttendances(meetingId: string): Promise<number> {
  const { count, error } = await supabase
    .from('team_meeting_attendances')
    .select('id', { count: 'exact', head: true })
    .eq('meeting_id', meetingId)
    .eq('present', true);

  if (error) throw error;
  return count ?? 0;
}
