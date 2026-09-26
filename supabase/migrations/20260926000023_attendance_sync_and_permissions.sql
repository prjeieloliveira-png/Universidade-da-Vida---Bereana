-- ============================================================================
-- MIGRAÇÃO 000023: Persistência de Chamadas (Attendances), Fila Offline e RLS
-- Garante gravação e leitura de presenças para a tela de Chamada e Porta
-- Cria RPCs record_attendance_rpc e sync_attendances_rpc (SECURITY DEFINER)
-- Cria View v_edition_attendance_matrix para consulta direta com pivô S1..S9
-- ============================================================================

-- 1. POLÍTICAS RLS PARA attendances E lessons

-- attendances: leitura para authenticated e anon
DROP POLICY IF EXISTS "attendances_select" ON attendances;
CREATE POLICY "attendances_select" ON attendances
    FOR SELECT TO authenticated, anon
    USING (true);

-- attendances: escrita e gerenciamento para authenticated e anon
DROP POLICY IF EXISTS "attendances_manage" ON attendances;
DROP POLICY IF EXISTS "attendances_all_access" ON attendances;
CREATE POLICY "attendances_all_access" ON attendances
    FOR ALL TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- lessons: leitura pública garantida para montagem de aulas
DROP POLICY IF EXISTS "lessons_select" ON lessons;
CREATE POLICY "lessons_select" ON lessons
    FOR SELECT TO authenticated, anon
    USING (true);


-- 2. RPC ATÔMICA PARA REGISTRAR UMA PRESENÇA (record_attendance_rpc)
-- Resolve o aluno e a aula por edição + número da semana
CREATE OR REPLACE FUNCTION record_attendance_rpc(
  p_edition_id      uuid,
  p_session_number  int,
  p_full_name       text,
  p_birth_date      date,
  p_present         boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_person_id uuid;
  v_reg_id    uuid;
  v_lesson_id uuid;
  v_att_id    uuid;
BEGIN
  -- 1. Localizar Pessoa por nome e data de nascimento
  SELECT id INTO v_person_id
  FROM people
  WHERE lower(trim(full_name)) = lower(trim(p_full_name))
    AND birth_date = p_birth_date
  LIMIT 1;

  -- Fallback: busca por nome dentro da edição se data de nascimento divergir
  IF v_person_id IS NULL THEN
    SELECT p.id INTO v_person_id
    FROM people p
    JOIN registrations r ON r.person_id = p.id
    WHERE r.edition_id = p_edition_id
      AND lower(trim(p.full_name)) = lower(trim(p_full_name))
    LIMIT 1;
  END IF;

  IF v_person_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Aluno não encontrado: ' || p_full_name);
  END IF;

  -- 2. Localizar Inscrição na Edição
  SELECT id INTO v_reg_id
  FROM registrations
  WHERE person_id = v_person_id
    AND edition_id = p_edition_id
  LIMIT 1;

  IF v_reg_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Inscrição não encontrada na turma');
  END IF;

  -- 3. Localizar Aula correspondente à semana da edição
  SELECT id INTO v_lesson_id
  FROM lessons
  WHERE edition_id = p_edition_id
    AND session_number = p_session_number
  LIMIT 1;

  IF v_lesson_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Aula/Semana ' || p_session_number || ' não encontrada');
  END IF;

  -- 4. Gravar/Atualizar Presença (Upsert idempotente)
  INSERT INTO attendances (registration_id, lesson_id, present, marked_at, marked_by)
  VALUES (v_reg_id, v_lesson_id, p_present, now(), auth.uid())
  ON CONFLICT (registration_id, lesson_id) DO UPDATE
  SET
    present   = EXCLUDED.present,
    marked_at = now()
  RETURNING id INTO v_att_id;

  RETURN jsonb_build_object(
    'success', true,
    'attendance_id', v_att_id,
    'registration_id', v_reg_id,
    'lesson_id', v_lesson_id,
    'session_number', p_session_number,
    'present', p_present
  );
END;
$$;


-- 3. RPC EM LOTE PARA SINCRONIZAÇÃO E FILA OFFLINE (sync_attendances_rpc)
CREATE OR REPLACE FUNCTION sync_attendances_rpc(
  p_edition_id uuid,
  p_items      jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item      jsonb;
  v_synced    int := 0;
  v_skipped   int := 0;
  v_full_name text;
  v_bdate     date;
  v_session   int;
  v_present   boolean;
  v_person_id uuid;
  v_reg_id    uuid;
  v_lesson_id uuid;
BEGIN
  IF jsonb_typeof(p_items) != 'array' THEN
    RAISE EXCEPTION 'p_items deve ser um array JSON';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_full_name := trim(v_item->>'full_name');
    v_bdate     := (v_item->>'birth_date')::date;
    v_session   := (v_item->>'session_number')::int;
    v_present   := COALESCE((v_item->>'present')::boolean, true);

    IF v_full_name IS NULL OR v_session IS NULL THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    -- Localizar pessoa
    SELECT id INTO v_person_id
    FROM people
    WHERE lower(trim(full_name)) = lower(v_full_name)
      AND (v_bdate IS NULL OR birth_date = v_bdate)
    LIMIT 1;

    IF v_person_id IS NULL THEN
      SELECT p.id INTO v_person_id
      FROM people p
      JOIN registrations r ON r.person_id = p.id
      WHERE r.edition_id = p_edition_id
        AND lower(trim(p.full_name)) = lower(v_full_name)
      LIMIT 1;
    END IF;

    IF v_person_id IS NULL THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    -- Localizar inscrição
    SELECT id INTO v_reg_id
    FROM registrations
    WHERE person_id = v_person_id AND edition_id = p_edition_id
    LIMIT 1;

    IF v_reg_id IS NULL THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    -- Localizar aula
    SELECT id INTO v_lesson_id
    FROM lessons
    WHERE edition_id = p_edition_id AND session_number = v_session
    LIMIT 1;

    IF v_lesson_id IS NULL THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    -- Upsert na presença
    INSERT INTO attendances (registration_id, lesson_id, present, marked_at, marked_by)
    VALUES (v_reg_id, v_lesson_id, v_present, now(), auth.uid())
    ON CONFLICT (registration_id, lesson_id) DO UPDATE
    SET
      present   = EXCLUDED.present,
      marked_at = now();

    v_synced := v_synced + 1;
  END LOOP;

  RETURN jsonb_build_object('synced', v_synced, 'skipped', v_skipped);
END;
$$;


-- 4. VIEW PARA MATRIZ DE PRESENÇA DA TURMA (v_edition_attendance_matrix)
CREATE OR REPLACE VIEW v_edition_attendance_matrix AS
SELECT
  r.id AS registration_id,
  r.edition_id,
  p.id AS person_id,
  p.full_name,
  p.birth_date,
  COALESCE(bool_or(CASE WHEN l.session_number = 1 THEN a.present END), false) AS s1,
  COALESCE(bool_or(CASE WHEN l.session_number = 2 THEN a.present END), false) AS s2,
  COALESCE(bool_or(CASE WHEN l.session_number = 3 THEN a.present END), false) AS s3,
  COALESCE(bool_or(CASE WHEN l.session_number = 4 THEN a.present END), false) AS s4,
  COALESCE(bool_or(CASE WHEN l.session_number = 5 THEN a.present END), false) AS s5,
  COALESCE(bool_or(CASE WHEN l.session_number = 6 THEN a.present END), false) AS s6,
  COALESCE(bool_or(CASE WHEN l.session_number = 7 THEN a.present END), false) AS s7,
  COALESCE(bool_or(CASE WHEN l.session_number = 8 THEN a.present END), false) AS s8,
  COALESCE(bool_or(CASE WHEN l.session_number = 9 THEN a.present END), false) AS s9,
  COUNT(a.id) FILTER (WHERE a.present = true) AS total_present
FROM registrations r
JOIN people p ON p.id = r.person_id
CROSS JOIN lessons l
LEFT JOIN attendances a ON a.registration_id = r.id AND a.lesson_id = l.id
WHERE l.edition_id = r.edition_id
GROUP BY r.id, r.edition_id, p.id, p.full_name, p.birth_date;


-- 5. PERMISSÕES DE EXECUÇÃO E ACESSO
GRANT EXECUTE ON FUNCTION record_attendance_rpc TO authenticated, anon;
GRANT EXECUTE ON FUNCTION sync_attendances_rpc TO authenticated, anon;
GRANT EXECUTE ON FUNCTION mark_attendance_batch TO authenticated, anon;
GRANT SELECT ON v_edition_attendance_matrix TO authenticated, anon;
