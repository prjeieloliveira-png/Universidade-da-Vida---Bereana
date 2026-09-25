BEGIN;
SELECT plan(15);

-- ============================================================================
-- 1. VERIFICAR QUE RLS ESTÁ HABILITADA EM TODAS AS TABELAS DE EQUIPES
-- ============================================================================

SELECT ok(
    (SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'team_roles'),
    'RLS deve estar habilitada em team_roles'
);

SELECT ok(
    (SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'team_members'),
    'RLS deve estar habilitada em team_members'
);

SELECT ok(
    (SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'team_meetings'),
    'RLS deve estar habilitada em team_meetings'
);

SELECT ok(
    (SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'team_meeting_roles'),
    'RLS deve estar habilitada em team_meeting_roles'
);

SELECT ok(
    (SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'team_meeting_attendances'),
    'RLS deve estar habilitada em team_meeting_attendances'
);

-- ============================================================================
-- 2. VERIFICAR SEED DAS 9 EQUIPES
-- ============================================================================

SELECT is(
    (SELECT count(*)::int FROM public.team_roles WHERE active = true),
    9,
    'Devem existir exatamente 9 equipes oficiais ativas cadastradas'
);

SELECT is(
    (SELECT name FROM public.team_roles WHERE sort_order = 1),
    'Presidente',
    'A primeira equipe ordenada por sort_order deve ser Presidente'
);

-- ============================================================================
-- 3. CRIAR USUÁRIOS DE TESTE PARA CADA PAPEL (ROLE)
-- ============================================================================

-- Coordinator
INSERT INTO auth.users (id, email)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'coord_test@bereana.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'coord_test@bereana.com', 'Coordenador Teste', 'coordinator')
ON CONFLICT (id) DO UPDATE SET role = 'coordinator';

-- Secretary
INSERT INTO auth.users (id, email)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sec_test@bereana.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sec_test@bereana.com', 'Secretária Teste', 'secretary')
ON CONFLICT (id) DO UPDATE SET role = 'secretary';

-- Network Leader
INSERT INTO auth.users (id, email)
VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'leader_test@bereana.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'leader_test@bereana.com', 'Líder Teste', 'network_leader')
ON CONFLICT (id) DO UPDATE SET role = 'network_leader';

-- Viewer
INSERT INTO auth.users (id, email)
VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'viewer_test@bereana.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'viewer_test@bereana.com', 'Viewer Teste', 'viewer')
ON CONFLICT (id) DO UPDATE SET role = 'viewer';

-- ============================================================================
-- 4. TESTAR ACESSO DA COORDENAÇÃO (coordinator) -> LEITURA E ESCRITA PERMITIDAS
-- ============================================================================

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}';

SELECT is(
    (SELECT count(*)::int FROM public.team_roles),
    9,
    'Coordinator consegue visualizar as 9 equipes'
);

-- ============================================================================
-- 5. TESTAR ACESSO DA SECRETARIA (secretary) -> LEITURA E ESCRITA PERMITIDAS
-- ============================================================================

SET LOCAL "request.jwt.claims" = '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}';

SELECT is(
    (SELECT count(*)::int FROM public.team_roles),
    9,
    'Secretary consegue visualizar as 9 equipes'
);

-- ============================================================================
-- 6. TESTAR BLOQUEIO DE LÍDER DE REDE (network_leader) -> 0 LINHAS
-- ============================================================================

SET LOCAL "request.jwt.claims" = '{"sub": "cccccccc-cccc-cccc-cccc-cccccccccccc"}';

SELECT is(
    (SELECT count(*)::int FROM public.team_roles),
    0,
    'Network Leader NÃO tem acesso a team_roles (retorna 0 linhas)'
);

SELECT is(
    (SELECT count(*)::int FROM public.team_members),
    0,
    'Network Leader NÃO tem acesso a team_members (retorna 0 linhas)'
);

SELECT is(
    (SELECT count(*)::int FROM public.team_meetings),
    0,
    'Network Leader NÃO tem acesso a team_meetings (retorna 0 linhas)'
);

-- ============================================================================
-- 7. TESTAR BLOQUEIO DE VISUALIZADOR (viewer) -> 0 LINHAS
-- ============================================================================

SET LOCAL "request.jwt.claims" = '{"sub": "dddddddd-dddd-dddd-dddd-dddddddddddd"}';

SELECT is(
    (SELECT count(*)::int FROM public.team_roles),
    0,
    'Viewer NÃO tem acesso a team_roles (retorna 0 linhas)'
);

SELECT is(
    (SELECT count(*)::int FROM public.team_members),
    0,
    'Viewer NÃO tem acesso a team_members (retorna 0 linhas)'
);

SELECT is(
    (SELECT count(*)::int FROM public.team_meetings),
    0,
    'Viewer NÃO tem acesso a team_meetings (retorna 0 linhas)'
);

SELECT * FROM finish();
ROLLBACK;
