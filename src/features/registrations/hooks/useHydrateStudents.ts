import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStudentStore } from '../store/studentStore';
import { DEFAULT_EDITION_ID, fetchStudentsFromSupabase } from '../api/registrationsApi';

/**
 * Busca os inscritos (com a presença real s1..s9) da edição ativa no Supabase
 * e hidrata o `studentStore` global. O merge com marcações locais ainda não
 * sincronizadas é feito dentro de `setStudents` (fila offline otimista).
 */
export function useHydrateStudents(editionId?: string) {
  const setStudents = useStudentStore((s) => s.setStudents);
  const targetEditionId = editionId || DEFAULT_EDITION_ID;

  const query = useQuery({
    queryKey: ['students', targetEditionId],
    queryFn: () => fetchStudentsFromSupabase(targetEditionId),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (query.data && query.data.length > 0) {
      setStudents(query.data);
    }
  }, [query.data, setStudents]);

  return query;
}
