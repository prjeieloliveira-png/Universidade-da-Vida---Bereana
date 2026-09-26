-- ============================================================================
-- MIGRAÇÃO 000030: Observação na falta + rótulo de data da aula
-- Não destrutiva: apenas ADD COLUMN IF NOT EXISTS e CREATE OR REPLACE FUNCTION.
-- ============================================================================

-- 1. Observação/justificativa opcional por presença (usada principalmente em faltas)
ALTER TABLE attendances
    ADD COLUMN IF NOT EXISTS note text;

-- 2. Rótulo de data livre da aula (ex.: "07 de Março"), separado do session_date
--    tipado (que não é usado pelo app hoje) para não exigir ano/parse.
ALTER TABLE lessons
    ADD COLUMN IF NOT EXISTS session_date_label text;

-- 3. record_attendance_rpc: aceita e grava a observação
--    (o novo parâmetro muda a assinatura; remove a versão de 5 argumentos para
--    evitar ambiguidade entre as duas sobrecargas em chamadas com 5 argumentos)
DROP FUNCTION IF EXISTS record_attendance_rpc(uuid, int, text, date, boolean);

CREATE OR REPLACE FUNCTION record_attendance_rpc(
  p_edition_id      uuid,
  p_session_number  int,
  p_full_name       text,
  p_birth_date      date,
  p_present         boolean,
  p_note            text DEFAULT NULL
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
  SELECT id INTO v_person_id
  FROM people
  WHERE lower(trim(full_name)) = lower(trim(p_full_name))
    AND birth_date = p_birth_date
  LIMIT 1;

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

  SELECT id INTO v_reg_id
  FROM registrations
  WHERE person_id = v_person_id
    AND edition_id = p_edition_id
  LIMIT 1;

  IF v_reg_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Inscrição não encontrada na turma');
  END IF;

  SELECT id INTO v_lesson_id
  FROM lessons
  WHERE edition_id = p_edition_id
    AND session_number = p_session_number
  LIMIT 1;

  IF v_lesson_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Aula/Semana ' || p_session_number || ' não encontrada');
  END IF;

  INSERT INTO attendances (registration_id, lesson_id, present, note, marked_at, marked_by)
  VALUES (v_reg_id, v_lesson_id, p_present, NULLIF(trim(p_note), ''), now(), auth.uid())
  ON CONFLICT (registration_id, lesson_id) DO UPDATE
  SET
    present   = EXCLUDED.present,
    note      = EXCLUDED.note,
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

-- 4. sync_attendances_rpc: cada item do lote pode trazer "note"
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
  v_note      text;
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
    v_note      := NULLIF(trim(COALESCE(v_item->>'note', '')), '');

    IF v_full_name IS NULL OR v_session IS NULL THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

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

    SELECT id INTO v_reg_id
    FROM registrations
    WHERE person_id = v_person_id AND edition_id = p_edition_id
    LIMIT 1;

    IF v_reg_id IS NULL THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    SELECT id INTO v_lesson_id
    FROM lessons
    WHERE edition_id = p_edition_id AND session_number = v_session
    LIMIT 1;

    IF v_lesson_id IS NULL THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    INSERT INTO attendances (registration_id, lesson_id, present, note, marked_at, marked_by)
    VALUES (v_reg_id, v_lesson_id, v_present, v_note, now(), auth.uid())
    ON CONFLICT (registration_id, lesson_id) DO UPDATE
    SET
      present   = EXCLUDED.present,
      note      = EXCLUDED.note,
      marked_at = now();

    v_synced := v_synced + 1;
  END LOOP;

  RETURN jsonb_build_object('synced', v_synced, 'skipped', v_skipped);
END;
$$;

GRANT EXECUTE ON FUNCTION record_attendance_rpc(uuid, int, text, date, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_attendances_rpc(uuid, jsonb) TO authenticated;
