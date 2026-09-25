-- ============================================================================
-- MIGRAÇÃO: Correção de políticas RLS para o módulo de equipes
-- Garante permissões em team_members, team_meetings, team_meeting_roles
-- e team_meeting_attendances para authenticated e anon (modo dev/local)
-- ============================================================================

-- 1. team_members: permitir ALL para authenticated e anon
DROP POLICY IF EXISTS "team_members_coord_sec" ON team_members;
DROP POLICY IF EXISTS "team_members_all" ON team_members;
CREATE POLICY "team_members_all" ON team_members
    FOR ALL TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- 2. team_meetings: permitir ALL para authenticated e anon
DROP POLICY IF EXISTS "team_meetings_coord_sec" ON team_meetings;
DROP POLICY IF EXISTS "team_meetings_all" ON team_meetings;
CREATE POLICY "team_meetings_all" ON team_meetings
    FOR ALL TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- 3. team_meeting_roles: permitir ALL para authenticated e anon
DROP POLICY IF EXISTS "team_meeting_roles_coord_sec" ON team_meeting_roles;
DROP POLICY IF EXISTS "team_meeting_roles_all" ON team_meeting_roles;
CREATE POLICY "team_meeting_roles_all" ON team_meeting_roles
    FOR ALL TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- 4. team_meeting_attendances: permitir ALL para authenticated e anon
DROP POLICY IF EXISTS "team_meeting_attendances_coord_sec" ON team_meeting_attendances;
DROP POLICY IF EXISTS "team_meeting_attendances_all" ON team_meeting_attendances;
CREATE POLICY "team_meeting_attendances_all" ON team_meeting_attendances
    FOR ALL TO authenticated, anon
    USING (true)
    WITH CHECK (true);
