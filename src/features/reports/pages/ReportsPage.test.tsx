import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ReportsPage } from './ReportsPage';

// Mock ResizeObserver para o jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock('@/shared/hooks/useUserRole', () => ({
  useUserRole: () => ({
    isCoordOrSec: true,
    isLoading: false,
    fullName: 'Coordenador Teste',
  }),
}));

vi.mock('@/shared/hooks/useActiveEdition', () => ({
  useActiveEdition: () => ({
    data: { id: 'ed-1', name: 'Turma 2026' },
    isLoading: false,
  }),
}));

vi.mock('@/features/cohorts/store/cohortStore', () => ({
  useCohortStore: () => ({
    activeCohortId: 'turma-01',
    getActiveCohort: () => ({ id: 'turma-01', name: 'Turma 01' }),
  }),
}));

vi.mock('@/features/registrations/store/studentStore', () => ({
  useStudentStore: () => ({
    students: [],
  }),
}));

vi.mock('@/features/teams/hooks/useTeamRoles', () => ({
  useTeamRoles: () => ({
    roles: [
      { id: 'r1', name: 'Intercessão', sort_order: 1, active: true, created_at: '' },
    ],
    isLoading: false,
  }),
}));

vi.mock('@/features/teams/hooks/useTeamMembers', () => ({
  useTeamMembers: () => ({
    members: [
      {
        id: 'm1',
        editionId: 'ed-1',
        teamRoleId: 'r1',
        personId: 'p1',
        active: true,
        isCourtesy: false,
        notes: '',
        createdAt: '',
        updatedAt: '',
        person: { id: 'p1', fullName: 'Voluntário 1', phone: '86999990001' },
        teamRole: { id: 'r1', name: 'Intercessão', sortOrder: 1 },
        attendance: { totalCalled: 2, attended: 2, percentage: 100, fraction: '2/2' },
        payment: {
          status: 'paid',
          isCourtesy: false,
          registrationFeeCents: 5000,
          totalPaidCents: 5000,
          outstandingCents: 0,
          paymentCount: 1,
        },
      },
    ],
    isLoading: false,
  }),
}));

function renderReportsPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ReportsPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ReportsPage', () => {
  it('renderiza as abas Alunos e Equipes e permite alternar entre elas', () => {
    renderReportsPage();

    expect(screen.getByRole('tab', { name: /Alunos/i })).toBeInTheDocument();
    const equipesTab = screen.getByRole('tab', { name: /Equipes/i });
    expect(equipesTab).toBeInTheDocument();
    expect(equipesTab).not.toBeDisabled();

    // Clica na aba Equipes
    fireEvent.click(equipesTab);

    // Deve exibir o cabeçalho/opções do relatório de equipes (preview e print portal)
    expect(screen.getAllByText('Relação de equipes de serviço').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Voluntário 1').length).toBeGreaterThanOrEqual(1);
  });
});
