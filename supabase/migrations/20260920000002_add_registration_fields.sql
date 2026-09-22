-- ============================================================================
-- MIGRAÇÃO: ADICIONAR CAMPOS DE PADRONIZAÇÃO NA INSCRIÇÃO & ATUALIZAR TAXA
-- ============================================================================

-- 1. Campos de liderança e vestuário específicos do evento
ALTER TABLE registrations
    ADD COLUMN IF NOT EXISTS shirt_size text,
    ADD COLUMN IF NOT EXISTS pastor_name text,
    ADD COLUMN IF NOT EXISTS g12_leader text,
    ADD COLUMN IF NOT EXISTS cell_leader text;

-- 2. Atualizar a taxa padrão da edição 2026 para R$ 200,00 (20000 centavos)
UPDATE editions
SET registration_fee_cents = 20000
WHERE year = 2026;
