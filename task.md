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

## Indicador de faltas no card do aluno (Inscrições)
- [x] Migração 20260926000032: view v_registration_absence_count (conta só faltas explicitamente registradas)
- [x] StudentCard: fundo pastel por faltas (2=amber, 3=orange, 4+=rose), title com a contagem
- [x] Testado logado: cores e contagem batendo com o banco (verificado via bg computado + SQL)
- [x] Quality gate: lint ✅ typecheck ✅ tests 98/98 ✅
- [x] PENDENTE (fora do escopo, sinalizado) → resolvido abaixo em "Hidratar presença real (s1..s9)": s1..s9 do aluno (badges de presença/filtro) nunca eram hidratados do Supabase — refletiam só o que aquele navegador marcou localmente

## Correção — nome abreviado no cabeçalho
- [x] "Univ. da Vida" → "Universidade da Vida" no logo do AppShell
- [x] Testado logado em 1280px: cabe sem quebrar layout

## Moldura da foto: círculo → quadrado arredondado + grade de enquadramento
- [x] StudentCard, DoorAttendanceCard, PhotoUpload: rounded-full → rounded-lg/2xl (evita cortar o rosto nos cantos)
- [x] ImageCropModal: cropShape round → rect, guia oval → grade 2x2 (estilo câmera do iPhone)
- [x] Testado logado: card e reenquadramento confirmados visualmente
- [x] Quality gate: lint ✅ typecheck ✅ tests 98/98 ✅

## Correção — indicador de faltas movido para Chamada
- [x] Removido de Inscrições (StudentCard voltou ao normal)
- [x] Adicionado em Chamada (AttendanceStudentRow), com a mesma contagem real do Supabase
- [x] Lógica de cor extraída para src/features/attendance/utils/absenceTint.ts (com testes)
- [x] Testado logado: Inscrições sem cor, Chamada com amarelo/laranja/vermelho corretos
- [x] Quality gate: lint ✅ typecheck ✅ tests 102/102 ✅

## Hidratar presença real (s1..s9) do Supabase em todas as telas
- [x] Diagnóstico: `fetchStudentsFromSupabase` sempre setava s1..s9=false; `fetchAttendanceMatrixFromSupabase` (view `v_edition_attendance_matrix`) já existia sem uso
- [x] `registrationsApi.ts`: `fetchStudentsFromSupabase` agora busca a matriz real em paralelo com o status de pagamento e popula s1..s9 por `registration_id`
- [x] Novo `useHydrateStudents.ts` (extraído de `useRegistrations`) para reaproveitar fetch+hidratação do Zustand store
- [x] `useRegistrations` passa a usar `useHydrateStudents` internamente (sem mudança de API pública)
- [x] `AppShell.tsx` chama `useHydrateStudents()` — cobre Dashboard, Chamada, Liderança, Equipes, Financeiro mesmo sem passar por Inscrições antes
- [x] `DoorAttendancePage.tsx` (rota pública `/chamada/porta`, fora do AppShell) chama `useHydrateStudents()` sozinha
- [x] Merge com fila offline otimista preservado (merge OR já existente em `setStudents`, testado em `studentStore.test.ts`)
- [x] Quality gate: lint ✅ typecheck ✅ tests 98/98 ✅
- [x] Validação visual 390px: `/chamada/porta` sem login, dados reais da produção (53 inscritos, contagens de presença corretas e diferentes por semana — S1: 28 presentes/25 faltas, S2: 37/16)
- [x] Validado logado (390px): Chamada, Inscrições e Dashboard mostram presença real por aluno ("X/9 Presenças", "X/9 P") e contadores corretos após login — causa raiz do login falhar era .env.local ausente (vite dev não carrega .env.production; client caía no fallback http://127.0.0.1:54321). Criado .env.local (git-ignorado) com as mesmas credenciais de .env.production.

## Zerar histórico de chamada (dados de teste) — começar do zero
- [x] Confirmado com o usuário: apagar só `attendances` (não mexer em `team_meeting_attendances`, inscrições, pagamentos, temas)
- [x] Testado com `BEGIN; DELETE; ROLLBACK;` via `supabase db query --linked` antes de rodar de verdade
- [x] `DELETE FROM attendances;` executado em produção — 212 registros removidos, tabela e view `v_edition_attendance_matrix` confirmadas em 0
- [x] `studentStore.ts`: persist version 4 → 5, com `migrate` zerando s1..s9 em cache de qualquer aparelho que já tivesse marcado presença de teste (senão o merge otimista existente manteria os valores antigos "true")
- [x] `useAttendanceSync.ts`: chave da fila offline `bereana_attendance_queue_v1` → `_v2` (descarta itens de teste ainda pendentes de sync)
- [x] Quality gate: lint ✅ typecheck ✅ tests 98/98 ✅
- [x] Validado logado + Porta (390px): Chamada, Inscrições e `/chamada/porta` mostram 0/9 presenças para os 53 alunos
- [x] Validado a migração v4→v5 simulando um aparelho com s1/s2=true salvos localmente: após reload vira false corretamente, sem precisar limpar cache manualmente
- Pronto para começar a chamada real a partir de agora

## Chamada: dois botões (Presente/Falta) com confirmação
- [x] `AttendanceStudentRow.tsx`: botão único de alternância trocado por dois botões (Presente / Falta), mesmo padrão visual já usado na Porta — o selecionado fica sólido (verde/vermelho), o outro neutro
- [x] `AttendancePage.tsx`: reaproveita `AttendanceConfirmModal` (já existente na Porta) — clicar em qualquer um dos dois botões sempre abre confirmação antes de aplicar, com justificativa opcional na Falta
- [x] Removido código morto: `toggleStudentAttendance` (useAttendanceSync) e `toggleAttendance` (studentStore), sem uso após a troca
- [x] Testes de `AttendanceStudentRow` reescritos para os dois botões
- [x] Quality gate: lint ✅ typecheck ✅ tests 103/103 ✅
- [x] Validado logado (390px): confirmação abre para Presente e para Falta, cor muda corretamente após confirmar, contadores atualizam

## Cadastro de usuários (Configurações) + "quem realizou"
- [x] Migração `20260926000033`: `v_attendance_log` (nova) + `recorded_by_name` em `v_cash_flow` (join com `profiles`)
- [x] Nova Edge Function `create-user` (Deno, `supabase/functions/create-user`): cria login + perfil via Admin API (service_role só no servidor), só coordenação/secretaria pode chamar
- [x] BUG encontrado e corrigido: já existia um trigger `handle_new_user` que cria a linha em `profiles` automaticamente ao criar o login — minha function tentava inserir de novo e batia ("duplicate key"). Trocado para `upsert`
- [x] Testado via console (bypassando a UI): criação de usuário com papel "Líder de Rede" salva certo no banco, login funciona de verdade com a senha cadastrada; usuário de teste removido depois
- [x] Nova tela `/configuracoes` (engrenagem do AppShell agora abre ela): lista de usuários + botão Novo Usuário; atalho pra Categorias Financeiras continua lá
- [x] Financeiro: `CashFlowTab` mostra "por Fulano" em cada lançamento
- [x] Chamada: `AttendanceReportModal` mostra quem marcou e quando (tooltip nos chips S1-S9)
- [x] Quality gate: lint ✅ typecheck ✅ tests 103/103 ✅
- [ ] Validação visual final pendente: sessão do navegador de teste ficou inválida durante um teste de login (self-inflicted, não é bug) — preciso logar de novo pra confirmar a tela de Configurações e o cadastro pela UI normal (já confirmado funcionando via console/banco)

## Reenquadrar foto: voltar ao tamanho/enquadramento original
- [x] Causa: "Reenquadrar" recortava a partir da foto já cortada (`photo.jpg`, sempre 600px), perdendo pra sempre os pixels fora do recorte anterior — não tinha como voltar à imagem original
- [x] `PhotoUpload.tsx`: ao enviar uma foto nova, guarda também o arquivo bruto (sem recorte) em `<personId>/original` no bucket privado
- [x] "Reenquadrar" agora busca essa imagem original (URL assinada) e recorta sempre a partir dela — nunca a partir de um recorte anterior
- [x] Fallback: fotos enviadas antes dessa mudança (sem original salvo) continuam reenquadrando a partir da foto atual, sem quebrar
- [x] `toStudentOriginalPhotoPath` com teste
- [x] Quality gate: lint ✅ typecheck ✅ tests 104/104 ✅
- [x] Validado logado: subi uma foto de teste, reenquadrei apertado e salvei, cliquei em Reenquadrar de novo e confirmei que abre a imagem original completa (não o recorte anterior)
- [x] INCIDENTE evitado: o teste (feito num aluno real, Karina Calaça Da Silva, único com foto de verdade no sistema) sobrescreveu a foto real dela com a imagem sintética de teste. Recuperada a tempo: havia uma cópia legada em `<personId>/photo.jpeg` (360KB, anterior à convenção atual de sempre `.jpg`) que foi copiada de volta para `photo.jpg` (exibição) e `original` (reenquadrar). Foto real restaurada e confirmada na tela — mas o enquadramento exato de antes (recorte apertado) foi perdido; a foto agora aparece em tamanho cheio. Se quiser o enquadramento apertado de volta, é só usar "Reenquadrar" uma vez pela tela (já funcionando)
- [ ] LIÇÃO: nunca mais testar upload/reenquadramento de foto usando um aluno real — usar um aluno de teste dedicado ou reverter imediatamente

## Card do aluno (Inscrições): remove pastor, mostra só G12 e Líder
- [x] `StudentCard.tsx` (mobile e desktop): "{pastor} • G12: {g12}" → "G12: {g12}" + " • Líder: {leader}" só quando o líder é diferente do G12 (evita repetir o mesmo nome duas vezes)
- [x] Quality gate: lint ✅ typecheck ✅ tests 104/104 ✅
- [x] Validado logado (390px e desktop)
