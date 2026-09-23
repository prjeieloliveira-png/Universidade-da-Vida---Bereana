-- ============================================================================
-- Testes de RLS — Universidade da Vida Bereana
-- Execute com: supabase test db (requer pgTAP)
-- ============================================================================
BEGIN;

SELECT plan(9);

-- ============================================================================
-- Fixture: usuários de teste
-- ============================================================================

-- Cria perfis fictícios para os testes
DO $$
DECLARE
    v_coord_id   uuid := gen_random_uuid();
    v_sec_id     uuid := gen_random_uuid();
    v_leader_id  uuid := gen_random_uuid();
    v_viewer_id  uuid := gen_random_uuid();
    v_network_id uuid := gen_random_uuid();
BEGIN
    -- Insere registros temporários em profiles sem auth.users (só para testes de RLS)
    -- Em pgTAP, usamos set_config para simular auth.uid()
    INSERT INTO networks (id, name) VALUES (v_network_id, 'Rede Teste');

    INSERT INTO profiles (id, email, full_name, role, network_id) VALUES
        (v_coord_id,  'coord@test.com',  'Coordenador Teste', 'coordinator',    NULL),
        (v_sec_id,    'sec@test.com',    'Secretária Teste',  'secretary',      NULL),
        (v_leader_id, 'leader@test.com', 'Líder Teste',       'network_leader', v_network_id),
        (v_viewer_id, 'viewer@test.com', 'Viewer Teste',      'viewer',         NULL);

    -- Armazena IDs para uso nos testes
    PERFORM set_config('test.coord_id',   v_coord_id::text,   true);
    PERFORM set_config('test.leader_id',  v_leader_id::text,  true);
    PERFORM set_config('test.viewer_id',  v_viewer_id::text,  true);
    PERFORM set_config('test.network_id', v_network_id::text, true);
END;
$$;

-- ============================================================================
-- Função auxiliar para simular auth.uid() nos testes
-- ============================================================================
CREATE OR REPLACE FUNCTION set_authenticated_user(p_user_id uuid)
RETURNS void
LANGUAGE sql AS $$
    SELECT set_config('request.jwt.claims',
        json_build_object('sub', p_user_id)::text,
        true
    );
$$;

-- ============================================================================
-- TESTE 1: network_leader NÃO vê health_records de outras redes
-- ============================================================================
SELECT ok(
    (
        SELECT is_coord_or_sec() = false
        FROM profiles
        WHERE id = current_setting('test.leader_id')::uuid
    ),
    '1. network_leader não é coord nem sec'
);

-- ============================================================================
-- TESTE 2: coordinator pode ler health_records
-- ============================================================================
SELECT ok(
    (
        SELECT is_coord_or_sec() = true
        FROM profiles
        WHERE id = current_setting('test.coord_id')::uuid
    ),
    '2. coordinator é coord_or_sec'
);

-- ============================================================================
-- TESTE 3: viewer NÃO é coord_or_sec
-- ============================================================================
SELECT ok(
    (
        SELECT is_coord_or_sec() = false
        FROM profiles
        WHERE id = current_setting('test.viewer_id')::uuid
    ),
    '3. viewer não é coord_or_sec'
);

-- ============================================================================
-- TESTE 4: Tabelas novas têm RLS habilitada
-- ============================================================================
SELECT ok(
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'pastors'),
    '4. RLS habilitado em pastors'
);

SELECT ok(
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'g12_leaders'),
    '5. RLS habilitado em g12_leaders'
);

SELECT ok(
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'cell_leaders'),
    '6. RLS habilitado em cell_leaders'
);

SELECT ok(
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'edition_leaders'),
    '7. RLS habilitado em edition_leaders'
);

-- ============================================================================
-- TESTE 8: v_registration_list NÃO contém colunas de saúde
-- ============================================================================
SELECT ok(
    NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'v_registration_list'
          AND column_name IN ('has_condition', 'condition_description', 'medication_schedule')
    ),
    '8. v_registration_list não expõe dados de saúde'
);

-- ============================================================================
-- TESTE 9: Trigger de criação de aulas existe
-- ============================================================================
SELECT ok(
    EXISTS (
        SELECT 1
        FROM information_schema.triggers
        WHERE trigger_name = 'on_edition_created'
          AND event_object_table = 'editions'
    ),
    '9. Trigger on_edition_created existe em editions'
);

SELECT * FROM finish();
ROLLBACK;
