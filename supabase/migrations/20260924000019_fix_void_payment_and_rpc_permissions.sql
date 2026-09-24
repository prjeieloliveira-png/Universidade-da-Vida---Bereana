-- ============================================================================
-- Correção da RPC void_payment e permissões de RPCs financeiras
-- ============================================================================

-- 1. Corrigir void_payment
CREATE OR REPLACE FUNCTION void_payment(payment_id UUID, reason TEXT DEFAULT 'Estorno solicitado')
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id UUID := auth.uid();
BEGIN
  -- Permissão: apenas coordenação ou secretaria (se autenticado)
  IF auth.uid() IS NOT NULL AND NOT is_coord_or_sec() THEN
    RAISE EXCEPTION 'Permissão negada: apenas coordenação ou secretaria pode estornar pagamentos';
  END IF;

  UPDATE payments
  SET voided_at = now(),
      voided_by = user_id,
      void_reason = COALESCE(reason, 'Estorno solicitado')
  WHERE id = payment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pagamento não encontrado: %', payment_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION void_payment(UUID, TEXT) TO authenticated, anon;

-- 2. Ajustar register_payment para suportar anon/dev mode
CREATE OR REPLACE FUNCTION register_payment(
  reg_id UUID,
  amt INTEGER,
  meth TEXT,
  pay_date DATE,
  pay_notes TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment_id UUID;
  v_norm_method TEXT;
BEGIN
  -- Permissão: apenas coordenação ou secretaria (se autenticado)
  IF auth.uid() IS NOT NULL AND NOT is_coord_or_sec() THEN
    RAISE EXCEPTION 'Permissão negada: apenas coordenação ou secretaria pode registrar pagamentos';
  END IF;

  v_norm_method := normalize_payment_method(meth);

  INSERT INTO payments (registration_id, amount_cents, payment_method, payment_date, notes)
  VALUES (reg_id, amt, v_norm_method, pay_date, pay_notes)
  RETURNING id INTO v_payment_id;

  RETURN v_payment_id;
END;
$$;

GRANT EXECUTE ON FUNCTION register_payment(UUID, INTEGER, TEXT, DATE, TEXT) TO authenticated, anon;

-- 3. Ajustar import_legacy_payments para suportar anon/dev mode
CREATE OR REPLACE FUNCTION import_legacy_payments(p_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item JSONB;
  v_items JSONB;
  v_person_id UUID;
  v_registration_id UUID;
  v_payment_id UUID;
  v_norm_method TEXT;
  v_inserted BIGINT := 0;
  v_skipped BIGINT := 0;
  v_payment_date DATE;
  v_reg_created_at TIMESTAMPTZ;
BEGIN
  -- Somente coordenação ou secretaria (se autenticado)
  IF auth.uid() IS NOT NULL AND NOT is_coord_or_sec() THEN
    RAISE EXCEPTION 'Permissão negada: apenas coordenação ou secretaria pode importar pagamentos';
  END IF;

  v_items := p_data;

  IF jsonb_typeof(v_items) != 'array' THEN
    RAISE EXCEPTION 'Dados devem ser um array JSON';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(v_items)
  LOOP
    -- Buscar pessoa por nome e data de nascimento
    SELECT id INTO v_person_id
    FROM people
    WHERE full_name = v_item->>'name'
      AND birth_date = (v_item->>'birthDate')::date;

    IF v_person_id IS NULL THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    -- Buscar inscrição ativa da pessoa
    SELECT id, created_at INTO v_registration_id, v_reg_created_at
    FROM registrations
    WHERE person_id = v_person_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_registration_id IS NULL THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    -- Verificar se já existe pagamento não estornado para esta inscrição
    IF EXISTS (
      SELECT 1 FROM payments
      WHERE registration_id = v_registration_id
        AND voided_at IS NULL
    ) THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    -- Normalizar método de pagamento
    v_norm_method := normalize_payment_method(v_item->>'paymentMethod');

    -- Usar a data de criação da inscrição como data do pagamento, ou a data atual
    v_payment_date := COALESCE(v_reg_created_at::date, CURRENT_DATE);

    -- Inserir pagamento
    INSERT INTO payments (
      registration_id,
      amount_cents,
      payment_method,
      payment_date,
      notes,
      source
    ) VALUES (
      v_registration_id,
      20000,
      v_norm_method,
      v_payment_date,
      'Migrado do cadastro — forma original: ' || COALESCE(v_item->>'paymentMethod', '—'),
      'legacy_migration'
    );

    v_inserted := v_inserted + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'inserted', v_inserted,
    'skipped', v_skipped
  );
END;
$$;

GRANT EXECUTE ON FUNCTION import_legacy_payments(JSONB) TO authenticated, anon;

-- 4. Garantir policy de UPDATE em payments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
    WHERE p.polname = 'payments_update_coord_or_anon' AND c.relname = 'payments'
  ) THEN
    CREATE POLICY "payments_update_coord_or_anon" ON payments
      FOR UPDATE TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
