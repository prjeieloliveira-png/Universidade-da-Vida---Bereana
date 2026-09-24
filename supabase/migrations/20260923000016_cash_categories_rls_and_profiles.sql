-- ============================================================================
-- MIGRAÇÃO: RLS EM cash_categories, LEITURA PÚBLICA DE EDIÇÕES E PERFIS DE ADMIN
-- ============================================================================

-- 1. Habilitar RLS em cash_categories
ALTER TABLE cash_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cash_categories_select" ON cash_categories;
CREATE POLICY "cash_categories_select" ON cash_categories
    FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "cash_categories_manage" ON cash_categories;
CREATE POLICY "cash_categories_manage" ON cash_categories
    FOR ALL TO authenticated USING (is_coord_or_sec());

-- 2. Permitir leitura pública (anon) de editions e lessons
DROP POLICY IF EXISTS "editions_select" ON editions;
CREATE POLICY "editions_select" ON editions
    FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "lessons_select" ON lessons;
CREATE POLICY "lessons_select" ON lessons
    FOR SELECT TO authenticated, anon USING (true);

-- 3. Garantir perfis de coordenação para os usuários administradores existentes
INSERT INTO profiles (id, email, full_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'Pastor Jeiel Oliveira'), 
    'coordinator'::user_role
FROM auth.users
WHERE email IN ('admin@bereana.com', 'prjeiel.oliveira@gmail.com')
ON CONFLICT (id) DO UPDATE SET role = 'coordinator';
