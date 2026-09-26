import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteTeamMemberModal } from './DeleteTeamMemberModal';
import type { TeamMemberWithDetails } from '../types/teams';

const mockInactiveMember: TeamMemberWithDetails = {
  id: 'm-inactive-1',
  editionId: 'ed-1',
  teamRoleId: 'role-1',
  personId: 'p-1',
  active: false,
  notes: null,
  createdAt: '',
  updatedAt: '',
  person: { id: 'p-1', fullName: 'Jeiel Oliveira Santos Junior', phone: '86988127676' },
  teamRole: { id: 'role-1', name: 'Presidente', sortOrder: 1 },
  attendance: { totalCalled: 0, attended: 0, percentage: 0, fraction: '0/0' },
};

describe('DeleteTeamMemberModal', () => {
  it('deve renderizar modal com nome do membro e equipe para exclusão', () => {
    render(
      <DeleteTeamMemberModal
        isOpen={true}
        onClose={vi.fn()}
        member={mockInactiveMember}
        onConfirmDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Excluir Membro')).toBeInTheDocument();
    expect(screen.getByText('Jeiel Oliveira Santos Junior')).toBeInTheDocument();
    expect(screen.getByText('Presidente')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Excluir Definitivamente/i })).toBeInTheDocument();
  });

  it('deve acionar onConfirmDelete e fechar ao confirmar exclusão', async () => {
    const onConfirmDelete = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <DeleteTeamMemberModal
        isOpen={true}
        onClose={onClose}
        member={mockInactiveMember}
        onConfirmDelete={onConfirmDelete}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /Excluir Definitivamente/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(onConfirmDelete).toHaveBeenCalledWith('m-inactive-1');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('deve fechar ao clicar no botão Cancelar', () => {
    const onClose = vi.fn();

    render(
      <DeleteTeamMemberModal
        isOpen={true}
        onClose={onClose}
        member={mockInactiveMember}
        onConfirmDelete={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
