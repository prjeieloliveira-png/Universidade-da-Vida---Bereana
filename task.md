# Tarefas — Módulo Financeiro

## Fase 1 — Banco de Dados (Migrações)
- [x] Migração `000005`: Enum `payment_method` (pix, debit, credit, cash)
- [x] Migração `000006`: Colunas de estorno (voided_at, voided_by, void_reason)
- [x] Migração `000007`: Tabela `cash_categories`
- [x] Migração `000008`: Trigger `prevent_overpayment`
- [x] Migração `000009`: View `v_registration_payment_status` (com filtro voided_at)
- [x] Migração `000010`: View `v_cash_flow`
- [x] Migração `000011`: View `v_cash_summary`
- [x] Migração `000012`: RPC `register_payment`
- [x] Migração `000013`: RPC `void_payment`
- [x] `supabase db push` aplicado com sucesso
- [x] `supabase gen types typescript` → `database.ts` (1605 linhas)
- [x] Quality gate: lint ✅ typecheck ✅ tests 24/24 ✅

## Fase 2 — Normalização de Dados Legados
- [x] Migração `000014`: Constraint canônica em `payments.payment_method`
- [x] Função `normalize_payment_method` para mapeamento PIX→pix, CARTÃO→credit etc.
- [x] RPC `register_payment` corrigida (coluna `payment_method` e retorno UUID)
- [x] RPC `upsert_registration` atualizada com normalize_payment_method
- [x] `supabase db push` aplicado com sucesso
- [x] Quality gate: lint ✅ typecheck ✅ tests 24/24 ✅

## Fase 3 — UI Módulo Financeiro (/financeiro)
- [x] `src/features/financial/types.ts` (tipos derivados do schema)
- [x] `src/features/financial/data/financialData.ts` (camada de dados)
- [x] `src/features/financial/components/FinancialSummaryCard.tsx`
- [x] `src/features/financial/components/PaymentsTab.tsx`
- [x] `src/features/financial/components/CashFlowTab.tsx`
- [x] `src/features/financial/components/AddPaymentModal.tsx`
- [x] `src/features/financial/pages/FinancialPage.tsx`
- [x] `src/shared/hooks/useActiveEdition.ts`
- [x] `src/app/routes.tsx` — rota `/financeiro` apontando para FinancialPage
- [x] Migração `000015`: Garantia de edição 2026 ativa no banco
- [x] Migração `000016`: RLS em `cash_categories`, leitura pública de `editions`/`lessons` e perfis de coordenação
- [x] Quality gate: lint ✅ typecheck ✅ tests 24/24 ✅
- [x] Validação visual mobile 390px ✅

## Fase 4 — Integração com telas existentes
- [x] `StudentCardDetails.tsx` — subcomponente extraído para respeitar limite de 250 linhas
- [x] `StudentCard.tsx` — badge de status dinâmico via `v_registration_payment_status`
- [x] `RegistrationsPage.tsx` — totais pago/pendente via `v_cash_summary` e mapeamento individual
- [x] `studentFilter.ts` — utilitário extraído para manter `RegistrationsPage` concisa
- [x] Dashboard (`DashboardPlaceholder.tsx`) — resumo financeiro integrado com métricas reais do caixa
- [x] Quality gate: lint ✅ typecheck ✅ tests 24/24 ✅
- [x] Validação visual no browser (viewport mobile 390px) ✅

## Correção — Miniatura da foto do aluno
- [x] Causa: bucket `student-photos` é privado, mas o upload salvava URL `/object/public/...` (HTTP 400)
- [x] `photo_url` passa a guardar o caminho do objeto; exibição via URL assinada (`useStudentPhotoUrl`)
- [x] URLs públicas legadas continuam funcionando (`toStudentPhotoPath`)
- [x] Aplicado em StudentCard, DoorAttendanceCard, StudentPrintSheet e PhotoUpload
- [x] Quality gate: lint ✅ typecheck ✅ tests 92/92 ✅
- [ ] Validação visual logado (390px)

## Enquadramento de foto antes do upload
- [x] `react-easy-crop` + `ImageCropModal` compartilhado (zoom/pinça, girar 90°, guia oval, proporção 3:4)
- [x] `cropImage.ts`: recorte via canvas → JPEG máx. 600 px (q 0,85), com testes
- [x] `PhotoUpload`: abre o enquadramento ao escolher foto; botão Reenquadrar; salva sempre `<personId>/photo.jpg`
- [x] Quality gate: lint ✅ typecheck ✅ tests 96/96 ✅ build ✅
- [ ] Validação visual logado (390px) — preview do Claude Code ainda preso à pasta anterior

## Foto ampliada ao expandir o card do aluno
- [x] `StudentCard`: avatar cresce com animação (scale 1.75 desktop / 1.35 mobile) sem alterar a altura do card
- [x] Painel de detalhes abre/fecha com animação de altura + fade (300 ms, em sincronia com a foto)
- [x] Quality gate: lint ✅ typecheck ✅ tests 96/96 ✅
- [ ] Validação visual logado

## Correção — Filtro Pagos/Pendentes
- [x] Causa: `registrationsApi` comparava `PAID`/`OVERPAID`, mas `v_registration_payment_status` retorna `paid`/`partial`/`pending` (minúsculas) → ninguém ficava "Pago"
- [x] `isPaidPaymentStatus` (com teste) + página usa o status da view também no filtro (mesma fonte do badge e dos contadores)
- [x] Quality gate: lint ✅ typecheck ✅ tests 98/98 ✅
- [ ] Validação visual logado

## Excluir inscrito (menu Inscrições)
- [x] Migração `20260926000029`: RPC `delete_registration` (SECURITY DEFINER, só coord/secretaria autenticados; bloqueia se houver pagamento válido; apaga pessoa órfã) — aplicada em produção
- [x] Testada em produção com ROLLBACK: pendente exclui ✅, pago bloqueia ✅, anon negado ✅
- [x] `database.ts` regenerado; `deleteRegistration` + `useDeleteRegistration` + `removeStudent` na store
- [x] `DeleteRegistrationDialog` + botão Excluir no modal de edição (só coordenação/secretaria)
- [x] Quality gate: lint ✅ typecheck ✅ tests 98/98 ✅
- [ ] Validação visual logado (390px)
- [ ] PENDENTE (segurança, fora do escopo): policies `*_all_access` com `USING (true)` para `anon` em people, health_records, registrations, attendances etc. — dados expostos a qualquer um com a anon key

## Remoção — botão Sincronizar Nuvem
- [x] Botão, handler, estado de sucesso e a mutação de sync em lote (`syncAllStudentsToSupabase`) removidos (só serviam para a importação inicial dos alunos)
- [x] `vite.config.ts`: testes agora excluem `.claude/worktrees/**` (evitava rodar/quebrar com testes de sessões paralelas)
- [x] Quality gate: lint ✅ typecheck ✅ tests 98/98 ✅
- [ ] Validação visual logado

## Chamada: observação na falta + tema/data da aula salvos no Supabase
- [x] Sincronização de presença/falta verificada: já funciona (fila offline + sync_attendances_rpc), 212 registros em produção
- [x] Migração `20260926000031`: coluna `note` em attendances + `session_date_label` em lessons; record_attendance_rpc e sync_attendances_rpc passam a aceitar/gravar note
- [x] Testado em produção com ROLLBACK: RPC única, RPC em lote e update direto de lessons — todos ok
- [x] AttendanceConfirmModal: campo de justificativa opcional só na Falta; fila offline carrega a nota
- [x] BUG encontrado e corrigido: tema/data da aula (Editar Tema) só salvava no localStorage, nunca no Supabase (todas as 9 aulas estavam com theme/session_date nulos no banco). Criado lessonsApi.ts + useLessonsSync; WeekSelectorPills agora carrega e salva no Supabase
- [x] Auditoria geral de persistência: inscrições, financeiro, equipes e liderança já salvam corretamente no Supabase
- [x] PENDENTE (fora do escopo, sinalizado): criar Nova Turma (cohortStore) também é só local, nunca gera linha em `editions` — sistema hoje usa só uma turma fixa, então não afeta a operação atual
- [x] Quality gate: lint ✅ typecheck ✅ tests 98/98 ✅
- [ ] Validação visual logado (390px)

### Nota sobre migração 20260926000030
A sessão paralela de segurança (RLS) usou o número 20260926000030 (`lockdown_anon_access.sql`) e já aplicou em produção. Copiei o arquivo dela para este checkout para o histórico local bater com o banco, e renumerei minha migração para 20260926000031. Ajustei os GRANTs de record_attendance_rpc/sync_attendances_rpc para `authenticated` apenas (sem anon), para não reabrir o acesso que aquela migração fechou.

## Refatoração — ReceivePaymentModal e ReceiveTeamPaymentModal
- [x] Dividido em: paymentReceiptShared.tsx (StatusBadge + msg WhatsApp, deduplicados), *SearchStep, *FormStep, *SuccessStep, useReceivePayment.ts e useReceiveTeamPayment.ts (hooks com toda a lógica de dados)
- [x] ReceivePaymentModal.tsx: 582 → 132 linhas. ReceiveTeamPaymentModal.tsx: 525 → 156 linhas. Todos os arquivos novos abaixo de 250 linhas
- [x] Sem mudança de comportamento (mesmo texto, mesmos fluxos, mesmos ids de teste)
- [x] Quality gate: lint ✅ typecheck ✅ tests 98/98 ✅
- [ ] Validação visual logado (registrar um pagamento de teste)
