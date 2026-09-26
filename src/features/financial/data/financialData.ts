import { supabase } from '@/shared/lib/supabase';
import type {
  CashSummary,
  RegistrationPaymentStatusRow,
  PaymentRecord,
  CashFlowEntry,
  CashCategory,
  CreateTransactionInput,
  TeamMemberPaymentStatus,
} from '../types';

export async function fetchCashSummary(editionId: string): Promise<CashSummary | null> {
  const { data, error } = await supabase
    .from('v_cash_summary')
    .select(
      'edition_id, total_payment_in_cents, total_manual_in_cents, total_manual_out_cents, total_in_cents, total_out_cents, net_balance_cents, total_registrations, paid_count, partial_count, pending_count, total_receivable_cents, total_registration_goal_cents, total_registration_paid_cents, total_team_members, team_paid_count, team_partial_count, team_pending_count, total_team_goal_cents, total_team_paid_cents, total_team_receivable_cents'
    )
    .eq('edition_id', editionId)
    .maybeSingle();

  if (error) throw error;
  return data as CashSummary | null;
}


export async function fetchRegistrationPaymentStatuses(
  editionId: string
): Promise<RegistrationPaymentStatusRow[]> {
  const { data, error } = await supabase
    .from('v_registration_payment_status')
    .select(
      'registration_id, edition_id, person_id, registration_fee_cents, total_paid_cents, outstanding_cents, status, payment_count, last_payment_at'
    )
    .eq('edition_id', editionId);

  if (error) throw error;
  return (data ?? []) as RegistrationPaymentStatusRow[];
}

export async function fetchPayments(editionId: string): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(
      'id, registration_id, amount_cents, payment_method, payment_date, voided_at, notes, registrations!inner(edition_id, people(full_name))'
    )
    .eq('registrations.edition_id', editionId)
    .is('voided_at', null)
    .order('payment_date', { ascending: false });

  if (error) throw error;

  interface RegistrationJoin {
    edition_id: string;
    people: { full_name: string } | null;
  }

  return (data ?? []).map((row) => {
    const reg = row.registrations as unknown as RegistrationJoin | null;
    return {
      id: row.id,
      registration_id: row.registration_id,
      person_name: reg?.people?.full_name ?? '—',
      amount_cents: row.amount_cents,
      payment_method: row.payment_method,
      payment_date: row.payment_date,
      voided_at: row.voided_at,
      notes: row.notes,
    };
  });
}

export const DEFAULT_CASH_CATEGORIES: CashCategory[] = [
  { id: 'cat-in-1', name: 'Inscrição', type: 'in' },
  { id: 'cat-in-2', name: 'Oferta / Doação', type: 'in' },
  { id: 'cat-in-3', name: 'Venda de Materiais', type: 'in' },
  { id: 'cat-in-4', name: 'Patrocínio', type: 'in' },
  { id: 'cat-in-5', name: 'Outras Entradas', type: 'in' },
  { id: 'cat-out-1', name: 'Aluguel do Sítio', type: 'out' },
  { id: 'cat-out-2', name: 'Alimentação', type: 'out' },
  { id: 'cat-out-3', name: 'Material / Apostilas', type: 'out' },
  { id: 'cat-out-4', name: 'Camisetas', type: 'out' },
  { id: 'cat-out-5', name: 'Transporte', type: 'out' },
  { id: 'cat-out-6', name: 'Som e Iluminação', type: 'out' },
  { id: 'cat-out-7', name: 'Locação / Estrutura', type: 'out' },
  { id: 'cat-out-8', name: 'Outras Saídas', type: 'out' },
];

export async function fetchCategories(): Promise<CashCategory[]> {
  try {
    const { data, error } = await supabase
      .from('cash_categories')
      .select('id, name, type')
      .order('name');

    if (error || !data || data.length === 0) {
      return DEFAULT_CASH_CATEGORIES;
    }
    return data as CashCategory[];
  } catch {
    return DEFAULT_CASH_CATEGORIES;
  }
}

export async function createCategory(name: string, type: 'in' | 'out'): Promise<CashCategory> {
  const { data, error } = await supabase
    .from('cash_categories')
    .insert({ name: name.trim(), type })
    .select('id, name, type')
    .single();

  if (error) {
    return { id: `local-${Date.now()}`, name: name.trim(), type };
  }
  return data as CashCategory;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('cash_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function fetchCashFlow(editionId: string): Promise<CashFlowEntry[]> {
  try {
    const [cashFlowRes, transactionsRes] = await Promise.all([
      supabase
        .from('v_cash_flow')
        .select(
          'transaction_id, date, source, flow_type, amount_cents, payment_method, category, registration_id, edition_id, person_name'
        )
        .eq('edition_id', editionId)
        .order('date', { ascending: false }),
      supabase
        .from('financial_transactions')
        .select('id, description, transaction_date')
        .eq('edition_id', editionId)
        .is('voided_at', null),
    ]);

    if (cashFlowRes.error) throw cashFlowRes.error;

    const descMap = new Map<string, string>();
    if (transactionsRes.data) {
      for (const t of transactionsRes.data) {
        if (t.description) descMap.set(t.id, t.description);
      }
    }

    return (cashFlowRes.data ?? []).map((row) => ({
      ...row,
      description:
        row.source === 'manual'
          ? (row.transaction_id ? descMap.get(row.transaction_id) : null) ?? row.category
          : row.person_name ? `Inscrição: ${row.person_name}` : row.category,
    })) as CashFlowEntry[];
  } catch {
    return [];
  }
}

export async function createTransaction(input: CreateTransactionInput): Promise<string> {
  const { data, error } = await supabase
    .from('financial_transactions')
    .insert({
      edition_id: input.edition_id,
      type: input.type,
      category: input.category,
      amount_cents: input.amount_cents,
      payment_method: input.payment_method,
      description: input.description,
      transaction_date: input.transaction_date,
      receipt_url: input.receipt_url ?? null,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function voidTransaction(transactionId: string, reason: string): Promise<void> {
  const { error: rpcError } = await supabase.rpc('void_financial_transaction', {
    tx_id: transactionId,
    reason,
  });

  if (!rpcError) return;

  const { error } = await supabase
    .from('financial_transactions')
    .update({
      voided_at: new Date().toISOString(),
      void_reason: reason,
    })
    .eq('id', transactionId);

  if (error) throw error;
}

export async function voidCashFlowEntry(
  entry: CashFlowEntry,
  reason = 'Estorno manual via painel'
): Promise<void> {
  if (entry.source === 'payment') {
    return voidPayment(entry.transaction_id, reason);
  }
  return voidTransaction(entry.transaction_id, reason);
}

export async function registerPayment(params: {
  reg_id: string;
  amt: number;
  meth: string;
  pay_date: string;
  pay_notes?: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc('register_payment', {
    reg_id: params.reg_id,
    amt: params.amt,
    meth: params.meth as 'pix' | 'debit' | 'credit' | 'cash',
    pay_date: params.pay_date,
    pay_notes: params.pay_notes ?? undefined,
  });

  if (error) throw error;
  return data as string;
}

export async function voidPayment(paymentId: string, reason: string): Promise<void> {
  const { error } = await supabase.rpc('void_payment', {
    payment_id: paymentId,
    reason,
  });

  if (error) throw error;
}

// ─── Team Member Payments ─────────────────────────────────────────────────────

export async function fetchTeamMemberPaymentStatuses(
  editionId: string
): Promise<TeamMemberPaymentStatus[]> {
  const { data, error } = await supabase
    .from('v_team_member_payment_status')
    .select(
      'team_member_id, edition_id, person_id, team_role_id, active, registration_fee_cents, total_paid_cents, outstanding_cents, status, payment_count, last_payment_at'
    )
    .eq('edition_id', editionId);

  if (error) throw error;
  return (data ?? []) as TeamMemberPaymentStatus[];
}

export async function registerTeamMemberPayment(params: {
  team_member_id: string;
  edition_id: string;
  amount_cents: number;
  method: string;
  pay_date: string;
  notes?: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc('register_team_member_payment', {
    p_team_member_id: params.team_member_id,
    p_edition_id: params.edition_id,
    p_amount_cents: params.amount_cents,
    p_method: params.method,
    p_date: params.pay_date,
    p_notes: params.notes ?? undefined,
  });

  if (error) throw error;
  return data as string;
}

export async function voidTeamMemberPayment(
  paymentId: string,
  reason = 'Estorno manual via painel'
): Promise<void> {
  const { error } = await supabase.rpc('void_team_member_payment', {
    p_payment_id: paymentId,
    p_reason: reason,
  });

  if (error) throw error;
}
