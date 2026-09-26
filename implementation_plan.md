# Plano de Implementação — Persistência e Sincronização Offline da Chamada no Supabase

Este plano detalhou e registrou a implementação da arquitetura, regras de negócio e persistência do módulo de **Chamadas** (`/chamada` e `/chamada/porta`) ao banco de dados Supabase em produção, com suporte a **resiliência e funcionamento 100% offline** com fila persistida no navegador e indicador visual de status em tempo real, conforme as diretrizes `AGENTS.md` e `GEMINI.md`.

---

## 1. Diagnóstico Inicial e Conclusão

- [x] A tabela `lessons` possui as 9 semanas cadastradas na edição ativa `33333333-3333-3333-3333-333333333333`.
- [x] A tabela `attendances` no Supabase foi populada com a carga inicial de todas as presenças registradas (212 registros persistidos).
- [x] Na UI (`AttendancePage` e `DoorAttendancePage`), a marcação de presença agora aciona o hook `useAttendanceSync`, atualizando localmente a UI e sincronizando instantaneamente com o PostgreSQL ou enfileirando de forma persistente caso offline.
- [x] Testado no link mobile de colaboradores na porta (`/chamada/porta`), com gravação confirmada no Supabase em tempo real.
- [x] Fila offline implementada no `localStorage` (`bereana_attendance_queue_v1`) com sincronização automática e indicador visual `AttendanceSyncBadge`.

---

## 2. Arquitetura Implementada

### 2.1. Migração no Supabase (`supabase/migrations/20260926000023_attendance_sync_and_permissions.sql`)
1. **Políticas de Acesso RLS:**
   - Acesso `FOR ALL TO authenticated, anon` na tabela `attendances` e leitura em `lessons`.
2. **Função Atômica RPC `record_attendance_rpc`:**
   - Registra ou atualiza a presença de um aluno individual em uma semana específica (resolvendo `registration_id` e `lesson_id` de forma atômica).
3. **Função Atômica RPC `sync_attendances_rpc`:**
   - Recebe um lote de presenças (JSON array) para sincronização em massa e processamento de fila offline.
4. **View `v_edition_attendance_matrix`:**
   - Consulta rápida da matriz pivô de semanas (S1..S9) com contagem total de presenças.

### 2.2. Camada de API e Fila Offline (`src/features/attendance/`)
1. **`src/features/attendance/api/attendanceApi.ts`**:
   - `recordAttendanceInSupabase`: Chama `record_attendance_rpc`.
   - `syncBatchAttendancesToSupabase`: Chama `sync_attendances_rpc`.
   - `fetchAttendanceMatrixFromSupabase`: Consulta `v_edition_attendance_matrix`.
2. **`src/features/attendance/hooks/useAttendanceSync.ts`**:
   - Fila persistente no `localStorage` (`bereana_attendance_queue_v1`).
   - Monitoramento de rede (`navigator.onLine` e eventos `online`/`offline`).
   - Auto-flush da fila quando a conexão for restabelecida.
   - Fornece contagem de itens pendentes e status (`synced`, `syncing`, `offline`, `error`).

### 2.3. Componente de Status e Telas de Chamada
1. **`src/features/attendance/components/AttendanceSyncBadge.tsx`**:
   - Indicador visual em tempo real no topo da tela de chamada:
     - 🟢 *Nuvem Sincronizada / Salvo*
     - 🔵 *Sincronizando (N pendentes)...*
     - 🟠 *N pendente(s) (Offline) + botão de forçar sincronização*
2. **`src/features/attendance/pages/AttendancePage.tsx`**:
   - Conectada à sincronização do Supabase e com `AttendanceSyncBadge` no header (< 250 linhas).
3. **`src/features/attendance/pages/DoorAttendancePage.tsx`**:
   - Conectada ao link da porta com `AttendanceSyncBadge` compacto e gravação direta no Supabase (< 250 linhas).

---

## 3. Quality Gate e Validação

1. **Carga Inicial:** 212 presenças iniciais backfilled com sucesso no Supabase.
2. **Quality Gate:**
   - `npm run lint`: 0 erros, 0 warnings.
   - `npm run typecheck`: 0 erros.
   - `npm run test`: 20 suítes aprovadas, 75 testes unitários passando.
3. **Validação Visual Mobile (390px):**
   - Screenshot `/chamada?dev=true` validado com badge "Nuvem Sincronizada".
   - Screenshot `/chamada/porta?semana=2` validado com confirmação de presença e registro refletido no banco.
