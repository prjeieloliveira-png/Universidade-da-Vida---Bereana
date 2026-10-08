# Plano: página dedicada de Relatórios (3 abas, personalizáveis, prontos para A4)

## Estrutura
Nova rota `/relatorios` (item "Relatórios" no menu) com 3 abas:
1. **Frequência** (alunos e equipe)
2. **Financeiro**
3. **Alunos** (relação com líderes)

Cada aba tem o mesmo esqueleto, para ficar fácil de aprender:
**[Filtros] → [Campos/colunas] → [Opções de página] → [Pré-visualização A4] → [Imprimir / Exportar CSV]**

## O que dá para personalizar (comum às 3 abas)
- **Colunas:** marcar/desmarcar o que aparece e reordenar.
- **Filtros:** específicos de cada relatório (abaixo), com resumo dos filtros ativos impresso no cabeçalho.
- **Ordenação** (ex.: A-Z, por líder, por data) e **agrupamento** com cabeçalho e subtotal (ex.: por G12, por equipe, por categoria).
- **Papel:** A4 retrato ou paisagem (a tabela se ajusta), densidade (compacta/normal) e numeração das linhas.
- **Cabeçalho:** logo, título e subtítulo editáveis, data de emissão, quem emitiu e campo opcional de observação/assinatura no rodapé.
- **Modelos salvos** (opcional): guardar a configuração com um nome e reaproveitar.

## Aba 1 — Frequência
- **Alunos:** colunas escolhidas entre nº, nome, telefone, pastor, G12, líder, pagamento, S1–S9, total, %, faltas, justificativas. Filtros: semanas (uma, várias ou todas), situação (presente / falta confirmada / sem registro), mínimo de faltas, faltas seguidas, pastor/G12/líder, pagamento, sexo, idade. Em branco = sem registro; "F" = falta confirmada.
- **Equipe:** membros × reuniões. Filtros: equipes, período/reuniões, situação (presente/falta/sem registro/não convocada), só ativos.
- Opcional nas duas: resumo no topo (totais e % por semana/reunião) e quem registrou cada marcação.

## Aba 2 — Financeiro
- **Extrato personalizável:** período, tipo (entrada/saída), origem (inscrição, equipe, manual), categoria, forma de pagamento, pessoa, quem registrou, só editados. Colunas à escolha (data, descrição, categoria, forma, valor, quem registrou, editado). Agrupar por dia, categoria ou forma de pagamento, com subtotais e **resumo no topo** (entradas, saídas, saldo).
- **Situação de pagamentos** (modo à parte): por aluno/membro — taxa, pago, saldo, abatimento (quitação), status. Filtros: status, equipe/G12/pastor.
- Valores sempre exatos (centavos) e formatados em R$.

## Aba 3 — Alunos
- **Relação de alunos** com colunas à escolha: nº, nome, telefone, endereço, data de nascimento/idade, sexo, estado civil, camiseta, **pastor, G12, líder**, pagamento (status/valor), frequência (total). Filtros: os mesmos de Inscrições (sexo, idade, estado civil, camiseta, forma de pagamento, pagamento, pastor, G12, líder). Agrupar por pastor, G12 ou líder, com contagem por grupo.
- **Saúde/comorbidade:** coluna disponível **somente para coordenação e secretaria** (regra do projeto).

## Impressão A4
- Impressão pela própria página (estilo de impressão com `@page A4`, quebra de página que não corta linha, cabeçalho da tabela repetido em cada folha, rodapé com paginação), sem janela pop-up (que alguns navegadores bloqueiam). Pré-visualização na tela já no formato da folha.

## Dados e banco
- Usa as views e tabelas que já existem (`v_edition_attendance_matrix`, `v_attendance_log`, `v_team_attendance_log`, `v_cash_flow`, `v_cash_summary`, status de pagamento, inscrições). **Não precisa de migração.**
- Modelos salvos: guardados no navegador de cada usuário (sem tabela nova), a menos que você queira compartilhá-los entre usuários (aí precisa de tabela).

## Entrega em 3 etapas (cada uma com testes, validação em 390px e em A4)
1. Base (rota, abas, filtros, seletor de colunas, folha A4, CSV) + **aba Alunos**
2. **Aba Frequência** (alunos e equipe)
3. **Aba Financeiro** (extrato + situação de pagamentos)

## Decisões suas
1. **Quem acessa:** sugiro coordenação e secretaria na página inteira. Líder de rede veria só a frequência e a lista de alunos da própria rede (etapa posterior). Concorda?
2. **Modelos salvos:** incluir já (no navegador de cada um) ou deixar para depois?
3. **Prioridade:** começo por Alunos (mais simples, valida a base), depois Frequência e Financeiro. Ou prefere outra ordem?

Aguardando aprovação.
