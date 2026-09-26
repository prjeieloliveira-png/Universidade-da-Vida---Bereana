-- ============================================================================
-- Correção de estorno de transações financeiras manuais e permissões
-- ============================================================================

CREATE OR REPLACE FUNCTION void_financial_transaction(tx_id UUID, reason TEXT DEFAULT 'Estorno solicitado')
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
    RAISE EXCEPTION 'Permissão negada: apenas coordenação ou secretaria pode estornar lançamentos';
  END IF;

  UPDATE financial_transactions
  SET voided_at = now(),
      voided_by = user_id,
      void_reason = COALESCE(reason, 'Estorno solicitado')
  WHERE id = tx_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lançamento financeiro não encontrado: %', tx_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION void_financial_transaction(UUID, TEXT) TO authenticated, anon;

-- Garantir policy de UPDATE em financial_transactions para ambientes dev/coord
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
    WHERE p.polname = 'financial_transactions_update_coord_or_anon' AND c.relname = 'financial_transactions'
  ) THEN
    CREATE POLICY "financial_transactions_update_coord_or_anon" ON financial_transactions
      FOR UPDATE TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
