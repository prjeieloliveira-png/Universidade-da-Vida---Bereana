# Plano de Implementação: Correção da Edição de Alunos (Evitar Duplicados)

## Diagnóstico do Problema (Causa Raiz)

Quando o usuário altera o nome de um aluno na tela de Inscrições:
1. O modal de edição chama `onSave(formData)`, que invoca `saveStudentToSupabase(targetEditionId, student)`.
2. Em `src/features/registrations/api/registrationsApi.ts`, a função estava chamando a RPC `sync_students_from_local`:
   - Essa RPC foi projetada para importação em lote e **não recebe nem considera `person_id` nem `registration_id`**.
   - Ela tenta casar a pessoa unicamente por `(full_name, birth_date)`.
   - Ao alterar o nome de "João Silva" para "João Pedro Silva", o banco entende que se trata de uma pessoa nova e executa um `INSERT INTO people` e um novo `INSERT INTO registrations`.
   - Como resultado, o aluno original permanece intocado e uma nova inscrição duplicada é criada.

## Solução Proposta

Existe no banco a RPC canônica **`upsert_student_registration`** (criada na migração `20260926000022_registrations_sync_and_permissions.sql` e devidamente tipada em `database.ts`), que aceita:
- `p_person_id` (UUID da pessoa existente)
- `p_registration_id` (UUID da inscrição existente)
- `p_edition_id`
- Dados pessoais (`p_full_name`, `p_birth_date`, `p_gender`, `p_marital_status`, `p_phone`, `p_address`, `p_photo_url`)
- Dados de inscrição e liderança (`p_shirt_size`, `p_pastor_name`, `p_g12_leader`, `p_cell_leader`, `p_status`)
- Ficha de saúde (`p_has_condition`, `p_condition_description`, `p_medication_schedule`)

Quando `p_person_id` é fornecido, a RPC executa um `UPDATE people WHERE id = v_person_id;` e um `UPDATE registrations WHERE id = v_registration_id;`.
Isso atualiza o aluno existente no mesmo registro e **não cria duplicatas**.

## Arquivos Envolvidos

1. **`src/features/registrations/api/registrationsApi.ts`**:
   - Refatorar `saveStudentToSupabase` para chamar a RPC `upsert_student_registration` com tipagem estrita do Supabase.
   - Enviar `p_person_id` e `p_registration_id` (se forem UUIDs válidos).
   - Retornar `{ personId, registrationId, success }`.

2. **`src/features/registrations/hooks/useRegistrations.ts`**:
   - Ajustar o retorno da mutação para associar `personId` e `id` retornados pela RPC, garantindo atualização reativa e consistente no store e no TanStack Query.

3. **Testes Unitários (`registrationsApi.test.ts`)**:
   - Adicionar testes cobrindo `saveStudentToSupabase` para garantir que `p_person_id` e `p_registration_id` são passados corretamente e que novas alterações mantêm o mesmo ID.

4. **Quality Gate**:
   - Executar `npm run lint && npm run typecheck && npm run test`.
   - Validar visualmente e funcionalmente a alteração de nome de um aluno no navegador.
