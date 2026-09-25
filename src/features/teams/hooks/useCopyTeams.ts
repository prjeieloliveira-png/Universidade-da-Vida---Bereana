import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import type { Database } from '@/shared/types/database';

type EditionRow = Database['public']['Tables']['editions']['Row'];

export interface PreviewMember {
  id: string;
  teamRoleId: string;
  teamRoleName: string;
  sortOrder: number;
  personId: string;
  personName: string;
  personPhone: string;
  notes: string | null;
}

interface RawPreviewData {
  id: string;
  team_role_id: string;
  person_id: string;
  notes: string | null;
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

export function useCopyTeams(targetEditionId: string | undefined) {
  const queryClient = useQueryClient();

  // Buscar todas as edições para preencher o seletor de turma de origem
  const editionsQuery = useQuery<EditionRow[]>({
    queryKey: ['all-editions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select(
          'id, name, year, code, start_date, end_date, encounter_date, registration_fee_cents, total_lessons, target_students, status, is_active, created_at'
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as EditionRow[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Função para buscar prévia dos membros da turma de origem
  const fetchSourcePreview = async (sourceEditionId: string): Promise<PreviewMember[]> => {
    if (!sourceEditionId) return [];

    const { data: raw, error } = await supabase
      .from('team_members')
      .select(
        `
        id, team_role_id, person_id, notes,
        people!team_members_person_id_fkey(id, full_name, phone),
        team_roles!team_members_team_role_id_fkey(id, name, sort_order)
      `
      )
      .eq('edition_id', sourceEditionId)
      .eq('active', true);

    if (error) throw error;

    const list = ((raw ?? []) as unknown as RawPreviewData[]).map((r) => ({
      id: r.id,
      teamRoleId: r.team_role_id,
      teamRoleName: r.team_roles?.name ?? 'Equipe',
      sortOrder: r.team_roles?.sort_order ?? 999,
      personId: r.person_id,
      personName: r.people?.full_name ?? 'Sem nome',
      personPhone: r.people?.phone ?? '',
      notes: r.notes,
    }));

    list.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.personName.localeCompare(b.personName);
    });

    return list;
  };

  // Mutação para executar a cópia
  const copyMutation = useMutation({
    mutationFn: async ({
      sourceEditionId,
      selectedPersonIds,
    }: {
      sourceEditionId: string;
      selectedPersonIds?: string[];
    }) => {
      if (!targetEditionId) throw new Error('Turma de destino não definida');
      if (sourceEditionId === targetEditionId) {
        throw new Error('A turma de origem não pode ser a mesma da turma atual.');
      }

      // 1. Buscar membros ativos da turma de origem
      const sourceMembers = await fetchSourcePreview(sourceEditionId);
      const membersToCopy = selectedPersonIds
        ? sourceMembers.filter((m) => selectedPersonIds.includes(m.personId))
        : sourceMembers;

      if (membersToCopy.length === 0) {
        return { copied: 0, skipped: 0 };
      }

      // 2. Buscar membros já existentes na turma de destino para não duplicar
      const { data: existing, error: existingError } = await supabase
        .from('team_members')
        .select('team_role_id, person_id')
        .eq('edition_id', targetEditionId);

      if (existingError) throw existingError;

      const existingSet = new Set((existing ?? []).map((e) => `${e.team_role_id}:${e.person_id}`));

      const toInsert = membersToCopy
        .filter((m) => !existingSet.has(`${m.teamRoleId}:${m.personId}`))
        .map((m) => ({
          edition_id: targetEditionId,
          team_role_id: m.teamRoleId,
          person_id: m.personId,
          notes: m.notes,
          active: true,
        }));

      let copiedCount = 0;
      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from('team_members').insert(toInsert);

        if (insertError) throw insertError;
        copiedCount = toInsert.length;
      }

      return {
        copied: copiedCount,
        skipped: membersToCopy.length - copiedCount,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team-members', targetEditionId] });
      void queryClient.invalidateQueries({
        queryKey: ['team-attendance-summary', targetEditionId],
      });
    },
  });

  return {
    editions: editionsQuery.data ?? [],
    isEditionsLoading: editionsQuery.isLoading,
    fetchSourcePreview,
    copyTeams: copyMutation.mutateAsync,
    isCopying: copyMutation.isPending,
  };
}
