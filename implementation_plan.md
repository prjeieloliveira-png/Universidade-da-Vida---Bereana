# Plano: Ajustes no menu Chamada

## 1. Remover badge "Nuvem Sincronizada"
- Arquivo: `src/features/attendance/components/AttendanceSyncBadge.tsx`
- Quando `status === 'synced'`, o componente passa a retornar `null` (não renderiza nada).
- Os estados de **offline / pendente / sincronizando / erro** continuam sendo exibidos normalmente — são o indicador obrigatório de fila de sincronização exigido pelo AGENTS.md (item 4, chamada offline) e não podem ser removidos.
- Trivial, um único arquivo — sem necessidade de plano formal, mas documentado aqui por estar no mesmo pedido.

## 2. Nenhuma semana pré-selecionada ao abrir a Chamada

### Problema
`activeWeek` hoje começa em `2` (`useState<WeekNumber>(2)`) e é usado de forma não-nula em vários pontos (filtro por semana, contagem de presentes/faltas, botões "Marcar presença na Semana X", pill highlight S1-S9). Tornar `activeWeek` totalmente `null` exigiria mudar o tipo em cascata por vários componentes.

### Abordagem
Manter `activeWeek: WeekNumber` internamente (evita refatoração de tipos em cascata), mas adicionar um novo estado `weekSelected: boolean` (inicial `false`). Nenhuma pill aparece "ativa" e os botões Presente/Falta ficam desabilitados até o usuário clicar em uma semana pela primeira vez.

### Arquivos afetados
1. **`src/features/attendance/pages/AttendancePage.tsx`**
   - Adicionar `const [weekSelected, setWeekSelected] = useState(false);`
   - Novo handler `handleSelectWeek(week) { setActiveWeek(week); setWeekSelected(true); }` passado ao `WeekSelectorPills`.
   - Repassar `weekSelected` para `WeekSelectorPills` e `AttendanceStudentRow`.
   - Filtro de status (Presente/Falta) e contagens da `AttendanceStatsBar` continuam funcionando normalmente somente após seleção; antes disso, mostrar estado neutro (ex.: contagens zeradas / mensagem "Selecione uma semana").

2. **`src/features/attendance/components/WeekSelectorPills.tsx`**
   - Nova prop `weekSelected: boolean`.
   - Pill só fica com estilo "ativa" quando `weekSelected && lesson.number === activeWeek`.
   - Texto "Ativa: Semana X" no cabeçalho só aparece se `weekSelected`; caso contrário, mostrar "Nenhuma semana selecionada".
   - Banner inferior (tema da semana) mostra estado neutro/placeholder até a seleção.

3. **`src/features/attendance/components/AttendanceStudentRow.tsx`**
   - Nova prop `weekSelected: boolean`.
   - `isCurrentWeek` passa a ser `weekSelected && w === activeWeek` (nenhum chip S1-S9 destacado como semana atual antes da seleção).
   - Botões "Presente"/"Falta" ficam desabilitados (`disabled`, estilo acinzentado, tooltip "Selecione uma semana acima para registrar a chamada") enquanto `weekSelected` for `false`.

4. Testes existentes que montam esses componentes (`AttendanceStudentRow`, `WeekSelectorPills`, `AttendancePage` se houver) — ajustar para passar a nova prop / cobrir o novo estado inicial.

### Fora de escopo
- Tela "Porta" (`DoorAttendancePage.tsx`) não foi mencionada pelo usuário — mantém o comportamento atual (semana pré-selecionada), a menos que seja pedido depois.

---
CONCLUÍDO — ambos os itens implementados, testados (108/108) e validados no navegador (desktop e 390px). Ver detalhes em `task.md`.
