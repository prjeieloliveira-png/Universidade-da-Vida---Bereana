# Plano — Cadastro de usuários (login/senha) + "quem realizou"

## Contexto (o que já existe, confirmado no código)
- Hoje só existe **um** jeito de criar login: inserir direto em `auth.users` via SQL (só eu ou você conseguem, via `supabase db query`/seed). Não existe tela nem função pra isso.
- `attendances.marked_by` e `financial_transactions.recorded_by` (e `payments.recorded_by`) **já existem e já são gravados automaticamente** (via `auth.uid()`, dentro das próprias RPCs). O que falta é: (1) contas individuais de verdade pra cada pessoa, e (2) mostrar isso na tela — hoje esses campos nunca aparecem em lugar nenhum da interface.
- A engrenagem no canto superior direito do `AppShell` já existe, mas hoje só abre `/financeiro?config=categorias` (configuração de categorias do financeiro). Vou transformar isso numa tela de Configurações de verdade, com uma seção de Usuários (e a de Categorias continua acessível de lá).
- Criar um usuário com email+senha exige a **Admin API do Supabase** (`auth.admin.createUser`), que só funciona com a chave `service_role` — nunca pode ir pro navegador. Então isso precisa de uma **Supabase Edge Function** (não existe nenhuma hoje no projeto). A função roda no servidor, valida que quem está chamando é coordenação/secretaria, e só então cria o login.

## ⚠️ Ponto que preciso confirmar com você antes de programar
Hoje a Porta da Chamada funciona porque **um aparelho fica logado com uma conta só**, e todo mundo que usa aquele tablet marca presença "como" essa mesma conta. Se o objetivo é realmente saber **qual pessoa** marcou cada presença/lançamento, isso só funciona se **cada pessoa logar com a própria conta** no aparelho (ou pelo menos escolher o próprio nome antes de registrar) — senão o campo "quem realizou" vai sempatar sempre com a mesma pessoa (quem logou primeiro no tablet), mesmo sendo outra pessoa mexendo.

Isso vale tanto pra Chamada (já no ar) quanto pro link do Financeiro que a gente ia fazer depois. Quero confirmar o que você prefere:
1. Cada colaborador loga com a própria conta (login/senha individual) sempre que for usar — mais preciso, mas dá mais trabalho no dia a dia (login toda vez ou trocar de conta no aparelho compartilhado).
2. Mantém aparelho compartilhado logado numa conta só, mas antes de cada registro a pessoa escolhe o próprio nome numa lista simples (sem senha) — mais rápido no dia a dia, mas não é "seguro" (qualquer um pode escolher o nome de outro).

## 1. Banco de dados
- Migração nova `20260926000033_settings_users.sql`... na verdade sem mudança de schema aqui: `profiles`, roles e as policies já servem (qualquer autenticado já pode ler `profiles`; só coordenação/secretaria pode alterar). Vou usar o papel `viewer` (já existe, sem nenhuma permissão extra de escrita nas outras tabelas) pra contas de colaboradores simples — assim não preciso mexer no enum de papéis.
- **Nova Edge Function `create-user`** (`supabase/functions/create-user/index.ts`): recebe `{ email, password, full_name, role }`; confere no cabeçalho da requisição que quem está chamando é coordenação/secretaria (consulta `profiles` pelo JWT); usa `service_role` (variável de ambiente que o Supabase já injeta sozinho dentro da function, não preciso configurar nada manual) pra criar o login (`auth.admin.createUser`) e a linha em `profiles`; se der erro no meio, desfaz o que já tinha criado. Faço deploy dessa função pelo `supabase functions deploy` (CLI já está logada no seu projeto).

## 2. Frontend — Tela de Configurações
- Nova rota `/configuracoes` dentro do `AppShell` (só aparece no menu pra coordenação/secretaria, mesmo padrão de Equipes/Financeiro hoje).
- A engrenagem passa a abrir `/configuracoes` (a configuração de categorias do financeiro continua existindo, só muda o link de entrada).
- `src/features/settings/pages/SettingsPage.tsx`: lista de usuários (nome, email, papel, data de criação) + botão "Novo Usuário" → formulário simples (nome completo, email, senha, papel) → chama a Edge Function.
- Sem edição/desativação de usuário por enquanto (não foi pedido) — só cadastrar e listar.

## 3. Mostrar "quem realizou"
- **Financeiro**: nova coluna/etiqueta "registrado por {nome}" em cada lançamento do `CashFlowTab` (join simples de `recorded_by` → `profiles.full_name` numa view).
- **Chamada**: adiciono "registrado por {nome} às HH:mm" no Relatório (`AttendanceReportModal`), já que ali tem espaço — não vou tentar espremer isso nos chips S1-S9 (ficaria apertado demais no mobile).

## 4. Quality Gate e Validação
- `npm run lint && npm run typecheck && npm run test`
- Testar a Edge Function em produção: criar um usuário de teste, confirmar login funcionando, depois excluir
- Validação visual em 390px: tela de Configurações, cadastro de usuário, e "quem realizou" aparecendo no Financeiro e no Relatório da Chamada
