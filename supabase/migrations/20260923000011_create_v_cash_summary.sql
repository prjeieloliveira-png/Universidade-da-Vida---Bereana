-- Create v_cash_summary view (resumo financeiro por edição)
CREATE OR REPLACE VIEW v_cash_summary AS
SELECT
  e.id AS edition_id,
  -- Totais de pagamentos de inscrição (sempre entradas)
  COALESCE(pay_totals.total_payment_cents, 0) AS total_payment_in_cents,
  -- Totais de transações manuais (receitas)
  COALESCE(ft_in.total_cents, 0) AS total_manual_in_cents,
  -- Totais de transações manuais (despesas)
  COALESCE(ft_out.total_cents, 0) AS total_manual_out_cents,
  -- Totais gerais
  (COALESCE(pay_totals.total_payment_cents, 0) + COALESCE(ft_in.total_cents, 0)) AS total_in_cents,
  COALESCE(ft_out.total_cents, 0) AS total_out_cents,
  (COALESCE(pay_totals.total_payment_cents, 0) + COALESCE(ft_in.total_cents, 0) - COALESCE(ft_out.total_cents, 0)) AS net_balance_cents,
  -- Status de inscrições
  COALESCE(reg_stats.total_registrations, 0) AS total_registrations,
  COALESCE(reg_stats.paid_count, 0) AS paid_count,
  COALESCE(reg_stats.partial_count, 0) AS partial_count,
  COALESCE(reg_stats.pending_count, 0) AS pending_count,
  COALESCE(reg_stats.total_receivable_cents, 0) AS total_receivable_cents
FROM editions e
LEFT JOIN LATERAL (
  SELECT SUM(p.amount_cents) AS total_payment_cents
  FROM payments p
  JOIN registrations r ON p.registration_id = r.id
  WHERE r.edition_id = e.id AND p.voided_at IS NULL
) pay_totals ON true
LEFT JOIN LATERAL (
  SELECT SUM(ft.amount_cents) AS total_cents
  FROM financial_transactions ft
  WHERE ft.edition_id = e.id AND ft.voided_at IS NULL AND ft.type = 'revenue'
) ft_in ON true
LEFT JOIN LATERAL (
  SELECT SUM(ft.amount_cents) AS total_cents
  FROM financial_transactions ft
  WHERE ft.edition_id = e.id AND ft.voided_at IS NULL AND ft.type = 'expense'
) ft_out ON true
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS total_registrations,
    COUNT(CASE WHEN vrp.status = 'paid' THEN 1 END) AS paid_count,
    COUNT(CASE WHEN vrp.status = 'partial' THEN 1 END) AS partial_count,
    COUNT(CASE WHEN vrp.status = 'pending' THEN 1 END) AS pending_count,
    COALESCE(SUM(vrp.outstanding_cents), 0) AS total_receivable_cents
  FROM registrations r2
  JOIN v_registration_payment_status vrp ON vrp.registration_id = r2.id
  WHERE r2.edition_id = e.id
) reg_stats ON true;
