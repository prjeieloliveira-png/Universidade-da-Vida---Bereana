-- ============================================================================
-- RPC delete_registration: exclusão de inscrito pelo menu Inscrições
-- Não destrutiva para o schema: apenas cria a função.
--
-- Regras:
--   * somente usuários autenticados com perfil de coordenação ou secretaria;
--   * bloqueada se a inscrição tiver pagamentos válidos (não estornados) —
--     o pagamento deve ser estornado no Financeiro antes;
--   * presenças e pagamentos estornados são removidos por ON DELETE CASCADE;
--     financial_transactions ficam com registration_id = NULL;
--   * a pessoa é excluída junto quando não tem outra inscrição nem vínculo
--     com equipes (evita cadastros órfãos, como os de teste).
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_registration(p_registration_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_person_id UUID;
  v_valid_payments INTEGER;
  v_attendances INTEGER;
  v_person_deleted BOOLEAN := false;
BEGIN
  IF auth.uid() IS NULL OR NOT is_coord_or_sec() THEN
    RAISE EXCEPTION 'Permissão negada: apenas coordenação ou secretaria pode excluir inscritos'
      USING ERRCODE = '42501';
  END IF;

  SELECT person_id INTO v_person_id
  FROM registrations
  WHERE id = p_registration_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inscrição não encontrada: %', p_registration_id
      USING ERRCODE = 'P0002';
  END IF;

  SELECT COUNT(*) INTO v_valid_payments
  FROM payments
  WHERE registration_id = p_registration_id AND voided_at IS NULL;

  IF v_valid_payments > 0 THEN
    RAISE EXCEPTION 'Inscrição possui % pagamento(s) registrado(s). Estorne no Financeiro antes de excluir.', v_valid_payments
      USING ERRCODE = 'P0001', HINT = 'has_payments';
  END IF;

  SELECT COUNT(*) INTO v_attendances
  FROM attendances
  WHERE registration_id = p_registration_id;

  DELETE FROM registrations WHERE id = p_registration_id;

  IF NOT EXISTS (SELECT 1 FROM registrations WHERE person_id = v_person_id)
     AND NOT EXISTS (SELECT 1 FROM team_members WHERE person_id = v_person_id) THEN
    DELETE FROM people WHERE id = v_person_id;
    v_person_deleted := true;
  END IF;

  RETURN jsonb_build_object(
    'person_deleted', v_person_deleted,
    'attendances_deleted', v_attendances
  );
END;
$$;

REVOKE ALL ON FUNCTION delete_registration(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION delete_registration(UUID) TO authenticated;
