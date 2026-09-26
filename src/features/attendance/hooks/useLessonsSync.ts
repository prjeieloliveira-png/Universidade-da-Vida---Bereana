import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActiveEdition } from '@/shared/hooks/useActiveEdition';
import { useLessonStore } from '../store/lessonStore';
import { fetchLessonsFromSupabase, updateLessonInSupabase } from '../api/lessonsApi';
import type { WeekNumber } from '../types';

/**
 * Carrega os temas/datas das aulas do Supabase para o `lessonStore` (que antes
 * só vivia no localStorage) e expõe `saveLesson` para persistir edições.
 */
export function useLessonsSync() {
  const { data: activeEdition } = useActiveEdition();
  const editionId = activeEdition?.id;
  const queryClient = useQueryClient();
  const hydrateLessons = useLessonStore((s) => s.hydrateLessons);
  const updateLessonLocal = useLessonStore((s) => s.updateLesson);

  const { data: remoteLessons } = useQuery({
    queryKey: ['lessons', editionId],
    queryFn: () => fetchLessonsFromSupabase(editionId as string),
    enabled: !!editionId,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (remoteLessons && remoteLessons.length > 0) {
      hydrateLessons(remoteLessons);
    }
  }, [remoteLessons, hydrateLessons]);

  const saveMutation = useMutation({
    mutationFn: async ({
      weekNumber,
      updates,
    }: {
      weekNumber: WeekNumber;
      updates: { title: string; theme: string; dateStr: string };
    }) => {
      if (!editionId) throw new Error('Edição ativa não encontrada.');
      await updateLessonInSupabase(editionId, weekNumber, updates);
      return { weekNumber, updates };
    },
    onSuccess: ({ weekNumber, updates }) => {
      // Atualização otimista local + invalida para refletir em outras abas/dispositivos
      updateLessonLocal(weekNumber, updates);
      void queryClient.invalidateQueries({ queryKey: ['lessons', editionId] });
    },
  });

  return {
    saveLesson: (weekNumber: WeekNumber, updates: { title: string; theme: string; dateStr: string }) =>
      saveMutation.mutateAsync({ weekNumber, updates }),
    isSavingLesson: saveMutation.isPending,
    saveLessonError: saveMutation.error,
  };
}
