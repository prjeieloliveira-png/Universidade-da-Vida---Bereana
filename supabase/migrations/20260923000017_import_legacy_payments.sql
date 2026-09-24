-- ============================================================================
-- FASE: Importação de pagamentos legados do localStorage para Supabase
-- Idempotente: seguro para rodar múltiplas vezes
-- ============================================================================

-- 1. Adicionar coluna source na tabela payments (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'source'
  ) THEN
    ALTER TABLE payments ADD COLUMN source text DEFAULT 'manual';
  END IF;
END $$;

-- 2. Criar índice para otimizar verificação de idempotência
CREATE INDEX IF NOT EXISTS idx_payments_source_registration_id
  ON payments (registration_id) WHERE source = 'legacy_migration';

-- 3. RPC idempotente para importar pagamentos legados
--    Recebe JSON com array de itens: [{ name, birthDate, paymentMethod, registrationCreatedAt }]
--    Retorna: { inserted: bigint, skipped: bigint }
CREATE OR REPLACE FUNCTION import_legacy_payments(p_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_edition_id uuid := '33333333-3333-3333-3333-333333333333'; -- Edição 2026 ativa
  v_items jsonb;
  v_item jsonb;
  v_person_id uuid;
  v_registration_id uuid;
  v_payment_id uuid;
  v_norm_method text;
  v_inserted bigint := 0;
  v_skipped bigint := 0;
  v_payment_date date;
  v_reg_created_at timestamptz;
BEGIN
  -- Somente coordenação ou secretaria
  IF NOT is_coord_or_sec() THEN
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

    -- Buscar inscrição ativa na edição 2026
    SELECT r.id INTO v_registration_id
    FROM registrations r
    WHERE r.person_id = v_person_id
      AND r.edition_id = v_edition_id
      AND r.status = 'confirmed';

    IF v_registration_id IS NULL THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    -- Verificar idempotência: já existe pagamento com source='legacy_migration'?
    IF EXISTS (
      SELECT 1 FROM payments p
      WHERE p.registration_id = v_registration_id
        AND p.source = 'legacy_migration'
    ) THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    -- Normalizar método de pagamento legado
    v_norm_method := normalize_payment_method(v_item->>'paymentMethod');

    -- Data do pagamento: created_at da inscrição (se disponível), senão data de início da edição
    v_payment_date := COALESCE(
      (SELECT created_at::date FROM registrations r WHERE r.id = v_registration_id),
      (SELECT start_date FROM editions WHERE id = v_edition_id)
    );

    -- Inserir pagamento
    INSERT INTO payments (registration_id, amount_cents, payment_method, payment_date, notes, source)
    VALUES (
      v_registration_id,
      20000,
      v_norm_method,
      v_payment_date,
      'Migrado do cadastro — forma original: ' || v_item->>'paymentMethod',
      'legacy_migration'
    )
    RETURNING id INTO v_payment_id;

    IF v_payment_id IS NOT NULL THEN
      v_inserted := v_inserted + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('inserted', v_inserted, 'skipped', v_skipped);
END;
$$;
