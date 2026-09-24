-- Create cash_categories table and seed default categories
CREATE TABLE IF NOT EXISTS cash_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('in','out'))
);

INSERT INTO cash_categories (id, name, type) VALUES
  (gen_random_uuid(), 'Inscrição', 'in'),
  (gen_random_uuid(), 'Oferta/Doação', 'in'),
  (gen_random_uuid(), 'Venda de materiais', 'in'),
  (gen_random_uuid(), 'Outras entradas', 'in'),
  (gen_random_uuid(), 'Alimentação', 'out'),
  (gen_random_uuid(), 'Transporte', 'out'),
  (gen_random_uuid(), 'Material/Apostilas', 'out'),
  (gen_random_uuid(), 'Camisetas', 'out'),
  (gen_random_uuid(), 'Locação/Estrutura', 'out'),
  (gen_random_uuid(), 'Outras saídas', 'out')
ON CONFLICT DO NOTHING;
