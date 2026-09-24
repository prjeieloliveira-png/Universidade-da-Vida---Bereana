-- Drop and recreate v_registration_payment_status with void support
DROP VIEW IF EXISTS v_cash_summary CASCADE;
DROP VIEW IF EXISTS v_cash_flow CASCADE;
DROP VIEW IF EXISTS v_registration_payment_status CASCADE;

CREATE VIEW v_registration_payment_status AS
SELECT
  r.id AS registration_id,
  r.edition_id,
  r.person_id,
  e.registration_fee_cents,
  COALESCE(SUM(p.amount_cents) FILTER (WHERE p.voided_at IS NULL), 0) AS total_paid_cents,
  GREATEST(0, e.registration_fee_cents - COALESCE(SUM(p.amount_cents) FILTER (WHERE p.voided_at IS NULL), 0)) AS outstanding_cents,
  CASE
    WHEN COALESCE(SUM(p.amount_cents) FILTER (WHERE p.voided_at IS NULL), 0) >= e.registration_fee_cents THEN 'paid'
    WHEN COALESCE(SUM(p.amount_cents) FILTER (WHERE p.voided_at IS NULL), 0) > 0 THEN 'partial'
    ELSE 'pending'
  END AS status,
  COUNT(p.id) FILTER (WHERE p.voided_at IS NULL) AS payment_count,
  MAX(p.created_at) FILTER (WHERE p.voided_at IS NULL) AS last_payment_at
FROM registrations r
JOIN editions e ON r.edition_id = e.id
LEFT JOIN payments p ON p.registration_id = r.id
GROUP BY r.id, r.edition_id, r.person_id, e.registration_fee_cents;
