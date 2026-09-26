# Plano de Implementação — Excluir inscrito (menu Inscrições)

Permitir que a coordenação/secretaria exclua um inscrito, inclusive os cadastros de teste.

---

## 1. Impacto no banco (levantado em produção)

Excluir uma inscrição (`registrations`) dispara, pelas chaves estrangeiras já existentes:

| Tabela | Efeito |
|---|---|
| `payments` | **apagados** (ON DELETE CASCADE) — some do caixa e dos totais |
| `attendances` | **apagadas** (CASCADE) |
| `financial_transactions` | mantidas, com `registration_id = NULL` |

A pessoa (`people`) é a entidade permanente. Se ela não tiver outra inscrição nem estiver em uma equipe (`team_members`), é excluída junto (e `health_records` por cascata), para não deixar cadastros órfãos, como os de teste.

## 2. Banco — migração `20260926000029_delete_registration_rpc.sql` (não destrutiva)

- Função `delete_registration(p_registration_id uuid)`, `SECURITY DEFINER`, `search_path` fixo:
  - exige `is_coord_or_sec()`; caso contrário, lança erro "Sem permissão";
  - executa tudo em uma transação: apaga a inscrição e, se aplicável, a pessoa;
  - retorna um resumo: `{ person_deleted, payments_deleted, attendances_deleted }`.
- `GRANT EXECUTE` apenas para `authenticated`.

## 3. Frontend

| Arquivo | Ação |
|---|---|
| `api/registrationsApi.ts` | `deleteRegistration(id)` chamando a RPC |
| `hooks/useRegistrations.ts` | mutação de exclusão: remove da lista local e invalida pagamentos/caixa |
| `components/DeleteRegistrationDialog.tsx` (novo) | confirmação com nome, pagamentos (R$) e presenças que serão apagados |
| `components/RegistrationEditModal.tsx` | botão **Excluir inscrição** (vermelho, no rodapé), visível só para coordenação/secretaria |

O botão fica dentro do modal de edição (lápis), e não direto no card, para evitar exclusões por toque acidental no celular.

## 4. Quality Gate e Validação

- `npm run lint && npm run typecheck && npm run test` e `supabase db lint`
- Validação visual em 390px: excluir um aluno de teste e conferir lista, contadores e caixa.
