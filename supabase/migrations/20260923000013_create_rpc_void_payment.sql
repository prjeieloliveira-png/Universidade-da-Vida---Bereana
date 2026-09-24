-- Void payment RPC
CREATE OR REPLACE FUNCTION void_payment(payment_id UUID, reason TEXT) RETURNS VOID AS $$
DECLARE
  user_id UUID := auth.uid();
BEGIN
  -- Permission check: only coordinator or secretary
  PERFORM pg_has_role('coordinator') OR pg_has_role('secretary');
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  UPDATE payments
  SET voided_at = now(),
      voided_by = user_id,
      void_reason = reason
  WHERE id = payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
