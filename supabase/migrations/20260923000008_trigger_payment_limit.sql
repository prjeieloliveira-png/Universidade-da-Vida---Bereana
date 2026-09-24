DROP TRIGGER IF EXISTS trg_prevent_overpayment ON payments;
DROP FUNCTION IF EXISTS prevent_overpayment();

-- Prevent over-payment for a registration
CREATE OR REPLACE FUNCTION prevent_overpayment()
RETURNS trigger AS $$
DECLARE
  fee BIGINT;
  current_total BIGINT;
BEGIN
  SELECT e.registration_fee_cents INTO fee
  FROM editions e
  JOIN registrations r ON r.edition_id = e.id
  WHERE r.id = NEW.registration_id;

  SELECT COALESCE(SUM(p.amount_cents),0) INTO current_total
  FROM payments p
  WHERE p.registration_id = NEW.registration_id
    AND p.voided_at IS NULL;

  IF (current_total + NEW.amount_cents) > fee THEN
    RAISE EXCEPTION 'Pagamento excede o valor da taxa (saldo restante: %)', fee - current_total;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_prevent_overpayment
BEFORE INSERT ON payments
FOR EACH ROW EXECUTE FUNCTION prevent_overpayment();
