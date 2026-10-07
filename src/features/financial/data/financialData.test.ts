import { describe, it, expect, vi, beforeEach } from 'vitest';
import { voidCashFlowEntry, voidTransaction, updateCashFlowEntry } from './financialData';
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
      recorded_by_name: null,
      last_edited_at: null,
      last_edited_by_name: null,
      notes: null,
      receipt_url: null,
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
      recorded_by_name: null,
      last_edited_at: null,
      last_edited_by_name: null,
      notes: null,
      receipt_url: null,
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

describe('financialData - update entries', () => {
  const base: CashFlowEntry = {
    transaction_id: 'id-1',
    date: '2026-09-26T12:00:00Z',
    source: 'payment',
    flow_type: 'in',
    amount_cents: 5000,
    payment_method: 'pix',
    category: 'Inscrição',
    registration_id: null,
    edition_id: 'ed-1',
    person_name: 'Fulano',
    recorded_by_name: null,
    last_edited_at: null,
    last_edited_by_name: null,
    notes: null,
    receipt_url: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.rpc as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: null });
  });

  it.each([
    ['payment', 'update_payment'],
    ['team_payment', 'update_team_member_payment'],
  ] as const)('edita %s pela RPC %s', async (source, rpcName) => {
    await updateCashFlowEntry(
      { ...base, source },
      { amount_cents: 7000, payment_method: 'cash', date: '2026-09-27', notes: 'ok' }
    );
    expect(supabase.rpc).toHaveBeenCalledWith(rpcName, {
      p_payment_id: 'id-1',
      p_amount_cents: 7000,
      p_method: 'cash',
      p_date: '2026-09-27',
      p_notes: 'ok',
    });
  });

  it('edita lançamento manual com tipo, categoria e descrição', async () => {
    await updateCashFlowEntry(
      { ...base, source: 'manual', flow_type: 'out', category: 'Alimentação' },
      {
        amount_cents: 1990,
        payment_method: 'pix',
        date: '2026-09-28',
        type: 'expense',
        category: 'Transporte',
        description: 'Uber',
      }
    );
    expect(supabase.rpc).toHaveBeenCalledWith(
      'update_financial_transaction',
      expect.objectContaining({ p_id: 'id-1', p_type: 'expense', p_category: 'Transporte', p_description: 'Uber' })
    );
  });

  it('propaga o erro do banco', async () => {
    (supabase.rpc as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: new Error('Pagamento excede o valor da taxa'),
    });
    await expect(
      updateCashFlowEntry(base, { amount_cents: 999999, payment_method: 'pix', date: '2026-09-27' })
    ).rejects.toThrow('excede');
  });
});
