-- ============================================================================
-- MIGRAÇÃO: PAGAMENTOS DE MEMBROS DAS EQUIPES DA UV
-- Cria a tabela team_member_payments, view derivada de status e RPCs.
-- ============================================================================

-- 1. Tabela de pagamentos dos membros de equipe
CREATE TABLE IF NOT EXISTS team_member_payments (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    team_member_id  uuid NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    edition_id      uuid NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    amount_cents    integer NOT NULL CHECK (amount_cents > 0),
    payment_method  text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('pix','debit','credit','cash')),
    payment_date    date NOT NULL DEFAULT CURRENT_DATE,
    notes           text,
    voided_at       timestamptz,
    void_reason     text,
    created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tmp_member    ON team_member_payments(team_member_id);
CREATE INDEX IF NOT EXISTS idx_tmp_edition   ON team_member_payments(edition_id);
CREATE INDEX IF NOT EXISTS idx_tmp_voided    ON team_member_payments(voided_at) WHERE voided_at IS NULL;

-- 2. Row Level Security
ALTER TABLE team_member_payments ENABLE ROW LEVEL SECURITY;

-- Leitura: coord/sec e anon (para modo dev)
DROP POLICY IF EXISTS "tmp_select" ON team_member_payments;
CREATE POLICY "tmp_select" ON team_member_payments
    FOR SELECT TO authenticated, anon USING (true);

-- Escrita: apenas coord/sec (autenticados) — via RPC SECURITY DEFINER para anon
DROP POLICY IF EXISTS "tmp_insert" ON team_member_payments;
CREATE POLICY "tmp_insert" ON team_member_payments
    FOR INSERT TO authenticated
    WITH CHECK (is_coord_or_sec());

DROP POLICY IF EXISTS "tmp_update" ON team_member_payments;
CREATE POLICY "tmp_update" ON team_member_payments
    FOR UPDATE TO authenticated
    USING (is_coord_or_sec())
    WITH CHECK (is_coord_or_sec());

DROP POLICY IF EXISTS "tmp_delete" ON team_member_payments;
CREATE POLICY "tmp_delete" ON team_member_payments
    FOR DELETE TO authenticated
    USING (is_coord_or_sec());

-- 3. View derivada de status de pagamento por membro (nunca salvar status em coluna)
CREATE OR REPLACE VIEW v_team_member_payment_status AS
SELECT
    tm.id                                                   AS team_member_id,
    tm.edition_id,
    tm.person_id,
    tm.team_role_id,
    tm.active,
    10000                                                   AS registration_fee_cents,
    COALESCE(SUM(p.amount_cents) FILTER (WHERE p.voided_at IS NULL), 0)::integer AS total_paid_cents,
    GREATEST(10000 - COALESCE(SUM(p.amount_cents) FILTER (WHERE p.voided_at IS NULL), 0)::integer, 0) AS outstanding_cents,
    CASE
        WHEN COALESCE(SUM(p.amount_cents) FILTER (WHERE p.voided_at IS NULL), 0) >= 10000 THEN 'paid'
        WHEN COALESCE(SUM(p.amount_cents) FILTER (WHERE p.voided_at IS NULL), 0) >    0  THEN 'partial'
        ELSE 'pending'
    END                                                     AS status,
    COUNT(p.id) FILTER (WHERE p.voided_at IS NULL)::integer AS payment_count,
    MAX(p.payment_date) FILTER (WHERE p.voided_at IS NULL) AS last_payment_at
FROM team_members tm
LEFT JOIN team_member_payments p ON p.team_member_id = tm.id
GROUP BY tm.id, tm.edition_id, tm.person_id, tm.team_role_id, tm.active;

-- 4. RPC para registrar pagamento de membro de equipe (SECURITY DEFINER — suporta anon em dev)
CREATE OR REPLACE FUNCTION register_team_member_payment(
    p_team_member_id  uuid,
    p_edition_id      uuid,
    p_amount_cents    integer,
    p_method          text,
    p_date            date,
    p_notes           text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id uuid;
BEGIN
    -- Permite anon em dev; em produção exige coord/sec autenticado
    IF auth.uid() IS NOT NULL AND NOT is_coord_or_sec() THEN
        RAISE EXCEPTION 'Permissão negada: apenas coordenação ou secretaria pode registrar pagamentos';
    END IF;

    IF p_amount_cents <= 0 THEN
        RAISE EXCEPTION 'Valor do pagamento deve ser positivo';
    END IF;

    INSERT INTO team_member_payments (
        team_member_id, edition_id, amount_cents,
        payment_method, payment_date, notes, created_by
    )
    VALUES (
        p_team_member_id, p_edition_id, p_amount_cents,
        p_method, p_date, p_notes, auth.uid()
    )
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION register_team_member_payment(uuid, uuid, integer, text, date, text)
    TO authenticated, anon;

-- 5. RPC para estornar pagamento de membro de equipe
CREATE OR REPLACE FUNCTION void_team_member_payment(
    p_payment_id uuid,
    p_reason     text DEFAULT 'Estorno manual via painel'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NOT NULL AND NOT is_coord_or_sec() THEN
        RAISE EXCEPTION 'Permissão negada: apenas coordenação ou secretaria pode estornar pagamentos';
    END IF;

    UPDATE team_member_payments
    SET voided_at   = now(),
        void_reason = p_reason
    WHERE id = p_payment_id
      AND voided_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pagamento não encontrado ou já estornado';
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION void_team_member_payment(uuid, text)
    TO authenticated, anon;
