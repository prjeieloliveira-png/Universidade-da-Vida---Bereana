# Plano: Chamada da equipe idêntica à chamada dos alunos

## Diferenças encontradas (equipe hoje vs. alunos)
| Item | Alunos (alvo) | Equipe hoje |
|---|---|---|
| Marcar | 2 botões Presente/Falta + modal de confirmação (com justificativa na falta) | 1 pílula que alterna na hora, sem confirmar |
| Falta | chip vermelho (falta confirmada) vs. branco (não registrado) | "ausente" cinza, igual a não registrado |
| Seleção | nenhuma semana pré-selecionada, ações bloqueadas até escolher | usuário abre a reunião pelo card (ok) |
| Offline | fila persistida + selo de sincronização | só online; falha silenciosa |
| Autoria | "quem registrou" | `marked_by` só preenchido no lote |
| Filtros | busca, A-Z, "Mais filtros", filtro Presentes/Faltas | nenhum |
| Relatório | modal + CSV (em branco = não registrado) | não existe |
| Link | "Link da Porta" público (`/chamada/porta`) | não existe |
| Lote | removido ("Todos Presentes") | "Marcar Presentes/Ausentes/equipe" |

## Banco (precisa de migração nova)
- `team_meeting_attendances`: **sem linha = não registrado** (já funciona, não precisa mudar o modelo); adicionar coluna `note text`.
- Nova RPC `record_team_attendance_rpc(meeting_id, team_member_id, present, note)` e `sync_team_attendances_rpc(p_items jsonb)` (SECURITY DEFINER, só `authenticated`, exige `is_coord_or_sec()`), preenchendo `marked_by = auth.uid()`; usada pela fila offline.
- Nova view `v_team_attendance_log` (como `v_attendance_log`): reunião, membro, present, note, marked_at, `marked_by_name`, `security_invoker`.
- Remover o uso de `mark_team_attendance_batch` no app (a função pode ficar no banco).
- Migração aplicada com `supabase db push` somente com sua aprovação explícita.

## App
1. `useTeamAttendanceSync` (cópia adaptada de `useAttendanceSync`): fila `bereana_team_attendance_queue_v1`, chave `(meetingId, memberId)`, selo `AttendanceSyncBadge` reaproveitado.
2. `useTeamAttendance`: estado de 3 valores (presente / falta confirmada / sem registro) lido de `v_team_attendance_log`.
3. `MeetingAttendanceSheet`: linhas no mesmo padrão (botões Presente/Falta, chip vermelho para falta, bloqueio sem reunião escolhida), `AttendanceConfirmModal` generalizado para aceitar nome + rótulo (aluno/semana ou membro/reunião), busca + A-Z + filtro Presentes/Faltas, remoção dos botões de lote.
4. Relatório da equipe (membros × reuniões, em branco = não registrado, CSV), no mesmo molde do `AttendanceReportModal`.
5. Link da equipe: reaproveitar `ShareDoorLinkModal` (recebe URL/tipo) + página `/equipes/porta?reuniao=ID` nos moldes do `DoorAttendancePage`.

## Decisão sua antes do passo 5 (link)
Hoje o anon está bloqueado nas RPCs de chamada (migração `lockdown_anon_access`): o link da porta de **alunos** só funciona em aparelho com login ativo. Para equipe, duas opções:
- **A (recomendada):** manter o mesmo comportamento — o link abre a chamada, mas exige login do aparelho (padrão idêntico ao dos alunos).
- **B:** liberar escrita anônima — contraria o lockdown de segurança, não recomendo.

## Ordem de entrega (cada etapa com lint/typecheck/test + validação em 390px)
1. Migração + hook/fila + confirmação + chip vermelho + bloqueio (núcleo do pedido)
2. Busca/A-Z/filtros + relatório/CSV
3. Link da porta da equipe

Aguardando aprovação (e a escolha A/B do link).
