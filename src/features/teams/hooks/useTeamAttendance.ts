import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import type { TeamMemberAttendanceItem } from '../types/teams';

interface UseTeamAttendanceParams {
  meetingId: string;
  editionId: string | undefined;
}

interface RawMemberInfo {
  id: string;
  team_role_id: string;
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

export function useTeamAttendance({ meetingId, editionId }: UseTeamAttendanceParams) {
  const queryClient = useQueryClient();
  const queryKey = ['meeting-attendance-sheet', meetingId];

  const attendanceQuery = useQuery<TeamMemberAttendanceItem[]>({
    queryKey,
    queryFn: async () => {
      if (!meetingId || !editionId) return [];

      // 1. Buscar equipes convocadas desta reunião
      const { data: convRoles, error: rolesError } = await supabase
        .from('team_meeting_roles')
        .select('team_role_id')
        .eq('meeting_id', meetingId);

      if (rolesError) throw rolesError;
      const convocadasIds = (convRoles ?? []).map((r) => r.team_role_id);

      if (convocadasIds.length === 0) return [];

      // 2. Buscar membros ativos pertencentes às equipes convocadas (sem select(*))
      const { data: rawMembers, error: membersError } = await supabase
        .from('team_members')
        .select(
          `
          id, team_role_id,
          people!team_members_person_id_fkey(id, full_name, phone),
          team_roles!team_members_team_role_id_fkey(id, name, sort_order)
        `
        )
        .eq('edition_id', editionId)
        .eq('active', true)
        .in('team_role_id', convocadasIds);

      if (membersError) throw membersError;

      // 3. Buscar presenças existentes marcadas para esta reunião
      const { data: rawAttendances, error: attendancesError } = await supabase
        .from('team_meeting_attendances')
        .select('team_member_id, present, marked_at')
        .eq('meeting_id', meetingId);

      if (attendancesError) throw attendancesError;

      const attendanceMap = new Map<string, { present: boolean; markedAt: string | null }>();
      (rawAttendances ?? []).forEach((att) => {
        attendanceMap.set(att.team_member_id, {
          present: att.present,
          markedAt: att.marked_at,
        });
      });

      const membersList = ((rawMembers ?? []) as unknown as RawMemberInfo[]).map((m) => {
        const att = attendanceMap.get(m.id);
        return {
          memberId: m.id,
          personName: m.people?.full_name ?? 'Sem nome',
          personPhone: m.people?.phone ?? '',
          teamRoleId: m.team_role_id,
          teamRoleName: m.team_roles?.name ?? 'Equipe',
          sortOrder: m.team_roles?.sort_order ?? 999,
          present: att?.present ?? false,
          markedAt: att?.markedAt ?? null,
        };
      });

      // Ordenar por ordem da equipe e depois por nome do membro
      membersList.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.personName.localeCompare(b.personName);
      });

      return membersList;
    },
    enabled: !!meetingId && !!editionId,
    staleTime: 10_000,
  });

  // Mutação individual com Optimistic Update
  const toggleAttendanceMutation = useMutation({
    mutationFn: async ({ memberId, present }: { memberId: string; present: boolean }) => {
      const { error } = await supabase.from('team_meeting_attendances').upsert(
        {
          meeting_id: meetingId,
          team_member_id: memberId,
          present,
          marked_at: new Date().toISOString(),
        },
        { onConflict: 'meeting_id,team_member_id' }
      );

      if (error) throw error;
    },
    onMutate: async ({ memberId, present }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<TeamMemberAttendanceItem[]>(queryKey);

      if (previousData) {
        queryClient.setQueryData<TeamMemberAttendanceItem[]>(
          queryKey,
          previousData.map((item) =>
            item.memberId === memberId
              ? { ...item, present, markedAt: new Date().toISOString() }
              : item
          )
        );
      }

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: ['team-meetings', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['team-members', editionId] });
    },
  });

  // Marcação em lote usando a RPC atômica mark_team_attendance_batch
  const batchAttendanceMutation = useMutation({
    mutationFn: async (records: { team_member_id: string; present: boolean }[]) => {
      const { error } = await (
        supabase as unknown as {
          rpc: (
            fn: string,
            args: { p_meeting_id: string; p_records: typeof records }
          ) => Promise<{ data: unknown; error: unknown }>;
        }
      ).rpc('mark_team_attendance_batch', {
        p_meeting_id: meetingId,
        p_records: records,
      });

      if (error) throw error as Error;
    },
    onMutate: async (records) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<TeamMemberAttendanceItem[]>(queryKey);

      if (previousData) {
        const updateMap = new Map<string, boolean>();
        records.forEach((r) => updateMap.set(r.team_member_id, r.present));

        queryClient.setQueryData<TeamMemberAttendanceItem[]>(
          queryKey,
          previousData.map((item) => {
            if (updateMap.has(item.memberId)) {
              return {
                ...item,
                present: updateMap.get(item.memberId)!,
                markedAt: new Date().toISOString(),
              };
            }
            return item;
          })
        );
      }

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: ['team-meetings', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['team-members', editionId] });
    },
  });

  // Helper para marcar todos presentes de uma equipe específica
  const markTeamAllPresent = (teamRoleId: string) => {
    const list = attendanceQuery.data ?? [];
    const teamMembers = list.filter((m) => m.teamRoleId === teamRoleId);
    const records = teamMembers.map((m) => ({
      team_member_id: m.memberId,
      present: true,
    }));
    return batchAttendanceMutation.mutateAsync(records);
  };

  // Helper para marcar todos presentes da reunião inteira
  const markAllPresent = () => {
    const list = attendanceQuery.data ?? [];
    const records = list.map((m) => ({
      team_member_id: m.memberId,
      present: true,
    }));
    return batchAttendanceMutation.mutateAsync(records);
  };

  // Helper para marcar todos ausentes
  const markAllAbsent = () => {
    const list = attendanceQuery.data ?? [];
    const records = list.map((m) => ({
      team_member_id: m.memberId,
      present: false,
    }));
    return batchAttendanceMutation.mutateAsync(records);
  };

  return {
    items: attendanceQuery.data ?? [],
    isLoading: attendanceQuery.isLoading,
    isError: attendanceQuery.isError,
    error: attendanceQuery.error,
    toggleAttendance: toggleAttendanceMutation.mutateAsync,
    isToggling: toggleAttendanceMutation.isPending,
    batchAttendance: batchAttendanceMutation.mutateAsync,
    isBatching: batchAttendanceMutation.isPending,
    markTeamAllPresent,
    markAllPresent,
    markAllAbsent,
  };
}
