import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamCard } from './TeamCard';
import type { TeamRoleRow, TeamMemberWithDetails } from '../types/teams';

const mockRole: TeamRoleRow = {
  id: 'role-1',
  name: 'Presidente',
  sort_order: 1,
  active: true,
  created_at: '',
};

const mockMembers: TeamMemberWithDetails[] = [
  {
    id: 'm-1',
    editionId: 'ed-1',
    teamRoleId: 'role-1',
    personId: 'p-1',
    active: true,
    notes: null,
    createdAt: '',
    updatedAt: '',
    person: { id: 'p-1', fullName: 'Pastor Jeiel', phone: '11987654321' },
    teamRole: { id: 'role-1', name: 'Presidente', sortOrder: 1 },
    attendance: { totalCalled: 4, attended: 4, percentage: 100, fraction: '4/4' },
  },
  {
    id: 'm-2',
    editionId: 'ed-1',
    teamRoleId: 'role-1',
    personId: 'p-2',
    active: false,
    notes: null,
    createdAt: '',
    updatedAt: '',
    person: { id: 'p-2', fullName: 'Membro Inativo', phone: '11911112222' },
    teamRole: { id: 'role-1', name: 'Presidente', sortOrder: 1 },
    attendance: { totalCalled: 2, attended: 1, percentage: 50, fraction: '1/2' },
  },
];

describe('TeamCard', () => {
  it('deve ocultar membros inativos por padrão quando showInactive for false', () => {
    render(
      <TeamCard
        role={mockRole}
        members={mockMembers}
        showInactive={false}
        onAddMember={vi.fn()}
        onEditMember={vi.fn()}
        onMoveMember={vi.fn()}
        onToggleActiveMember={vi.fn()}
      />
    );

    expect(screen.getByText('Pastor Jeiel')).toBeInTheDocument();
    expect(screen.queryByText('Membro Inativo')).not.toBeInTheDocument();
  });

  it('deve exibir membros inativos quando showInactive for true', () => {
    render(
      <TeamCard
        role={mockRole}
        members={mockMembers}
        showInactive={true}
        onAddMember={vi.fn()}
        onEditMember={vi.fn()}
        onMoveMember={vi.fn()}
        onToggleActiveMember={vi.fn()}
      />
    );

    expect(screen.getByText('Pastor Jeiel')).toBeInTheDocument();
    expect(screen.getByText('Membro Inativo')).toBeInTheDocument();
    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });
});
