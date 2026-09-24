import { supabase } from '@/shared/lib/supabase';
import type {
  CashSummary,
  RegistrationPaymentStatusRow,
  PaymentRecord,
  CashFlowEntry,
} from '../types';

export async function fetchCashSummary(editionId: string): Promise<CashSummary | null> {
  const { data, error } = await supabase
    .from('v_cash_summary')
    .select(
      'edition_id, total_payment_in_cents, total_manual_in_cents, total_manual_out_cents, total_in_cents, total_out_cents, net_balance_cents, total_registrations, paid_count, partial_count, pending_count, total_receivable_cents'
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

export async function fetchCashFlow(editionId: string): Promise<CashFlowEntry[]> {
  const { data, error } = await supabase
    .from('v_cash_flow')
    .select(
      'transaction_id, date, source, flow_type, amount_cents, payment_method, category, registration_id, edition_id, person_name'
    )
    .eq('edition_id', editionId)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data ?? []) as CashFlowEntry[];
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
