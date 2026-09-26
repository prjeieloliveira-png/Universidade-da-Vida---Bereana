-- =============================================================================
-- Fix: Remove overloaded register_payment function with payment_method enum
-- A migração 20260923000014 criou register_payment(UUID, BIGINT, payment_method, DATE, TEXT)
-- A migração 20260924000019 criou register_payment(UUID, INTEGER, TEXT, DATE, TEXT)
-- O Supabase não consegue resolver a ambiguidade. Removemos a versão com enum aqui.
-- =============================================================================

-- Drop da versão com BIGINT + payment_method enum (não mais necessária)
DROP FUNCTION IF EXISTS register_payment(UUID, BIGINT, payment_method, DATE, TEXT);

-- A versão canonical (INTEGER, TEXT) criada em 20260924000019 permanece e é a correta.
-- Garantimos que ela existe com a assinatura correta:
CREATE OR REPLACE FUNCTION register_payment(
  reg_id     UUID,
  amt        INTEGER,
  meth       TEXT,
  pay_date   DATE,
  pay_notes  TEXT DEFAULT NULL
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
