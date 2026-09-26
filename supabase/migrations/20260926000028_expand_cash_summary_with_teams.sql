-- ============================================================================
-- MIGRAÇÃO: Expansão do v_cash_summary para incluir pagamentos das equipes
-- Adiciona colunas de equipes separadas e totais consolidados
-- ============================================================================

-- Recria a view v_cash_summary com novas colunas de equipes
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
  COALESCE(team_stats.total_active_members, 0) * 10000      AS total_team_goal_cents,
  -- pago pelas equipes
  COALESCE(team_pay.total_team_paid_cents, 0)               AS total_team_paid_cents,
  -- a receber das equipes
  GREATEST(
    COALESCE(team_stats.total_active_members, 0) * 10000
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
    COALESCE(SUM(vrp.registration_fee_cents), 0)                           AS total_fee_cents
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
    COUNT(*) FILTER (WHERE tm.active = true AND vtmp.status = 'pending')   AS team_pending_count
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
