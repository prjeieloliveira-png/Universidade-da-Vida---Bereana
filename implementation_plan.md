# Plano: Replicar todos os filtros de Inscrições na Chamada

## Situação atual
- **Inscrições** (`RegistrationsPage.tsx` + `RegistrationFilterBar.tsx` + `RegistrationAdvancedFiltersDrawer.tsx`) usa um estado único `filters: RegistrationFilterState` (`src/features/registrations/types.ts`) com: `searchQuery`, `status` (Pago/Pendente), `paymentMethod`, `gender`, `ageRange`, `maritalStatus`, `shirtSize`, `comorbidity`, `pastor`, `g12`, `leader`. A filtragem em si é feita pela função pura `filterStudents()` (`registrations/utils/studentFilter.ts`), já testada e reaproveitável.
- **Chamada** (`AttendancePage.tsx`) hoje só tem: busca por texto, hierarquia Pastor/G12/Líder (via `HierarchicalLeaderFilter.tsx`, único lugar do app que usa esse componente) e o filtro de Presença/Falta da semana (que é específico da Chamada e não existe em Inscrições — deve ser mantido do jeito que está).
- Faltam em Chamada: Sexo, Faixa Etária, Estado Civil, Camiseta, Forma de Pagamento, Saúde/Comorbidade e Situação de Pagamento (Pago/Pendente).

## Abordagem
Reaproveitar exatamente o que já existe em Inscrições (mesmo tipo de dado `StudentRecord`, mesma função `filterStudents`, mesmo componente `RegistrationAdvancedFiltersDrawer`), em vez de duplicar código:

1. **`AttendancePage.tsx`**
   - Trocar os estados soltos `searchQuery`, `selectedPastor`, `selectedG12`, `selectedLeader` por um único `const [filters, setFilters] = useState<RegistrationFilterState>(initialRegistrationFilterState)`.
   - Trocar a filtragem manual (matchesSearch/matchesPastor/matchesG12/matchesLeader) por `filterStudents(cohortStudents, filters)`, mantendo por cima o filtro específico de Chamada (Presente/Falta na semana ativa).
   - Remover o uso de `HierarchicalLeaderFilter` (fica redundante — a hierarquia Pastor/G12/Líder passa a vir do mesmo drawer usado em Inscrições) e apagar o arquivo `HierarchicalLeaderFilter.tsx` (não é usado em nenhum outro lugar).
   - Adicionar botão "Mais filtros" (com contador de filtros ativos, igual ao de Inscrições) que abre o `RegistrationAdvancedFiltersDrawer` reaproveitado sem modificações — cobre Sexo, Idade, Estado Civil, Pagamento (forma), Pastor, G12, Líder, Camiseta e Saúde de uma vez.
   - Adicionar grupo de pills "Pagamento: Todos / Pago / Pendente" (único filtro de Inscrições que não está no drawer — lá ele é uma pill separada), ao lado do grupo já existente "Todos/Presentes/Faltas" (que continua sendo sobre presença na semana, filtro exclusivo da Chamada).
   - Chips de filtros ativos (mesmo padrão visual de Inscrições) com botão "Limpar tudo".

2. **Arquivo removido:** `src/features/registrations/components/HierarchicalLeaderFilter.tsx` (sem teste associado, sem outros usos).

3. **Testes:** ajustar/gerar testes conforme necessário para `AttendancePage` (se houver) e garantir que os 108 testes existentes continuem passando.

### Fora de escopo
- Não mexe em Inscrições, no drawer compartilhado, nem no `filterStudents`/tipos — são reaproveitados como estão.
- Mantém intactos: seleção de semana (`weekSelected`), badge de sincronização, filtro Presente/Falta específico da Chamada.

---
CONCLUÍDO — implementado, testado (107/107) e validado no navegador (desktop e 390px). Ver detalhes em `task.md`.
