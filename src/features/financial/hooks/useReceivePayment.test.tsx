import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReceivePayment } from './useReceivePayment';
import * as data from '../data/financialData';

vi.mock('../data/financialData', () => ({
  registerPayment: vi.fn(),
  fetchRegistrationPaymentStatuses: vi.fn(),
}));

vi.mock('@/shared/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        in: () =>
          Promise.resolve({ data: [{ id: 'p1', full_name: 'Maria', phone: '86999990000' }], error: null }),
      }),
    }),
  },
}));

const row = (fee: number) => ({
  registration_id: 'r1',
  edition_id: 'ed',
  person_id: 'p1',
  registration_fee_cents: fee,
  total_paid_cents: 0,
  outstanding_cents: fee,
  status: 'pending' as const,
  payment_count: 0,
  last_payment_at: null,
  waived_cents: 0,
  settled_at: null,
  settled_note: null,
});

function wrapper(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe('useReceivePayment', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mostra a taxa nova logo após recarregar os status (sem ficar com o valor antigo)', async () => {
    vi.mocked(data.fetchRegistrationPaymentStatuses)
      .mockResolvedValueOnce([row(20000)])
      .mockResolvedValue([row(15000)]);

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useReceivePayment(true, 'ed', vi.fn()), {
      wrapper: wrapper(client),
    });

    await waitFor(() => expect(result.current.filtered[0]?.registration_fee_cents).toBe(20000));

    await act(async () => {
      await client.invalidateQueries({ queryKey: ['reg-payment-statuses', 'ed'] });
    });

    await waitFor(() => expect(result.current.filtered[0]?.registration_fee_cents).toBe(15000));
    expect(result.current.filtered[0]?.outstanding_cents).toBe(15000);
  });
});
