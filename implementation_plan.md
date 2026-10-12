# Plano de Implementação: Indicador de Pagamento e Cortesia no Módulo de Equipes

## 1. Contexto e Objetivo
Conforme solicitado pelo usuário:
1. No **menu Equipes**, exibir um indicador visual claro de pagamento para cada membro:
   - **Pago** (quitado)
   - **Pendente** (pendente de pagamento)
   - **Cortesia** (membro isento/convidado)
2. Adicionar a opção de **etiquetar o membro como Cortesia**:
   - Membros com cortesia **não precisam pagar**.
   - Eles **saem do cálculo do financeiro** (sua meta no financeiro passa a ser R$ 0,00 e eles não geram saldo a receber nem entram na contagem de pendências).
   - O usuário pode marcar ou desmarcar cortesia no cadastro/edição ou via ação rápida no menu de equipes.

---

## 2. Modelagem do Domínio e Banco de Dados

### 2.1 Migração: `20261012000001_team_member_courtesy.sql`
1. **Tabela `team_members`**:
   - Adicionar coluna:
     ```sql
     ALTER TABLE team_members
     ADD COLUMN IF NOT EXISTS is_courtesy boolean NOT NULL DEFAULT false;
     ```
2. **View `v_team_member_payment_status`**:
   - Atualizar a view para expor `is_courtesy` e calcular:
     ```sql
     CASE
       WHEN b.is_courtesy THEN 'courtesy'
       WHEN b.settled_at IS NOT NULL OR b.paid >= b.fee THEN 'paid'
       WHEN b.paid > 0 THEN 'partial'
       ELSE 'pending'
     END AS status,
     CASE WHEN b.is_courtesy THEN 0 ELSE b.fee END AS registration_fee_cents,
     CASE
       WHEN b.is_courtesy THEN 0
       WHEN b.settled_at IS NOT NULL THEN 0
       ELSE GREATEST(b.fee - b.paid, 0)
     END AS outstanding_cents
     ```
3. **View `v_cash_summary`**:
   - Excluir membros cortesia do cálculo da meta e das pendências das equipes:
     ```sql
     COUNT(*) FILTER (WHERE tm.active = true AND vtmp.status = 'paid')      AS team_paid_count,
     COUNT(*) FILTER (WHERE tm.active = true AND vtmp.status = 'partial')   AS team_partial_count,
     COUNT(*) FILTER (WHERE tm.active = true AND vtmp.status = 'pending')   AS team_pending_count,
     COUNT(*) FILTER (WHERE tm.active = true AND vtmp.status = 'courtesy')  AS team_courtesy_count,
     COALESCE(SUM(vtmp.registration_fee_cents - vtmp.waived_cents)
              FILTER (WHERE tm.active = true AND NOT tm.is_courtesy), 0)    AS team_goal_cents
     ```
   - O saldo a receber das equipes (`total_team_receivable_cents`) é derivado de `GREATEST(team_goal_cents - total_team_paid_cents, 0)`. Com a meta zerada para cortesias, eles saem completamente do cálculo financeiro.
4. **RPC Segura: `set_team_member_courtesy`**:
   - Função `SECURITY DEFINER` com checagem `is_coord_or_sec()`.
   - Se tentar marcar como cortesia alguém que já possui pagamentos registrados (`total_paid_cents > 0`), lança erro explicativo solicitando estornar os pagamentos antes.
   - Atualiza `team_members.is_courtesy` e registra no `financial_edit_log`.

---

## 3. Camada de Dados e Tipos Frontend

### 3.1 `src/features/teams/types/teams.ts`
- Estender `TeamMemberWithDetails`:
  ```ts
  payment: {
    status: 'paid' | 'partial' | 'pending' | 'courtesy';
    isCourtesy: boolean;
    feeCents: number;
    paidCents: number;
    outstandingCents: number;
  };
  ```
- Estender `CreateTeamMemberInput` e `UpdateTeamMemberInput` com `isCourtesy?: boolean`.

### 3.2 `src/features/teams/hooks/useTeamMembers.ts`
- Na query `['team-members', editionId]`:
  - Buscar paralelamente os status em `v_team_member_payment_status`.
  - Mapear o objeto `payment` para cada membro retornado.
- Adicionar mutação `toggleCourtesy({ memberId, isCourtesy })`:
  - Invoca `set_team_member_courtesy` via Supabase RPC.
  - Invalida `['team-members', editionId]`, `['team-member-payment-statuses', editionId]` e `['cash-summary', editionId]`.
- Propagar `isCourtesy` nos mutations de criação e atualização de membros.

---

## 4. Interface do Usuário (UI/UX)

### 4.1 Linha do Membro (`TeamMemberRow.tsx`)
- Adicionar **Badge de Pagamento** ao lado da badge de presença:
  - **Pago:** verde (`bg-emerald-50 text-emerald-700 border-emerald-200`) com ícone `CheckCircle2`.
  - **Pendente:** âmbar (`bg-amber-50 text-amber-700 border-amber-200`) com ícone `Clock`.
  - **Cortesia:** lilás/índigo (`bg-purple-50 text-purple-700 border-purple-200`) com ícone `Gift` e texto "Cortesia".
- Adicionar botão de ação rápida para alternar Cortesia (ícone `Gift`), com tooltip intuitivo e feedback imediato.

### 4.2 Modal de Cadastro e Edição (`TeamMemberModal.tsx`)
- Adicionar seção/checkbox com toggle:
  - **"Cortesia / Convidado da Equipe"**
  - Legenda: *"Membro isento da taxa de inscrição — não entrará na cobrança do financeiro."*
  - Permitir definir na criação ou ao editar o membro.

### 4.3 Barra de Filtros e Resumo (`TeamListTab.tsx`)
- Adicionar filtro rápido por status de pagamento (Pills):
  - **Todos**
  - **Pagos** (`N`)
  - **Pendentes** (`N`)
  - **Cortesia** (`N`)
- Permitir filtrar instantaneamente os membros por status de pagamento, além da busca por nome/telefone e filtro de inativos.

### 4.4 Relatório de Impressão (`TeamsPrintSheet.tsx`)
- Incluir coluna ou badge de status de pagamento (Pago / Pendente / Cortesia) na ficha impressa das equipes.

---

## 5. Quality Gate e Salvaguardas

1. **Restrições Arquiteturais (`AGENTS.md`):**
   - Manter todos os componentes abaixo de 250 linhas e arquivos abaixo de 400 linhas (modularizar submódulos se necessário).
   - Tipagem estrita TypeScript sem `any`.
   - UI em português do Brasil (`pt-BR`).
2. **Execução do Quality Gate:**
   - `npm run lint && npm run typecheck && npm run test`
3. **Validação Visual no Navegador:**
   - Validar prioritariamente no viewport mobile de **390px** e desktop:
     - Visualização das badges de Pago, Pendente e Cortesia.
     - Ação de marcar/desmarcar cortesia no modal e na ação rápida.
     - Verificação da atualização dos cálculos no Financeiro.
