# Plano — Indicador de faltas no card do aluno (Inscrições)

## Regra
- 2 faltas → card em amarelo pastel
- 3 faltas → card em laranja pastel
- 4+ faltas → card em vermelho pastel
- Menos de 2 → sem alteração (visual atual)

## Como contar "falta" corretamente
Os campos locais `s1..s9` do aluno vêm só do navegador (fila offline/zustand) e podem estar desatualizados em relação a outro dispositivo (ex.: chamada feita pela Porta). Por isso o indicador vai usar a contagem real do Supabase: quantas linhas em `attendances` têm `present = false` para a inscrição — ou seja, só conta falta que foi de fato registrada em algum aparelho, nunca uma semana que ainda não aconteceu.

## Implementação
1. Migração `20260926000032` (não destrutiva): view `v_registration_absence_count` (`registration_id`, `absence_count`).
2. `attendanceApi.ts`: `fetchAbsenceCounts(editionId)`.
3. `RegistrationsPage.tsx`: busca e mescla no `cohortStudents`, igual já é feito com o status de pagamento.
4. `StudentCard.tsx`: recebe `absenceCount`; aplica fundo/borda pastel (amber-50/300, orange-50/300, rose-50/300) no card inteiro.

## Observação separada (resolvida depois)
Ao investigar, confirmei que `fetchStudentsFromSupabase` sempre zera `s1..s9` e nada no app hidrata a frequência real do Supabase de volta para a tela — os badges de presença refletiam só o que aquele navegador marcou localmente. Isso foi corrigido depois (ver `task.md`, seção "Hidratar presença real (s1..s9)").

---

# Plano de Implementação — Zerar histórico de chamada (dados de teste)

## Aprovado pelo usuário
- Escopo: apagar somente `attendances` (presença S1-S9 dos alunos). Não mexer em `team_meeting_attendances`, inscrições, pagamentos ou temas das aulas.
- Também ajustar o código para forçar cada aparelho a descartar marcações locais antigas (cache), já que o merge otimista existente (`inc.s1 || localAtt.s1` em `studentStore.ts`) prioriza o valor local — sem isso, um aparelho que já marcou presença de teste continuaria mostrando "Presente" mesmo com o banco zerado.

## Estado atual (antes de zerar)
`attendances`: 212 registros (67 presentes / 145 faltas), gravados entre 26/09 13:42 e 19:42 (produção).

## 1. Apagar no banco
`DELETE FROM attendances;` via `supabase db query --linked` (projeto já linkado: `wjyuxatjtmehnxpewqfz`).
- Testar primeiro dentro de uma transação com `ROLLBACK` para confirmar o efeito (contagem antes/depois), só then rodar o `DELETE` real sem rollback.
- Não é alteração estrutural (nenhum `DROP`/migração de schema) — é limpeza de dados de teste, então não precisa de arquivo em `supabase/migrations/`.

## 2. Forçar reset das marcações locais em cache
- `src/features/registrations/store/studentStore.ts`: bump da versão do `persist` (4 → 5) com um passo de `migrate` que zera `s1..s9` de todos os alunos persistidos localmente. Isso roda uma única vez, no próximo carregamento de cada aparelho, e depois a hidratação real do Supabase (já zerado) assume corretamente.
- `src/features/attendance/hooks/useAttendanceSync.ts`: troca a chave de armazenamento da fila offline (`bereana_attendance_queue_v1` → `bereana_attendance_queue_v2`), descartando qualquer item de teste ainda pendente de sincronizar.

## 3. Quality Gate e Validação
- `npm run lint && npm run typecheck && npm run test`
- Conferir no banco: `SELECT count(*) FROM attendances;` deve retornar 0
- Validação visual em 390px: Chamada, Inscrições e Porta devem mostrar 0/9 presenças para todos os alunos após o reset
