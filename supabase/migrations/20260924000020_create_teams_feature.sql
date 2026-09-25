-- ============================================================================
-- MIGRAÇÃO: MÓDULO DE EQUIPES DA UNIVERSIDADE DA VIDA
-- Criação de team_roles, team_members, team_meetings, team_meeting_roles,
-- team_meeting_attendances, view v_team_member_attendance, RLS, triggers e RPC
-- ============================================================================

-- 1. Catálogo de Equipes / Cargos
CREATE TABLE IF NOT EXISTS team_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    sort_order integer NOT NULL,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Seed oficial das 9 equipes na ordem exata de sort_order (1 a 9)
INSERT INTO team_roles (name, sort_order, active) VALUES
    ('Presidente', 1, true),
    ('Coordenador(a)', 2, true),
    ('Supervisor(a)', 3, true),
    ('Equipe de Intercessão Masculina', 4, true),
    ('Equipe de Intercessão Feminina', 5, true),
    ('Equipe de Recepção e Apoio Masculina', 6, true),
    ('Equipe de Recepção e Apoio Feminina', 7, true),
    ('Equipe de Secretaria', 8, true),
    ('Equipe de Celebração', 9, true)
ON CONFLICT (name) DO UPDATE SET
    sort_order = EXCLUDED.sort_order,
    active = EXCLUDED.active;

-- 2. Ajuste retrocompatível em people para voluntários que possuem apenas nome e telefone
ALTER TABLE people ALTER COLUMN birth_date DROP NOT NULL;
ALTER TABLE people ALTER COLUMN gender DROP NOT NULL;
ALTER TABLE people ALTER COLUMN marital_status DROP NOT NULL;

-- 3. Membros de equipe por edição/turma
CREATE TABLE IF NOT EXISTS team_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    edition_id uuid NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    team_role_id uuid NOT NULL REFERENCES team_roles(id) ON DELETE RESTRICT,
    person_id uuid NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
    active boolean NOT NULL DEFAULT true,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(edition_id, team_role_id, person_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_edition_role ON team_members(edition_id, team_role_id);
CREATE INDEX IF NOT EXISTS idx_team_members_person ON team_members(person_id);
CREATE INDEX IF NOT EXISTS idx_team_members_active ON team_members(edition_id, active);

-- 4. Reuniões da turma
CREATE TABLE IF NOT EXISTS team_meetings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    edition_id uuid NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    meeting_date date NOT NULL,
    title text,
    notes text,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_meetings_edition_date ON team_meetings(edition_id, meeting_date DESC);

-- 5. Equipes convocadas para a reunião
CREATE TABLE IF NOT EXISTS team_meeting_roles (
    meeting_id uuid NOT NULL REFERENCES team_meetings(id) ON DELETE CASCADE,
    team_role_id uuid NOT NULL REFERENCES team_roles(id) ON DELETE CASCADE,
    PRIMARY KEY (meeting_id, team_role_id)
);

-- 6. Presenças dos membros convocados nas reuniões
CREATE TABLE IF NOT EXISTS team_meeting_attendances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id uuid NOT NULL REFERENCES team_meetings(id) ON DELETE CASCADE,
    team_member_id uuid NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    present boolean NOT NULL DEFAULT false,
    marked_at timestamptz DEFAULT now(),
    marked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE (meeting_id, team_member_id)
);

CREATE INDEX IF NOT EXISTS idx_team_attendance_meeting ON team_meeting_attendances(meeting_id);
CREATE INDEX IF NOT EXISTS idx_team_attendance_member ON team_meeting_attendances(team_member_id);

-- 7. View derivada de frequência por membro: reuniões convocadas, presenças e percentual
CREATE OR REPLACE VIEW v_team_member_attendance AS
SELECT
    tm.id AS team_member_id,
    tm.edition_id,
    tm.team_role_id,
    tm.person_id,
    tm.active,
    COUNT(DISTINCT tmr.meeting_id) AS total_called_meetings,
    COUNT(DISTINCT tma.meeting_id) FILTER (WHERE tma.present = true) AS attended_meetings,
    CASE 
        WHEN COUNT(DISTINCT tmr.meeting_id) > 0 THEN
            ROUND((COUNT(DISTINCT tma.meeting_id) FILTER (WHERE tma.present = true)::numeric / COUNT(DISTINCT tmr.meeting_id)::numeric) * 100, 1)
        ELSE 0.0
    END AS attendance_percentage,
    (COUNT(DISTINCT tma.meeting_id) FILTER (WHERE tma.present = true))::text || '/' || (COUNT(DISTINCT tmr.meeting_id))::text AS attendance_fraction
FROM team_members tm
LEFT JOIN team_meetings m ON m.edition_id = tm.edition_id
LEFT JOIN team_meeting_roles tmr ON tmr.meeting_id = m.id AND tmr.team_role_id = tm.team_role_id
LEFT JOIN team_meeting_attendances tma ON tma.meeting_id = tmr.meeting_id AND tma.team_member_id = tm.id
GROUP BY tm.id, tm.edition_id, tm.team_role_id, tm.person_id, tm.active;

-- 8. Habilitação de RLS em todas as tabelas
ALTER TABLE team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_meeting_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_meeting_attendances ENABLE ROW LEVEL SECURITY;

-- Policies: team_roles é catálogo público de leitura (igual a editions, lessons e cash_categories); escrita restrita a coord/sec
DROP POLICY IF EXISTS "team_roles_select" ON team_roles;
CREATE POLICY "team_roles_select" ON team_roles
    FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "team_roles_manage" ON team_roles;
CREATE POLICY "team_roles_manage" ON team_roles
    FOR ALL TO authenticated USING (is_coord_or_sec());

DROP POLICY IF EXISTS "team_members_coord_sec" ON team_members;
CREATE POLICY "team_members_coord_sec" ON team_members
    FOR ALL TO authenticated
    USING (is_coord_or_sec())
    WITH CHECK (is_coord_or_sec());

DROP POLICY IF EXISTS "team_meetings_coord_sec" ON team_meetings;
CREATE POLICY "team_meetings_coord_sec" ON team_meetings
    FOR ALL TO authenticated
    USING (is_coord_or_sec())
    WITH CHECK (is_coord_or_sec());

DROP POLICY IF EXISTS "team_meeting_roles_coord_sec" ON team_meeting_roles;
CREATE POLICY "team_meeting_roles_coord_sec" ON team_meeting_roles
    FOR ALL TO authenticated
    USING (is_coord_or_sec())
    WITH CHECK (is_coord_or_sec());

DROP POLICY IF EXISTS "team_meeting_attendances_coord_sec" ON team_meeting_attendances;
CREATE POLICY "team_meeting_attendances_coord_sec" ON team_meeting_attendances
    FOR ALL TO authenticated
    USING (is_coord_or_sec())
    WITH CHECK (is_coord_or_sec());

-- 9. Triggers de auditoria
DROP TRIGGER IF EXISTS audit_team_members ON team_members;
CREATE TRIGGER audit_team_members
    AFTER INSERT OR UPDATE OR DELETE ON team_members
    FOR EACH ROW EXECUTE FUNCTION audit_table_change();

DROP TRIGGER IF EXISTS audit_team_meeting_attendances ON team_meeting_attendances;
CREATE TRIGGER audit_team_meeting_attendances
    AFTER INSERT OR UPDATE OR DELETE ON team_meeting_attendances
    FOR EACH ROW EXECUTE FUNCTION audit_table_change();

-- 10. RPC para marcação de presenças em massa (atômico)
CREATE OR REPLACE FUNCTION mark_team_attendance_batch(
    p_meeting_id uuid,
    p_records jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    rec jsonb;
BEGIN
    IF auth.uid() IS NOT NULL AND NOT is_coord_or_sec() THEN
        RAISE EXCEPTION 'Permissão negada: apenas coordenação ou secretaria pode marcar presença';
    END IF;

    FOR rec IN SELECT * FROM jsonb_array_elements(p_records)
    LOOP
        INSERT INTO team_meeting_attendances (meeting_id, team_member_id, present, marked_at, marked_by)
        VALUES (
            p_meeting_id,
            (rec->>'team_member_id')::uuid,
            (rec->>'present')::boolean,
            now(),
            auth.uid()
        )
        ON CONFLICT (meeting_id, team_member_id) DO UPDATE
        SET
            present   = EXCLUDED.present,
            marked_at = EXCLUDED.marked_at,
            marked_by = EXCLUDED.marked_by;
    END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION mark_team_attendance_batch(uuid, jsonb) TO authenticated, anon;
