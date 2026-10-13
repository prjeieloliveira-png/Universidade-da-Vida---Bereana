-- ============================================================================
-- MIGRAÇÃO: Cortesia para membros da equipe (is_courtesy)
-- Não destrutiva: ADD COLUMN IF NOT EXISTS, CREATE OR REPLACE, GRANT.
--  * team_members.is_courtesy: membro convidado/cortesia (isento de pagamento)
--  * Membros cortesia saem do cálculo do financeiro:
--      - registration_fee_cents = 0
--      - outstanding_cents = 0
--      - status = 'courtesy'
--      - excluídos da meta e do a receber em v_cash_summary
--  * RPC segura: set_team_member_courtesy(p_team_member_id, p_is_courtesy)
-- ============================================================================

-- 1. Nova coluna na tabela team_members
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS is_courtesy boolean NOT NULL DEFAULT false;

-- 2. Atualizar check constraint de auditoria
ALTER TABLE financial_edit_log DROP CONSTRAINT IF EXISTS financial_edit_log_entity_check;
ALTER TABLE financial_edit_log ADD CONSTRAINT financial_edit_log_entity_check
  CHECK (entity IN ('payment', 'team_payment', 'transaction',
                    'registration_fee', 'team_fee', 'registration_settlement',
                    'team_settlement', 'team_courtesy'));

-- 3. Atualizar views v_team_member_payment_status e v_cash_summary
DROP VIEW IF EXISTS v_cash_summary CASCADE;
DROP VIEW IF EXISTS v_team_member_payment_status CASCADE;

CREATE OR REPLACE VIEW v_team_member_payment_status AS
SELECT
  b.team_member_id,
  b.edition_id,
  b.person_id,
  b.team_role_id,
  b.active,
  CASE WHEN b.is_courtesy THEN 0 ELSE b.fee END AS registration_fee_cents,
  b.paid AS total_paid_cents,
  CASE
    WHEN b.is_courtesy THEN 0
    WHEN b.settled_at IS NOT NULL THEN 0
    ELSE GREATEST(b.fee - b.paid, 0)
  END AS outstanding_cents,
  CASE
    WHEN b.is_courtesy THEN 'courtesy'
    WHEN b.settled_at IS NOT NULL OR b.paid >= b.fee THEN 'paid'
    WHEN b.paid > 0 THEN 'partial'
    ELSE 'pending'
  END AS status,
  b.payment_count,
  b.last_payment_at,
  CASE
    WHEN b.is_courtesy THEN 0
    WHEN b.settled_at IS NOT NULL THEN GREATEST(b.fee - b.paid, 0)
    ELSE 0
  END AS waived_cents,
  b.settled_at,
  b.settled_note,
  b.is_courtesy
FROM (
  SELECT
    tm.id AS team_member_id,
    tm.edition_id,
    tm.person_id,
    tm.team_role_id,
    tm.active,
    tm.is_courtesy,
    COALESCE(tm.fee_cents, 10000) AS fee,
    COALESCE(SUM(p.amount_cents) FILTER (WHERE p.voided_at IS NULL), 0)::integer AS paid,
    COUNT(p.id) FILTER (WHERE p.voided_at IS NULL)::integer AS payment_count,
    MAX(p.payment_date) FILTER (WHERE p.voided_at IS NULL) AS last_payment_at,
    tm.settled_at,
    tm.settled_note
  FROM team_members tm
  LEFT JOIN team_member_payments p ON p.team_member_id = tm.id
  GROUP BY tm.id, tm.edition_id, tm.person_id, tm.team_role_id, tm.active, tm.is_courtesy, tm.fee_cents, tm.settled_at, tm.settled_note
) b;
ALTER VIEW v_team_member_payment_status SET (security_invoker = true);
REVOKE ALL ON v_team_member_payment_status FROM anon;
GRANT SELECT ON v_team_member_payment_status TO authenticated;

-- 4. Atualizar view v_cash_summary (excluindo cortesias da meta e pendências)
DROP VIEW IF EXISTS v_cash_summary CASCADE;
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
  COALESCE(reg_stats.total_fee_cents, 0)                    AS total_registration_goal_cents,
  COALESCE(pay_totals.total_payment_cents, 0)               AS total_registration_paid_cents,

  -- ── EQUIPES: status/meta ───────────────────────────────────────────────────
  COALESCE(team_stats.total_active_members, 0)              AS total_team_members,
  COALESCE(team_stats.team_paid_count, 0)                   AS team_paid_count,
  COALESCE(team_stats.team_partial_count, 0)                AS team_partial_count,
  COALESCE(team_stats.team_pending_count, 0)                AS team_pending_count,
  COALESCE(team_stats.team_goal_cents, 0)                   AS total_team_goal_cents,
  COALESCE(team_pay.total_team_paid_cents, 0)               AS total_team_paid_cents,
  GREATEST(
    COALESCE(team_stats.team_goal_cents, 0)
    - COALESCE(team_pay.total_team_paid_cents, 0),
    0
  )                                                         AS total_team_receivable_cents,
  COALESCE(team_stats.team_courtesy_count, 0)               AS team_courtesy_count

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

-- Status dos membros de equipe (excluindo cortesias da meta e das pendências)
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) FILTER (WHERE tm.active = true)                               AS total_active_members,
    COUNT(*) FILTER (WHERE tm.active = true AND vtmp.status = 'paid')      AS team_paid_count,
    COUNT(*) FILTER (WHERE tm.active = true AND vtmp.status = 'partial')   AS team_partial_count,
    COUNT(*) FILTER (WHERE tm.active = true AND vtmp.status = 'pending')   AS team_pending_count,
    COUNT(*) FILTER (WHERE tm.active = true AND vtmp.status = 'courtesy')  AS team_courtesy_count,
    COALESCE(SUM(vtmp.registration_fee_cents - vtmp.waived_cents) FILTER (WHERE tm.active = true AND NOT tm.is_courtesy), 0) AS team_goal_cents
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
REVOKE ALL ON v_cash_summary FROM anon;
GRANT SELECT ON v_cash_summary TO authenticated;

-- 5. RPC para alternar cortesia de membro da equipe
CREATE OR REPLACE FUNCTION set_team_member_courtesy(p_team_member_id uuid, p_is_courtesy boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_courtesy boolean;
  v_paid         bigint;
BEGIN
  IF auth.uid() IS NULL OR NOT is_coord_or_sec() THEN
    RAISE EXCEPTION 'Permissão negada: apenas coordenação ou secretaria pode alterar cortesia';
  END IF;

  SELECT is_courtesy INTO v_old_courtesy
  FROM team_members
  WHERE id = p_team_member_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Membro da equipe não encontrado';
  END IF;

  -- Se for marcar como cortesia, não pode ter pagamentos ativos registrados
  IF p_is_courtesy = true THEN
    SELECT total_paid_cents INTO v_paid
    FROM v_team_member_payment_status
    WHERE team_member_id = p_team_member_id;

    IF COALESCE(v_paid, 0) > 0 THEN
      RAISE EXCEPTION 'Não é possível marcar como cortesia um membro com pagamentos registrados (% centavos). Estorne os pagamentos antes.', v_paid;
    END IF;
  END IF;

  UPDATE team_members
  SET is_courtesy = p_is_courtesy,
      updated_at = now()
  WHERE id = p_team_member_id;

  INSERT INTO financial_edit_log (entity, entity_id, edited_by, before, after)
  VALUES ('team_courtesy', p_team_member_id, auth.uid(),
          jsonb_build_object('is_courtesy', v_old_courtesy),
          jsonb_build_object('is_courtesy', p_is_courtesy));
END;
$$;

GRANT EXECUTE ON FUNCTION set_team_member_courtesy(uuid, boolean) TO authenticated;
