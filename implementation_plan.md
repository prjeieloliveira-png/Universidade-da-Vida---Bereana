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

## Observação separada (não corrigir agora)
Ao investigar, confirmei que `fetchStudentsFromSupabase` sempre zera `s1..s9` e nada no app hidrata a frequência real do Supabase de volta para a tela — os badges de presença hoje refletem só o que aquele navegador marcou localmente. Vou sinalizar isso como tarefa separada; o indicador de faltas não depende disso porque usa a contagem direto do banco.
