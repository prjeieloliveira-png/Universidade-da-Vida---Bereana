# Plano: taxa editável por pessoa + "Quitação concluída" (com abatimento)

## Decisões já tomadas (suas respostas)
1. **Taxa editável por pessoa:** cada aluno/membro pode ter valor de inscrição próprio; o padrão segue R$ 200 (aluno) e R$ 100 (equipe).
2. **Quitação concluída = abatimento:** quem pagou só parte fica como **Pago**, o restante sai do "a receber" e vira um abatimento registrado (quanto, quem e quando), com opção de desfazer.

## Como está hoje
- A taxa do aluno vem de `editions.registration_fee_cents` (igual para todos) e a da equipe está fixa em 10000 (R$ 100) dentro de 2 views, 1 RPC de edição e na meta do resumo.
- Status (Pago/Parcial/Pendente) é **derivado** da soma dos pagamentos (regra do AGENTS.md: nunca salvar status em coluna) — vamos manter isso: o status passa a considerar a taxa da pessoa e a quitação.
- O gatilho `prevent_overpayment` e as RPCs de edição travam em "soma ≤ taxa".

## Banco (migração nova — a aplicar por você)
1. **Colunas novas** (sem apagar nada): `registrations.fee_cents` e `team_members.fee_cents` (opcional; vazio = taxa padrão); `settled_at`, `settled_by`, `waived_cents` (abatimento) nas duas tabelas.
2. **Views** `v_registration_payment_status` e `v_team_member_payment_status` (CREATE OR REPLACE, mesmas colunas, novas ao final): taxa efetiva = taxa da pessoa ou padrão; **status 'paid' se pagou o total OU está quitada**; `outstanding_cents` = 0 quando quitada; expõem `waived_cents` e `settled_at`.
3. **Resumo do caixa** (`v_cash_summary`): meta = soma das taxas efetivas **menos os abatimentos**; "a receber" deixa de contar o abatido; meta de equipe passa a somar a taxa de cada membro ativo (hoje é ativos × R$ 100).
4. **RPCs** (só coord/sec, SECURITY DEFINER, gravam em `financial_edit_log`):
   - `set_payment_fee(tipo, id, valor)` — altera a taxa da pessoa (recusa valor menor que o já pago).
   - `settle_payment_obligation(tipo, id, observação)` — marca quitação concluída e grava o abatimento (= taxa − pago).
   - `unsettle_payment_obligation(tipo, id)` — desfaz a quitação.
5. `prevent_overpayment`, `update_payment` e `update_team_member_payment` passam a usar a **taxa efetiva da pessoa** em vez da fixa; se a taxa mudar depois, pagamentos antigos não são alterados.

## App
- **Receber inscrição / Receber pagamento da equipe:** em cada modal, campo "Valor da inscrição" editável (salva a taxa daquela pessoa) e botão **"Quitação concluída"** (pede confirmação mostrando quanto será abatido); para quem já está quitado com abatimento, mostra "Quitado (abatimento de R$ X)" e **"Desfazer quitação"**.
- Status e rótulos (listas de busca, selos em Inscrições, Dashboard) passam a refletir quitação/abatimento; a meta e o "a receber" do resumo seguem o novo cálculo.
- Funções em `financialData.ts`, tipos em `database.ts` (editado à mão até o CLI voltar), testes e validação em 390px.

## Cuidados
- Mudar a taxa muda a **meta** e o **status** de quem já pagou (ex.: baixar a taxa para o que a pessoa já pagou deixa como Pago). Isso é o comportamento esperado, mas altera números do dashboard.
- Quitação não cria nem apaga pagamento; só muda o status e registra o abatimento.
- Ordem: você aplica o SQL → eu testo no banco real (com registros de teste estornados, como antes) → só então commit/push/merge.

Aguardando aprovação.
