-- Create v_cash_flow view
-- Unifica pagamentos de inscrição + transações financeiras manuais
CREATE OR REPLACE VIEW v_cash_flow AS
SELECT
  p.id AS transaction_id,
  p.created_at AS date,
  'payment'::TEXT AS source,
  'in'::TEXT AS flow_type,
  p.amount_cents,
  p.payment_method,
  'Inscrição' AS category,
  r.id AS registration_id,
  r.edition_id,
  pe.full_name AS person_name
FROM payments p
JOIN registrations r ON p.registration_id = r.id
JOIN people pe ON pe.id = r.person_id
WHERE p.voided_at IS NULL
UNION ALL
SELECT
  ft.id AS transaction_id,
  ft.created_at AS date,
  'manual'::TEXT AS source,
  CASE WHEN ft.type = 'revenue' THEN 'in' ELSE 'out' END AS flow_type,
  ft.amount_cents,
  ft.payment_method,
  ft.category,
  ft.registration_id,
  ft.edition_id,
  NULL AS person_name
FROM financial_transactions ft
WHERE ft.voided_at IS NULL;
