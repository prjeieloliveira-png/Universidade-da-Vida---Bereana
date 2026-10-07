-- ============================================================================
-- MIGRAÇÃO: extrato (v_cash_flow) passa a incluir os pagamentos dos membros das equipes
-- Não destrutiva: apenas CREATE OR REPLACE VIEW (mesmas colunas) + ALTER VIEW.
-- O resumo (v_cash_summary) já somava a equipe; o extrato não — por isso o saldo
-- ficava R$ acima da soma das linhas listadas.
-- ============================================================================

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
  pe.full_name AS person_name,
  prof.full_name AS recorded_by_name
FROM payments p
JOIN registrations r ON p.registration_id = r.id
JOIN people pe ON pe.id = r.person_id
LEFT JOIN profiles prof ON prof.id = p.recorded_by
WHERE p.voided_at IS NULL
UNION ALL
SELECT
  tp.id AS transaction_id,
  tp.created_at AS date,
  'team_payment'::TEXT AS source,
  'in'::TEXT AS flow_type,
  tp.amount_cents,
  tp.payment_method,
  'Equipe' AS category,
  NULL::uuid AS registration_id,
  tp.edition_id,
  pe.full_name AS person_name,
  prof.full_name AS recorded_by_name
FROM team_member_payments tp
JOIN team_members tm ON tm.id = tp.team_member_id
JOIN people pe ON pe.id = tm.person_id
LEFT JOIN profiles prof ON prof.id = tp.created_by
WHERE tp.voided_at IS NULL
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
  NULL AS person_name,
  prof.full_name AS recorded_by_name
FROM financial_transactions ft
LEFT JOIN profiles prof ON prof.id = ft.recorded_by
WHERE ft.voided_at IS NULL;

ALTER VIEW v_cash_flow SET (security_invoker = true);
GRANT SELECT ON v_cash_flow TO authenticated;
