import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamMemberRow } from './TeamMemberRow';
import type { TeamMemberWithDetails } from '../types/teams';

const baseMember: TeamMemberWithDetails = {
  id: 'tm-1',
  editionId: 'ed-1',
  teamRoleId: 'role-1',
  personId: 'p-1',
  active: true,
  isCourtesy: false,
  notes: null,
  createdAt: '',
  updatedAt: '',
  person: { id: 'p-1', fullName: 'Mateus Silva', phone: '11987654321' },
  teamRole: { id: 'role-1', name: 'Recepção', sortOrder: 3 },
  attendance: { totalCalled: 3, attended: 3, percentage: 100, fraction: '3/3' },
  payment: {
    status: 'pending',
    isCourtesy: false,
    registrationFeeCents: 15000,
    totalPaidCents: 0,
    outstandingCents: 15000,
    paymentCount: 0,
  },
};

describe('TeamMemberRow - Indicador de Pagamento e Cortesia', () => {
  it('deve exibir indicador "Pendente" quando o membro ainda não pagou', () => {
    render(
      <TeamMemberRow
        member={baseMember}
        onEdit={vi.fn()}
        onMove={vi.fn()}
        onToggleActive={vi.fn()}
      />
    );

    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('deve exibir indicador "Pago" quando o status for paid', () => {
    const paidMember: TeamMemberWithDetails = {
      ...baseMember,
      payment: {
        ...baseMember.payment,
        status: 'paid',
        totalPaidCents: 15000,
        outstandingCents: 0,
        paymentCount: 1,
      },
    };

    render(
      <TeamMemberRow
        member={paidMember}
        onEdit={vi.fn()}
        onMove={vi.fn()}
        onToggleActive={vi.fn()}
      />
    );

    expect(screen.getByText('Pago')).toBeInTheDocument();
  });

  it('deve exibir indicador "Parcial" com valor restante quando pagamento for parcial', () => {
    const partialMember: TeamMemberWithDetails = {
      ...baseMember,
      payment: {
        ...baseMember.payment,
        status: 'partial',
        totalPaidCents: 5000,
        outstandingCents: 10000,
        paymentCount: 1,
      },
    };

    render(
      <TeamMemberRow
        member={partialMember}
        onEdit={vi.fn()}
        onMove={vi.fn()}
        onToggleActive={vi.fn()}
      />
    );

    expect(screen.getByText(/Parcial/i)).toBeInTheDocument();
  });

  it('deve exibir indicador "Cortesia" com destaque quando isCourtesy for true', () => {
    const courtesyMember: TeamMemberWithDetails = {
      ...baseMember,
      isCourtesy: true,
      payment: {
        ...baseMember.payment,
        status: 'courtesy',
        isCourtesy: true,
        registrationFeeCents: 0,
        outstandingCents: 0,
      },
    };

    render(
      <TeamMemberRow
        member={courtesyMember}
        onEdit={vi.fn()}
        onMove={vi.fn()}
        onToggleActive={vi.fn()}
      />
    );

    expect(screen.getByText('Cortesia')).toBeInTheDocument();
  });

  it('deve chamar onToggleCourtesy ao clicar no botão de cortesia', () => {
    const onToggleCourtesy = vi.fn();

    render(
      <TeamMemberRow
        member={baseMember}
        onEdit={vi.fn()}
        onMove={vi.fn()}
        onToggleActive={vi.fn()}
        onToggleCourtesy={onToggleCourtesy}
      />
    );

    const courtesyButton = screen.getByTitle('Marcar como cortesia (isentar do financeiro)');
    fireEvent.click(courtesyButton);

    expect(onToggleCourtesy).toHaveBeenCalledWith(baseMember);
  });
});
