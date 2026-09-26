import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStudentStore } from '../store/studentStore';
import {
  DEFAULT_EDITION_ID,
  fetchStudentsFromSupabase,
  saveStudentToSupabase,
} from '../api/registrationsApi';
import type { StudentRecord } from '../types';

interface UseRegistrationsProps {
  editionId?: string;
}

export function useRegistrations({ editionId }: UseRegistrationsProps) {
  const queryClient = useQueryClient();
  const { students, updateStudent, addStudent, setStudents } = useStudentStore();
  const targetEditionId = editionId || DEFAULT_EDITION_ID;

  // 1. Busca alunos da edição ativa diretamente do Supabase via TanStack Query
  const {
    data: remoteStudents,
    isLoading: isLoadingStudents,
    isRefetching: isRefetchingStudents,
    error: fetchError,
    refetch: refetchStudents,
  } = useQuery({
    queryKey: ['students', targetEditionId],
    queryFn: () => fetchStudentsFromSupabase(targetEditionId),
    staleTime: 60_000,
  });

  // 2. Quando os dados remotos chegam, hidrata e sincroniza o Zustand store (para offline e reatividade global)
  useEffect(() => {
    if (remoteStudents && remoteStudents.length > 0) {
      setStudents(remoteStudents);
    }
  }, [remoteStudents, setStudents]);

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
