-- ============================================================================
-- GARANTIR EDIÇÃO 2026 ATIVA
-- As aulas são geradas automaticamente pelo trigger on_edition_created.
-- Idempotente: seguro para rodar múltiplas vezes
-- ============================================================================

INSERT INTO editions (
    id,
    name,
    year,
    start_date,
    end_date,
    registration_fee_cents,
    total_lessons,
    is_active
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    'Universidade da Vida 2026 — 1º Semestre',
    2026,
    '2026-03-01',
    '2026-04-15',
    20000,
    4,
    true
)
ON CONFLICT (id) DO UPDATE SET
    is_active = true,
    registration_fee_cents = 20000;
