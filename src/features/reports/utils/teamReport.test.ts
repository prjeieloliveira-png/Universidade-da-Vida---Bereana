import { describe, it, expect } from 'vitest';
import {
  TEAM_REPORT_COLUMNS,
  filterTeamRows,
  groupTeamRows,
  initialTeamReportFilterState,
  sortTeamRows,
  toTeamReportRows,
} from './teamReport';
import { buildCsv } from './csv';
import type { TeamMemberWithDetails } from '@/features/teams/types/teams';

const mockMember = (over: Partial<TeamMemberWithDetails>): TeamMemberWithDetails => ({
  id: 'm1',
  editionId: 'ed1',
  teamRoleId: 'r1',
  personId: 'p1',
  active: true,
  isCourtesy: false,
  notes: 'Observação teste',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  person: {
    id: 'p1',
    fullName: 'Carlos Silva',
    phone: '86999990001',
  },
  teamRole: {
    id: 'r1',
    name: 'Intercessão',
    sortOrder: 1,
  },
  attendance: {
    totalCalled: 4,
    attended: 3,
    percentage: 75,
    fraction: '3/4',
  },
  payment: {
    status: 'paid',
    isCourtesy: false,
    registrationFeeCents: 5000,
    totalPaidCents: 5000,
    outstandingCents: 0,
    paymentCount: 1,
  },
  ...over,
});

describe('teamReport', () => {
  it('transforma membros em TeamReportRow corretamente com status e valores', () => {
    const member = mockMember({
      isCourtesy: true,
      payment: {
        status: 'courtesy',
        isCourtesy: true,
        registrationFeeCents: 5000,
        totalPaidCents: 0,
        outstandingCents: 0,
        paymentCount: 0,
      },
    });

    const [row] = toTeamReportRows([member]);
    expect(row).toBeDefined();
    expect(row?.name).toBe('Carlos Silva');
    expect(row?.isCourtesy).toBe(true);
    expect(row?.courtesyLabel).toBe('Sim');
    expect(row?.paymentStatusLabel).toBe('Cortesia');
    expect(row?.attendanceFraction).toBe('3/4');

    const col = (id: string) => TEAM_REPORT_COLUMNS.find((c) => c.id === id)!;
    expect(col('name').value(row!)).toBe('Carlos Silva');
    expect(col('courtesy').value(row!)).toBe('Sim');
    expect(col('paymentStatus').value(row!)).toBe('Cortesia');
    expect(col('fee').value(row!)).toMatch(/50,00/);
    expect(col('paid').value(row!)).toMatch(/0,00/);
  });

  it('filtra por busca textual, equipe, status ativo e cortesia', () => {
    const m1 = mockMember({ id: 'm1', person: { id: 'p1', fullName: 'Carlos Silva', phone: '86999990001' } });
    const m2 = mockMember({
      id: 'm2',
      person: { id: 'p2', fullName: 'Bruna Lima', phone: '86988880002' },
      teamRoleId: 'r2',
      teamRole: { id: 'r2', name: 'Recepção', sortOrder: 2 },
      active: false,
    });
    const m3 = mockMember({
      id: 'm3',
      person: { id: 'p3', fullName: 'Daniel Santos', phone: '86977770003' },
      isCourtesy: true,
    });

    const rows = toTeamReportRows([m1, m2, m3]);

    // Busca textual
    expect(filterTeamRows(rows, { ...initialTeamReportFilterState, searchQuery: 'bruna' })).toHaveLength(1);
    expect(filterTeamRows(rows, { ...initialTeamReportFilterState, searchQuery: '988880002' })).toHaveLength(1);

    // Filtro por equipe
    expect(filterTeamRows(rows, { ...initialTeamReportFilterState, roleId: 'r2' })).toHaveLength(1);

    // Filtro por ativo/inativo
    expect(filterTeamRows(rows, { ...initialTeamReportFilterState, activeStatus: 'active' })).toHaveLength(2);
    expect(filterTeamRows(rows, { ...initialTeamReportFilterState, activeStatus: 'inactive' })).toHaveLength(1);

    // Filtro por cortesia
    expect(filterTeamRows(rows, { ...initialTeamReportFilterState, courtesy: 'yes' })).toHaveLength(1);
    expect(filterTeamRows(rows, { ...initialTeamReportFilterState, courtesy: 'no' })).toHaveLength(2);
  });

  it('ordena por equipe > nome, por nome A-Z e por frequência', () => {
    const m1 = mockMember({
      id: 'm1',
      person: { id: 'p1', fullName: 'Ziraldo', phone: '' },
      teamRoleId: 'r1',
      teamRole: { id: 'r1', name: 'Intercessão', sortOrder: 1 },
      attendance: { totalCalled: 4, attended: 1, percentage: 25, fraction: '1/4' },
    });
    const m2 = mockMember({
      id: 'm2',
      person: { id: 'p2', fullName: 'Amanda', phone: '' },
      teamRoleId: 'r2',
      teamRole: { id: 'r2', name: 'Apoio', sortOrder: 2 },
      attendance: { totalCalled: 4, attended: 4, percentage: 100, fraction: '4/4' },
    });
    const m3 = mockMember({
      id: 'm3',
      person: { id: 'p3', fullName: 'Bia', phone: '' },
      teamRoleId: 'r1',
      teamRole: { id: 'r1', name: 'Intercessão', sortOrder: 1 },
      attendance: { totalCalled: 4, attended: 2, percentage: 50, fraction: '2/4' },
    });

    const rows = toTeamReportRows([m1, m2, m3]);

    // Equipe > Nome
    const byRoleAndName = sortTeamRows(rows, 'role_then_name').map((r) => r.name);
    expect(byRoleAndName).toEqual(['Bia', 'Ziraldo', 'Amanda']);

    // Nome A-Z
    const byName = sortTeamRows(rows, 'name').map((r) => r.name);
    expect(byName).toEqual(['Amanda', 'Bia', 'Ziraldo']);

    // Frequência desc
    const byFreqDesc = sortTeamRows(rows, 'attendance_desc').map((r) => r.name);
    expect(byFreqDesc).toEqual(['Amanda', 'Bia', 'Ziraldo']);
  });

  it('agrupa por equipe, situação e pagamento', () => {
    const m1 = mockMember({
      id: 'm1',
      teamRoleId: 'r1',
      teamRole: { id: 'r1', name: 'Intercessão', sortOrder: 1 },
      active: true,
      payment: {
        status: 'paid',
        isCourtesy: false,
        registrationFeeCents: 5000,
        totalPaidCents: 5000,
        outstandingCents: 0,
        paymentCount: 1,
      },
    });
    const m2 = mockMember({
      id: 'm2',
      teamRoleId: 'r2',
      teamRole: { id: 'r2', name: 'Secretaria', sortOrder: 2 },
      active: false,
      payment: {
        status: 'pending',
        isCourtesy: false,
        registrationFeeCents: 5000,
        totalPaidCents: 0,
        outstandingCents: 5000,
        paymentCount: 0,
      },
    });

    const rows = toTeamReportRows([m1, m2]);

    const byRole = groupTeamRows(rows, 'role');
    expect(byRole).toHaveLength(2);
    expect(byRole[0]?.label).toBe('1. Intercessão');
    expect(byRole[1]?.label).toBe('2. Secretaria');

    const byStatus = groupTeamRows(rows, 'status');
    expect(byStatus).toHaveLength(2);
    expect(byStatus.map((g) => g.label)).toEqual(['Voluntários Ativos', 'Voluntários Inativos']);

    const byPayment = groupTeamRows(rows, 'payment');
    expect(byPayment.map((g) => g.label)).toEqual(['Status: Pago', 'Status: Pendente']);
  });

  it('gera CSV com formato correto para equipes', () => {
    const m1 = mockMember({
      person: { id: 'p1', fullName: 'Carlos "Líder"', phone: '86999990001' },
      teamRole: { id: 'r1', name: 'Intercessão', sortOrder: 1 },
    });
    const rows = toTeamReportRows([m1]);
    const groups = groupTeamRows(rows, 'role');
    const cols = TEAM_REPORT_COLUMNS.filter((c) => c.id === 'name' || c.id === 'teamRoleName');

    const csv = buildCsv(cols, groups, { groupLabel: 'Equipe', showRowNumbers: true });
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv.includes('"Carlos ""Líder"""')).toBe(true);
    expect(csv.includes('"1. Intercessão"')).toBe(true);
  });
});
