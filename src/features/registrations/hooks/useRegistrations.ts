import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStudentStore } from '../store/studentStore';
import { saveStudentToSupabase, syncAllStudentsToSupabase } from '../api/registrationsApi';
import type { StudentRecord } from '../types';

interface UseRegistrationsProps {
  editionId: string;
}

export function useRegistrations({ editionId }: UseRegistrationsProps) {
  const queryClient = useQueryClient();
  const { students, updateStudent, addStudent } = useStudentStore();

  const saveMutation = useMutation({
    mutationFn: async (student: StudentRecord) => {
      // 1. Salva no banco de dados Supabase de forma atômica
      const result = await saveStudentToSupabase(editionId, student);

      // 2. Atualiza o store local (Zustand com persistência em localStorage para offline)
      if (!student.id) {
        addStudent(student);
      } else {
        updateStudent(student);
      }

      return result;
    },
    onSuccess: () => {
      // 3. Invalida caches do React Query para atualizar contadores e dashboards em tempo real
      void queryClient.invalidateQueries({ queryKey: ['cash-summary', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['registration-payment-statuses', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['registrations-count', editionId] });
    },
  });

  const syncAllMutation = useMutation({
    mutationFn: async (studentsToSync: StudentRecord[]) => {
      return syncAllStudentsToSupabase(editionId, studentsToSync);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cash-summary', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['registration-payment-statuses', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['registrations-count', editionId] });
    },
  });

  return {
    students,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
    saveStudent: saveMutation.mutateAsync,
    isSyncing: syncAllMutation.isPending,
    syncAllStudents: syncAllMutation.mutateAsync,
  };
}
