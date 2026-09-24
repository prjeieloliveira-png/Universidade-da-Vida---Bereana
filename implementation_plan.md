# Implementation Plan — Migração de Pagamentos (Inscrições → Financeiro)

## 1. Diagnóstico

### Origem da lista de alunos
**Onde os 53 alunos estão:** `useStudentStore` → localStorage chave `bereana_students_store_v1` (Zustand persist). O `mockStudents.ts` é só o estado inicial; o store já contém edições do usuário. A UI de Inscrições lê `students` do store e filtra por `cohortId`.

### Supabase (banco local)
- Tabela `people`: **vazia** (0 registros)
- Tabela `registrations`: **vazia** (0 registros)
- Tabela `payments`: **vazia** (0 registros)
- View `v_registration_payment_status`: existe, mas sem dados
- View `v_cash_flow`: existe, sem dados
- View `v_cash_summary`: existe, sem dados
- RPC `register_payment`: existe (migração 000012)
- Enum `payment_method`: existe ('pix','debit','credit','cash')
- Tabela `cash_categories`: existe (migração 000007)

### Fluxo de caixa hoje
`v_cash_flow` faz UNION ALL de:
- `payments` (source='payment', flow_type='in', category='Inscrição')
- `financial_transactions` (source='manual', in/out conforme type)

**Conclusão:** não há duplicação porque `payments` e `financial_transactions` são tabelas separadas. Basta inserir em `payments` que o fluxo aparece automaticamente via view.

---

## 2. Estratégia

Como a origem é o **localStorage** (não Supabase), aplicar a **Opção B** do task:

1. Criar ação temporária "Importar pagamentos do cadastro" na tela `/financeiro` (visível só para coordinator)
2. Ação lê `bereana_students_store_v1`, filtra cohort 'turma-01', conta Pago/Pendente, mostra prévia
3. Após confirmação, envia JSON para RPC idempotente `import_legacy_payments` no Supabase
4. RPC faz INSERT idempotente em `payments` (skip se source='legacy_migration' já existe)
5. Remover a ação temporária após confirmação do usuário

---

## 3. Passos de Implementação

### Passo 1 — Migração SQL (idempotente)
Arquivo: `supabase/migrations/20260923000017_import_legacy_payments.sql`

- Criar coluna `source text DEFAULT 'manual'` em `payments` (se não existir)
- Criar função RPC `import_legacy_payments(p_data jsonb)` que:
  - Itera itens do array
  - Para cada um: busca `registration_id` pela pessoa (name+birthDate) na edição ativa
  - Verifica se já existe pagamento com source='legacy_migration' para essa registration_id → skip
  - Insere em `payments`: registration_id, amount_cents=20000, payment_method (mapeado), payment_date=created_at da registration, notes='Migrado do cadastro — forma original: CARTÃO', source='legacy_migration'
  - Retorna `{ inserted: N, skipped: M }`

Mapeamento formas:
- 'PIX' → 'pix'
- 'CARTÃO' → 'credit' (nota: "Migrado do cadastro — forma original: CARTÃO")
- 'DINHEIRO' → 'cash'
- '—' ou null → 'pix' (default seguro)

### Passo 2 — Componente UI temporário
Arquivo: `src/features/financial/components/LegacyImportBanner.tsx`

- Banner visível só para role='coordinator'
- Botão "Importar pagamentos do cadastro"
- Ao clicar: lê localStorage, calcula prévia (28 Pago / 25 Pendente, totais)
- Modal de confirmação com lista dos 28 pagamentos a criar
- Após confirmação: chama RPC, mostra resultado

### Passo 3 — Testes
- `studentStore.test.ts`: adicionar teste de mapeamento de formas de pagamento
- Teste: "Pendente" não gera pagamento
- Teste: segunda execução não duplica (idempotência)

### Passo 4 — Quality gate
```
npm run lint && npm run typecheck && npm run test && supabase db lint
```

---

## 4. Números esperados (conferência obrigatória)

| Métrica | Esperado |
|---------|----------|
| Total alunos Turma 01 | 53 |
| Pagos | 28 |
| Pendentes | 25 |
| PIX | 19 → R$ 3.800,00 |
| CARTÃO | 7 → R$ 1.400,00 |
| DINHEIRO | 2 → R$ 400,00 |
| Total arrecadado | R$ 5.600,00 |
| A receber | R$ 5.000,00 (25 × R$ 200,00) |

---

## 5. Lista dos 7 alunos CARTÃO → Crédito (para revisão)

1. Alana Mikaela (num 1) — CARTÃO → credit
2. Antônio Alencar Neto (num 6) — CARTÃO → credit
3. Gabriel Lira Fontenele (num 18) — CARTÃO → credit
4. Luiza de Sá Matos (num 32) — CARTÃO → credit
5. Márcia Silva (num 33) — CARTÃO → credit
6. Maria Cecília (num 35) — CARTÃO → credit
7. Simone Rodrigues (num 49) — CARTÃO → credit

---

## 6. Observações de segurança
- Nenhuma coluna DROP/NENHUMA alteração destrutiva
- Migração versionada em `supabase/migrations/`
- RLS permanece ativa
- Ação visível só para coordinator (via ProtectedRoute + role check)
- Valores em centavos (bigint), sem float
