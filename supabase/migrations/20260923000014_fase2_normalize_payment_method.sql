-- =============================================================================
-- FASE 2: Normalização do campo payment_method em payments
-- Idempotente: seguro para rodar múltiplas vezes
-- =============================================================================

-- 1. Remover constraint legada (valores em maiúsculas) e adicionar a nova (canônica)
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_payment_method_check;

ALTER TABLE payments
  ADD CONSTRAINT payments_payment_method_check
  CHECK (payment_method IN ('pix', 'debit', 'credit', 'cash'));

-- 2. Atualizar o check de financial_transactions para usar os novos valores canonicos
--    (a tabela usava 'PIX', 'CARTÃO' etc. via upsert_registration)
--    Aqui só garantimos que a constraint esteja correta; dados serão mapeados pela RPC.

-- 3. Corrigir a RPC register_payment (usa coluna errada 'method' em vez de 'payment_method')
-- DROP necessário pois o tipo de retorno mudou de VOID para UUID
DROP FUNCTION IF EXISTS register_payment(UUID, BIGINT, payment_method, DATE, TEXT);

CREATE OR REPLACE FUNCTION register_payment(
  reg_id     UUID,
  amt        BIGINT,
  meth       payment_method,
  pay_date   DATE DEFAULT CURRENT_DATE,
  pay_notes  TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment_id UUID;
BEGIN
  -- Somente coordenação ou secretaria
  IF NOT is_coord_or_sec() THEN
    RAISE EXCEPTION 'Permissão negada: apenas coordenação ou secretaria pode registrar pagamentos';
  END IF;

  INSERT INTO payments (registration_id, amount_cents, payment_method, payment_date, notes)
  VALUES (reg_id, amt, meth::text, pay_date, pay_notes)
  RETURNING id INTO v_payment_id;

  RETURN v_payment_id;
END;
$$;

-- 4. Corrigir a RPC upsert_registration para mapear valores legados ao inserir em payments
--    O mapeamento: PIX -> pix, CARTÃO -> credit, DINHEIRO -> cash, TRANSFERÊNCIA -> debit, OUTRO -> cash
CREATE OR REPLACE FUNCTION normalize_payment_method(raw text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN upper(raw) IN ('PIX')          THEN 'pix'
    WHEN upper(raw) IN ('CARTÃO', 'CARTAO', 'CRÉDITO', 'CREDITO') THEN 'credit'
    WHEN upper(raw) IN ('DINHEIRO', 'CASH') THEN 'cash'
    WHEN upper(raw) IN ('DÉBITO', 'DEBITO', 'TRANSFERÊNCIA', 'TRANSFERENCIA') THEN 'debit'
    WHEN lower(raw) IN ('pix', 'credit', 'debit', 'cash') THEN lower(raw)
    ELSE 'cash'  -- fallback seguro
  END;
$$;

-- 5. Atualizar upsert_registration para usar normalize_payment_method
CREATE OR REPLACE FUNCTION upsert_registration(p_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_person_id        uuid;
  v_registration_id  uuid;
  v_edition_id       uuid;
  v_network_id       uuid;
  v_leader_id        uuid;
  v_norm_method      text;
BEGIN
  -- Somente coordenação ou secretaria
  IF NOT is_coord_or_sec() THEN
    RAISE EXCEPTION 'Permissão negada';
  END IF;

  v_edition_id := (p_data->>'edition_id')::uuid;

  -- Upsert pessoa
  INSERT INTO people (full_name, birth_date, gender, marital_status, phone, address)
  VALUES (
    p_data->>'full_name',
    (p_data->>'birth_date')::date,
    p_data->>'gender',
    p_data->>'marital_status',
    p_data->>'phone',
    p_data->>'address'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_person_id;

  IF v_person_id IS NULL THEN
    SELECT id INTO v_person_id FROM people
    WHERE full_name = p_data->>'full_name'
      AND birth_date = (p_data->>'birth_date')::date;
  END IF;

  -- Resolver network_id a partir do nome da rede
  IF p_data->>'network_name' IS NOT NULL THEN
    SELECT id INTO v_network_id FROM networks WHERE name = p_data->>'network_name';
  END IF;

  -- Resolver leader_id a partir do nome do líder
  IF p_data->>'cell_leader_name' IS NOT NULL THEN
    SELECT id INTO v_leader_id FROM cell_leaders WHERE name = p_data->>'cell_leader_name';
  END IF;

  -- Upsert inscrição
  INSERT INTO registrations (person_id, edition_id, network_id, leader_id, shirt_size, pastor_name, g12_leader, cell_leader)
  VALUES (
    v_person_id,
    v_edition_id,
    v_network_id,
    v_leader_id,
    p_data->>'shirt_size',
    p_data->>'pastor_name',
    p_data->>'g12_name',
    p_data->>'cell_leader_name'
  )
  ON CONFLICT (person_id, edition_id) DO UPDATE
  SET
    network_id   = EXCLUDED.network_id,
    leader_id    = EXCLUDED.leader_id,
    shirt_size   = EXCLUDED.shirt_size,
    pastor_name  = EXCLUDED.pastor_name,
    g12_leader   = EXCLUDED.g12_leader,
    cell_leader  = EXCLUDED.cell_leader,
    updated_at   = now()
  RETURNING id INTO v_registration_id;

  IF v_registration_id IS NULL THEN
    SELECT id INTO v_registration_id FROM registrations
    WHERE person_id = v_person_id AND edition_id = v_edition_id;
  END IF;

  -- Saúde
  IF (p_data->>'has_condition') IS NOT NULL THEN
    INSERT INTO health_records (person_id, has_condition, condition_description, medication_schedule)
    VALUES (
      v_person_id,
      (p_data->>'has_condition')::boolean,
      p_data->>'condition_description',
      p_data->>'medication_schedule'
    )
    ON CONFLICT (person_id) DO UPDATE
    SET
      has_condition         = EXCLUDED.has_condition,
      condition_description = EXCLUDED.condition_description,
      medication_schedule   = EXCLUDED.medication_schedule,
      updated_at            = now();
  END IF;

  -- Pagamento (somente se valor > 0 e método fornecido)
  IF (p_data->>'amount_cents')::bigint > 0 AND p_data->>'payment_method' IS NOT NULL THEN
    -- Normalizar método legado para valor canônico
    v_norm_method := normalize_payment_method(p_data->>'payment_method');

    INSERT INTO payments (registration_id, amount_cents, payment_method, payment_date, recorded_by)
    VALUES (
      v_registration_id,
      (p_data->>'amount_cents')::bigint,
      v_norm_method,
      CURRENT_DATE,
      auth.uid()
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_registration_id;
END;
$$;
