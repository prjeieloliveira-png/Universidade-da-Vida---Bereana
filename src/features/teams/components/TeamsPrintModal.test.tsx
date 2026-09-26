import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamsPrintModal } from './TeamsPrintModal';
import type { TeamRoleRow, TeamMemberWithDetails } from '../types/teams';

const mockRoles: TeamRoleRow[] = [
  { id: 'r-1', name: 'Presidente', sort_order: 1, active: true, created_at: '' },
  { id: 'r-2', name: 'Equipe de Intercessão', sort_order: 2, active: true, created_at: '' },
];

const mockMembers: TeamMemberWithDetails[] = [
  {
    id: 'm-1',
    editionId: 'ed-1',
    teamRoleId: 'r-1',
    personId: 'p-1',
    active: true,
    notes: 'Coordenação geral',
    createdAt: '',
    updatedAt: '',
    person: { id: 'p-1', fullName: 'Pr. Jeiel Oliveira', phone: '86988167076' },
    teamRole: { id: 'r-1', name: 'Presidente', sortOrder: 1 },
    attendance: { totalCalled: 3, attended: 3, percentage: 100, fraction: '3/3' },
  },
  {
    id: 'm-2',
    editionId: 'ed-1',
    teamRoleId: 'r-2',
    personId: 'p-2',
    active: false,
    notes: null,
    createdAt: '',
    updatedAt: '',
    person: { id: 'p-2', fullName: 'Voluntário Inativo', phone: '86999990000' },
    teamRole: { id: 'r-2', name: 'Equipe de Intercessão', sortOrder: 2 },
    attendance: { totalCalled: 2, attended: 1, percentage: 50, fraction: '1/2' },
  },
];

describe('TeamsPrintModal', () => {
  it('deve renderizar modal com nome da edição e equipes para impressão A4', () => {
    render(
      <TeamsPrintModal
        isOpen={true}
        onClose={vi.fn()}
        roles={mockRoles}
        members={mockMembers}
        editionName="Turma 01 - 2026"
      />
    );

    expect(screen.getByText('Imprimir Relação de Equipes')).toBeInTheDocument();
    expect(screen.getAllByText(/Turma 01 - 2026/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Presidente')).toBeInTheDocument();
    expect(screen.getByText('Equipe de Intercessão')).toBeInTheDocument();
    expect(screen.getByText('Pr. Jeiel Oliveira')).toBeInTheDocument();
    // Membro inativo oculto por padrão
    expect(screen.queryByText('Voluntário Inativo')).not.toBeInTheDocument();
  });

  it('deve exibir membro inativo quando o botão "Incluir Inativos" for clicado', () => {
    render(
      <TeamsPrintModal
        isOpen={true}
        onClose={vi.fn()}
        roles={mockRoles}
        members={mockMembers}
        editionName="Turma 01 - 2026"
      />
    );

    const toggleBtn = screen.getByRole('button', { name: /Incluir Inativos/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByText('Voluntário Inativo')).toBeInTheDocument();
  });

  it('deve fechar ao clicar no botão de fechar', () => {
    const onClose = vi.fn();

    render(
      <TeamsPrintModal
        isOpen={true}
        onClose={onClose}
        roles={mockRoles}
        members={mockMembers}
        editionName="Turma 01 - 2026"
      />
    );

    const closeBtn = screen.getByRole('button', { name: /Fechar modal/i });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
