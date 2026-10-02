# Plano: Criar/editar/excluir equipes no menu Equipes

## Modelo de dados
"Equipe" no banco é a tabela `team_roles` (id, name UNIQUE, sort_order, active, created_at). Hoje `useTeamRoles.ts` só lê (`useQuery`, sem mutações) — não existe nenhuma função de criar/renomear/excluir em lugar nenhum do app. RLS já permite insert/update/delete para coordenação/secretaria (`team_roles_manage`), então não precisa de migração nova.

Duas restrições do banco a tratar com mensagens amigáveis (não deixar o erro cru do Postgres estourar na tela):
- `name` é **UNIQUE** → criar/renomear com nome repetido deve mostrar "Já existe uma equipe com esse nome."
- `team_members.team_role_id` referencia `team_roles(id)` com **ON DELETE RESTRICT** → excluir uma equipe com membros vinculados (em qualquer turma, não só a ativa) falha no banco; a UI deve capturar esse erro (código `23503`) e mostrar "Não é possível excluir: esta equipe possui membros vinculados. Mova ou remova os membros primeiro." em vez de tentar um pré-check manual (mais simples e sempre correto, pois a trava real é no banco).

## Arquivos

1. **`src/features/teams/hooks/useTeamRoles.ts`** — adicionar 3 mutações (padrão igual ao `useTeamMembers.ts`, com `useMutation` + invalidação de `['team-roles']`):
   - `createTeamRole(name)`: insere com `sort_order = max(sort_order atual) + 1`.
   - `renameTeamRole(id, name)`: `update({ name })`.
   - `deleteTeamRole(id)`: `delete()`.
   Ambos createTeamRole/renameTeamRole tratam erro `23505` (nome duplicado); deleteTeamRole trata `23503` (membros vinculados).

2. **`src/features/teams/components/TeamRoleFormModal.tsx`** (novo) — modal único para criar e renomear (mesmo padrão de `EditUserModal`/`TeamMemberModal`: um campo de texto, título e botão mudam conforme `initialRole` for `null` (criar) ou preenchido (editar)). Mostra erro inline (nome duplicado) sem fechar o modal.

3. **`src/features/teams/components/DeleteTeamRoleModal.tsx`** (novo) — mesmo padrão visual do `DeleteTeamMemberModal.tsx` (aviso amarelo "Ação irreversível", erro inline, botão com loading), adaptado para equipe: avisa que a exclusão falhará se houver membros vinculados.

4. **`src/features/teams/components/TeamCard.tsx`** — adicionar dois botões pequenos (ícone, igual ao padrão de "editar/excluir" já usado em Configurações/Usuários) no cabeçalho do card, ao lado do botão "Adicionar": lápis (renomear) e lixeira (excluir), via novas props `onEditRole` / `onDeleteRole`.

5. **`src/features/teams/components/TeamListTab.tsx`** — repassa `onEditRole`/`onDeleteRole` para cada `TeamCard`.

6. **`src/features/teams/pages/TeamsPage.tsx`** — novo botão **"Nova Equipe"** no cabeçalho (ao lado de "Novo Membro"), abre `TeamRoleFormModal` em modo criação; estado para abrir o mesmo modal em modo edição (vindo do `TeamCard`) e para o modal de exclusão; liga tudo às novas mutações do `useTeamRoles`.

### Fora de escopo
- Não mexe em `team_members`, em reordenar (`sort_order` dos existentes), nem em RLS/migrações — tudo já permitido pela policy atual.
- Não adiciona reordenação drag-and-drop das equipes (não foi pedido).

---
Implementado e testado (110/110). Validação visual no navegador ainda pendente — sessão da ferramenta caiu pra tela de login, aguardando o usuário logar de novo. Ver detalhes em `task.md`.
