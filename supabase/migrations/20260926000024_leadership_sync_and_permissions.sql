-- ============================================================================
-- MIGRAÇÃO 000024: Persistência de Liderança, Hierarquia, RLS e Seed Oficial
-- Habilita leitura e gerenciamento completo em pastors, g12_leaders e cell_leaders
-- Cria View v_leadership_hierarchy para visualização unificada da árvore
-- Insere a árvore inicial de liderança da Igreja Bereana de forma idempotente
-- ============================================================================

-- 1. POLÍTICAS RLS (Garante leitura e escrita completas para authenticated e anon)

DROP POLICY IF EXISTS "pastors_select" ON pastors;
CREATE POLICY "pastors_select" ON pastors FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "pastors_all_access" ON pastors;
CREATE POLICY "pastors_all_access" ON pastors FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "g12_select" ON g12_leaders;
CREATE POLICY "g12_select" ON g12_leaders FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "g12_all_access" ON g12_leaders;
CREATE POLICY "g12_all_access" ON g12_leaders FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cell_select" ON cell_leaders;
CREATE POLICY "cell_select" ON cell_leaders FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "cell_all_access" ON cell_leaders;
CREATE POLICY "cell_all_access" ON cell_leaders FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "edition_leaders_select" ON edition_leaders;
CREATE POLICY "edition_leaders_select" ON edition_leaders FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "edition_leaders_all_access" ON edition_leaders;
CREATE POLICY "edition_leaders_all_access" ON edition_leaders FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- 2. ÍNDICES ÚNICOS PARA IDEMPOTÊNCIA
CREATE UNIQUE INDEX IF NOT EXISTS idx_pastors_name_unique ON pastors (lower(trim(name)));
CREATE UNIQUE INDEX IF NOT EXISTS idx_g12_pastor_name_unique ON g12_leaders (pastor_id, lower(trim(name)));
CREATE UNIQUE INDEX IF NOT EXISTS idx_cell_g12_name_unique ON cell_leaders (g12_id, lower(trim(name)));

-- 3. SEED DOS DADOS INICIAIS DA LIDERANÇA
DO $$
DECLARE
  v_pastor_socorro_id uuid;
  v_pastor_gonzaga_id uuid;
  v_g12_id            uuid;
BEGIN
  -- Pastores Principais
  INSERT INTO pastors (name, category, active)
  VALUES ('Pra. Socorro Paiva', 'familia', true)
  ON CONFLICT (lower(trim(name))) DO UPDATE SET category = EXCLUDED.category, active = true
  RETURNING id INTO v_pastor_socorro_id;

  INSERT INTO pastors (name, category, active)
  VALUES ('Pr. Luis Gonzaga', 'geral', true)
  ON CONFLICT (lower(trim(name))) DO UPDATE SET category = EXCLUDED.category, active = true
  RETURNING id INTO v_pastor_gonzaga_id;

  -- -------------------------------------------------------------
  -- REDE PRA. SOCORRO PAIVA
  -- -------------------------------------------------------------

  -- G12: Shirlany Sampaio
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_socorro_id, 'Shirlany Sampaio', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active)
  VALUES (v_g12_id, 'Shirlany', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

  -- G12: Karol Abreu
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_socorro_id, 'Karol Abreu', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active) VALUES
    (v_g12_id, 'Gabriela Tobal', true),
    (v_g12_id, 'Karol Abreu', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

  -- G12: Pra. Herlene Monteiro
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_socorro_id, 'Pra. Herlene Monteiro', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active) VALUES
    (v_g12_id, 'Jaqueline Lustosa', true),
    (v_g12_id, 'Maria Teresa', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

  -- G12: Bruna Alencar
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_socorro_id, 'Bruna Alencar', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active) VALUES
    (v_g12_id, 'Eryckah Laila', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

  -- G12: Pra. Marta Mônica
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_socorro_id, 'Pra. Marta Mônica', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active) VALUES
    (v_g12_id, 'Celina', true),
    (v_g12_id, 'Ivone', true),
    (v_g12_id, 'Dulce', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

  -- G12: Francisca Sousa
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_socorro_id, 'Francisca Sousa', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active) VALUES
    (v_g12_id, 'Francisca Sousa', true),
    (v_g12_id, 'Claudete', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

  -- G12: Carol Barros
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_socorro_id, 'Carol Barros', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active) VALUES
    (v_g12_id, 'Vera Abreu', true),
    (v_g12_id, 'Maurina', true),
    (v_g12_id, 'Antonia Maria', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

  -- G12: Carmela Lustosa
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_socorro_id, 'Carmela Lustosa', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active) VALUES
    (v_g12_id, 'Fernanda', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

  -- G12: Otacília Graziela
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_socorro_id, 'Otacília Graziela', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active) VALUES
    (v_g12_id, 'Yndira Moura', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

  -- G12: Francinete Pereira
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_socorro_id, 'Francinete Pereira', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active) VALUES
    (v_g12_id, 'Francinete Pereira', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

  -- G12: Francisca Silva
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_socorro_id, 'Francisca Silva', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active) VALUES
    (v_g12_id, 'Claudete', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

  -- -------------------------------------------------------------
  -- REDE PR. LUIS GONZAGA
  -- -------------------------------------------------------------

  -- G12: Pr. Jeiel Oliveira Santos
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_gonzaga_id, 'Pr. Jeiel Oliveira Santos', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active) VALUES
    (v_g12_id, 'Adão', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

  -- G12: Apollo Tobal
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_gonzaga_id, 'Apollo Tobal', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active) VALUES
    (v_g12_id, 'Apollo', true),
    (v_g12_id, 'Kelson', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

  -- G12: Joab Barros
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_gonzaga_id, 'Joab Barros', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active) VALUES
    (v_g12_id, 'Joab Barros', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

  -- G12: Walcídio Júnior
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_gonzaga_id, 'Walcídio Júnior', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active) VALUES
    (v_g12_id, 'Leonardo', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

  -- G12: Raimundo Nonato
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_gonzaga_id, 'Raimundo Nonato', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active) VALUES
    (v_g12_id, 'Raimundo Nonato', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

  -- G12: Jesiley Alber
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_gonzaga_id, 'Jesiley Alber', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active) VALUES
    (v_g12_id, 'Júnior Amaro', true),
    (v_g12_id, 'Elias', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

  -- G12: Ademir Pereira
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_gonzaga_id, 'Ademir Pereira', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active) VALUES
    (v_g12_id, 'Ademir Pereira', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

  -- G12: Agustinho Rodrigues
  INSERT INTO g12_leaders (pastor_id, name, active)
  VALUES (v_pastor_gonzaga_id, 'Agustinho Rodrigues', true)
  ON CONFLICT (pastor_id, lower(trim(name))) DO UPDATE SET active = true
  RETURNING id INTO v_g12_id;
  INSERT INTO cell_leaders (g12_id, name, active) VALUES
    (v_g12_id, 'Agustinho Rodrigues', true)
  ON CONFLICT (g12_id, lower(trim(name))) DO NOTHING;

END $$;

-- 4. VIEW DA HIERARQUIA COMPLETA DE LIDERANÇA
CREATE OR REPLACE VIEW v_leadership_hierarchy AS
SELECT 
  'PASTOR' AS role,
  'Pastor' AS role_label,
  p.id,
  p.name,
  p.phone,
  p.active,
  NULL::uuid AS pastor_id,
  p.name AS pastor_name,
  NULL::uuid AS g12_id,
  NULL::text AS g12_name,
  p.category AS pastor_category,
  p.created_at
FROM pastors p

UNION ALL

SELECT 
  'G12' AS role,
  'Líder G12' AS role_label,
  g.id,
  g.name,
  g.phone,
  g.active,
  p.id AS pastor_id,
  p.name AS pastor_name,
  NULL::uuid AS g12_id,
  NULL::text AS g12_name,
  p.category AS pastor_category,
  g.created_at
FROM g12_leaders g
JOIN pastors p ON p.id = g.pastor_id

UNION ALL

SELECT 
  'LEADER' AS role,
  'Líder' AS role_label,
  c.id,
  c.name,
  c.phone,
  c.active,
  p.id AS pastor_id,
  p.name AS pastor_name,
  g.id AS g12_id,
  g.name AS g12_name,
  p.category AS pastor_category,
  c.created_at
FROM cell_leaders c
JOIN g12_leaders g ON g.id = c.g12_id
JOIN pastors p ON p.id = g.pastor_id;

GRANT SELECT ON v_leadership_hierarchy TO authenticated, anon;
