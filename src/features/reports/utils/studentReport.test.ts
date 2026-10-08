import { describe, it, expect } from 'vitest';
import {
  STUDENT_REPORT_COLUMNS,
  groupStudentRows,
  sortStudentRows,
  toStudentReportRows,
  type StudentReportRow,
} from './studentReport';
import { buildCsv } from './csv';
import type { StudentRecord } from '@/features/registrations/types';

const base = (over: Partial<StudentRecord>): StudentRecord => ({
  id: 'r1', personId: 'p1', num: 1, name: 'Ana', gender: 'Feminino', birthDate: '2000-05-17', age: 26,
  maritalStatus: 'Solteiro', phone: '(86) 99999-0000', address: 'Rua A', shirtSize: 'M',
  pastor: 'Pr. B', g12: 'G12 X', leader: 'Líder Y', status: 'Pendente', paymentMethod: 'PIX',
  amountCents: 20000, comorbidity: 'Não', medSchedule: 'Não',
  s1: true, s2: true, s3: false, s4: false, s5: false, s6: false, s7: false, s8: false, s9: false,
  ...over,
});

const rows = (list: Partial<StudentRecord>[]): StudentReportRow[] =>
  toStudentReportRows(list.map(base), undefined);

describe('studentReport', () => {
  it('usa o status da view de pagamentos e mostra o abatimento da quitação', () => {
    const result = toStudentReportRows([base({ id: 'r1' })], [
      {
        registration_id: 'r1', edition_id: 'e', person_id: 'p1', registration_fee_cents: 20000,
        total_paid_cents: 12000, outstanding_cents: 0, status: 'paid', payment_count: 1,
        last_payment_at: null, waived_cents: 8000, settled_at: '2026-10-09T00:00:00Z', settled_note: null,
      },
    ]);
    const col = (id: string) => STUDENT_REPORT_COLUMNS.find((c) => c.id === id)!;
    expect(result[0]?.status).toBe('Pago');
    expect(col('paymentStatus').value(result[0]!)).toMatch(/Quitado \(abatimento R\$\s*80,00\)/);
    expect(col('paid').value(result[0]!)).toMatch(/120,00/);
  });

  it('formata colunas simples e conta presenças', () => {
    const [row] = rows([{}]);
    const col = (id: string) => STUDENT_REPORT_COLUMNS.find((c) => c.id === id)!;
    expect(col('birthDate').value(row!)).toBe('17/05/2000');
    expect(col('presences').value(row!)).toBe('2/9');
  });

  it('marca comorbidade e medicação como restritas', () => {
    const restricted = STUDENT_REPORT_COLUMNS.filter((c) => c.restricted).map((c) => c.id);
    expect(restricted).toEqual(['comorbidity', 'medSchedule']);
  });

  it('ordena por hierarquia e por número', () => {
    const list = rows([
      { id: 'a', num: 3, name: 'Zé', pastor: 'Pr. B', g12: 'G2', leader: 'L1' },
      { id: 'b', num: 1, name: 'Bia', pastor: 'Pr. A', g12: 'G9', leader: 'L1' },
      { id: 'c', num: 2, name: 'Ana', pastor: 'Pr. B', g12: 'G1', leader: 'L1' },
    ]);
    expect(sortStudentRows(list, 'hierarchy').map((r) => r.name)).toEqual(['Bia', 'Ana', 'Zé']);
    expect(sortStudentRows(list, 'num').map((r) => r.name)).toEqual(['Bia', 'Ana', 'Zé']);
  });

  it('agrupa por G12 com rótulo "Sem G12" por último', () => {
    const list = rows([
      { id: 'a', name: 'A', g12: '' },
      { id: 'b', name: 'B', g12: 'Beta' },
      { id: 'c', name: 'C', g12: 'Alfa' },
    ]);
    const groups = groupStudentRows(list, 'g12');
    expect(groups.map((g) => g.label)).toEqual(['G12: Alfa', 'G12: Beta', 'G12: Sem G12']);
    expect(groupStudentRows(list, 'none')).toHaveLength(1);
  });

  it('gera CSV com BOM, ";" e aspas escapadas, incluindo a coluna de grupo', () => {
    const list = rows([{ name: 'Maria "Dudu"', g12: 'Alfa' }]);
    const csv = buildCsv(
      STUDENT_REPORT_COLUMNS.filter((c) => c.id === 'name' || c.id === 'g12'),
      groupStudentRows(list, 'g12'),
      { groupLabel: 'Grupo', showRowNumbers: true }
    );
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv.replace('\uFEFF', '').split('\n')[0]).toBe('"#";"Grupo";"Nome";"G12"');
    expect(csv.split('\n')[1]).toBe('"1";"G12: Alfa";"Maria ""Dudu""";"Alfa"');
  });
});
