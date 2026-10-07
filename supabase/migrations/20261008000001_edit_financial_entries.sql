-- ============================================================================
-- MIGRAÇÃO: edição de lançamentos financeiros (inscrição de aluno, equipe e manuais)
-- com trilha de auditoria e data real no extrato.
-- Não destrutiva: CREATE TABLE IF NOT EXISTS, CREATE OR REPLACE, GRANT.
-- ============================================================================

-- 1. Trilha de auditoria: quem editou, quando e o que mudou (antes/depois)
CREATE TABLE IF NOT EXISTS financial_edit_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity     text NOT NULL CHECK (entity IN ('payment', 'team_payment', 'transaction')),
  entity_id  uuid NOT NULL,
  edited_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  edited_at  timestamptz NOT NULL DEFAULT now(),
  before     jsonb NOT NULL,
  after      jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_fel_entity ON financial_edit_log(entity, entity_id, edited_at DESC);

ALTER TABLE financial_edit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fel_select_coord_sec" ON financial_edit_log;
CREATE POLICY "fel_select_coord_sec" ON financial_edit_log
  FOR SELECT TO authenticated USING (is_coord_or_sec());
-- Sem policy de escrita: só as RPCs abaixo (SECURITY DEFINER) gravam no log.

-- 2. Edição de pagamento de inscrição de aluno
CREATE OR REPLACE FUNCTION update_payment(
  p_payment_id   uuid,
  p_amount_cents integer,
  p_method       text,
  p_date         date,
  p_notes        text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old    payments%ROWTYPE;
  v_fee    bigint;
  v_others bigint;
BEGIN
  IF auth.uid() IS NULL OR NOT is_coord_or_sec() THEN
    RAISE EXCEPTION 'Permissão negada: apenas coordenação ou secretaria pode editar lançamentos';
  END IF;
  IF p_amount_cents IS NULL OR p_amount_cents <= 0 THEN
    RAISE EXCEPTION 'O valor deve ser maior que zero';
  END IF;
  IF p_method NOT IN ('pix', 'debit', 'credit', 'cash') THEN
    RAISE EXCEPTION 'Forma de pagamento inválida';
  END IF;

  SELECT * INTO v_old FROM payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND OR v_old.voided_at IS NOT NULL THEN
    RAISE EXCEPTION 'Pagamento não encontrado ou já estornado';
  END IF;

  SELECT e.registration_fee_cents INTO v_fee
  FROM editions e JOIN registrations r ON r.edition_id = e.id
  WHERE r.id = v_old.registration_id;

  SELECT COALESCE(SUM(amount_cents), 0) INTO v_others
  FROM payments
  WHERE registration_id = v_old.registration_id AND voided_at IS NULL AND id <> p_payment_id;

  IF v_others + p_amount_cents > v_fee THEN
    RAISE EXCEPTION 'Pagamento excede o valor da taxa (valor máximo para este lançamento: %)', v_fee - v_others;
  END IF;

  UPDATE payments
  SET amount_cents = p_amount_cents,
      payment_method = p_method,
      payment_date = p_date,
      notes = NULLIF(trim(COALESCE(p_notes, '')), '')
  WHERE id = p_payment_id;

  INSERT INTO financial_edit_log (entity, entity_id, edited_by, before, after)
  VALUES ('payment', p_payment_id, auth.uid(),
    jsonb_build_object('amount_cents', v_old.amount_cents, 'payment_method', v_old.payment_method,
                       'payment_date', v_old.payment_date, 'notes', v_old.notes),
    jsonb_build_object('amount_cents', p_amount_cents, 'payment_method', p_method,
                       'payment_date', p_date, 'notes', NULLIF(trim(COALESCE(p_notes, '')), '')));
END;
$$;

-- 3. Edição de pagamento de membro de equipe
CREATE OR REPLACE FUNCTION update_team_member_payment(
  p_payment_id   uuid,
  p_amount_cents integer,
  p_method       text,
  p_date         date,
  p_notes        text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old    team_member_payments%ROWTYPE;
  v_others bigint;
BEGIN
  IF auth.uid() IS NULL OR NOT is_coord_or_sec() THEN
    RAISE EXCEPTION 'Permissão negada: apenas coordenação ou secretaria pode editar lançamentos';
  END IF;
  IF p_amount_cents IS NULL OR p_amount_cents <= 0 THEN
    RAISE EXCEPTION 'O valor deve ser maior que zero';
  END IF;
  IF p_method NOT IN ('pix', 'debit', 'credit', 'cash') THEN
    RAISE EXCEPTION 'Forma de pagamento inválida';
  END IF;

  SELECT * INTO v_old FROM team_member_payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND OR v_old.voided_at IS NOT NULL THEN
    RAISE EXCEPTION 'Pagamento não encontrado ou já estornado';
  END IF;

  -- Taxa da equipe: R$ 100,00 (mesmo valor usado em v_team_member_payment_status)
  SELECT COALESCE(SUM(amount_cents), 0) INTO v_others
  FROM team_member_payments
  WHERE team_member_id = v_old.team_member_id AND voided_at IS NULL AND id <> p_payment_id;

  IF v_others + p_amount_cents > 10000 THEN
    RAISE EXCEPTION 'Pagamento excede o valor da taxa (valor máximo para este lançamento: %)', 10000 - v_others;
  END IF;

  UPDATE team_member_payments
  SET amount_cents = p_amount_cents,
      payment_method = p_method,
      payment_date = p_date,
      notes = NULLIF(trim(COALESCE(p_notes, '')), '')
  WHERE id = p_payment_id;

  INSERT INTO financial_edit_log (entity, entity_id, edited_by, before, after)
  VALUES ('team_payment', p_payment_id, auth.uid(),
    jsonb_build_object('amount_cents', v_old.amount_cents, 'payment_method', v_old.payment_method,
                       'payment_date', v_old.payment_date, 'notes', v_old.notes),
    jsonb_build_object('amount_cents', p_amount_cents, 'payment_method', p_method,
                       'payment_date', p_date, 'notes', NULLIF(trim(COALESCE(p_notes, '')), '')));
END;
$$;

-- 4. Edição de entrada/saída manual
CREATE OR REPLACE FUNCTION update_financial_transaction(
  p_id           uuid,
  p_type         text,
  p_category     text,
  p_amount_cents integer,
  p_method       text,
  p_description  text,
  p_date         date,
  p_receipt_url  text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old financial_transactions%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR NOT is_coord_or_sec() THEN
    RAISE EXCEPTION 'Permissão negada: apenas coordenação ou secretaria pode editar lançamentos';
  END IF;
  IF p_type NOT IN ('revenue', 'expense') THEN
    RAISE EXCEPTION 'Tipo de lançamento inválido';
  END IF;
  IF p_amount_cents IS NULL OR p_amount_cents <= 0 THEN
    RAISE EXCEPTION 'O valor deve ser maior que zero';
  END IF;
  IF p_method NOT IN ('pix', 'debit', 'credit', 'cash') THEN
    RAISE EXCEPTION 'Forma de pagamento inválida';
  END IF;
  IF trim(COALESCE(p_category, '')) = '' OR trim(COALESCE(p_description, '')) = '' THEN
    RAISE EXCEPTION 'Categoria e descrição são obrigatórias';
  END IF;

  SELECT * INTO v_old FROM financial_transactions WHERE id = p_id FOR UPDATE;
  IF NOT FOUND OR v_old.voided_at IS NOT NULL THEN
    RAISE EXCEPTION 'Lançamento não encontrado ou já estornado';
  END IF;

  UPDATE financial_transactions
  SET type = p_type,
      category = trim(p_category),
      amount_cents = p_amount_cents,
      payment_method = p_method,
      description = trim(p_description),
      transaction_date = p_date,
      receipt_url = NULLIF(trim(COALESCE(p_receipt_url, '')), '')
  WHERE id = p_id;

  INSERT INTO financial_edit_log (entity, entity_id, edited_by, before, after)
  VALUES ('transaction', p_id, auth.uid(),
    jsonb_build_object('type', v_old.type, 'category', v_old.category, 'amount_cents', v_old.amount_cents,
                       'payment_method', v_old.payment_method, 'description', v_old.description,
                       'transaction_date', v_old.transaction_date, 'receipt_url', v_old.receipt_url),
    jsonb_build_object('type', p_type, 'category', trim(p_category), 'amount_cents', p_amount_cents,
                       'payment_method', p_method, 'description', trim(p_description),
                       'transaction_date', p_date, 'receipt_url', NULLIF(trim(COALESCE(p_receipt_url, '')), '')));
END;
$$;

REVOKE ALL ON FUNCTION update_payment(uuid, integer, text, date, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION update_team_member_payment(uuid, integer, text, date, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION update_financial_transaction(uuid, text, text, integer, text, text, date, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION update_payment(uuid, integer, text, date, text) TO authenticated;
GRANT EXECUTE ON FUNCTION update_team_member_payment(uuid, integer, text, date, text) TO authenticated;
GRANT EXECUTE ON FUNCTION update_financial_transaction(uuid, text, text, integer, text, text, date, text) TO authenticated;

-- 5. Extrato: data real do pagamento/lançamento (meio-dia, para não virar o dia no fuso do Brasil)
--    + última edição (quando e por quem), observação e comprovante: colunas novas ao final da view.
CREATE OR REPLACE VIEW v_cash_flow AS
SELECT
  p.id AS transaction_id,
  (p.payment_date::timestamp + interval '12 hours')::timestamptz AS date,
  'payment'::TEXT AS source,
  'in'::TEXT AS flow_type,
  p.amount_cents,
  p.payment_method,
  'Inscrição' AS category,
  r.id AS registration_id,
  r.edition_id,
  pe.full_name AS person_name,
  prof.full_name AS recorded_by_name,
  le.edited_at AS last_edited_at,
  le.edited_by_name AS last_edited_by_name,
  p.notes AS notes,
  p.receipt_url AS receipt_url
FROM payments p
JOIN registrations r ON p.registration_id = r.id
JOIN people pe ON pe.id = r.person_id
LEFT JOIN profiles prof ON prof.id = p.recorded_by
LEFT JOIN LATERAL (
  SELECT l.edited_at, ep.full_name AS edited_by_name
  FROM financial_edit_log l LEFT JOIN profiles ep ON ep.id = l.edited_by
  WHERE l.entity = 'payment' AND l.entity_id = p.id
  ORDER BY l.edited_at DESC LIMIT 1
) le ON true
WHERE p.voided_at IS NULL
UNION ALL
SELECT
  tp.id,
  (tp.payment_date::timestamp + interval '12 hours')::timestamptz,
  'team_payment'::TEXT,
  'in'::TEXT,
  tp.amount_cents,
  tp.payment_method,
  'Equipe',
  NULL::uuid,
  tp.edition_id,
  pe.full_name,
  prof.full_name,
  le.edited_at,
  le.edited_by_name,
  tp.notes,
  NULL::text
FROM team_member_payments tp
JOIN team_members tm ON tm.id = tp.team_member_id
JOIN people pe ON pe.id = tm.person_id
LEFT JOIN profiles prof ON prof.id = tp.created_by
LEFT JOIN LATERAL (
  SELECT l.edited_at, ep.full_name AS edited_by_name
  FROM financial_edit_log l LEFT JOIN profiles ep ON ep.id = l.edited_by
  WHERE l.entity = 'team_payment' AND l.entity_id = tp.id
  ORDER BY l.edited_at DESC LIMIT 1
) le ON true
WHERE tp.voided_at IS NULL
UNION ALL
SELECT
  ft.id,
  (ft.transaction_date::timestamp + interval '12 hours')::timestamptz,
  'manual'::TEXT,
  CASE WHEN ft.type = 'revenue' THEN 'in' ELSE 'out' END,
  ft.amount_cents,
  ft.payment_method,
  ft.category,
  ft.registration_id,
  ft.edition_id,
  NULL,
  prof.full_name,
  le.edited_at,
  le.edited_by_name,
  NULL::text,
  ft.receipt_url
FROM financial_transactions ft
LEFT JOIN profiles prof ON prof.id = ft.recorded_by
LEFT JOIN LATERAL (
  SELECT l.edited_at, ep.full_name AS edited_by_name
  FROM financial_edit_log l LEFT JOIN profiles ep ON ep.id = l.edited_by
  WHERE l.entity = 'transaction' AND l.entity_id = ft.id
  ORDER BY l.edited_at DESC LIMIT 1
) le ON true
WHERE ft.voided_at IS NULL;

ALTER VIEW v_cash_flow SET (security_invoker = true);
GRANT SELECT ON v_cash_flow TO authenticated;
