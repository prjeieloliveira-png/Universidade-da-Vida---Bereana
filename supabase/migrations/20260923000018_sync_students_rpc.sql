-- ============================================================================
-- MIGRAÇÃO 000018: RPC sync_students_from_local
-- Recebe array JSON com dados dos alunos do localStorage e faz upsert idempotente
-- em people + registrations.
-- Segura para rodar múltiplas vezes (upsert por full_name + birth_date).
-- ============================================================================

-- Adicionar colunas opcionais em registrations (se ainda não existirem)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'shirt_size'
  ) THEN
    ALTER TABLE registrations ADD COLUMN shirt_size text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'pastor_name'
  ) THEN
    ALTER TABLE registrations ADD COLUMN pastor_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'g12_leader'
  ) THEN
    ALTER TABLE registrations ADD COLUMN g12_leader text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'cell_leader'
  ) THEN
    ALTER TABLE registrations ADD COLUMN cell_leader text;
  END IF;
END $$;

-- RPC principal: recebe p_edition_id e p_data (array de alunos)
-- Retorna: { synced: bigint, skipped: bigint }
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
  v_synced        bigint := 0;
  v_skipped       bigint := 0;
BEGIN
  -- Verificar autenticação: permite coordinator, secretary ou acesso via anon (dev)
  IF auth.uid() IS NOT NULL AND NOT is_coord_or_sec() THEN
    RAISE EXCEPTION 'Permissão negada: apenas coordenação ou secretaria pode sincronizar alunos';
  END IF;

  IF jsonb_typeof(p_data) != 'array' THEN
    RAISE EXCEPTION 'p_data deve ser um array JSON';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_data)
  LOOP
    v_full_name  := trim(v_item->>'full_name');
    v_birth_date := (v_item->>'birth_date')::date;
    v_gender     := COALESCE(v_item->>'gender', 'Outro');
    v_marital    := COALESCE(v_item->>'marital_status', 'Solteiro');
    v_phone      := COALESCE(NULLIF(trim(v_item->>'phone'), ''), '—');
    v_address    := NULLIF(trim(v_item->>'address'), '');
    v_shirt_size := NULLIF(trim(v_item->>'shirt_size'), '');
    v_pastor     := NULLIF(trim(v_item->>'pastor'), '');
    v_g12        := NULLIF(trim(v_item->>'g12'), '');
    v_leader     := NULLIF(trim(v_item->>'leader'), '');

    -- Normalizar gender para constraint do banco
    v_gender := CASE
      WHEN v_gender IN ('Masculino', 'Feminino') THEN v_gender
      ELSE 'Outro'
    END;

    IF v_full_name IS NULL OR v_birth_date IS NULL THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    -- Upsert pessoa (chave: full_name + birth_date)
    INSERT INTO people (full_name, birth_date, gender, marital_status, phone, address)
    VALUES (v_full_name, v_birth_date, v_gender, v_marital, v_phone, v_address)
    ON CONFLICT (full_name, birth_date) DO UPDATE
    SET
      gender         = EXCLUDED.gender,
      marital_status = EXCLUDED.marital_status,
      phone          = EXCLUDED.phone,
      address        = COALESCE(EXCLUDED.address, people.address),
      updated_at     = now()
    RETURNING id INTO v_person_id;

    -- Se não retornou (conflito sem RETURNING), buscar
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

    IF v_reg_id IS NOT NULL THEN
      v_synced := v_synced + 1;
    ELSE
      v_skipped := v_skipped + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('synced', v_synced, 'skipped', v_skipped);
END;
$$;

-- Garantir unique constraint em people (full_name, birth_date) — necessário para o ON CONFLICT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'people_full_name_birth_date_key'
  ) THEN
    ALTER TABLE people ADD CONSTRAINT people_full_name_birth_date_key
      UNIQUE (full_name, birth_date);
  END IF;
END $$;

-- Adicionar policy para permitir INSERT/UPDATE em people por coordenação ou anon (dev)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
    WHERE p.polname = 'people_insert_coord_or_anon' AND c.relname = 'people'
  ) THEN
    CREATE POLICY "people_insert_coord_or_anon" ON people
      FOR INSERT TO anon, authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
    WHERE p.polname = 'people_update_coord_or_anon' AND c.relname = 'people'
  ) THEN
    CREATE POLICY "people_update_coord_or_anon" ON people
      FOR UPDATE TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Adicionar policy para INSERT/UPDATE em registrations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
    WHERE p.polname = 'registrations_insert_coord_or_anon' AND c.relname = 'registrations'
  ) THEN
    CREATE POLICY "registrations_insert_coord_or_anon" ON registrations
      FOR INSERT TO anon, authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
    WHERE p.polname = 'registrations_update_coord_or_anon' AND c.relname = 'registrations'
  ) THEN
    CREATE POLICY "registrations_update_coord_or_anon" ON registrations
      FOR UPDATE TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
