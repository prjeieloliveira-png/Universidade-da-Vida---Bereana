-- ============================================================================
-- MIGRAÇÃO 33: Cadastro de usuários (Edge Function) + "quem realizou"
-- Não destrutiva: apenas CREATE OR REPLACE / GRANT
-- ============================================================================

-- 1. v_cash_flow passa a expor quem registrou o lançamento (join com profiles)
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

-- 2. RPC que registra o lançamento manual de financeiro (usada pelo link público
--    do financeiro, na próxima etapa) já grava recorded_by = auth.uid() — não
--    precisa de RPC nova aqui ainda, só a authorship na view acima.

-- 3. v_edition_attendance_matrix continua igual (pivotada por semana); quem
--    marcou cada presença fica disponível numa view de detalhe, usada no
--    Relatório da Chamada.
CREATE OR REPLACE VIEW v_attendance_log AS
SELECT
  a.registration_id,
  a.lesson_id,
  l.session_number,
  a.present,
  a.note,
  a.marked_at,
  prof.full_name AS marked_by_name
FROM attendances a
JOIN lessons l ON l.id = a.lesson_id
LEFT JOIN profiles prof ON prof.id = a.marked_by;

ALTER VIEW v_attendance_log SET (security_invoker = true);

GRANT SELECT ON v_attendance_log TO authenticated;
