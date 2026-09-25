# Plano de Implementação — Nova Identidade Visual (Referência Quixotic)

Este plano detalha a extração da identidade visual fornecida na imagem de referência e a transformação da aplicação da **Universidade da Vida (Bereana)** para adotar essa estética executiva, moderna e de alto padrão, em estrita conformidade com `AGENTS.md` e `GEMINI.md`.

---

## 1. Diagnóstico e Extração da Identidade Visual

A imagem de referência apresenta uma interface SaaS/Fintech de altíssimo nível com as seguintes características fundamentais:

| Elemento Visual | Na Imagem de Referência | Aplicação na Universidade da Vida |
| :--- | :--- | :--- |
| **Canvas de Fundo** | Cinza suave moderno (`#e9edf0` / `#ebeef2`) | Background global do app envolto por moldura flutuante |
| **Moldura Principal (Desktop)** | Canvas branco flutuante com cantos arredondados generosos (`rounded-[32px]`) | Container principal desktop com padding suave e bordas sutis |
| **Cor Primária (Accent)** | Verde Esmeralda / Floresta profundo (`#0d7647` / `#095a36`) | Substitui o mint pastel anterior, transmitindo solidez e prestígio |
| **Gradiente em Cartão** | Verde rico com textura sutil e ondas contactless | Cartão de Resumo Financeiro / Caixa estilizado como cartão físico UV |
| **Dock Lateral Esquerdo** | Rail vertical flutuante branco com círculo verde ativo e ícones stroke | Menu lateral flutuante no desktop com atalhos rápidos, settings e logout |
| **Navegação Superior** | Pílula central com abas (`Dashboard`, `Inscrições`, etc.) e itens ativos brancos com sombra suave | Pílula de navegação superior refinada |
| **Ações no Topo** | Botões circulares brancos com borda fina (busca, sino, engrenagem, avatar) | Ações de topo padronizadas em cápsulas circulares `w-9 h-9` |
| **Cards de Conteúdo** | Branco puro (`bg-white`), `rounded-[24px]`, bordas ultrafinas (`border-slate-150`), botão circular `↗` no topo direito | Padronização de todos os cards do dashboard |
| **Gráfico de Barras (Frequência)** | Barras verticais arredondadas com textura verde sálvia e barra ativa em destaque com badge flutuante | Gráfico de Frequência/Aulas da UV com badge `+17.8%` |
| **Sparkline e Balanço** | Saldo grande com gráfico de onda suave em verde e botões pill `Entrada ↑` / `Saída ↓` | Card de Fluxo de Caixa / Saldo em tempo real |
| **Tabela de Atividades** | Lista limpa com ícones/logos de categoria e status dot `● Confirmado` | Tabela de Últimas Inscrições / Lançamentos |
| **Avatares em Grupo** | Avatares circulares sobrepostos com badge verde `+2` | Equipe de serviço e líderes ativos |
| **Mobile (390px)** | Barra flutuante inferior com o mesmo dock em pílula | Mantém navegação mobile-first rápida e ergonômica com alvos de toque de 44px |

---

## 2. Paleta de Cores e Tokens de Design (`src/index.css`)

```css
:root {
  /* Verde Esmeralda Quixotic */
  --brand-primary: #0d7647;
  --brand-primary-hover: #095a36;
  --brand-primary-light: #e8f7ee;
  --brand-primary-border: #b6e3c9;
  
  /* Superfícies e Canvas */
  --brand-canvas: #e9edf0;
  --brand-surface: #ffffff;
  --brand-surface-subtle: #f8fafc;
  
  /* Textos */
  --brand-text-main: #111827;
  --brand-text-muted: #64748b;
  --brand-text-subtle: #94a3b8;
  
  /* Bordas e Sombras */
  --brand-border: #eef2f5;
  --brand-radius-card: 24px;
  --brand-radius-pill: 9999px;
}
```

---

## 3. Arquitetura do Layout (`src/app/AppShell.tsx`)

1. **Desktop (`lg` e superior):**
   - Canvas exterior em `#e9edf0`.
   - Container flutuante arredondado (`rounded-[32px] bg-white border border-slate-200/60 shadow-xs max-w-7xl mx-auto my-3 min-h-[calc(100vh-1.5rem)]`).
   - Top Header com:
     - Logo Bereana / UV com ícone em verde esmeralda.
     - Barra de navegação central em pílula (`bg-[#f4f6f8]` com aba ativa branca e sombra suave).
     - Seletor de turma (CohortSelector) em pílula elegante.
     - Botões circulares: Busca rápida, Notificações (`Bell`), Configurações (`Settings`) e Avatar.
   - Rail vertical esquerdo flutuante (Dock):
     - Ícone ativo com círculo verde esmeralda (`bg-[#0d7647] text-white`).
     - Ícones de navegação limpos e com espaçamento generoso.
     - Divisor sutil e botões inferiores para `Configurações` e `Sair`.
2. **Mobile (Viewport 390px):**
   - Preserva a experiência mobile rápida, fluida e ergonômica.
   - Barra de navegação flutuante inferior adaptada à nova identidade (pílula branca, ícone ativo com badge verde esmeralda `#0d7647`, alvos de toque de 44px).
   - Menu "Mais" na gaveta inferior mantendo coerência visual total.

---

## 4. Redesenho da Página do Dashboard (`DashboardPlaceholder.tsx` e componentes)

A tela principal do Dashboard será transformada para reproduzir a composição da referência:

1. **Linha de Saudação:**
   - Título: `Bem-vindo(a), {Nome}` (tipografia moderna com "Bem-vindo(a)," em peso normal e o nome em negrito).
   - Direita: Seletor de Turma em cápsula com ícone de calendário e botão pílula `+ Novo Aluno`.
2. **Card Cartão UV (Estilo Cartão de Crédito Verde):**
   - Gradiente verde esmeralda profundo (`from-[#0d7647] to-[#085231]`).
   - Símbolo contactless, bandeira "UV CARD", saldo em destaque (`R$ XX.XXX,XX`), número mascarado `•••• 2026` e validade.
   - Rodapé com arrecadação semanal e badge de taxa `+12.8%`.
3. **Card Taxa de Frequência (Bar Chart):**
   - Título com ícone e toggle em pílula (`Mensal` / `Aulas`).
   - Barras verticais arredondadas com textura/cor sálvia suave e a barra ativa da semana em verde esmeralda sólido com badge flutuante de presença (`+17.8%`).
4. **Card de Saldo em Caixa & Gráfico de Onda (Sparkline):**
   - Saldo líquido disponível em caixa com curva suave de fluxo financeiro.
   - Botões pílula de ação rápida: `Entrada ↑` (verde) e `Saída ↓` (branco com borda).
5. **Card de Metas e Equipe:**
   - Total de alunos inscritos vs meta da turma.
   - Grupo de avatares circulares sobrepostos com crachá `+2` indicando líderes e voluntários servindo.
6. **Card de Histórico Recente (Payment/Registration History):**
   - Tabela limpa com nome do participante/lançamento, data, hora, status (`● Confirmado` / `● Pago`) e valor monetário formatado em centavos.

---

## 5. Plano de Execução Passo a Passo

1. **Fase 1 — Tokens Globais (`src/index.css`):**
   - Adicionar variáveis de cor da nova paleta Quixotic.
   - Configurar classes utilitárias para cantos arredondados (`rounded-[24px]`, `rounded-[32px]`) e gradientes esmeralda.
2. **Fase 2 — Reestruturação do AppShell (`src/app/AppShell.tsx`):**
   - Implementar o container flutuante desktop e o rail vertical de ícones.
   - Atualizar a pílula de navegação superior e botões circulares de ação.
   - Atualizar a barra inferior mobile (390px).
3. **Fase 3 — Componentes de Dashboard no Novo Estilo:**
   - Criar/adaptar os componentes de cards com botão `↗`, cartão verde esmeralda e gráfico de barras com textura.
4. **Fase 4 — Integração na DashboardPage (`DashboardPlaceholder.tsx`):**
   - Montar o grid de 3 colunas exatamente como na referência.
5. **Fase 5 — Validação e Quality Gate:**
   - Execução de `npm run lint && npm run typecheck && npm run test`.
   - Validação visual em viewport mobile de 390px e desktop via subagente de navegação integrado com capturas de tela.

---

## 6. Solicitação de Aprovação

Solicito a aprovação deste plano de implementação para iniciar a transformação da identidade visual.
