-- ============================================================================
-- MIGRAÇÃO: chamada da equipe no mesmo modelo da chamada dos alunos
-- Não destrutiva: ADD COLUMN IF NOT EXISTS, CREATE OR REPLACE, GRANT
--   - justificativa (note) na presença/falta da reunião
--   - sync_team_attendances_rpc: grava um lote (1 item ou fila offline) com autoria
--   - v_team_attendance_log: presença + justificativa + "quem registrou"
-- Sem linha em team_meeting_attendances = "não registrado" (diferente de falta).
-- ============================================================================

ALTER TABLE team_meeting_attendances ADD COLUMN IF NOT EXISTS note text;

CREATE OR REPLACE FUNCTION sync_team_attendances_rpc(
  p_meeting_id uuid,
  p_items      jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item    jsonb;
  v_synced  int := 0;
  v_skipped int := 0;
  v_member  uuid;
  v_present boolean;
  v_note    text;
BEGIN
  IF auth.uid() IS NULL OR NOT is_coord_or_sec() THEN
    RAISE EXCEPTION 'Permissão negada: apenas coordenação ou secretaria pode registrar presença da equipe';
  END IF;

  IF jsonb_typeof(p_items) != 'array' THEN
    RAISE EXCEPTION 'p_items deve ser um array JSON';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_member  := NULLIF(v_item->>'team_member_id', '')::uuid;
    v_present := (v_item->>'present')::boolean;
    v_note    := NULLIF(trim(COALESCE(v_item->>'note', '')), '');

    IF v_member IS NULL OR v_present IS NULL
       OR NOT EXISTS (SELECT 1 FROM team_members WHERE id = v_member) THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    INSERT INTO team_meeting_attendances (meeting_id, team_member_id, present, note, marked_at, marked_by)
    VALUES (p_meeting_id, v_member, v_present, v_note, now(), auth.uid())
    ON CONFLICT (meeting_id, team_member_id) DO UPDATE
    SET
      present   = EXCLUDED.present,
      note      = EXCLUDED.note,
      marked_at = now(),
      marked_by = auth.uid();

    v_synced := v_synced + 1;
  END LOOP;

  RETURN jsonb_build_object('synced', v_synced, 'skipped', v_skipped);
END;
$$;

REVOKE ALL ON FUNCTION sync_team_attendances_rpc(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION sync_team_attendances_rpc(uuid, jsonb) TO authenticated;

CREATE OR REPLACE VIEW v_team_attendance_log
WITH (security_invoker = true) AS
SELECT
  a.meeting_id,
  a.team_member_id,
  a.present,
  a.note,
  a.marked_at,
  prof.full_name AS marked_by_name
FROM team_meeting_attendances a
LEFT JOIN profiles prof ON prof.id = a.marked_by;

GRANT SELECT ON v_team_attendance_log TO authenticated;
