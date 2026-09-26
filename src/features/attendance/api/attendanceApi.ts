import { supabase } from '@/shared/lib/supabase';

export interface AttendancePayloadItem {
  full_name: string;
  birth_date: string;
  session_number: number;
  present: boolean;
  /** Justificativa opcional, usada principalmente em faltas. */
  note?: string;
}

export interface AttendanceRecordResult {
  success: boolean;
  attendance_id?: string;
  registration_id?: string;
  lesson_id?: string;
  session_number?: number;
  present?: boolean;
  error?: string;
}

export interface AttendanceBatchResult {
  synced: number;
  skipped: number;
}

export interface AttendanceMatrixRow {
  registration_id: string;
  edition_id: string;
  person_id: string;
  full_name: string;
  birth_date: string;
  s1: boolean;
  s2: boolean;
  s3: boolean;
  s4: boolean;
  s5: boolean;
  s6: boolean;
  s7: boolean;
  s8: boolean;
  s9: boolean;
  total_present: number;
}

/**
 * Registra a presença de um único aluno no Supabase de forma atômica
 */
export async function recordAttendanceInSupabase(params: {
  editionId: string;
  sessionNumber: number;
  fullName: string;
  birthDate: string;
  present: boolean;
  note?: string;
}): Promise<AttendanceRecordResult> {
  const { data, error } = await (
    supabase as unknown as {
      rpc: (
        fn: string,
        args: {
          p_edition_id: string;
          p_session_number: number;
          p_full_name: string;
          p_birth_date: string;
          p_present: boolean;
          p_note?: string;
        }
      ) => Promise<{ data: unknown; error: unknown }>;
    }
  ).rpc('record_attendance_rpc', {
    p_edition_id: params.editionId,
    p_session_number: params.sessionNumber,
    p_full_name: params.fullName.trim(),
    p_birth_date: params.birthDate,
    p_present: params.present,
    p_note: params.note?.trim() || undefined,
  });

  if (error) {
    console.error('Erro ao registrar presença no Supabase:', error);
    throw error as Error;
  }

  return (data as AttendanceRecordResult) || { success: true };
}

/**
 * Sincroniza um lote de presenças no Supabase (utilizado para esvaziar a fila offline)
 */
export async function syncBatchAttendancesToSupabase(params: {
  editionId: string;
  items: AttendancePayloadItem[];
}): Promise<AttendanceBatchResult> {
  if (params.items.length === 0) {
    return { synced: 0, skipped: 0 };
  }

  const { data, error } = await (
    supabase as unknown as {
      rpc: (
        fn: string,
        args: {
          p_edition_id: string;
          p_items: AttendancePayloadItem[];
        }
      ) => Promise<{ data: unknown; error: unknown }>;
    }
  ).rpc('sync_attendances_rpc', {
    p_edition_id: params.editionId,
    p_items: params.items,
  });

  if (error) {
    console.error('Erro na sincronização em lote de presenças no Supabase:', error);
    throw error as Error;
  }

  return (data as AttendanceBatchResult) || { synced: params.items.length, skipped: 0 };
}

/**
 * Consulta a matriz de presenças de todas as 9 semanas direto do Supabase
 */
export async function fetchAttendanceMatrixFromSupabase(
  editionId: string
): Promise<AttendanceMatrixRow[]> {
  const { data, error } = await supabase
    .from('v_edition_attendance_matrix')
    .select(
      'registration_id, edition_id, person_id, full_name, birth_date, s1, s2, s3, s4, s5, s6, s7, s8, s9, total_present'
    )
    .eq('edition_id', editionId);

  if (error) {
    console.error('Erro ao buscar matriz de presença do Supabase:', error);
    throw error as Error;
  }

  return (data as AttendanceMatrixRow[]) || [];
}

export interface RegistrationAbsenceCount {
  registration_id: string;
  absence_count: number;
}

/**
 * Contagem de faltas explicitamente registradas por inscrição (present=false
 * em `attendances`). Semanas ainda não registradas não entram na contagem.
 */
export async function fetchAbsenceCounts(editionId: string): Promise<RegistrationAbsenceCount[]> {
  const { data, error } = await supabase
    .from('v_registration_absence_count')
    .select('registration_id, absence_count')
    .eq('edition_id', editionId);

  if (error) {
    console.error('Erro ao buscar contagem de faltas:', error);
    throw error;
  }

  return (data || [])
    .filter((row): row is { registration_id: string; absence_count: number } => !!row.registration_id)
    .map((row) => ({ registration_id: row.registration_id, absence_count: row.absence_count ?? 0 }));
}
