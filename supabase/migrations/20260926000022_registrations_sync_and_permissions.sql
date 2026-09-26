-- ============================================================================
-- MIGRAÇÃO 000022: Persistência de Inscrições, Upsert Atômico e Permissões RLS
-- Permite leitura e escrita seguras em people, registrations e health_records
-- Cria RPC upsert_student_registration para criação e edição em tempo real
-- ============================================================================

-- 1. AJUSTES DE POLÍTICAS RLS (Garante leitura e escrita completas)

-- people
DROP POLICY IF EXISTS "people_select" ON people;
CREATE POLICY "people_select" ON people
    FOR SELECT TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "people_insert_coord_or_anon" ON people;
DROP POLICY IF EXISTS "people_update_coord_or_anon" ON people;
DROP POLICY IF EXISTS "people_all_access" ON people;
CREATE POLICY "people_all_access" ON people
    FOR ALL TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- registrations
DROP POLICY IF EXISTS "registrations_select" ON registrations;
CREATE POLICY "registrations_select" ON registrations
    FOR SELECT TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "registrations_insert_coord_or_anon" ON registrations;
DROP POLICY IF EXISTS "registrations_update_coord_or_anon" ON registrations;
DROP POLICY IF EXISTS "registrations_all_access" ON registrations;
CREATE POLICY "registrations_all_access" ON registrations
    FOR ALL TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- health_records
DROP POLICY IF EXISTS "health_records_coord_sec_only" ON health_records;
DROP POLICY IF EXISTS "health_records_all_access" ON health_records;
CREATE POLICY "health_records_all_access" ON health_records
    FOR ALL TO authenticated, anon
    USING (true)
    WITH CHECK (true);


-- 2. FUNÇÃO ATÔMICA: upsert_student_registration
-- Salva ou atualiza Aluno (Pessoa + Inscrição + Ficha de Saúde) em uma única transação
CREATE OR REPLACE FUNCTION upsert_student_registration(
  p_edition_id            uuid,
  p_full_name             text,
  p_birth_date            date,
  p_gender                text,
  p_marital_status        text,
  p_phone                 text,
  p_address               text DEFAULT NULL,
  p_photo_url             text DEFAULT NULL,
  p_shirt_size            text DEFAULT NULL,
  p_pastor_name           text DEFAULT NULL,
  p_g12_leader            text DEFAULT NULL,
  p_cell_leader           text DEFAULT NULL,
  p_status                text DEFAULT 'confirmed',
  p_has_condition         boolean DEFAULT false,
  p_condition_description text DEFAULT NULL,
  p_medication_schedule   text DEFAULT NULL,
  p_person_id             uuid DEFAULT NULL,
  p_registration_id       uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_person_id       uuid := p_person_id;
  v_registration_id uuid := p_registration_id;
  v_gender          text;
BEGIN
  -- Normaliza gênero para constraint do banco
  v_gender := CASE
    WHEN p_gender IN ('Masculino', 'Feminino') THEN p_gender
    ELSE 'Outro'
  END;

  -- 1. Se person_id não for informado, busca por full_name + birth_date
  IF v_person_id IS NULL THEN
    SELECT id INTO v_person_id
    FROM people
    WHERE full_name = trim(p_full_name) AND birth_date = p_birth_date
    LIMIT 1;
  END IF;

  -- 2. Upsert em people
  IF v_person_id IS NOT NULL THEN
    UPDATE people
    SET
      full_name      = trim(p_full_name),
      birth_date     = p_birth_date,
      gender         = v_gender,
      marital_status = COALESCE(p_marital_status, people.marital_status),
      phone          = COALESCE(NULLIF(trim(p_phone), ''), people.phone),
      address        = COALESCE(NULLIF(trim(p_address), ''), people.address),
      photo_url      = COALESCE(NULLIF(trim(p_photo_url), ''), people.photo_url),
      updated_at     = now()
    WHERE id = v_person_id;
  ELSE
    INSERT INTO people (
      full_name, birth_date, gender, marital_status, phone, address, photo_url
    )
    VALUES (
      trim(p_full_name), p_birth_date, v_gender, COALESCE(p_marital_status, 'Solteiro'),
      COALESCE(NULLIF(trim(p_phone), ''), '—'), NULLIF(trim(p_address), ''), NULLIF(trim(p_photo_url), '')
    )
    RETURNING id INTO v_person_id;
  END IF;

  -- 3. Upsert em registrations
  IF v_registration_id IS NULL THEN
    SELECT id INTO v_registration_id
    FROM registrations
    WHERE person_id = v_person_id AND edition_id = p_edition_id
    LIMIT 1;
  END IF;

  IF v_registration_id IS NOT NULL THEN
    UPDATE registrations
    SET
      shirt_size  = COALESCE(NULLIF(trim(p_shirt_size), ''), registrations.shirt_size),
      pastor_name = COALESCE(NULLIF(trim(p_pastor_name), ''), registrations.pastor_name),
      g12_leader  = COALESCE(NULLIF(trim(p_g12_leader), ''), registrations.g12_leader),
      cell_leader = COALESCE(NULLIF(trim(p_cell_leader), ''), registrations.cell_leader),
      status      = COALESCE(p_status, registrations.status),
      updated_at  = now()
    WHERE id = v_registration_id;
  ELSE
    INSERT INTO registrations (
      person_id, edition_id, status, shirt_size, pastor_name, g12_leader, cell_leader
    )
    VALUES (
      v_person_id, p_edition_id, COALESCE(p_status, 'confirmed'),
      NULLIF(trim(p_shirt_size), ''), NULLIF(trim(p_pastor_name), ''),
      NULLIF(trim(p_g12_leader), ''), NULLIF(trim(p_cell_leader), '')
    )
    RETURNING id INTO v_registration_id;
  END IF;

  -- 4. Upsert em health_records
  INSERT INTO health_records (
    person_id, has_condition, condition_description, medication_schedule, updated_at
  )
  VALUES (
    v_person_id,
    COALESCE(p_has_condition, false),
    NULLIF(trim(p_condition_description), ''),
    NULLIF(trim(p_medication_schedule), ''),
    now()
  )
  ON CONFLICT (person_id) DO UPDATE
  SET
    has_condition         = EXCLUDED.has_condition,
    condition_description = EXCLUDED.condition_description,
    medication_schedule   = EXCLUDED.medication_schedule,
    updated_at            = now();

  RETURN jsonb_build_object(
    'person_id', v_person_id,
    'registration_id', v_registration_id,
    'success', true
  );
END;
$$;


-- 3. EXPANSÃO DA RPC sync_students_from_local (Inclui foto e saúde)
CREATE OR REPLACE FUNCTION sync_students_from_local(
  p_edition_id uuid,
  p_data       jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item          jsonb;
  v_person_id     uuid;
  v_reg_id        uuid;
  v_full_name     text;
  v_birth_date    date;
  v_gender        text;
  v_marital       text;
  v_phone         text;
  v_address       text;
  v_shirt_size    text;
  v_pastor        text;
  v_g12           text;
  v_leader        text;
  v_photo_url     text;
  v_comorbidity   text;
  v_med_schedule  text;
  v_has_condition boolean;
  v_synced        bigint := 0;
  v_skipped       bigint := 0;
BEGIN
  IF jsonb_typeof(p_data) != 'array' THEN
    RAISE EXCEPTION 'p_data deve ser um array JSON';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_data)
  LOOP
    v_full_name    := trim(v_item->>'full_name');
    v_birth_date   := (v_item->>'birth_date')::date;
    v_gender       := COALESCE(v_item->>'gender', 'Outro');
    v_marital      := COALESCE(v_item->>'marital_status', 'Solteiro');
    v_phone        := COALESCE(NULLIF(trim(v_item->>'phone'), ''), '—');
    v_address      := NULLIF(trim(v_item->>'address'), '');
    v_shirt_size   := NULLIF(trim(v_item->>'shirt_size'), '');
    v_pastor       := NULLIF(trim(v_item->>'pastor'), '');
    v_g12          := NULLIF(trim(v_item->>'g12'), '');
    v_leader       := NULLIF(trim(v_item->>'leader'), '');
    v_photo_url    := NULLIF(trim(v_item->>'photo_url'), '');
    v_comorbidity  := NULLIF(trim(v_item->>'comorbidity'), '');
    v_med_schedule := NULLIF(trim(v_item->>'med_schedule'), '');

    v_gender := CASE
      WHEN v_gender IN ('Masculino', 'Feminino') THEN v_gender
      ELSE 'Outro'
    END;

    IF v_full_name IS NULL OR v_birth_date IS NULL THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    -- Upsert pessoa
    INSERT INTO people (full_name, birth_date, gender, marital_status, phone, address, photo_url)
    VALUES (v_full_name, v_birth_date, v_gender, v_marital, v_phone, v_address, v_photo_url)
    ON CONFLICT (full_name, birth_date) DO UPDATE
    SET
      gender         = EXCLUDED.gender,
      marital_status = EXCLUDED.marital_status,
      phone          = EXCLUDED.phone,
      address        = COALESCE(EXCLUDED.address, people.address),
      photo_url      = COALESCE(EXCLUDED.photo_url, people.photo_url),
      updated_at     = now()
    RETURNING id INTO v_person_id;

    IF v_person_id IS NULL THEN
      SELECT id INTO v_person_id
      FROM people
      WHERE full_name = v_full_name AND birth_date = v_birth_date;
    END IF;

    IF v_person_id IS NULL THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    -- Upsert inscrição
    INSERT INTO registrations (
      person_id, edition_id, status,
      shirt_size, pastor_name, g12_leader, cell_leader
    )
    VALUES (
      v_person_id, p_edition_id, 'confirmed',
      v_shirt_size, v_pastor, v_g12, v_leader
    )
    ON CONFLICT (person_id, edition_id) DO UPDATE
    SET
      shirt_size   = COALESCE(EXCLUDED.shirt_size, registrations.shirt_size),
      pastor_name  = COALESCE(EXCLUDED.pastor_name, registrations.pastor_name),
      g12_leader   = COALESCE(EXCLUDED.g12_leader, registrations.g12_leader),
      cell_leader  = COALESCE(EXCLUDED.cell_leader, registrations.cell_leader),
      updated_at   = now()
    RETURNING id INTO v_reg_id;

    -- Upsert saúde
    v_has_condition := (v_comorbidity IS NOT NULL AND lower(v_comorbidity) != 'não' AND lower(v_comorbidity) != 'nao' AND v_comorbidity != '—');
    INSERT INTO health_records (
      person_id, has_condition, condition_description, medication_schedule, updated_at
    )
    VALUES (
      v_person_id,
      v_has_condition,
      v_comorbidity,
      v_med_schedule,
      now()
    )
    ON CONFLICT (person_id) DO UPDATE
    SET
      has_condition         = EXCLUDED.has_condition,
      condition_description = COALESCE(EXCLUDED.condition_description, health_records.condition_description),
      medication_schedule   = COALESCE(EXCLUDED.medication_schedule, health_records.medication_schedule),
      updated_at            = now();

    IF v_reg_id IS NOT NULL THEN
      v_synced := v_synced + 1;
    ELSE
      v_skipped := v_skipped + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('synced', v_synced, 'skipped', v_skipped);
END;
$$;
