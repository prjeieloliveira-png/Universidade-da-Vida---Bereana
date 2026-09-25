import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamMemberModal } from './TeamMemberModal';
import type { TeamRoleRow } from '../types/teams';

const mockRoles: TeamRoleRow[] = [
  { id: 'role-1', name: 'Presidente', sort_order: 1, active: true, created_at: '' },
  { id: 'role-2', name: 'Coordenador(a)', sort_order: 2, active: true, created_at: '' },
];

describe('TeamMemberModal', () => {
  it('não deve renderizar quando isOpen for falso', () => {
    render(
      <TeamMemberModal
        isOpen={false}
        onClose={vi.fn()}
        roles={mockRoles}
        onSaveCreate={vi.fn()}
        onSaveUpdate={vi.fn()}
      />
    );
    expect(screen.queryByText('Novo Membro da Equipe')).not.toBeInTheDocument();
  });

  it('deve validar nome e telefone brasileiro no cadastro', async () => {
    const handleSaveCreate = vi.fn().mockResolvedValue({});
    render(
      <TeamMemberModal
        isOpen={true}
        onClose={vi.fn()}
        roles={mockRoles}
        onSaveCreate={handleSaveCreate}
        onSaveUpdate={vi.fn()}
      />
    );

    expect(screen.getByText('Novo Membro da Equipe')).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Nome Completo \*/i);
    const phoneInput = screen.getByLabelText(/Telefone \(WhatsApp\) \*/i);
    const submitBtn = screen.getByRole('button', { name: /Cadastrar Membro/i });

    // Tentar submeter vazio disparando submit no form
    const form = nameInput.closest('form')!;
    fireEvent.submit(form);
    await waitFor(() => {
      expect(screen.getByText(/O nome do membro é obrigatório/i)).toBeInTheDocument();
    });

    // Preencher nome mas telefone inválido
    fireEvent.change(nameInput, { target: { value: 'Carlos Silva' } });
    fireEvent.change(phoneInput, { target: { value: '123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Informe um telefone brasileiro válido com DDD/i)
      ).toBeInTheDocument();
    });

    // Preencher telefone válido
    fireEvent.change(phoneInput, { target: { value: '11987654321' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSaveCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'Carlos Silva',
          phone: '11987654321',
          teamRoleId: 'role-1',
        })
      );
    });
  });
});
