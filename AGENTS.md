# Diretrizes e Padrões de Desenvolvimento — Universidade da Vida (Bereana)

Este documento estabelece a arquitetura, convenções, requisitos de segurança e padrões de código obrigatórios para todo o ciclo de vida do projeto.

---

## 1. Contexto do Projeto

Sistema de gestão da **Universidade da Vida** para uma igreja. O sistema é responsável por:
- Cadastro e gestão de pessoas.
- Inscrição de participantes em edições anuais.
- Controle de presença e frequência em encontros e aulas.
- Gestão financeira de inscrições, pagamentos e fluxo de caixa do evento.
- Emissão de fichas cadastrais, crachás e relatórios impressos.

### Perfil dos Usuários e Ambiente
- **Público principal:** Coordenação e líderes de rede.
- **Dispositivo predominante:** Smartphones (uso massivo em ambiente mobile).
- **Conectividade:** Ambientes com internet móvel instável ou intermitente — o sistema deve ser resiliente, fornecer feedback visual imediato e lidar adequadamente com falhas de conexão.

---

## 2. Stack Tecnológica

- **Frontend:** React 19 + TypeScript (strict mode) + Vite
- **Estilização:** Tailwind CSS v4 (Mobile-first)
- **Roteamento:** React Router
- **Server State & Cache:** TanStack Query (para fetch, cache, mutações e sincronização de dados do servidor)
- **Client/UI State:** Zustand (estritamente para estado de UI volátil/local, ex.: modals abertos, filtros temporários, drawer)
- **Formulários & Validação:** react-hook-form + Zod
- **Backend as a Service:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Testes Unitários e Integração:** Vitest + React Testing Library
- **Testes End-to-End (E2E):** Playwright

---

## 3. Banco de Dados e Regras de Negócio

1. **Fonte da Verdade:** O banco PostgreSQL é a única fonte da verdade do domínio. Regras de negócio que podem viver no Postgres (constraints, checks, triggers, views, funções PL/pgSQL) **não** devem ser reimplementadas no cliente.
2. **Entidade Central — Pessoa (não Aluno):**
   - A entidade permanente do sistema é a **Pessoa** (`people`). Uma pessoa é cadastrada uma única vez e pode se inscrever em múltiplas edições ao longo dos anos.
   - **Presença, pagamentos e vínculo de liderança pertencem estritamente à Inscrição** (`registrations`), **nunca à pessoa**.
3. **Dados de Saúde e Sensíveis em Tabela Separada:**
   - Comorbidades, medicações e restrições médicas devem residir em tabela própria (ex.: `medical_records` / `health_info`), **nunca como colunas da tabela de pessoas**.
   - A tabela de saúde possui **RLS restritiva exclusiva**, com acesso concedido apenas para a **coordenação** e a **secretaria** (líderes e usuários comuns não têm visibilidade nem permissão de leitura).
4. **Row Level Security (RLS) Mandatória:**
   - Toda tabela nasce com RLS habilitada (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).
   - Tabela sem policy definida é tratada como **bug crítico de segurança**, nunca como "ainda não configurado".
5. **Gestão de Chaves e Credenciais:**
   - O cliente web consome **exclusivamente** a chave pública `anon`.
   - A `service_role` **nunca** entra no bundle do frontend, em arquivos `.env` do client, nem em Edge Functions expostas sem autenticação/autorização rigorosa.
6. **Tipagem Automática:**
   - Todo acesso a dados deve passar pelo cliente Supabase tipado estritamente com os tipos gerados via `supabase gen types typescript`.
   - **É terminantemente proibido tipar respostas de query na mão** (ex.: `as MyCustomType`).
7. **Versionamento de Schema:**
   - Todo e qualquer schema, função, view ou alteração de tabela deve ser versionado via arquivos de migração em `supabase/migrations/`.
   - Nenhuma alteração estrutural pode ser feita direto pelo painel/dashboard web do Supabase.
8. **Valores Monetários:**
   - Dinheiro é **sempre em centavos (`integer` / `bigint`)**.
   - Nunca utilizar `float`, `double` ou `numeric`/`decimal` para valores monetários.
9. **Dados Derivados:**
   - Proibido salvar valores deriváveis em colunas normais (exemplo: idade é derivada de `birth_date`; status de quitação de inscrição é derivado da soma dos pagamentos registrados).
   - Utilizar SQL Views ou Generated Columns (`STORED` ou `VIRTUAL`).

---

## 4. Padrões de Código e Arquitetura

1. **Limites de Tamanho:**
   - **Nenhum componente pode ultrapassar 250 linhas**.
   - **Nenhum arquivo pode ultrapassar 400 linhas**.
   - Componentes ou utilitários que atingirem esses limites devem ser decompostos em submódulos coesos.
2. **Idiomas e Nomenclatura:**
   - **Interface e mensagens para o usuário:** Português do Brasil (`pt-BR`).
   - **Código-fonte, variáveis, funções, componentes:** Inglês (`camelCase` / `PascalCase`).
   - **Tabelas e colunas no banco:** Inglês (`snake_case`).
3. **Mobile-First Obrigatório:**
   - O desenvolvimento e a validação de layout devem ser feitos primeiramente no viewport de **390px** (largura típica de smartphones modernos) antes de considerar a tarefa finalizada.
4. **Resiliência e Chamada Offline:**
   - **A tela de chamada (frequência/presença) deve funcionar 100% offline.**
   - Mutações de presença efetuadas offline devem ser mantidas em uma **fila persistida no navegador** (ex.: IndexedDB / local storage estruturado) e sincronizadas automaticamente quando a conexão for restabelecida.
   - Deve haver um **indicador visual em tempo real** mostrando o status de sincronização e a quantidade de registros pendentes na fila.
   - O restante da aplicação pode exigir conectividade ativa.
5. **Tratamento de Estados:**
   - Tratamento explícito de estados de carregamento (skeletons/spinners), estados vazios (empty states) e mensagens de erro compreensíveis em falhas de rede.

---

## 5. Proibições Estritas (Zero Tolerance)

- ❌ Proibido o uso de `any` no TypeScript.
- ❌ Proibido criar tabelas sem RLS ativa e sem policies completas.
- ❌ Proibido commitar segredos, credenciais ou tokens em qualquer arquivo do repositório.
- ❌ Proibido armazenar imagens ou arquivos em base64 no banco (usar Supabase Storage com bucket apropriado).
- ❌ Proibido o uso de `select('*')` em telas de listagem; especifique explicitamente as colunas necessárias para reduzir payload e uso de banda móvel.

---

## 6. Quality Gate

Ao final de cada tarefa de implementação, devem ser executados com sucesso:
```bash
npm run lint && npm run typecheck && npm run test
```

Se houver alteração de schema ou migrações de banco:
```bash
supabase db lint
# e execução dos testes específicos de RLS
```
