-- ============================================================================
-- MIGRAÇÃO: taxa editável por pessoa + "Quitação concluída" (abatimento)
-- Não destrutiva: ADD COLUMN IF NOT EXISTS, CREATE OR REPLACE, GRANT.
--  * registrations.fee_cents / team_members.fee_cents: taxa própria (vazio = padrão)
--  * settled_at/settled_by/settled_note: quitação concluída (status 'paid' mesmo com
--    pagamento parcial); o abatimento é DERIVADO (taxa - pago) nas views, nunca gravado
--  * views de status e v_cash_summary passam a usar a taxa efetiva e o abatimento
--  * RPCs: set_payment_fee, settle_payment_obligation, unsettle_payment_obligation
-- ============================================================================

ALTER TABLE registrations ADD COLUMN IF NOT EXISTS fee_cents integer CHECK (fee_cents IS NULL OR fee_cents > 0);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS settled_at timestamptz;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS settled_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS settled_note text;

ALTER TABLE team_members ADD COLUMN IF NOT EXISTS fee_cents integer CHECK (fee_cents IS NULL OR fee_cents > 0);
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS settled_at timestamptz;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS settled_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS settled_note text;

-- Auditoria: novos tipos de entidade
ALTER TABLE financial_edit_log DROP CONSTRAINT IF EXISTS financial_edit_log_entity_check;
ALTER TABLE financial_edit_log ADD CONSTRAINT financial_edit_log_entity_check
  CHECK (entity IN ('payment', 'team_payment', 'transaction',
                    'registration_fee', 'team_fee', 'registration_settlement', 'team_settlement'));

-- Views de status (mesmas colunas de antes; novas ao final)
CREATE OR REPLACE VIEW v_registration_payment_status AS
SELECT
  b.registration_id,
  b.edition_id,
  b.person_id,
  b.fee AS registration_fee_cents,
  b.paid AS total_paid_cents,
  CASE WHEN b.settled_at IS NOT NULL THEN 0::bigint
       ELSE GREATEST(0::bigint, b.fee - b.paid) END AS outstanding_cents,
  CASE
    WHEN b.settled_at IS NOT NULL OR b.paid >= b.fee THEN 'paid'
    WHEN b.paid > 0 THEN 'partial'
    ELSE 'pending'
  END AS status,
  b.payment_count,
  b.last_payment_at,
  CASE WHEN b.settled_at IS NOT NULL THEN GREATEST(0::bigint, b.fee - b.paid) ELSE 0::bigint END AS waived_cents,
  b.settled_at,
  b.settled_note
FROM (
  SELECT
    r.id AS registration_id,
    r.edition_id,
    r.person_id,
    COALESCE(r.fee_cents, e.registration_fee_cents) AS fee,
    COALESCE(SUM(p.amount_cents) FILTER (WHERE p.voided_at IS NULL), 0) AS paid,
    COUNT(p.id) FILTER (WHERE p.voided_at IS NULL) AS payment_count,
    MAX(p.created_at) FILTER (WHERE p.voided_at IS NULL) AS last_payment_at,
    r.settled_at,
    r.settled_note
  FROM registrations r
  JOIN editions e ON r.edition_id = e.id
  LEFT JOIN payments p ON p.registration_id = r.id
  GROUP BY r.id, r.edition_id, r.person_id, e.registration_fee_cents, r.fee_cents, r.settled_at, r.settled_note
) b;
ALTER VIEW v_registration_payment_status SET (security_invoker = true);

CREATE OR REPLACE VIEW v_team_member_payment_status AS
SELECT
  b.team_member_id,
  b.edition_id,
  b.person_id,
  b.team_role_id,
  b.active,
  b.fee AS registration_fee_cents,
  b.paid AS total_paid_cents,
  CASE WHEN b.settled_at IS NOT NULL THEN 0 ELSE GREATEST(b.fee - b.paid, 0) END AS outstanding_cents,
  CASE
    WHEN b.settled_at IS NOT NULL OR b.paid >= b.fee THEN 'paid'
    WHEN b.paid > 0 THEN 'partial'
    ELSE 'pending'
  END AS status,
  b.payment_count,
  b.last_payment_at,
  CASE WHEN b.settled_at IS NOT NULL THEN GREATEST(b.fee - b.paid, 0) ELSE 0 END AS waived_cents,
  b.settled_at,
  b.settled_note
FROM (
  SELECT
    tm.id AS team_member_id,
    tm.edition_id,
    tm.person_id,
    tm.team_role_id,
    tm.active,
    COALESCE(tm.fee_cents, 10000) AS fee,
    COALESCE(SUM(p.amount_cents) FILTER (WHERE p.voided_at IS NULL), 0)::integer AS paid,
    COUNT(p.id) FILTER (WHERE p.voided_at IS NULL)::integer AS payment_count,
    MAX(p.payment_date) FILTER (WHERE p.voided_at IS NULL) AS last_payment_at,
    tm.settled_at,
    tm.settled_note
  FROM team_members tm
  LEFT JOIN team_member_payments p ON p.team_member_id = tm.id
  GROUP BY tm.id, tm.edition_id, tm.person_id, tm.team_role_id, tm.active, tm.fee_cents, tm.settled_at, tm.settled_note
) b;
ALTER VIEW v_team_member_payment_status SET (security_invoker = true);

-- Resumo do caixa: meta = taxas efetivas menos abatimentos
CREATE OR REPLACE VIEW v_cash_summary AS
SELECT
  e.id AS edition_id,

  -- ── INSCRITOS: pagamentos de inscrição ─────────────────────────────────────
  COALESCE(pay_totals.total_payment_cents, 0)               AS total_payment_in_cents,
  -- Totais de transações manuais (receitas)
  COALESCE(ft_in.total_cents, 0)                            AS total_manual_in_cents,
  -- Totais de transações manuais (despesas)
  COALESCE(ft_out.total_cents, 0)                           AS total_manual_out_cents,
  -- Totais gerais (entrada/saída)
  (COALESCE(pay_totals.total_payment_cents, 0)
    + COALESCE(ft_in.total_cents, 0)
    + COALESCE(team_pay.total_team_paid_cents, 0))           AS total_in_cents,
  COALESCE(ft_out.total_cents, 0)                           AS total_out_cents,
  (COALESCE(pay_totals.total_payment_cents, 0)
    + COALESCE(ft_in.total_cents, 0)
    + COALESCE(team_pay.total_team_paid_cents, 0)
    - COALESCE(ft_out.total_cents, 0))                      AS net_balance_cents,

  -- ── INSCRITOS: status/meta ─────────────────────────────────────────────────
  COALESCE(reg_stats.total_registrations, 0)                AS total_registrations,
  COALESCE(reg_stats.paid_count, 0)                         AS paid_count,
  COALESCE(reg_stats.partial_count, 0)                      AS partial_count,
  COALESCE(reg_stats.pending_count, 0)                      AS pending_count,
  COALESCE(reg_stats.total_receivable_cents, 0)             AS total_receivable_cents,
  -- meta total de inscritos = soma de todas as taxas de inscrição da edição
  COALESCE(reg_stats.total_fee_cents, 0)                    AS total_registration_goal_cents,
  -- pago pelos inscritos
  COALESCE(pay_totals.total_payment_cents, 0)               AS total_registration_paid_cents,

  -- ── EQUIPES: status/meta ───────────────────────────────────────────────────
  COALESCE(team_stats.total_active_members, 0)              AS total_team_members,
  COALESCE(team_stats.team_paid_count, 0)                   AS team_paid_count,
  COALESCE(team_stats.team_partial_count, 0)                AS team_partial_count,
  COALESCE(team_stats.team_pending_count, 0)                AS team_pending_count,
  -- meta das equipes = membros ativos × R$100
  COALESCE(team_stats.team_goal_cents, 0)                    AS total_team_goal_cents,
  -- pago pelas equipes
  COALESCE(team_pay.total_team_paid_cents, 0)               AS total_team_paid_cents,
  -- a receber das equipes
  GREATEST(
    COALESCE(team_stats.team_goal_cents, 0)
    - COALESCE(team_pay.total_team_paid_cents, 0),
    0
  )                                                         AS total_team_receivable_cents

FROM editions e

-- Pagamentos de inscrição (não estornados)
LEFT JOIN LATERAL (
  SELECT COALESCE(SUM(p.amount_cents), 0) AS total_payment_cents
  FROM payments p
  JOIN registrations r ON p.registration_id = r.id
  WHERE r.edition_id = e.id AND p.voided_at IS NULL
) pay_totals ON true

-- Transações manuais de receita
LEFT JOIN LATERAL (
  SELECT COALESCE(SUM(ft.amount_cents), 0) AS total_cents
  FROM financial_transactions ft
  WHERE ft.edition_id = e.id AND ft.voided_at IS NULL AND ft.type = 'revenue'
) ft_in ON true

-- Transações manuais de despesa
LEFT JOIN LATERAL (
  SELECT COALESCE(SUM(ft.amount_cents), 0) AS total_cents
  FROM financial_transactions ft
  WHERE ft.edition_id = e.id AND ft.voided_at IS NULL AND ft.type = 'expense'
) ft_out ON true

-- Status dos inscritos
LEFT JOIN LATERAL (
  SELECT
    COUNT(*)                                                                AS total_registrations,
    COUNT(CASE WHEN vrp.status = 'paid'    THEN 1 END)                     AS paid_count,
    COUNT(CASE WHEN vrp.status = 'partial' THEN 1 END)                     AS partial_count,
    COUNT(CASE WHEN vrp.status = 'pending' THEN 1 END)                     AS pending_count,
    COALESCE(SUM(vrp.outstanding_cents), 0)                                AS total_receivable_cents,
    COALESCE(SUM(vrp.registration_fee_cents - vrp.waived_cents), 0)           AS total_fee_cents
  FROM registrations r2
  JOIN v_registration_payment_status vrp ON vrp.registration_id = r2.id
  WHERE r2.edition_id = e.id
) reg_stats ON true

-- Status dos membros de equipe (contagem por status)
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) FILTER (WHERE tm.active = true)                               AS total_active_members,
    COUNT(*) FILTER (WHERE tm.active = true AND vtmp.status = 'paid')      AS team_paid_count,
    COUNT(*) FILTER (WHERE tm.active = true AND vtmp.status = 'partial')   AS team_partial_count,
    COUNT(*) FILTER (WHERE tm.active = true AND vtmp.status = 'pending')   AS team_pending_count,
    COALESCE(SUM(vtmp.registration_fee_cents - vtmp.waived_cents) FILTER (WHERE tm.active = true), 0) AS team_goal_cents
  FROM team_members tm
  LEFT JOIN v_team_member_payment_status vtmp ON vtmp.team_member_id = tm.id
  WHERE tm.edition_id = e.id
) team_stats ON true

-- Total pago pelas equipes (não estornado)
LEFT JOIN LATERAL (
  SELECT COALESCE(SUM(tmp.amount_cents), 0) AS total_team_paid_cents
  FROM team_member_payments tmp
  WHERE tmp.edition_id = e.id AND tmp.voided_at IS NULL
) team_pay ON true;

ALTER VIEW v_cash_summary SET (security_invoker = true);

-- Travas de limite passam a usar a taxa efetiva da pessoa
CREATE OR REPLACE FUNCTION prevent_overpayment()
RETURNS trigger AS $$
DECLARE
  fee BIGINT;
  current_total BIGINT;
BEGIN
  SELECT COALESCE(r.fee_cents, e.registration_fee_cents) INTO fee
  FROM registrations r
  JOIN editions e ON r.edition_id = e.id
  WHERE r.id = NEW.registration_id;

  SELECT COALESCE(SUM(p.amount_cents), 0) INTO current_total
  FROM payments p
  WHERE p.registration_id = NEW.registration_id
    AND p.voided_at IS NULL;

  IF (current_total + NEW.amount_cents) > fee THEN
    RAISE EXCEPTION 'Pagamento excede o valor da taxa (saldo restante: %)', fee - current_total;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION prevent_team_overpayment()
RETURNS trigger AS $$
DECLARE
  fee BIGINT;
  current_total BIGINT;
BEGIN
  SELECT COALESCE(tm.fee_cents, 10000) INTO fee FROM team_members tm WHERE tm.id = NEW.team_member_id;

  SELECT COALESCE(SUM(p.amount_cents), 0) INTO current_total
  FROM team_member_payments p
  WHERE p.team_member_id = NEW.team_member_id AND p.voided_at IS NULL;

  IF (current_total + NEW.amount_cents) > fee THEN
    RAISE EXCEPTION 'Pagamento excede o valor da taxa (saldo restante: %)', fee - current_total;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_team_overpayment ON team_member_payments;
CREATE TRIGGER trg_prevent_team_overpayment
BEFORE INSERT ON team_member_payments
FOR EACH ROW EXECUTE FUNCTION prevent_team_overpayment();

-- Edição de pagamentos: limite pela taxa efetiva
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

  SELECT COALESCE(r.fee_cents, e.registration_fee_cents) INTO v_fee
  FROM registrations r JOIN editions e ON r.edition_id = e.id
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

  SELECT * INTO v_old FROM team_member_payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND OR v_old.voided_at IS NOT NULL THEN
    RAISE EXCEPTION 'Pagamento não encontrado ou já estornado';
  END IF;

  SELECT COALESCE(tm.fee_cents, 10000) INTO v_fee FROM team_members tm WHERE tm.id = v_old.team_member_id;

  SELECT COALESCE(SUM(amount_cents), 0) INTO v_others
  FROM team_member_payments
  WHERE team_member_id = v_old.team_member_id AND voided_at IS NULL AND id <> p_payment_id;

  IF v_others + p_amount_cents > v_fee THEN
    RAISE EXCEPTION 'Pagamento excede o valor da taxa (valor máximo para este lançamento: %)', v_fee - v_others;
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

-- Taxa por pessoa
CREATE OR REPLACE FUNCTION set_payment_fee(p_kind text, p_id uuid, p_fee_cents integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_fee bigint;
  v_paid    bigint;
BEGIN
  IF auth.uid() IS NULL OR NOT is_coord_or_sec() THEN
    RAISE EXCEPTION 'Permissão negada: apenas coordenação ou secretaria pode alterar a taxa';
  END IF;
  IF p_fee_cents IS NULL OR p_fee_cents <= 0 THEN
    RAISE EXCEPTION 'A taxa deve ser maior que zero';
  END IF;

  IF p_kind = 'registration' THEN
    SELECT registration_fee_cents, total_paid_cents INTO v_old_fee, v_paid
    FROM v_registration_payment_status WHERE registration_id = p_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Inscrição não encontrada'; END IF;
    IF p_fee_cents < v_paid THEN
      RAISE EXCEPTION 'A taxa não pode ser menor que o valor já pago (%)', v_paid;
    END IF;
    UPDATE registrations SET fee_cents = p_fee_cents WHERE id = p_id;
    INSERT INTO financial_edit_log (entity, entity_id, edited_by, before, after)
    VALUES ('registration_fee', p_id, auth.uid(),
            jsonb_build_object('fee_cents', v_old_fee), jsonb_build_object('fee_cents', p_fee_cents));
  ELSIF p_kind = 'team' THEN
    SELECT registration_fee_cents, total_paid_cents INTO v_old_fee, v_paid
    FROM v_team_member_payment_status WHERE team_member_id = p_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Membro da equipe não encontrado'; END IF;
    IF p_fee_cents < v_paid THEN
      RAISE EXCEPTION 'A taxa não pode ser menor que o valor já pago (%)', v_paid;
    END IF;
    UPDATE team_members SET fee_cents = p_fee_cents WHERE id = p_id;
    INSERT INTO financial_edit_log (entity, entity_id, edited_by, before, after)
    VALUES ('team_fee', p_id, auth.uid(),
            jsonb_build_object('fee_cents', v_old_fee), jsonb_build_object('fee_cents', p_fee_cents));
  ELSE
    RAISE EXCEPTION 'Tipo inválido (use registration ou team)';
  END IF;
END;
$$;

-- Quitação concluída (abatimento derivado: taxa - pago)
CREATE OR REPLACE FUNCTION settle_payment_obligation(p_kind text, p_id uuid, p_note text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fee     bigint;
  v_paid    bigint;
  v_settled timestamptz;
  v_note    text := NULLIF(trim(COALESCE(p_note, '')), '');
BEGIN
  IF auth.uid() IS NULL OR NOT is_coord_or_sec() THEN
    RAISE EXCEPTION 'Permissão negada: apenas coordenação ou secretaria pode concluir quitação';
  END IF;

  IF p_kind = 'registration' THEN
    SELECT registration_fee_cents, total_paid_cents, settled_at INTO v_fee, v_paid, v_settled
    FROM v_registration_payment_status WHERE registration_id = p_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Inscrição não encontrada'; END IF;
  ELSIF p_kind = 'team' THEN
    SELECT registration_fee_cents, total_paid_cents, settled_at INTO v_fee, v_paid, v_settled
    FROM v_team_member_payment_status WHERE team_member_id = p_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Membro da equipe não encontrado'; END IF;
  ELSE
    RAISE EXCEPTION 'Tipo inválido (use registration ou team)';
  END IF;

  IF v_settled IS NOT NULL THEN
    RAISE EXCEPTION 'A quitação já foi concluída';
  END IF;
  IF v_paid <= 0 THEN
    RAISE EXCEPTION 'Registre ao menos um pagamento antes de concluir a quitação';
  END IF;
  IF v_paid >= v_fee THEN
    RAISE EXCEPTION 'O valor já está totalmente pago';
  END IF;

  IF p_kind = 'registration' THEN
    UPDATE registrations SET settled_at = now(), settled_by = auth.uid(), settled_note = v_note WHERE id = p_id;
  ELSE
    UPDATE team_members SET settled_at = now(), settled_by = auth.uid(), settled_note = v_note WHERE id = p_id;
  END IF;

  INSERT INTO financial_edit_log (entity, entity_id, edited_by, before, after)
  VALUES (CASE WHEN p_kind = 'registration' THEN 'registration_settlement' ELSE 'team_settlement' END,
          p_id, auth.uid(),
          jsonb_build_object('settled', false),
          jsonb_build_object('settled', true, 'fee_cents', v_fee, 'paid_cents', v_paid,
                             'waived_cents', v_fee - v_paid, 'note', v_note));
END;
$$;

CREATE OR REPLACE FUNCTION unsettle_payment_obligation(p_kind text, p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settled timestamptz;
BEGIN
  IF auth.uid() IS NULL OR NOT is_coord_or_sec() THEN
    RAISE EXCEPTION 'Permissão negada: apenas coordenação ou secretaria pode desfazer quitação';
  END IF;

  IF p_kind = 'registration' THEN
    SELECT settled_at INTO v_settled FROM registrations WHERE id = p_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Inscrição não encontrada'; END IF;
    IF v_settled IS NULL THEN RAISE EXCEPTION 'Esta inscrição não está quitada por abatimento'; END IF;
    UPDATE registrations SET settled_at = NULL, settled_by = NULL, settled_note = NULL WHERE id = p_id;
  ELSIF p_kind = 'team' THEN
    SELECT settled_at INTO v_settled FROM team_members WHERE id = p_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Membro da equipe não encontrado'; END IF;
    IF v_settled IS NULL THEN RAISE EXCEPTION 'Este membro não está quitado por abatimento'; END IF;
    UPDATE team_members SET settled_at = NULL, settled_by = NULL, settled_note = NULL WHERE id = p_id;
  ELSE
    RAISE EXCEPTION 'Tipo inválido (use registration ou team)';
  END IF;

  INSERT INTO financial_edit_log (entity, entity_id, edited_by, before, after)
  VALUES (CASE WHEN p_kind = 'registration' THEN 'registration_settlement' ELSE 'team_settlement' END,
          p_id, auth.uid(),
          jsonb_build_object('settled', true, 'settled_at', v_settled),
          jsonb_build_object('settled', false));
END;
$$;

REVOKE ALL ON FUNCTION set_payment_fee(text, uuid, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION settle_payment_obligation(text, uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION unsettle_payment_obligation(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION set_payment_fee(text, uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION settle_payment_obligation(text, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION unsettle_payment_obligation(text, uuid) TO authenticated;
