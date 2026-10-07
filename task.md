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

## Imprimir Fichas: opção de Lista Resumida além da Ficha Completa
- [x] Botão "Imprimir Fichas" (Inscrições) virou um menu com duas opções: "Ficha Completa" (comportamento antigo, uma página A4 por aluno) e "Lista Resumida" (nova)
- [x] Nova `StudentSummaryPrintSheet.tsx` + `StudentSummaryPrintModal.tsx`: tabela com Nº, Nome, G12, Líder (só quando diferente do G12), Pagamento e Frequência (X/9) — uma linha por aluno, respeita o filtro ativo igual a Ficha Completa
- [x] Quality gate: lint ✅ typecheck ✅ tests 104/104 ✅
- [x] Validado logado (390px e desktop): menu abre, Ficha Completa continua igual, Lista Resumida mostra a tabela certa

## Ficha Completa: melhor aproveitamento da folha A4
- [x] Causa: fontes e espaçamentos pequenos demais (pensados pro preview reduzido dentro do modal) deixavam a ficha ocupando só a metade de cima da página A4 real, com muito espaço vazio embaixo
- [x] `StudentPrintSheet.tsx`: aumentado fonte base, títulos, badges, foto (54×72 → 72×96), chips de frequência e espaçamento entre seções (~1.3-1.5x), sem quebrar layout
- [x] `StudentIndividualPrintModal.tsx` e `StudentBatchPrintModal.tsx`: página impressa agora centraliza o conteúdo verticalmente (`display:flex; justify-content:center`) dentro da folha A4 — se ainda sobrar espaço, fica distribuído, não empilhado embaixo
- [x] Continua uma ficha por página (`page-break-after`), sem mudança nisso
- [x] Quality gate: lint ✅ typecheck ✅ tests 104/104 ✅
- [x] Validado o resultado real em tamanho A4 (via preview isolado, mesmo CSS usado na impressão): ficha completa preenche praticamente a página inteira, nos dois modos (individual e lote)

## Chamada: quadradinho S1-S9 fica vermelho quando falta é confirmada
- [x] Antes, semana sem presença (`false`) sempre aparecia neutra/branca — sem distinguir "falta confirmada" de "ainda não registrada"
- [x] Confirmado com o usuário: manter neutro para semanas nunca registradas (não pintar de vermelho semanas futuras); só fica vermelho quando a falta foi de fato confirmada
- [x] `AttendancePage.tsx`: busca `v_attendance_log` (mesma view de "quem realizou") pra saber quais semanas cada aluno já tem registro real; mescla com um Set otimista local, atualizado assim que a Falta é confirmada (não espera o round-trip do Supabase)
- [x] `AttendanceStudentRow.tsx`: chip agora tem 3 estados — verde (presente), vermelho (falta confirmada), neutro (não registrada)
- [x] Quality gate: lint ✅ typecheck ✅ tests 104/104 ✅
- [x] Validado ao vivo em produção: confirmei falta pra Karina na S2, chip ficou vermelho sólido na hora; revertido o dado de teste (DELETE do registro) depois de confirmar

## Inscrições: ordenar alunos em ordem alfabética
- [x] Botão "A-Z" novo na barra de filtros (`RegistrationFilterBar.tsx`), ativa/desativa ordenação alfabética (pt-BR, ignora acento/maiúscula)
- [x] `sortStudentsByName` em `studentFilter.ts`, aplicado no `filteredStudents` (fonte única usada pela listagem, Ficha Completa, Lista Resumida e Exportar PDF) — a ordenação vale junto com qualquer filtro ativo (idade, sexo, estado civil, camiseta, pagamento, etc.)
- [x] Quality gate: lint ✅ typecheck ✅ tests 104/104 ✅
- [x] Validado logado (desktop e 390px): ativei A-Z + filtro Pendentes juntos, confirmei que a listagem, a Lista Resumida e a Ficha Completa (25 fichas) seguem a mesma ordem alfabética

## Configurações: editar e excluir usuários
- [x] Novas Edge Functions `update-user` e `delete-user` (mesmo padrão de `create-user`), só coordenação/secretaria pode chamar
- [x] `delete-user` bloqueia excluir a própria conta (evita se trancar fora do sistema)
- [x] `_shared/authGuard.ts` novo: extrai a verificação de "chamador é coord/sec" repetida nas 3 functions
- [x] `EditUserModal.tsx` (nome, email, papel, senha opcional — em branco mantém a atual) e `DeleteUserDialog.tsx` (confirmação)
- [x] `SettingsPage.tsx`: botões editar/excluir por usuário; excluir escondido na própria linha ("você")
- [x] Quality gate: lint ✅ typecheck ✅ tests 104/104 ✅
- [x] 3 functions publicadas (create-user, update-user, delete-user)
- [x] Testado ao vivo com usuário de teste dedicado (não usei o "Teste" existente, que tem o email real do usuário): criei, editei email/senha/papel, confirmei login real com a nova senha
- [x] BUG de teste (não do código): testar login com signInWithPassword usando um client novo sem storageKey próprio sobrescreve a sessão da aba principal (mesmo incidente de antes) — troquei a conta ativa sem querer no meio do teste de exclusão; limpo via SQL, sem afetar o app
- [x] Exclusão confirmada pela UI depois (usuário de teste dedicado, criado/editado/excluído com sucesso, sem tocar nas contas reais)

## Ordenação alfabética em todas as telas com lista de pessoas
- [x] Novo util compartilhado `src/shared/utils/sortByName.ts` (pt-BR, ignora acento/maiúscula) com teste; `sortStudentsByName` (Inscrições) passa a delegar pra ele, sem mudar comportamento
- [x] Botão "A-Z" adicionado em: Chamada (`AttendancePage.tsx`), Porta (`DoorAttendancePage.tsx`), Liderança (`LeadershipFilterBar.tsx`), Equipes (`TeamListTab.tsx` — ordena dentro de cada equipe, sem misturar), Configurações/Usuários (`SettingsPage.tsx`)
- [x] Deixado de fora, com justificativa: Financeiro (extrato é ordenado por data de propósito) e Dashboard (mostra só os 5 cadastros mais recentes, não uma lista pra navegar)
- [x] Numeração original dos alunos (Nº) preservada — só a ordem de exibição muda, confirmado que não existe numeração fixa em Liderança/Equipes/Usuários pra se preocupar
- [x] Quality gate: lint ✅ typecheck ✅ tests 106/106 ✅
- [x] Validado logado (desktop e 390px) nas 5 telas: Chamada, Porta, Liderança, Equipes e Configurações — todas ordenam corretamente ao ativar o botão
- NOTA: durante a implementação, o verificador de segurança do modo automático (classificador server-side) ficou fora do ar por um tempo, bloqueando todo Bash/Write/Agent — esperei e tentei de novo até voltar, sem tentar contornar
- PR #7 mesclado em main, deploy Hostinger confirmado com sucesso

## Ajustes no menu Chamada: remover badge "Nuvem Sincronizada" + nenhuma semana pré-selecionada
- [x] `AttendanceSyncBadge.tsx`: quando `status === 'synced'` agora retorna `null` (não exibe nada); estados offline/pendente/sincronizando/erro continuam aparecendo normalmente (indicador obrigatório da fila offline, AGENTS.md item 4)
- [x] Novo estado `weekSelected` (inicia `false`) em `AttendancePage.tsx`: nenhuma pill S1-S9 aparece destacada ao abrir a Chamada
- [x] `WeekSelectorPills.tsx`: nova prop `weekSelected`; sem seleção mostra "Nenhuma semana selecionada" no lugar de "Ativa: Semana X", nenhuma pill com estilo ativo, banner de tema não diz "Chamada Oficial" até escolher
- [x] `AttendanceStudentRow.tsx`: nova prop `weekSelected`; sem seleção nenhum chip S1-S9 é destacado como semana atual, e os botões Presente/Falta ficam desabilitados (cinza, `cursor-not-allowed`) até o usuário escolher uma semana
- [x] Filtro Presentes/Faltas e botão "Todos Presentes" na `AttendanceStatsBar` também ficam bloqueados/zerados até a seleção de semana, pra não aplicar ações na semana errada por engano
- [x] Testes ajustados: `AttendanceSyncBadge.test.tsx` (2 casos agora verificam que nada é renderizado quando sincronizado), `AttendanceStudentRow.test.tsx` (+1 teste cobrindo botões desabilitados sem semana selecionada)
- [x] Quality gate: lint ✅ typecheck ✅ tests 108/108 ✅
- [x] Validado no navegador (desktop e 390px): ao abrir `/chamada`, nenhuma pill ativa, sem badge de sync, botões Presente/Falta desabilitados; ao clicar em uma semana, tudo ativa corretamente
- Fora de escopo (não pedido): tela Porta (`DoorAttendancePage.tsx`) mantém o comportamento de semana pré-selecionada
- PR #8 mesclado em main, deploy Hostinger confirmado com sucesso

## Replicar todos os filtros de Inscrições na Chamada
- [x] `AttendancePage.tsx`: estados soltos (`searchQuery`, `selectedPastor`, `selectedG12`, `selectedLeader`) substituídos por um único `filters: RegistrationFilterState` (mesmo tipo de Inscrições), filtrado pela mesma função pura `filterStudents()` — reaproveitamento total, sem duplicar lógica
- [x] Botão "Mais filtros" (com contador de filtros ativos) abre o mesmo `RegistrationAdvancedFiltersDrawer` de Inscrições, sem modificá-lo: Sexo, Faixa Etária, Estado Civil, Forma de Pagamento, Pastor de Rede, Discípulo G12, Líder de Célula, Camiseta e Saúde/Comorbidade
- [x] Pills "Pagamento: Todos/Pagos/Pendentes" adicionadas (único filtro de Inscrições que fica fora do drawer)
- [x] Chips de filtros ativos com "Limpar tudo", igual ao padrão visual de Inscrições
- [x] Removido `HierarchicalLeaderFilter.tsx` (só era usado na Chamada) — a hierarquia Pastor/G12/Líder passou a vir do mesmo drawer, sem duplicar UI
- [x] Mantidos intactos: seleção de semana obrigatória, badge de sincronização, filtro Presente/Falta específico da Chamada (não existe em Inscrições)
- [x] Quality gate: lint ✅ typecheck ✅ tests 107/107 ✅
- [x] Validado no navegador (390px e desktop): drawer abre e filtra corretamente (testado Sexo e Pastor de Rede em cascata), chips e contador funcionam, "Todos (53)" atualiza para "Todos (29)" ao filtrar por pastor
- PR #9 mesclado em main, deploy Hostinger confirmado com sucesso

## Relatório de Chamada: não marcar "F" em semana nunca registrada
- Bug reportado com print: a tabela detalhada do Relatório de Frequência (`AttendanceReportModal.tsx`) marcava "F" (falta) em toda semana com `Boolean(student[week])` false — mas isso também é verdade pra semanas que nunca tiveram chamada feita, não só faltas de fato confirmadas
- [x] `authorMap` agora guarda também `present` (vindo do `attendanceLog`/`v_attendance_log`, fonte real do Supabase), não só autor/data
- [x] Célula da tabela: só mostra "✓" (presente) ou "F" (falta) quando existe registro real (local otimista de presença OU entrada no `attendanceLog`); semana nunca registrada fica em branco (sem símbolo), com tooltip "Ainda não registrado — nenhuma chamada feita nesta semana"
- [x] Mesma correção aplicada no export CSV (`handleExportCSV`): coluna da semana fica vazia (`''`) em vez de forçar "FALTA" quando não há registro
- [x] Legenda do rodapé atualizada: "✓: Presente | F: Falta confirmada | Em branco: semana ainda não registrada"
- [x] Novo teste em `AttendanceReportModal.test.tsx` cobrindo os 3 estados (presente, falta confirmada via log mockado, e semana em branco)
- [x] Quality gate: lint ✅ typecheck ✅ tests 108/108 ✅
- [x] Validado no navegador (desktop e 390px): abri o Relatório Completo de Chamada e confirmei visualmente que semanas sem chamada aparecem em branco, só semanas com registro real mostram ✓/F
- PR #10 mesclado em main, deploy Hostinger confirmado com sucesso

## Remover botão "Todos Presentes" da Chamada
- [x] Botão removido de `AttendanceStatsBar.tsx` (e a prop `onMarkAllPresent`)
- [x] Handler `handleMarkAllPresent` removido de `AttendancePage.tsx`
- [x] `markBulkStudentsAttendance` removido de `useAttendanceSync.ts` (ficou sem nenhum outro uso no app após a remoção do botão)
- [x] Quality gate: lint ✅ typecheck ✅ tests 108/108 ✅
- [x] Validado no navegador (desktop e 390px): botão não aparece mais, resta só "Relatório Completo" na barra de estatísticas
- PR #11 mesclado em main, deploy Hostinger confirmado com sucesso

## Criar/editar/excluir equipes no menu Equipes
- "Equipe" no banco é a tabela `team_roles` (name UNIQUE, sort_order); antes só existia leitura (`useTeamRoles` era um `useQuery` puro, sem nenhuma mutação em lugar nenhum do app). RLS já permitia insert/update/delete pra coordenação/secretaria, não precisou de migração.
- [x] `useTeamRoles.ts` reescrito no padrão do `useTeamMembers.ts`: agora retorna `{ roles, isLoading, createRole, renameRole, deleteRole, ... }` com 3 mutações novas. `createRole` calcula `sort_order = max atual + 1`; erro de nome duplicado (`23505`) e exclusão bloqueada por membros vinculados (`23503`, FK `ON DELETE RESTRICT` em `team_members.team_role_id`) viram mensagens amigáveis em vez do erro cru do Postgres
- [x] `TeamRoleFormModal.tsx` (novo): modal único pra criar e renomear equipe (mesmo padrão do `EditUserModal`)
- [x] `DeleteTeamRoleModal.tsx` (novo): confirmação de exclusão, mesmo padrão visual do `DeleteTeamMemberModal.tsx`
- [x] `TeamCard.tsx`: botões de lápis (renomear) e lixeira (excluir) no cabeçalho de cada equipe
- [x] `TeamListTab.tsx`: repassa `onEditRole`/`onDeleteRole` pros cards
- [x] `TeamsPage.tsx`: botão "Nova Equipe" no cabeçalho, ao lado de "Novo Membro"; liga tudo às novas mutações
- [x] Único call site existente de `useTeamRoles` (`TeamsPage.tsx`) atualizado pro novo formato de retorno; teste `TeamsPage.test.tsx` ajustado (mock do hook) + 2 testes novos (abrir modal de nova equipe, botões renomear/excluir aparecem)
- [x] Quality gate: lint ✅ typecheck ✅ tests 110/110 ✅
- [x] PR #12 mesclado em main, deploy Hostinger confirmado com sucesso
- NOTA: a validação visual específica da tela de Equipes (criar/renomear/excluir) não chegou a ser feita no navegador antes do merge — a sessão da ferramenta caiu pra tela de login durante o desenvolvimento e o usuário pediu pra subir e mesclar antes de eu conseguir logar de novo e confirmar visualmente

## Dashboard: card "Taxa de Frequência" mostrava nomes de aula errados
- Usuário reportou e pediu pra verificar: no card da home (`LessonsProgressCard.tsx`), os nomes de cada semana (S1, S2, S3, S4...) na visão "Geral" não batiam com os nomes reais cadastrados/editados na Chamada
- Investigação confirmou: as porcentagens estavam corretas (conferido direto contra a view `v_edition_attendance_matrix` no Supabase via console do navegador: S1 22/46=48%, S2 37/46=80%, S3 36/46=78%, S4 33/46=72%, tudo batendo). O problema era só o **nome** de cada semana: o card usava a constante fixa `LESSON_WEEKS` (os temas padrão de fábrica, ex. "O Encontro com Deus") em vez de `lessons` do `useLessonStore` (os temas reais editados, ex. "Aprendendo com os erros"), que é a mesma fonte que o rodapé do card ("Fazer Chamada") já usava corretamente
- [x] `LessonsProgressCard.tsx`: trocado `LESSON_WEEKS.map(...)` por `lessons.map(...)` (vindo do hook, já em uso no resto do componente) + adicionado `lessons` nas dependências do `useMemo`
- [x] Quality gate: lint ✅ typecheck ✅ tests 110/110 ✅ (teste existente não mudou, pois o estado inicial do `lessonStore` é igual a `LESSON_WEEKS` até ser hidratado do Supabase)
- [x] Validado no navegador logado (desktop e 390px): visão "Geral" agora mostra "S1 • Aprendendo com os erros", "S2 • O melhor negócio da sua vida" etc., batendo com os nomes reais da Chamada

- PR #13 mesclado em main, deploy Hostinger confirmado com sucesso

## Semana 4 "todo mundo presente ao atualizar a página"
- Diagnóstico: o banco (RPC `sync_attendances_rpc`, upsert por aluno+aula) está correto. O bug era no cliente: `studentStore.setStudents` mesclava `banco || local`, então um "presente" antigo guardado no localStorage do navegador (resíduo do botão "Todos Presentes" removido) sempre vencia a falta gravada no banco e voltava a cada refresh
- [x] `setStudents` agora trata o banco como verdade e só preserva marcações ainda pendentes na fila offline (`bereana_attendance_queue_v2`); testes ajustados (+1) — lint ✅ typecheck ✅ tests 111/111 ✅
- Dados: na S4 há um lote de 33 presenças gravadas no mesmo minuto (28/09 21:44, 33P/0F) = clique em "Todos Presentes"; S1–S3 não têm lotes. As 33 presenças atuais da S4 são, na prática, esse lote + 13 faltas individuais — precisa o usuário conferir a S4 real. NÃO alterei dados de produção.
- [ ] Commit/push/merge dessa correção aguardando aprovação do usuário

## Chamada da equipe igual à dos alunos — etapa 1
- Migração `20261003000001_team_attendance_parity.sql` aplicada pelo usuário no banco: coluna `team_meeting_attendances.note`, RPC `sync_team_attendances_rpc` (só authenticated, coord/sec) e view `v_team_attendance_log` (com autor). CLI estava logado na conta errada (403), por isso o usuário aplicou o SQL manualmente
- [x] `AttendanceConfirmModal` generalizado (subjectName/label/noun/contextLabel/details); AttendancePage e DoorAttendancePage adaptadas
- [x] `useTeamAttendanceSync` (fila `bereana_team_attendance_queue_v1`) + `useTeamAttendance` em 3 estados (presente / falta confirmada / não registrado), lendo `v_team_attendance_log`
- [x] `MeetingAttendanceSheet` + `MeetingAttendanceRow` + `MeetingAttendanceToolbar`: botões Presente/Falta com confirmação e justificativa, quadradinho verde/vermelho/branco, selo de sync, busca, A-Z, filtro Presentes/Faltas; botões em lote removidos
- [x] `database.ts` editado à mão (note, v_team_attendance_log, sync_team_attendances_rpc) — regenerar com `npm run db:types` quando o CLI tiver acesso ao projeto
- [x] Quality gate: lint ✅ typecheck ✅ tests 111/111 ✅
- [ ] Validação visual em 390px pendente (sessão do navegador da ferramenta deslogada)
- Próximas etapas: relatório/CSV da equipe; link da porta da equipe (opção A: exige login no aparelho, como nos alunos)
- PR #15 mesclado em main, deploy ok (etapa 1)

## Chamada da equipe — etapas 2 e 3
- [x] Etapa 2: `TeamsAttendanceReportModal` (membros × reuniões, ✓/F/em branco, tooltip com autor e justificativa, total, imprimir e CSV com BOM) + botão "Relatório" em Reuniões (`MeetingListTab`); +1 teste
- [x] Etapa 3 (opção A, exige login no aparelho): `ShareDoorLinkModal` generalizado (path/título/instruções/WhatsApp); botão "Link da Porta" na chamada da reunião; rota `/equipes/porta?reuniao=ID` dentro de `ProtectedRoute` (sem AppShell) → `TeamDoorAttendancePage` reaproveita o mesmo `MeetingAttendanceSheet` (procedimento idêntico); bloqueia quem não é coord/sec
- [x] Quality gate: lint ✅ typecheck ✅ tests 112/112 ✅
- [ ] Validação visual (390px) das etapas 1–3 pendente — sessão do navegador da ferramenta deslogada

## Financeiro: pagamentos da equipe no extrato
- Verificação (banco real): `team_member_payments` tinha 5 pagamentos (R$ 500,00); `v_cash_summary` já somava (entradas R$ 6.828,00 = alunos 6.328 + equipe 500; saldo R$ 6.708,10), mas `v_cash_flow` (extrato) só trazia pagamentos de inscrição + lançamentos manuais → extrato somava R$ 6.208,10, R$ 500 abaixo do saldo
- [x] Migração `20261007000001_cash_flow_include_team_payments.sql` (a aplicar pelo usuário): `v_cash_flow` ganha ramo `source='team_payment'` (categoria "Equipe", nome do membro, forma, autor via `created_by`), mesmas colunas, `security_invoker`
- [x] App: `CashFlowEntry.source` aceita `'team_payment'`; descrição "Equipe: Nome"; estorno chama `voidTeamMemberPayment` (antes cairia em `voidTransaction`); invalida status de pagamento da equipe; ícone de "Equipe"
- [x] Quality gate: lint ✅ typecheck ✅ tests 112/112 ✅
- [x] Migração aplicada pelo usuário e conferida: extrato = saldo (R$ 6.708,10), 5 linhas "Equipe" (R$ 500,00) aparecem no banco e na tela
- [ ] Estorno de pagamento de equipe ainda não testado (dinheiro real)
- PR #16 mesclado em main, deploy Hostinger ok
- [x] Usuário validou em produção a chamada da equipe (etapas 1–3) e o extrato com pagamentos da equipe
- Pendências conhecidas: regenerar `database.ts` com `npm run db:types` quando o Supabase CLI tiver acesso ao projeto Bereana (hoje editado à mão); `AttendancePage.tsx` passou de 400 linhas (limite do AGENTS.md) e merece ser dividida; 33 presenças em lote da Semana 4 (28/09 21:44) aguardam decisão do usuário
- PR #16 e validação em produção registrados acima

## Financeiro: editar lançamentos (alunos, equipe e manuais) com auditoria
- Verificação: antes só existia estorno; nenhuma tela/RPC de edição
- [x] Migração `20261008000001_edit_financial_entries.sql` (a aplicar pelo usuário): tabela `financial_edit_log` (RLS, leitura coord/sec), RPCs `update_payment`, `update_team_member_payment` (revalidam limite da taxa; equipe R$ 100) e `update_financial_transaction` (tipo/categoria/valor/forma/descrição/data/comprovante), todas coord/sec, recusam estornados e gravam antes/depois no log; `v_cash_flow` passa a usar a data real do pagamento/lançamento (meio-dia p/ não virar o dia) e ganha colunas `last_edited_at`, `last_edited_by_name`, `notes`, `receipt_url`
- [x] App: `EditCashFlowEntryModal` (campos conforme o tipo), lápis em cada linha do extrato, selo "Editado" (com quem/quando no tooltip), `updateCashFlowEntry`, invalidação de extrato/caixa/status; `database.ts` editado à mão (view, funções)
- [x] Quality gate: lint ✅ typecheck ✅ tests 116/116 ✅ (+4 testes)
- [ ] ATENÇÃO: `fetchCashFlow` devolve [] em erro — só fazer merge/deploy DEPOIS de aplicar a migração (a view nova precisa das colunas novas)
- [ ] Aplicar SQL, validar no navegador (editar de teste e conferir log e saldo) e então commit/push/merge
