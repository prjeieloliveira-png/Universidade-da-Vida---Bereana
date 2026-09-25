import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToggleMemberActiveModal } from './ToggleMemberActiveModal';
import type { TeamMemberWithDetails } from '../types/teams';

const activeMember: TeamMemberWithDetails = {
  id: 'm-1',
  editionId: 'ed-1',
  teamRoleId: 'role-1',
  personId: 'p-1',
  active: true,
  notes: null,
  createdAt: '',
  updatedAt: '',
  person: { id: 'p-1', fullName: 'Carlos Silva', phone: '11987654321' },
  teamRole: { id: 'role-1', name: 'Equipe de Celebração', sortOrder: 9 },
  attendance: { totalCalled: 3, attended: 3, percentage: 100, fraction: '3/3' },
};

const inactiveMember: TeamMemberWithDetails = {
  ...activeMember,
  id: 'm-2',
  active: false,
};

describe('ToggleMemberActiveModal', () => {
  it('deve renderizar modal de desativação com nome e equipe do membro ativo', () => {
    render(
      <ToggleMemberActiveModal
        isOpen={true}
        onClose={vi.fn()}
        member={activeMember}
        onConfirmToggle={vi.fn()}
      />
    );

    expect(screen.getByText('Desativar Membro')).toBeInTheDocument();
    expect(screen.getByText('Carlos Silva')).toBeInTheDocument();
    expect(screen.getByText('Equipe de Celebração')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sim, Desativar/i })).toBeInTheDocument();
  });

  it('deve renderizar modal de reativação para membro inativo', () => {
    render(
      <ToggleMemberActiveModal
        isOpen={true}
        onClose={vi.fn()}
        member={inactiveMember}
        onConfirmToggle={vi.fn()}
      />
    );

    expect(screen.getByText('Reativar Membro')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sim, Reativar/i })).toBeInTheDocument();
  });

  it('deve acionar onConfirmToggle e fechar ao confirmar', async () => {
    const onConfirmToggle = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <ToggleMemberActiveModal
        isOpen={true}
        onClose={onClose}
        member={activeMember}
        onConfirmToggle={onConfirmToggle}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: /Sim, Desativar/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(onConfirmToggle).toHaveBeenCalledWith('m-1', false);
      expect(onClose).toHaveBeenCalled();
    });
  });
});
