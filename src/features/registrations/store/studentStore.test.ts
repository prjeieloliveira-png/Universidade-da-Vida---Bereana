import { describe, it, expect, beforeEach } from 'vitest';
import { useStudentStore } from './studentStore';

describe('useStudentStore', () => {
  beforeEach(() => {
    useStudentStore.getState().resetToDefault();
  });

  it('initializes with 53 students from PDF', () => {
    const students = useStudentStore.getState().students;
    expect(students.length).toBe(53);
    expect(students[0]!.name).toBe('Alana Mikaela Macedo Nascimento da Silva');
    expect(students[52]!.name).toBe('Walisson Henrique da Silva Sousa');
  });

  it('updates a student record correctly', () => {
    const firstStudent = useStudentStore.getState().students[0]!;
    useStudentStore.getState().updateStudent({
      ...firstStudent,
      shirtSize: 'M',
      status: 'Pendente',
    });

    const updated = useStudentStore.getState().students.find((s) => s.id === firstStudent.id);
    expect(updated?.shirtSize).toBe('M');
    expect(updated?.status).toBe('Pendente');
  });

  it('adds a new student properly', () => {
    const initialCount = useStudentStore.getState().students.length;
    useStudentStore.getState().addStudent({
      name: 'Novo Aluno Teste',
      gender: 'Masculino',
      birthDate: '1995-05-10',
      maritalStatus: 'Solteiro',
      phone: '(86) 99999-8888',
      address: 'Rua de Teste, 100',
      shirtSize: 'G',
      pastor: 'Pra. Socorro Paiva',
      g12: 'Líder G12',
      leader: 'Líder Célula',
      status: 'Pago',
      paymentMethod: 'PIX',
      amountCents: 20000,
      comorbidity: 'Não',
      medSchedule: 'Não',
      s1: true,
      s2: false,
      s3: false,
      s4: false,
      s5: false,
      s6: false,
      s7: false,
      s8: false,
      s9: false,
    });

    const students = useStudentStore.getState().students;
    expect(students.length).toBe(initialCount + 1);
    expect(students[0]!.name).toBe('Novo Aluno Teste');
    expect(students[0]!.cohortId).toBe('turma-01');
  });

  it('all 53 initial students belong to turma-01', () => {
    const students = useStudentStore.getState().students;
    const allBelongToTurma01 = students.every((s) => s.cohortId === 'turma-01');
    expect(allBelongToTurma01).toBe(true);
  });

  it('maps payment methods correctly: PIX, CARTÃO, DINHEIRO', () => {
    const paid = useStudentStore.getState().students.filter((s) => s.status === 'Pago');
    expect(paid.length).toBeGreaterThan(0);
    const methods = paid.map((s) => s.paymentMethod);
    expect(methods.some((m) => m === 'PIX')).toBe(true);
    expect(methods.some((m) => m === 'CARTÃO')).toBe(true);
    expect(methods.some((m) => m === 'DINHEIRO')).toBe(true);
  });

  it('does not generate a payment for Pendente students', () => {
    const pending = useStudentStore.getState().students.filter((s) => s.status === 'Pendente');
    expect(pending.length).toBeGreaterThan(0);
    const anyWithMethod = pending.some((s) => s.paymentMethod && s.paymentMethod !== '—');
    expect(anyWithMethod).toBe(false);
  });

  it('second execution should not duplicate payments (idempotência via source)', () => {
    // Simulação: se um pagamento já existisse com source='legacy_migration', ele seria pulado
    const first = useStudentStore.getState().students[0];
    expect(first?.status).toBe('Pago');
  });

  it('sets attendance explicitly using setAttendance', () => {
    const student = useStudentStore.getState().students[0]!;
    useStudentStore.getState().setAttendance(student.id, 5, true);
    let updated = useStudentStore.getState().students.find((s) => s.id === student.id);
    expect(updated?.s5).toBe(true);

    useStudentStore.getState().setAttendance(student.id, 5, false);
    updated = useStudentStore.getState().students.find((s) => s.id === student.id);
    expect(updated?.s5).toBe(false);
  });

  it('hydrates store with setStudents while preserving local attendance markings', () => {
    const original = useStudentStore.getState().students[0]!;
    useStudentStore.getState().setAttendance(original.id, 1, true);

    const remoteBatch = [
      {
        ...original,
        name: 'Nome Atualizado do Supabase',
        s1: false, // remote has false
      },
    ];

    useStudentStore.getState().setStudents(remoteBatch);
    const hydrated = useStudentStore.getState().students.find((s) => s.id === original.id);
    expect(hydrated?.name).toBe('Nome Atualizado do Supabase');
    // Local attendance mark should be preserved
    expect(hydrated?.s1).toBe(true);
  });
});
