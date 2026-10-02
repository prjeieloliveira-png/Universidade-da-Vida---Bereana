import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { TeamsPage } from './TeamsPage';

// Mocks
vi.mock('@/shared/hooks/useUserRole', () => ({
  useUserRole: () => ({
    isCoordOrSec: true,
    isCoordinator: true,
    isSecretary: false,
    role: 'coordinator',
    fullName: 'Coordenador',
    email: 'admin@bereana.com',
    isLoading: false,
  }),
}));

vi.mock('@/features/cohorts/store/cohortStore', () => ({
  useCohortStore: () => ({
    getActiveCohort: () => ({ id: 'c-1', name: 'Turma 2026' }),
  }),
}));

vi.mock('@/shared/hooks/useActiveEdition', () => ({
  useActiveEdition: () => ({
    data: { id: 'ed-1', name: 'Turma 2026' },
    isLoading: false,
  }),
}));

vi.mock('../hooks/useTeamRoles', () => ({
  useTeamRoles: () => ({
    roles: [
      { id: 'r-1', name: 'Presidente', sort_order: 1, active: true, created_at: '' },
      { id: 'r-2', name: 'Coordenador(a)', sort_order: 2, active: true, created_at: '' },
    ],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    createRole: vi.fn(),
    isCreating: false,
    renameRole: vi.fn(),
    isRenaming: false,
    deleteRole: vi.fn(),
    isDeleting: false,
  }),
}));

vi.mock('../hooks/useTeamMembers', () => ({
  useTeamMembers: () => ({
    members: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    addMember: vi.fn(),
    updateMember: vi.fn(),
    toggleActive: vi.fn(),
    moveTeam: vi.fn(),
  }),
  searchPersonByPhone: vi.fn(),
}));

vi.mock('../hooks/useTeamMeetings', () => ({
  useTeamMeetings: () => ({
    meetings: [],
    isLoading: false,
    addMeeting: vi.fn(),
    updateMeeting: vi.fn(),
    deleteMeeting: vi.fn(),
  }),
}));

describe('TeamsPage', () => {
  it('deve abrir o modal de novo membro ao clicar em "Novo Membro"', async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TeamsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // O modal não deve estar visível inicialmente
    expect(screen.queryByText('Novo Membro da Equipe')).not.toBeInTheDocument();

    // Clicar no botão "Novo Membro"
    const newMemberBtn = screen.getByRole('button', { name: /Novo Membro/i });
    fireEvent.click(newMemberBtn);

    // O modal deve aparecer
    await waitFor(() => {
      expect(screen.getByText('Novo Membro da Equipe')).toBeInTheDocument();
    });
  });

  it('deve abrir o modal de nova equipe ao clicar em "Nova Equipe"', async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TeamsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.queryByText('Nova Equipe', { selector: 'h3' })).not.toBeInTheDocument();

    const newRoleBtn = screen.getByRole('button', { name: /Nova Equipe/i });
    fireEvent.click(newRoleBtn);

    await waitFor(() => {
      expect(screen.getByText('Nova Equipe', { selector: 'h3' })).toBeInTheDocument();
    });
  });

  it('deve renderizar as equipes com botões de renomear e excluir', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TeamsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByLabelText('Renomear equipe Presidente')).toBeInTheDocument();
    expect(screen.getByLabelText('Excluir equipe Presidente')).toBeInTheDocument();
  });
});
