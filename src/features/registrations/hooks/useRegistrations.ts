import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStudentStore } from '../store/studentStore';
import { DEFAULT_EDITION_ID, saveStudentToSupabase } from '../api/registrationsApi';
import { useHydrateStudents } from './useHydrateStudents';
import type { StudentRecord } from '../types';

interface UseRegistrationsProps {
  editionId?: string;
}

export function useRegistrations({ editionId }: UseRegistrationsProps) {
  const queryClient = useQueryClient();
  const { students, updateStudent, addStudent } = useStudentStore();
  const targetEditionId = editionId || DEFAULT_EDITION_ID;

  // 1. Busca alunos da edição ativa no Supabase (com presença real) e hidrata o Zustand store
  const {
    isLoading: isLoadingStudents,
    isRefetching: isRefetchingStudents,
    error: fetchError,
    refetch: refetchStudents,
  } = useHydrateStudents(targetEditionId);

  // 3. Mutação de salvamento atômico no Supabase
  const saveMutation = useMutation({
    mutationFn: async (student: StudentRecord) => {
      const result = await saveStudentToSupabase(targetEditionId, student);

      if (!student.id) {
        addStudent(student);
      } else {
        updateStudent(student);
      }

      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['students', targetEditionId] });
      void queryClient.invalidateQueries({ queryKey: ['cash-summary', targetEditionId] });
      void queryClient.invalidateQueries({ queryKey: ['registration-payment-statuses', targetEditionId] });
      void queryClient.invalidateQueries({ queryKey: ['registrations-count', targetEditionId] });
    },
  });

  return {
    students,
    isLoadingStudents,
    isRefetchingStudents,
    fetchError,
    refetchStudents,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
    saveStudent: saveMutation.mutateAsync,
  };
}
