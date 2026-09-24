-- Register payment RPC
CREATE OR REPLACE FUNCTION register_payment(
  reg_id UUID,
  amt BIGINT,
  meth payment_method,
  pay_date DATE,
  notes TEXT
) RETURNS VOID AS $$
BEGIN
  -- Permission check: only coordinator or secretary
  PERFORM pg_has_role('coordinator') OR pg_has_role('secretary');
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  INSERT INTO payments (registration_id, amount_cents, method, payment_date, notes)
  VALUES (reg_id, amt, meth, pay_date, notes);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
