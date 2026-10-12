# Plano de Implementação: Filtro de Idade Personalizado (Idade Inicial e Idade Final)

## Objetivo
Substituir as faixas etárias pré-definidas (`<18`, `18-29`, `30-49`, `50+`) por campos personalizáveis onde o usuário pode definir a idade mínima (inicial) e a idade máxima (final) desejadas para filtrar os alunos.

---

## Modificações Propostas

### 1. Modelo de Dados (`src/features/registrations/types.ts`)
- Substituir o campo `ageRange: 'ALL' | 'under18' | '18-29' | '30-49' | '50+'` em `RegistrationFilterState` por:
  ```ts
  minAge: string;
  maxAge: string;
  ```
- Atualizar `initialRegistrationFilterState` com `minAge: ''` e `maxAge: ''`.

### 2. Lógica de Filtragem (`src/features/registrations/utils/studentFilter.ts`)
- Ajustar `filterStudents` para aplicar:
  - Se `minAge` preenchido: `s.age >= Number(minAge)`
  - Se `maxAge` preenchido: `s.age <= Number(maxAge)`
  - Se ambos preenchidos: alunos com idade entre `minAge` e `maxAge` (inclusive)
  - Se nenhum preenchido: todas as idades

### 3. Interface da Barra de Filtros (`RegistrationFilterBar.tsx`)
- **Barra horizontal rápida (desktop/rolável):**
  - Substituir o `<select>` de faixas fixas por um seletor inline com inputs numéricos: `Idade: [ Mín ] a [ Máx ]`.
- **Badges/Chips ativos e contador:**
  - Contar como filtro ativo se `minAge` ou `maxAge` estiver preenchido.
  - Exibir chip formatado:
    - Ambos: `Idade: 18 a 30 anos`
    - Apenas mínima: `Idade: ≥ 18 anos`
    - Apenas máxima: `Idade: ≤ 30 anos`
  - Ao remover o chip (botão `X`), limpa ambos os campos.

### 4. Gaveta de Filtros Avançados (`RegistrationAdvancedFiltersDrawer.tsx`)
- Substituir o `<select>` de faixas por dois inputs em grade:
  - `Idade Mínima` (ex: 18)
  - `Idade Máxima` (ex: 35)

### 5. Demais Telas Integradas
- **Relatório PDF de Inscrições (`RegistrationReportModal.tsx`):**
  - Exibir no resumo de filtros a faixa personalizada ativa (ex: `Idade: 18 a 30 anos`).
- **Aba Alunos da Página de Relatórios (`StudentFiltersPanel.tsx`):**
  - Atualizar o resumo descritivo e o chip de idade para refletir `minAge`/`maxAge`.
- **Chamada (`AttendancePage.tsx`):**
  - Como compartilha o mesmo `RegistrationFilterState`, atualizar os contadores de filtros ativos e chips correspondentes.

---

## Verificação e Quality Gate
1. `npm run test` (todos os testes passando, adicionando teste para o filtro de idade customizado).
2. `npm run typecheck` e `npm run lint`.
3. Validação visual no viewport mobile (390px) e desktop.
