-- ============================================================================
-- MIGRAÇÃO 000032: View de contagem de faltas por inscrição
-- Não destrutiva: apenas CREATE OR REPLACE VIEW.
--
-- Conta somente presenças explicitamente marcadas como falta (present=false)
-- em `attendances`. Semanas ainda não registradas não entram na contagem.
-- ============================================================================

CREATE OR REPLACE VIEW v_registration_absence_count AS
SELECT
  r.id AS registration_id,
  r.edition_id,
  COUNT(a.id) FILTER (WHERE a.present = false) AS absence_count
FROM registrations r
LEFT JOIN attendances a ON a.registration_id = r.id
GROUP BY r.id, r.edition_id;

GRANT SELECT ON v_registration_absence_count TO authenticated;
