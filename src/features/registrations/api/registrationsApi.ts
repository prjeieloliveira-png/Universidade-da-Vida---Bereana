import { supabase } from '@/shared/lib/supabase';
import type { StudentRecord } from '../types';

export interface SyncRpcResult {
  synced: number;
  skipped: number;
}

export function formatStudentForSync(s: StudentRecord) {
  return {
    full_name: s.name.trim(),
    birth_date: s.birthDate,
    gender: s.gender,
    marital_status: s.maritalStatus || 'Solteiro',
    phone: s.phone && s.phone !== '—' ? s.phone.trim() : '—',
    address: s.address && s.address !== '—' ? s.address.trim() : null,
    shirt_size: s.shirtSize && s.shirtSize !== '—' ? s.shirtSize : null,
    pastor: s.pastor && s.pastor !== 'ALL' ? s.pastor : null,
    g12: s.g12 && s.g12 !== 'ALL' ? s.g12 : null,
    leader: s.leader && s.leader !== 'ALL' ? s.leader : null,
  };
}

/**
 * Persiste um único aluno de forma atômica no Supabase (people + registrations)
 */
export async function saveStudentToSupabase(
  editionId: string,
  student: StudentRecord
): Promise<SyncRpcResult> {
  if (!editionId) {
    throw new Error('ID da edição/turma ativa não encontrado');
  }

  const payload = [formatStudentForSync(student)];

  const { data, error } = await (
    supabase as unknown as {
      rpc: (
        fn: string,
        args: { p_edition_id: string; p_data: typeof payload }
      ) => Promise<{ data: unknown; error: unknown }>;
    }
  ).rpc('sync_students_from_local', {
    p_edition_id: editionId,
    p_data: payload,
  });

  if (error) {
    console.error('Erro ao salvar aluno no Supabase:', error);
    throw error as Error;
  }

  return (data as SyncRpcResult) || { synced: 1, skipped: 0 };
}

/**
 * Sincroniza uma lista inteira de alunos para o Supabase
 */
export async function syncAllStudentsToSupabase(
  editionId: string,
  students: StudentRecord[]
): Promise<SyncRpcResult> {
  if (!editionId) {
    throw new Error('ID da edição/turma ativa não encontrado');
  }

  const payload = students.map(formatStudentForSync);

  const { data, error } = await (
    supabase as unknown as {
      rpc: (
        fn: string,
        args: { p_edition_id: string; p_data: typeof payload }
      ) => Promise<{ data: unknown; error: unknown }>;
    }
  ).rpc('sync_students_from_local', {
    p_edition_id: editionId,
    p_data: payload,
  });

  if (error) {
    console.error('Erro na sincronização em massa com o Supabase:', error);
    throw error as Error;
  }

  return (data as SyncRpcResult) || { synced: students.length, skipped: 0 };
}
