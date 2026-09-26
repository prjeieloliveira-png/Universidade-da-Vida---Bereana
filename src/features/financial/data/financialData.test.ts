import { describe, it, expect, vi, beforeEach } from 'vitest';
import { voidCashFlowEntry, voidTransaction } from './financialData';
import { supabase } from '@/shared/lib/supabase';
import type { CashFlowEntry } from '../types';

vi.mock('@/shared/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe('financialData - void entries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('voidCashFlowEntry delegates to voidPayment when source is "payment"', async () => {
    const entry: CashFlowEntry = {
      transaction_id: 'payment-uuid-123',
      date: '2026-09-26T12:00:00Z',
      source: 'payment',
      flow_type: 'in',
      amount_cents: 5000,
      payment_method: 'pix',
      category: 'Inscrição',
      registration_id: 'reg-uuid-1',
      edition_id: 'ed-uuid-1',
      person_name: 'Rômulo Leite Brito',
    };

    (supabase.rpc as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: null,
    });

    await voidCashFlowEntry(entry, 'Estorno manual via painel');

    expect(supabase.rpc).toHaveBeenCalledWith('void_payment', {
      payment_id: 'payment-uuid-123',
      reason: 'Estorno manual via painel',
    });
  });

  it('voidCashFlowEntry delegates to voidTransaction when source is "manual"', async () => {
    const entry: CashFlowEntry = {
      transaction_id: 'tx-uuid-456',
      date: '2026-09-26T12:00:00Z',
      source: 'manual',
      flow_type: 'out',
      amount_cents: 15000,
      payment_method: 'pix',
      category: 'Alimentação',
      registration_id: null,
      edition_id: 'ed-uuid-1',
      person_name: null,
    };

    (supabase.rpc as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: null,
    });

    await voidCashFlowEntry(entry, 'Estorno manual via painel');

    expect(supabase.rpc).toHaveBeenCalledWith('void_financial_transaction', {
      tx_id: 'tx-uuid-456',
      reason: 'Estorno manual via painel',
    });
  });

  it('voidTransaction falls back to table update if RPC returns error', async () => {
    (supabase.rpc as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'function does not exist' },
    });

    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      update: mockUpdate,
    });

    await voidTransaction('tx-fallback-789', 'Motivo teste');

    expect(supabase.from).toHaveBeenCalledWith('financial_transactions');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        void_reason: 'Motivo teste',
      })
    );
    expect(mockEq).toHaveBeenCalledWith('id', 'tx-fallback-789');
  });
});
