# Plano de Implementação — Chamada: sincronização, observação na falta e auditoria de persistência

## 1. Verificação da sincronização de presença/falta (concluída)

Testei em produção: a fila offline (`useAttendanceSync`) grava no `localStorage` e, ao voltar a conexão, chama a RPC `sync_attendances_rpc`, que grava em `attendances` (212 registros hoje, 67 presenças / 145 faltas). **A sincronização já funciona corretamente**, inclusive offline. Nenhuma correção necessária aqui.

## 2. Campo de observação/justificativa na Falta (pedido principal)

No **Link da Porta** (`DoorAttendancePage` → `AttendanceConfirmModal`), ao escolher "Falta":

- Migração `20260926000030`: `ALTER TABLE attendances ADD COLUMN IF NOT EXISTS note text;` (não destrutiva).
- `record_attendance_rpc` e `sync_attendances_rpc` passam a aceitar e gravar `note` (opcional, `NULL` permitido).
- `AttendanceConfirmModal`: mostra um campo de texto opcional ("Justificativa (opcional)") só quando a ação é Falta.
- `useAttendanceSync`/`attendanceApi`: `note` passa a viajar na fila offline e no envio ao Supabase.
- O toast de confirmação mostra a observação quando informada.

## 3. Auditoria: dados do usuário não salvos no Supabase (pedido complementar)

Revisei todos os formulários do sistema (inscrições, financeiro, equipes, liderança, chamada). A maioria já persiste corretamente. Encontrei **dois problemas**:

### 3a. Tema e data da aula (Editar Tema) — corrigir agora
`WeekSelectorPills` → `EditLessonThemeModal` salva apenas no `localStorage` (`useLessonStore` com `persist`), nunca na tabela `lessons`. Confirmado no banco: todas as 9 aulas estão com `theme` e `session_date` nulos, mesmo com temas definidos localmente. Cada coordenador/dispositivo vê um tema diferente.

- Migração `20260926000030` (mesma acima): `ALTER TABLE lessons ADD COLUMN IF NOT EXISTS session_date_label text;` para guardar o texto livre da data (ex.: "07 de Março"), sem forçar conversão para o tipo `date` (ambíguo sem ano).
- Novo `src/features/attendance/api/lessonsApi.ts`: busca e atualiza `lessons` por `edition_id` + `session_number` (a policy `lessons_manage` já permite coordenação/secretaria).
- `WeekSelectorPills` passa a carregar os temas do Supabase ao entrar na tela e a salvar no Supabase ao editar, mantendo a atualização local instantânea.

### 3b. Criação de turma ("Nova Turma") — não corrigir agora, só sinalizar
`NewCohortModal`/`cohortStore` também são só locais: criar uma turma não gera uma linha em `editions`. Hoje o sistema usa uma única turma fixa (`turma-01` ↔ edição `33333333-...`), então isso não afeta a operação atual, mas uma "Turma 02" criada não teria inscrições, financeiro nem chamada reais no banco. Corrigir isso é um redesenho maior (unificar `cohorts` com `editions`) e fica fora deste pedido — vou deixar registrado como tarefa separada, para tratar quando fizer sentido.

## 4. Quality Gate e Validação

- `npm run lint && npm run typecheck && npm run test`
- Testar a RPC em produção com `ROLLBACK` antes de confiar
- Validação visual em 390px: registrar uma falta com observação pela Porta
