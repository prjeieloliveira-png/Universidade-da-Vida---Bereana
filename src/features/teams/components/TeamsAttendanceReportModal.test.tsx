import type { ReactElement } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeamsAttendanceReportModal } from './TeamsAttendanceReportModal';
import type { TeamMeetingWithDetails } from '../types/teams';

vi.mock('@/shared/lib/supabase', () => {
  const members = [
    {
      id: 'm1',
      team_role_id: 'r1',
      people: { full_name: 'Ana Souza' },
      team_roles: { name: 'Recepção', sort_order: 1 },
    },
  ];
  const log = [
    { meeting_id: 'a', team_member_id: 'm1', present: false, note: 'Viagem', marked_by_name: 'Pastor' },
  ];
  return {
    supabase: {
      from: (table: string) => {
        const result = { data: table === 'team_members' ? members : log, error: null };
        const chain: Record<string, unknown> = {};
        chain.select = () => chain;
        chain.eq = () => (table === 'team_members' ? chain : result);
        chain.in = () => result;
        (chain as { then: unknown }).then = (res: (v: typeof result) => unknown) => res(result);
        return chain;
      },
    },
  };
});

const meeting = (id: string, date: string): TeamMeetingWithDetails => ({
  id,
  editionId: 'e',
  meetingDate: date,
  title: null,
  notes: null,
  createdBy: null,
  createdAt: '',
  convocadasRoleIds: ['r1'],
  attendanceSummary: { attendedCount: 0, calledCount: 0, percentage: 0 },
});

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('TeamsAttendanceReportModal', () => {
  it('mostra F só na falta confirmada e deixa em branco reunião sem registro', async () => {
    renderWithClient(
      <TeamsAttendanceReportModal
        isOpen
        onClose={vi.fn()}
        editionId="e"
        editionName="Turma 2026"
        meetings={[meeting('a', '2026-09-10'), meeting('b', '2026-09-17')]}
      />
    );

    await waitFor(() => expect(screen.getByText('Ana Souza')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByTitle(/Falta • registrado por Pastor • Viagem/)).toHaveTextContent('F'));
    expect(screen.getByTitle('Ainda não registrado')).toHaveTextContent('');
  });
});
