import { formatCentsToBRL } from '@/shared/utils/currency';
import { formatPhone, unmaskPhone } from '@/shared/utils/phone';
import { sortByName } from '@/shared/utils/sortByName';
import type { TeamMemberWithDetails } from '@/features/teams/types/teams';
import type { ReportColumn, ReportGroup } from '../types';

export interface TeamReportRow {
  id: string;
  personId: string;
  name: string;
  phone: string;
  rawPhone: string;
  teamRoleId: string;
  teamRoleName: string;
  teamRoleOrder: number;
  active: boolean;
  statusLabel: 'Ativo' | 'Inativo';
  isCourtesy: boolean;
  courtesyLabel: 'Sim' | 'Não';
  attendanceFraction: string;
  attendancePercentage: number;
  attendanceTotalCalled: number;
  attendanceAttended: number;
  paymentStatus: 'paid' | 'partial' | 'pending' | 'courtesy';
  paymentStatusLabel: 'Pago' | 'Parcial' | 'Pendente' | 'Cortesia';
  feeCents: number;
  paidCents: number;
  outstandingCents: number;
  notes: string;
}

export function toTeamReportRows(members: TeamMemberWithDetails[]): TeamReportRow[] {
  return members.map((m) => {
    const isCourtesy = m.isCourtesy || m.payment?.status === 'courtesy';
    const paymentStatus = isCourtesy ? 'courtesy' : m.payment?.status ?? 'pending';

    let paymentStatusLabel: 'Pago' | 'Parcial' | 'Pendente' | 'Cortesia' = 'Pendente';
    if (isCourtesy) {
      paymentStatusLabel = 'Cortesia';
    } else if (paymentStatus === 'paid') {
      paymentStatusLabel = 'Pago';
    } else if (paymentStatus === 'partial') {
      paymentStatusLabel = 'Parcial';
    }

    return {
      id: m.id,
      personId: m.personId,
      name: m.person.fullName,
      phone: formatPhone(m.person.phone) || '—',
      rawPhone: m.person.phone,
      teamRoleId: m.teamRoleId,
      teamRoleName: m.teamRole.name,
      teamRoleOrder: m.teamRole.sortOrder,
      active: m.active,
      statusLabel: m.active ? 'Ativo' : 'Inativo',
      isCourtesy,
      courtesyLabel: isCourtesy ? 'Sim' : 'Não',
      attendanceFraction: m.attendance.fraction || '0/0',
      attendancePercentage: m.attendance.percentage ?? 0,
      attendanceTotalCalled: m.attendance.totalCalled ?? 0,
      attendanceAttended: m.attendance.attended ?? 0,
      paymentStatus,
      paymentStatusLabel,
      feeCents: m.payment?.registrationFeeCents ?? 0,
      paidCents: m.payment?.totalPaidCents ?? 0,
      outstandingCents: m.payment?.outstandingCents ?? 0,
      notes: m.notes?.trim() || '',
    };
  });
}

const money = (cents: number | undefined) => (cents === undefined ? '' : formatCentsToBRL(cents));

export const TEAM_REPORT_COLUMNS: ReportColumn<TeamReportRow>[] = [
  {
    id: 'teamRoleOrder',
    label: 'Ordem',
    value: (r) => String(r.teamRoleOrder),
    align: 'center',
    nowrap: true,
  },
  {
    id: 'teamRoleName',
    label: 'Equipe',
    value: (r) => r.teamRoleName,
    defaultVisible: true,
  },
  {
    id: 'name',
    label: 'Nome do Voluntário',
    value: (r) => r.name,
    defaultVisible: true,
  },
  {
    id: 'phone',
    label: 'Telefone',
    value: (r) => (r.phone === '—' ? '' : r.phone),
    nowrap: true,
    defaultVisible: true,
  },
  {
    id: 'status',
    label: 'Situação',
    value: (r) => r.statusLabel,
    align: 'center',
    nowrap: true,
    defaultVisible: true,
  },
  {
    id: 'courtesy',
    label: 'Cortesia',
    value: (r) => r.courtesyLabel,
    align: 'center',
    nowrap: true,
  },
  {
    id: 'attendance',
    label: 'Frequência',
    value: (r) => r.attendanceFraction,
    align: 'center',
    nowrap: true,
    defaultVisible: true,
  },
  {
    id: 'attendancePercentage',
    label: '% Presença',
    value: (r) => `${r.attendancePercentage}%`,
    align: 'center',
    nowrap: true,
  },
  {
    id: 'paymentStatus',
    label: 'Pagamento',
    value: (r) => r.paymentStatusLabel,
    align: 'center',
    nowrap: true,
  },
  {
    id: 'fee',
    label: 'Taxa',
    value: (r) => money(r.feeCents),
    align: 'right',
    nowrap: true,
  },
  {
    id: 'paid',
    label: 'Pago',
    value: (r) => money(r.paidCents),
    align: 'right',
    nowrap: true,
  },
  {
    id: 'outstanding',
    label: 'Saldo',
    value: (r) => money(r.outstandingCents),
    align: 'right',
    nowrap: true,
  },
  {
    id: 'notes',
    label: 'Observações',
    value: (r) => r.notes,
    defaultVisible: true,
  },
];

export const TEAM_SORT_OPTIONS = [
  { value: 'role_then_name', label: 'Equipe > Nome' },
  { value: 'name', label: 'Nome (A-Z)' },
  { value: 'attendance_desc', label: 'Maior Frequência' },
  { value: 'attendance_asc', label: 'Menor Frequência' },
];

export const TEAM_GROUP_OPTIONS = [
  { value: 'role', label: 'Por equipe' },
  { value: 'status', label: 'Por situação (Ativo/Inativo)' },
  { value: 'payment', label: 'Por pagamento' },
  { value: 'none', label: 'Sem agrupamento' },
];

const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });

export function sortTeamRows(rows: TeamReportRow[], sortBy: string): TeamReportRow[] {
  if (sortBy === 'name') {
    return sortByName(rows, (r) => r.name);
  }
  if (sortBy === 'attendance_desc') {
    return [...rows].sort(
      (a, b) =>
        b.attendancePercentage - a.attendancePercentage ||
        collator.compare(a.name, b.name)
    );
  }
  if (sortBy === 'attendance_asc') {
    return [...rows].sort(
      (a, b) =>
        a.attendancePercentage - b.attendancePercentage ||
        collator.compare(a.name, b.name)
    );
  }
  // Padrão: Equipe (sortOrder ou nome) > Nome
  return [...rows].sort(
    (a, b) =>
      a.teamRoleOrder - b.teamRoleOrder ||
      collator.compare(a.teamRoleName, b.teamRoleName) ||
      collator.compare(a.name, b.name)
  );
}

export function groupTeamRows(rows: TeamReportRow[], groupBy: string): ReportGroup<TeamReportRow>[] {
  if (groupBy === 'status') {
    const active = rows.filter((r) => r.active);
    const inactive = rows.filter((r) => !r.active);
    const groups: ReportGroup<TeamReportRow>[] = [];
    if (active.length > 0) groups.push({ key: 'active', label: 'Voluntários Ativos', rows: active });
    if (inactive.length > 0) groups.push({ key: 'inactive', label: 'Voluntários Inativos', rows: inactive });
    return groups.length > 0 ? groups : [{ key: 'all', label: '', rows: [] }];
  }

  if (groupBy === 'payment') {
    const map = new Map<string, TeamReportRow[]>();
    rows.forEach((r) => {
      const key = r.paymentStatusLabel;
      map.set(key, [...(map.get(key) ?? []), r]);
    });
    const order = ['Pago', 'Parcial', 'Pendente', 'Cortesia'];
    return order
      .filter((k) => map.has(k))
      .map((k) => ({
        key: k,
        label: `Status: ${k}`,
        rows: map.get(k) ?? [],
      }));
  }

  if (groupBy === 'role') {
    const map = new Map<string, { roleName: string; order: number; rows: TeamReportRow[] }>();
    rows.forEach((r) => {
      const existing = map.get(r.teamRoleId);
      if (existing) {
        existing.rows.push(r);
      } else {
        map.set(r.teamRoleId, {
          roleName: r.teamRoleName,
          order: r.teamRoleOrder,
          rows: [r],
        });
      }
    });

    return Array.from(map.entries())
      .sort(([, a], [, b]) => a.order - b.order || collator.compare(a.roleName, b.roleName))
      .map(([key, data]) => ({
        key,
        label: `${data.order}. ${data.roleName}`,
        rows: data.rows,
      }));
  }

  return [{ key: 'all', label: '', rows }];
}

export interface TeamReportFilterState {
  searchQuery: string;
  roleId: string;
  activeStatus: 'ALL' | 'active' | 'inactive';
  paymentStatus: 'ALL' | 'paid' | 'pending' | 'courtesy';
  courtesy: 'ALL' | 'yes' | 'no';
}

export const initialTeamReportFilterState: TeamReportFilterState = {
  searchQuery: '',
  roleId: 'ALL',
  activeStatus: 'ALL',
  paymentStatus: 'ALL',
  courtesy: 'ALL',
};

export function filterTeamRows(rows: TeamReportRow[], filters: TeamReportFilterState): TeamReportRow[] {
  const q = filters.searchQuery.trim().toLowerCase();
  const cleanQ = unmaskPhone(filters.searchQuery);

  return rows.filter((row) => {
    if (filters.roleId !== 'ALL' && row.teamRoleId !== filters.roleId) {
      return false;
    }

    if (filters.activeStatus === 'active' && !row.active) {
      return false;
    }
    if (filters.activeStatus === 'inactive' && row.active) {
      return false;
    }

    if (filters.paymentStatus === 'paid' && (row.isCourtesy || row.paymentStatus !== 'paid')) {
      return false;
    }
    if (filters.paymentStatus === 'pending' && (row.isCourtesy || row.paymentStatus === 'paid')) {
      return false;
    }
    if (filters.paymentStatus === 'courtesy' && !row.isCourtesy) {
      return false;
    }

    if (filters.courtesy === 'yes' && !row.isCourtesy) {
      return false;
    }
    if (filters.courtesy === 'no' && row.isCourtesy) {
      return false;
    }

    if (q) {
      const matchName = row.name.toLowerCase().includes(q);
      const matchPhone = cleanQ ? row.rawPhone.includes(cleanQ) : false;
      const matchNotes = row.notes.toLowerCase().includes(q);
      const matchRole = row.teamRoleName.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchNotes && !matchRole) {
        return false;
      }
    }

    return true;
  });
}
