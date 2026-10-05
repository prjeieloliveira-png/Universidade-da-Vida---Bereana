import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import type { TeamMemberAttendanceItem } from '../types/teams';
import { readPendingTeamAttendance, useTeamAttendanceSync } from './useTeamAttendanceSync';

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

      // 3. Registros reais (presença E falta confirmada) — sem linha = não registrado
      const { data: rawLog, error: logError } = await supabase
        .from('v_team_attendance_log')
        .select('team_member_id, present, note, marked_at, marked_by_name')
        .eq('meeting_id', meetingId);

      if (logError) throw logError;

      const logMap = new Map<
        string,
        { present: boolean; note: string | null; markedAt: string | null; markedByName: string | null }
      >();
      (rawLog ?? []).forEach((row) => {
        if (!row.team_member_id || row.present === null) return;
        logMap.set(row.team_member_id, {
          present: row.present,
          note: row.note,
          markedAt: row.marked_at,
          markedByName: row.marked_by_name,
        });
      });

      const membersList = ((rawMembers ?? []) as unknown as RawMemberInfo[]).map((m) => {
        const att = logMap.get(m.id);
        return {
          memberId: m.id,
          personName: m.people?.full_name ?? 'Sem nome',
          personPhone: m.people?.phone ?? '',
          teamRoleId: m.team_role_id,
          teamRoleName: m.team_roles?.name ?? 'Equipe',
          sortOrder: m.team_roles?.sort_order ?? 999,
          present: att ? att.present : null,
          markedAt: att?.markedAt ?? null,
          note: att?.note ?? null,
          markedByName: att?.markedByName ?? null,
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

  const invalidateSummaries = () => {
    void queryClient.invalidateQueries({ queryKey });
    void queryClient.invalidateQueries({ queryKey: ['team-meetings', editionId] });
    void queryClient.invalidateQueries({ queryKey: ['team-members', editionId] });
  };

  const { syncStatus, pendingCount, flushQueue, markAttendance } =
    useTeamAttendanceSync(invalidateSummaries);

  // Marcações ainda pendentes (offline) aparecem na hora por cima do que veio do banco
  const items = useMemo(() => {
    const base = attendanceQuery.data ?? [];
    if (pendingCount === 0) return base;
    const pending = readPendingTeamAttendance(meetingId);
    return base.map((item) => {
      const p = pending.get(item.memberId);
      return p
        ? { ...item, present: p.present, note: p.note ?? null, markedAt: new Date(p.timestamp).toISOString() }
        : item;
    });
  }, [attendanceQuery.data, pendingCount, meetingId, syncStatus]);

  return {
    items,
    isLoading: attendanceQuery.isLoading,
    isError: attendanceQuery.isError,
    error: attendanceQuery.error,
    syncStatus,
    pendingCount,
    flushQueue,
    markAttendance: (memberId: string, present: boolean, note?: string) =>
      markAttendance(meetingId, memberId, present, note),
  };
}
