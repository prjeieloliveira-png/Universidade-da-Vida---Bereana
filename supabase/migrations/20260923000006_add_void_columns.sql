-- Add void columns to payments and financial_transactions

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS voided_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS voided_by UUID,
  ADD COLUMN IF NOT EXISTS void_reason TEXT;

ALTER TABLE financial_transactions
  ADD COLUMN IF NOT EXISTS voided_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS voided_by UUID,
  ADD COLUMN IF NOT EXISTS void_reason TEXT;
