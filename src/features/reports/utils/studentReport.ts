import { formatCentsToBRL } from '@/shared/utils/currency';
import { sortByName } from '@/shared/utils/sortByName';
import type { StudentRecord } from '@/features/registrations/types';
import type { RegistrationPaymentStatusRow } from '@/features/financial/types';
import type { ReportColumn, ReportGroup } from '../types';

export interface StudentReportRow extends StudentRecord {
  payment: {
    feeCents: number;
    paidCents: number;
    outstandingCents: number;
    waivedCents: number;
    status: 'paid' | 'partial' | 'pending';
  } | null;
}

export function toStudentReportRows(
  students: StudentRecord[],
  statuses: RegistrationPaymentStatusRow[] | undefined
): StudentReportRow[] {
  const byRegistration = new Map<string, RegistrationPaymentStatusRow>();
  statuses?.forEach((s) => {
    byRegistration.set(s.registration_id, s);
    if (s.person_id) byRegistration.set(s.person_id, s);
  });

  return students.map((s) => {
    const st = byRegistration.get(s.id) ?? byRegistration.get(s.personId);
    if (!st) return { ...s, payment: null };
    return {
      ...s,
      // mesma regra de Inscrições: o status vem da view de pagamentos
      status: st.status === 'paid' ? 'Pago' : 'Pendente',
      payment: {
        feeCents: st.registration_fee_cents,
        paidCents: st.total_paid_cents,
        outstandingCents: st.outstanding_cents,
        waivedCents: st.waived_cents,
        status: st.status,
      },
    };
  });
}

const formatDate = (iso: string): string => {
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
};

function paymentLabel(row: StudentReportRow): string {
  if (!row.payment) return row.status;
  if (row.payment.status === 'paid') {
    return row.payment.waivedCents > 0
      ? `Quitado (abatimento ${formatCentsToBRL(row.payment.waivedCents)})`
      : 'Pago';
  }
  return row.payment.status === 'partial' ? 'Parcial' : 'Pendente';
}

const money = (cents: number | undefined) => (cents === undefined ? '' : formatCentsToBRL(cents));

export const STUDENT_REPORT_COLUMNS: ReportColumn<StudentReportRow>[] = [
  { id: 'num', label: 'Nº', value: (r) => String(r.num), align: 'center', nowrap: true, defaultVisible: true },
  { id: 'name', label: 'Nome', value: (r) => r.name, defaultVisible: true },
  { id: 'phone', label: 'Telefone', value: (r) => (r.phone === '—' ? '' : r.phone), nowrap: true, defaultVisible: true },
  { id: 'pastor', label: 'Pastor', value: (r) => r.pastor, defaultVisible: true },
  { id: 'g12', label: 'G12', value: (r) => r.g12, defaultVisible: true },
  { id: 'leader', label: 'Líder', value: (r) => r.leader, defaultVisible: true },
  { id: 'address', label: 'Endereço', value: (r) => r.address },
  { id: 'birthDate', label: 'Nascimento', value: (r) => formatDate(r.birthDate), align: 'center', nowrap: true },
  { id: 'age', label: 'Idade', value: (r) => String(r.age), align: 'center', nowrap: true },
  { id: 'gender', label: 'Sexo', value: (r) => r.gender },
  { id: 'maritalStatus', label: 'Estado civil', value: (r) => r.maritalStatus },
  { id: 'shirtSize', label: 'Camiseta', value: (r) => (r.shirtSize === '—' ? '' : r.shirtSize), align: 'center', nowrap: true },
  { id: 'paymentStatus', label: 'Pagamento', value: paymentLabel },
  { id: 'fee', label: 'Taxa', value: (r) => money(r.payment?.feeCents), align: 'right', nowrap: true },
  { id: 'paid', label: 'Pago', value: (r) => money(r.payment?.paidCents), align: 'right', nowrap: true },
  { id: 'outstanding', label: 'Saldo', value: (r) => money(r.payment?.outstandingCents), align: 'right', nowrap: true },
  {
    id: 'presences',
    label: 'Presenças',
    value: (r) =>
      `${[r.s1, r.s2, r.s3, r.s4, r.s5, r.s6, r.s7, r.s8, r.s9].filter(Boolean).length}/9`,
    align: 'center',
    nowrap: true,
  },
  { id: 'comorbidity', label: 'Comorbidade', value: (r) => r.comorbidity, restricted: true },
  { id: 'medSchedule', label: 'Medicação', value: (r) => r.medSchedule, restricted: true },
];

export const STUDENT_SORT_OPTIONS = [
  { value: 'name', label: 'Nome (A-Z)' },
  { value: 'num', label: 'Número' },
  { value: 'hierarchy', label: 'Pastor > G12 > Líder' },
];

export const STUDENT_GROUP_OPTIONS = [
  { value: 'none', label: 'Sem agrupamento' },
  { value: 'pastor', label: 'Por pastor' },
  { value: 'g12', label: 'Por G12' },
  { value: 'leader', label: 'Por líder' },
];

const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });

export function sortStudentRows(rows: StudentReportRow[], sortBy: string): StudentReportRow[] {
  if (sortBy === 'num') return [...rows].sort((a, b) => a.num - b.num);
  if (sortBy === 'hierarchy') {
    return [...rows].sort(
      (a, b) =>
        collator.compare(a.pastor, b.pastor) ||
        collator.compare(a.g12, b.g12) ||
        collator.compare(a.leader, b.leader) ||
        collator.compare(a.name, b.name)
    );
  }
  return sortByName(rows, (r) => r.name);
}

const GROUP_FIELD = { pastor: 'Pastor', g12: 'G12', leader: 'Líder' } as const;

export function groupStudentRows(rows: StudentReportRow[], groupBy: string): ReportGroup<StudentReportRow>[] {
  if (groupBy !== 'pastor' && groupBy !== 'g12' && groupBy !== 'leader') {
    return [{ key: 'all', label: '', rows }];
  }
  const map = new Map<string, StudentReportRow[]>();
  rows.forEach((r) => {
    const key = r[groupBy].trim();
    map.set(key, [...(map.get(key) ?? []), r]);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => (a === '' ? 1 : b === '' ? -1 : collator.compare(a, b)))
    .map(([key, groupRows]) => ({
      key: key || '__none',
      label: `${GROUP_FIELD[groupBy]}: ${key || 'Sem ' + GROUP_FIELD[groupBy]}`,
      rows: groupRows,
    }));
}
