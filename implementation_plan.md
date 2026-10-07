# Plano: editar lançamentos do Financeiro (alunos, equipe e manuais)

## Verificação — hoje NÃO dá para editar
Todo lançamento do extrato só tem "Estornar" (void). Não existe nenhuma tela, função ou RPC de edição. Hoje, para corrigir um valor errado, é preciso estornar e lançar de novo.

| Tipo | Tabela | Campos editáveis |
|---|---|---|
| Inscrição de aluno | `payments` | valor, forma de pagamento, data do pagamento, observação (e comprovante) |
| Pagamento de equipe | `team_member_payments` | valor, forma, data, observação |
| Entrada/saída manual | `financial_transactions` | tipo (entrada/saída), categoria, valor, forma, descrição, data, comprovante |

Não editáveis: lançamentos já estornados, e "de quem" é o pagamento (trocar o aluno/membro de um pagamento) — para isso continua estorno + novo lançamento.

## Banco (migração nova — a aplicar por você)
1. **3 RPCs** `SECURITY DEFINER`, só `authenticated` com `is_coord_or_sec()`, recusam lançamento estornado:
   - `update_payment(id, amount, method, date, notes)` — revalida o limite da taxa (soma dos outros pagamentos do aluno + novo valor ≤ taxa), pois o gatilho atual só vale em INSERT.
   - `update_team_member_payment(id, amount, method, date, notes)` — mesma regra (taxa de R$ 100,00 da equipe).
   - `update_financial_transaction(id, type, category, amount, method, description, date, receipt_url)`.
2. **Valor sempre em centavos inteiros e > 0**, forma de pagamento só entre as aceitas (pix, débito, crédito, dinheiro).
3. **Trilha de auditoria** (recomendado, pois é dinheiro): tabela `financial_edit_log` (entidade, id, quem editou, quando, valores antes/depois em JSON), com RLS (leitura só coord/sec). Cada RPC grava uma linha.
4. **Data do extrato:** hoje `v_cash_flow` mostra a data de criação do registro (`created_at`), não a data informada. Para a edição de data ter efeito, a view passa a usar a data do pagamento/lançamento.

## App
- Botão de lápis em cada linha do extrato (ao lado do estorno), abrindo `EditCashFlowEntryModal` com os campos do tipo daquele lançamento (valor, forma, data, observação; e categoria/descrição/tipo nos manuais). Reaproveita o padrão dos modais existentes.
- Funções em `financialData.ts` chamando as RPCs; atualização do extrato, resumo do caixa e status de pagamento (alunos/equipe) após salvar.
- Selo "Editado" na linha (com quem e quando, vindo do log) — se você aprovar a auditoria.
- Testes do modal e das funções; quality gate; validação em 390px.

## Decisões suas antes de começar
1. **Auditoria (item 3):** recomendo sim (rastreia quem alterou valores). Se não quiser, tiro o log e o selo.
2. **Data do extrato (item 4):** recomendo passar a usar a data real do pagamento. Isso pode reordenar lançamentos antigos cujo dia informado difere do dia em que foram digitados.

Aguardando aprovação.
