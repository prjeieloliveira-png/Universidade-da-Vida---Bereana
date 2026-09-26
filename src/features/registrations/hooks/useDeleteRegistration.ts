import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStudentStore } from '../store/studentStore';
import { DEFAULT_EDITION_ID, deleteRegistration } from '../api/registrationsApi';

export function useDeleteRegistration(editionId?: string) {
  const queryClient = useQueryClient();
  const removeStudent = useStudentStore((s) => s.removeStudent);
  const targetEditionId = editionId || DEFAULT_EDITION_ID;

  return useMutation({
    mutationFn: (registrationId: string) => deleteRegistration(registrationId),
    onSuccess: (_result, registrationId) => {
      removeStudent(registrationId);
      void queryClient.invalidateQueries({ queryKey: ['students', targetEditionId] });
      void queryClient.invalidateQueries({ queryKey: ['cash-summary', targetEditionId] });
      void queryClient.invalidateQueries({ queryKey: ['registration-payment-statuses', targetEditionId] });
      void queryClient.invalidateQueries({ queryKey: ['registrations-count', targetEditionId] });
    },
  });
}
