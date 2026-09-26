# Plano de Implementação — Persistência Completa de Inscrições no Supabase

Este plano detalha a arquitetura e as etapas necessárias para conectar o módulo de **Inscrições** diretamente ao banco de dados Supabase em produção, garantindo que nenhum dado seja perdido e que todas as operações (cadastro, edição, fotos e saúde) persistam no PostgreSQL em conformidade com as diretrizes `AGENTS.md` e `GEMINI.md`.

---

## 1. Diagnóstico Atual

- O banco de dados PostgreSQL do Supabase possui 0 pessoas e 0 inscrições salvas.
- Os 53 alunos atuais residem apenas no `mockStudents.ts` e no `localStorage` do navegador via `useStudentStore`.
- No componente `RegistrationsPage.tsx`, `handleSaveStudent` grava apenas no estado local do Zustand.
- As políticas de segurança (RLS) para `SELECT` em `people` e `registrations` precisam permitir a leitura correta dos registros.

---

## 2. Solução Arquitetural

### 2.1. Migração no Supabase (`supabase/migrations/20260926000022_registrations_sync_and_permissions.sql`)
1. **Políticas RLS:**
   - Garantir que `people`, `registrations` e `health_records` permitam `SELECT`, `INSERT`, `UPDATE` para usuários autenticados e anônimos (modo dev/mobile resilience).
2. **Função Atômica RPC `upsert_student_registration`:**
   - Recebe em uma única chamada:
     - Dados da pessoa (`full_name`, `birth_date`, `gender`, `marital_status`, `phone`, `address`, `photo_url`)
     - Dados da inscrição (`edition_id`, `shirt_size`, `pastor_name`, `g12_leader`, `cell_leader`, `status`)
     - Dados sensíveis de saúde (`has_condition`, `condition_description`, `medication_schedule`)
   - Executa a gravação transacional atômica em `people` + `registrations` + `health_records`.
3. **Atualização da RPC `sync_students_from_local`:**
   - Expandir a carga em massa para também gravar `photo_url`, `shirt_size`, `pastor`, `g12`, `leader` e criar os registros em `health_records`.

### 2.2. Camada de API e Hooks (`src/features/registrations/`)
1. **`src/features/registrations/api/registrationsApi.ts`**:
   - `fetchRegistrations(editionId)`: Busca inscrições no Supabase com join em `people` e `health_records`.
   - `saveStudentRegistration(editionId, student)`: Chama a RPC atômica `upsert_student_registration`.
   - `syncAllLocalStudents(editionId, students)`: Carga inicial em lote dos 53 alunos.
2. **`src/features/registrations/hooks/useRegistrations.ts`**:
   - Hook React Query (`useQuery` + `useMutation`) para gerenciar o estado do servidor com sincronização bidirecional no `useStudentStore` (para manter compatibilidade com módulos dependentes como Chamada e Dashboard).

### 2.3. Interface do Usuário (`RegistrationsPage.tsx` e `RegistrationEditModal.tsx`)
1. **Carga Inicial dos Dados:**
   - Se o banco de dados estiver com 0 registros, exibe um banner/botão intuitivo de **"Sincronizar Alunos com a Nuvem"** (e permite acionamento com 1 clique).
2. **Salvamento em Tempo Real:**
   - No modal de edição/criação, `handleSaveStudent` chama a mutação no Supabase com feedback visual (loading no botão "Salvar" e mensagem de confirmação).

---

## 3. Arquivos Envolvidos

1. `supabase/migrations/20260926000022_registrations_sync_and_permissions.sql` *(Novo)*
2. `src/features/registrations/api/registrationsApi.ts` *(Novo, < 250 linhas)*
3. `src/features/registrations/hooks/useRegistrations.ts` *(Novo, < 250 linhas)*
4. `src/features/registrations/pages/RegistrationsPage.tsx` *(Modificação)*
5. `src/features/registrations/components/RegistrationEditModal.tsx` *(Modificação para feedback de loading ao salvar)*

---

## 4. Quality Gate e Validação

1. Execução do script de migração no Supabase.
2. Execução dos testes e linter:
   ```bash
   npm run lint && npm run typecheck && npm run test
   ```
3. Teste em tempo real:
   - Sincronização dos 53 alunos.
   - Verificação direta no Supabase (`people` > 0, `registrations` > 0).
   - Criação de um novo aluno de teste e confirmação imediata no banco.
   - Validação visual no browser integrado em viewport mobile (**390px**).
