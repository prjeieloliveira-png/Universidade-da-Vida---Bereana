import { supabase } from '@/shared/lib/supabase';
import type { StudentRecord } from '../types';

export const DEFAULT_EDITION_ID = '33333333-3333-3333-3333-333333333333';

export interface SyncRpcResult {
  synced: number;
  skipped: number;
}

function calculateAge(birthDateStr: string | null): number {
  if (!birthDateStr) return 0;
  const parts = birthDateStr.split('-');
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return 0;
  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1;
  const birthDay = parseInt(parts[2], 10);
  const today = new Date(2026, 8, 20);
  let age = today.getFullYear() - birthYear;
  const m = today.getMonth() - birthMonth;
  if (m < 0 || (m === 0 && today.getDate() < birthDay)) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * `v_registration_payment_status.status` retorna 'paid' | 'partial' | 'pending'
 * (minúsculas). Parcial conta como pendente, igual aos totais de `v_cash_summary`.
 */
export function isPaidPaymentStatus(status?: string | null): boolean {
  return status?.toLowerCase() === 'paid';
}

export function formatStudentForSync(s: StudentRecord) {
  let birthDate = s.birthDate?.trim();
  if (!birthDate || birthDate === '' || isNaN(Date.parse(birthDate))) {
    birthDate = '2000-01-01';
  }

  return {
    full_name: s.name.trim(),
    birth_date: birthDate,
    gender: s.gender || 'Feminino',
    marital_status: s.maritalStatus || 'Solteiro',
    phone: s.phone && s.phone !== '—' ? s.phone.trim() : '—',
    address: s.address && s.address !== '—' ? s.address.trim() : null,
    shirt_size: s.shirtSize && s.shirtSize !== '—' ? s.shirtSize : null,
    pastor: s.pastor && s.pastor !== 'ALL' ? s.pastor : null,
    g12: s.g12 && s.g12 !== 'ALL' ? s.g12 : null,
    leader: s.leader && s.leader !== 'ALL' ? s.leader : null,
    photo_url: s.photoUrl || null,
    comorbidity: s.comorbidity && s.comorbidity !== 'Não' ? s.comorbidity : null,
    med_schedule: s.medSchedule && s.medSchedule !== 'Não' ? s.medSchedule : null,
  };
}

/**
 * Busca todos os inscritos da edição ativa no Supabase, trazendo dados de pessoas e saúde
 */
export async function fetchStudentsFromSupabase(
  editionId?: string
): Promise<StudentRecord[]> {
  const targetEditionId = editionId || DEFAULT_EDITION_ID;

  const { data, error } = await supabase
    .from('registrations')
    .select(`
      id,
      person_id,
      edition_id,
      status,
      shirt_size,
      pastor_name,
      g12_leader,
      cell_leader,
      created_at,
      people!inner (
        id,
        full_name,
        birth_date,
        gender,
        marital_status,
        phone,
        address,
        photo_url,
        health_records (
          has_condition,
          condition_description,
          medication_schedule
        )
      )
    `)
    .eq('edition_id', targetEditionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar inscritos no Supabase:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Busca status de pagamento para cada inscrição
  const { data: paymentStatuses } = await supabase
    .from('v_registration_payment_status')
    .select('registration_id, status, total_paid_cents')
    .eq('edition_id', targetEditionId);

  const paymentMap = new Map<string, { status: string; totalPaid: number }>();
  paymentStatuses?.forEach((p) => {
    if (p.registration_id) {
      paymentMap.set(p.registration_id, {
        status: p.status || 'pending',
        totalPaid: p.total_paid_cents || 0,
      });
    }
  });

  return data.map((row, index) => {
    const person = Array.isArray(row.people) ? row.people[0] : row.people;
    const health = person?.health_records
      ? Array.isArray(person.health_records)
        ? person.health_records[0]
        : person.health_records
      : null;

    const payment = paymentMap.get(row.id);
    const isPaid = isPaidPaymentStatus(payment?.status);

    return {
      id: row.id,
      cohortId: 'turma-01',
      personId: row.person_id,
      num: index + 1,
      name: person?.full_name || 'Sem Nome',
      gender: (person?.gender as 'Masculino' | 'Feminino') || 'Feminino',
      birthDate: person?.birth_date || '2000-01-01',
      age: calculateAge(person?.birth_date || null),
      maritalStatus: (person?.marital_status as 'Solteiro' | 'Casado' | 'Viúvo' | 'Divorciado') || 'Solteiro',
      phone: person?.phone || '—',
      address: person?.address || '—',
      shirtSize: row.shirt_size || '—',
      pastor: row.pastor_name || 'Pra. Socorro Paiva',
      g12: row.g12_leader || '',
      leader: row.cell_leader || '',
      status: isPaid ? 'Pago' : 'Pendente',
      paymentMethod: isPaid ? 'PIX' : '—',
      amountCents: 20000,
      comorbidity: health?.condition_description || 'Não',
      medSchedule: health?.medication_schedule || 'Não',
      photoUrl: person?.photo_url || undefined,
      s1: false,
      s2: false,
      s3: false,
      s4: false,
      s5: false,
      s6: false,
      s7: false,
      s8: false,
      s9: false,
    };
  });
}

/**
 * Persiste um único aluno de forma atômica no Supabase (people + registrations)
 */
export async function saveStudentToSupabase(
  editionId: string | undefined,
  student: StudentRecord
): Promise<SyncRpcResult> {
  const targetEditionId = editionId || DEFAULT_EDITION_ID;
  const payload = [formatStudentForSync(student)];

  const { data, error } = await (
    supabase as unknown as {
      rpc: (
        fn: string,
        args: { p_edition_id: string; p_data: typeof payload }
      ) => Promise<{ data: unknown; error: unknown }>;
    }
  ).rpc('sync_students_from_local', {
    p_edition_id: targetEditionId,
    p_data: payload,
  });

  if (error) {
    console.error('Erro ao salvar aluno no Supabase:', error);
    throw error as Error;
  }

  return (data as SyncRpcResult) || { synced: 1, skipped: 0 };
}

export interface DeleteRegistrationResult {
  personDeleted: boolean;
  attendancesDeleted: number;
}

/**
 * Exclui a inscrição via RPC `delete_registration` (apenas coordenação/secretaria).
 * O banco bloqueia a exclusão quando há pagamentos válidos.
 */
export async function deleteRegistration(registrationId: string): Promise<DeleteRegistrationResult> {
  const { data, error } = await supabase.rpc('delete_registration', {
    p_registration_id: registrationId,
  });

  if (error) {
    console.error('Erro ao excluir inscrição:', error);
    if (error.hint === 'has_payments') {
      throw new Error('Este aluno tem pagamentos registrados. Estorne no Financeiro antes de excluir.');
    }
    if (error.code === '42501') {
      throw new Error('Apenas coordenação ou secretaria pode excluir inscritos.');
    }
    throw new Error('Não foi possível excluir o inscrito. Verifique a conexão e tente novamente.');
  }

  const result = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  return {
    personDeleted: result.person_deleted === true,
    attendancesDeleted: typeof result.attendances_deleted === 'number' ? result.attendances_deleted : 0,
  };
}
