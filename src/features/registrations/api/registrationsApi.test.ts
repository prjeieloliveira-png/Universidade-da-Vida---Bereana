import { describe, expect, it, vi } from 'vitest';
import { isPaidPaymentStatus, saveStudentToSupabase } from './registrationsApi';
import { supabase } from '@/shared/lib/supabase';
import type { StudentRecord } from '../types';

vi.mock('@/shared/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe('isPaidPaymentStatus', () => {
  it('considera pago apenas o status "paid" da view', () => {
    expect(isPaidPaymentStatus('paid')).toBe(true);
    expect(isPaidPaymentStatus('PAID')).toBe(true);
  });

  it('trata parcial, pendente e ausente como não pagos', () => {
    expect(isPaidPaymentStatus('partial')).toBe(false);
    expect(isPaidPaymentStatus('pending')).toBe(false);
    expect(isPaidPaymentStatus(undefined)).toBe(false);
    expect(isPaidPaymentStatus(null)).toBe(false);
  });
});

describe('saveStudentToSupabase', () => {
  const baseStudent: StudentRecord = {
    id: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d',
    personId: '11111111-2222-4333-8444-555555555555',
    cohortId: 'turma-01',
    num: 1,
    name: 'João Silva Santos',
    gender: 'Masculino',
    birthDate: '1995-05-10',
    age: 31,
    maritalStatus: 'Casado',
    phone: '(86) 99999-8888',
    address: 'Rua das Flores, 123',
    shirtSize: 'G',
    pastor: 'Pra. Socorro Paiva',
    g12: 'Líder G12',
    leader: 'Líder Célula',
    status: 'Pago',
    paymentMethod: 'PIX',
    amountCents: 20000,
    comorbidity: 'Não',
    medSchedule: 'Não',
    photoUrl: 'https://example.com/photo.jpg',
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

  it('chama upsert_student_registration passando person_id e registration_id de aluno existente', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: {
        person_id: baseStudent.personId,
        registration_id: baseStudent.id,
        success: true,
      },
      error: null,
    });
    vi.mocked(supabase.rpc).mockImplementation(mockRpc);

    const result = await saveStudentToSupabase('33333333-3333-3333-3333-333333333333', baseStudent);

    expect(mockRpc).toHaveBeenCalledWith('upsert_student_registration', {
      p_edition_id: '33333333-3333-3333-3333-333333333333',
      p_full_name: 'João Silva Santos',
      p_birth_date: '1995-05-10',
      p_gender: 'Masculino',
      p_marital_status: 'Casado',
      p_phone: '(86) 99999-8888',
      p_address: 'Rua das Flores, 123',
      p_photo_url: 'https://example.com/photo.jpg',
      p_shirt_size: 'G',
      p_pastor_name: 'Pra. Socorro Paiva',
      p_g12_leader: 'Líder G12',
      p_cell_leader: 'Líder Célula',
      p_has_condition: false,
      p_condition_description: undefined,
      p_medication_schedule: undefined,
      p_person_id: '11111111-2222-4333-8444-555555555555',
      p_registration_id: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d',
    });

    expect(result).toEqual({
      personId: '11111111-2222-4333-8444-555555555555',
      registrationId: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d',
      success: true,
    });
  });

  it('não envia IDs se forem inválidos ou de novo cadastro', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: {
        person_id: 'new-person-uuid',
        registration_id: 'new-reg-uuid',
        success: true,
      },
      error: null,
    });
    vi.mocked(supabase.rpc).mockImplementation(mockRpc);

    const newStudent: StudentRecord = {
      ...baseStudent,
      id: '',
      personId: 'person-1', // não é UUID
    };

    const result = await saveStudentToSupabase('33333333-3333-3333-3333-333333333333', newStudent);

    expect(mockRpc).toHaveBeenCalledWith(
      'upsert_student_registration',
      expect.objectContaining({
        p_person_id: undefined,
        p_registration_id: undefined,
      })
    );

    expect(result.personId).toBe('new-person-uuid');
    expect(result.registrationId).toBe('new-reg-uuid');
  });
});
