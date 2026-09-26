import type { Database } from '@/shared/types/database';

// Tipos derivados do schema gerado
export type PaymentRow = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type FinancialTransactionRow = Database['public']['Tables']['financial_transactions']['Row'];

// Mapeamento de método de pagamento (canônico -> label pt-BR)
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: 'PIX',
  debit: 'Débito',
  credit: 'Crédito',
  cash: 'Dinheiro',
};

export type PaymentMethodKey = 'pix' | 'debit' | 'credit' | 'cash';

// Status de pagamento derivado da view
export type RegistrationPaymentStatus = 'paid' | 'partial' | 'pending';

export const PAYMENT_STATUS_LABELS: Record<RegistrationPaymentStatus, string> = {
  paid: 'Pago',
  partial: 'Parcial',
  pending: 'Pendente',
};

// Tipo do registro financeiro unificado (v_cash_flow)
export interface CashFlowEntry {
  transaction_id: string;
  date: string;
  source: 'payment' | 'manual';
  flow_type: 'in' | 'out';
  amount_cents: number;
  payment_method: string;
  category: string;
  registration_id: string | null;
  edition_id: string;
  person_name: string | null;
  description?: string | null;
}

// Categoria de fluxo de caixa
export interface CashCategory {
  id: string;
  name: string;
  type: 'in' | 'out';
}

// Entrada para criação de transação manual
export interface CreateTransactionInput {
  edition_id: string;
  type: 'revenue' | 'expense';
  category: string;
  amount_cents: number;
  payment_method: string;
  description: string;
  transaction_date: string;
  receipt_url?: string;
}

// Tipo do resumo financeiro (v_cash_summary)
export interface CashSummary {
  edition_id: string;
  // Totais gerais
  total_payment_in_cents: number;
  total_manual_in_cents: number;
  total_manual_out_cents: number;
  total_in_cents: number;
  total_out_cents: number;
  net_balance_cents: number;
  // Inscritos
  total_registrations: number;
  paid_count: number;
  partial_count: number;
  pending_count: number;
  total_receivable_cents: number;
  total_registration_goal_cents: number;
  total_registration_paid_cents: number;
  // Equipes
  total_team_members: number;
  team_paid_count: number;
  team_partial_count: number;
  team_pending_count: number;
  total_team_goal_cents: number;
  total_team_paid_cents: number;
  total_team_receivable_cents: number;
}


// Tipo da view v_registration_payment_status
export interface RegistrationPaymentStatusRow {
  registration_id: string;
  edition_id: string;
  person_id: string;
  registration_fee_cents: number;
  total_paid_cents: number;
  outstanding_cents: number;
  status: RegistrationPaymentStatus;
  payment_count: number;
  last_payment_at: string | null;
}

// Dados para a aba de pagamentos (join com people)
export interface PaymentRecord {
  id: string;
  registration_id: string;
  person_name: string;
  amount_cents: number;
  payment_method: string;
  payment_date: string;
  voided_at: string | null;
  notes: string | null;
}

// Status de pagamento de membro de equipe (v_team_member_payment_status)
export interface TeamMemberPaymentStatus {
  team_member_id: string;
  edition_id: string;
  person_id: string;
  team_role_id: string;
  active: boolean;
  registration_fee_cents: number;
  total_paid_cents: number;
  outstanding_cents: number;
  status: 'paid' | 'partial' | 'pending';
  payment_count: number;
  last_payment_at: string | null;
}

