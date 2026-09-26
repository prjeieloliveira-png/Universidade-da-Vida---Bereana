# CLAUDE.md

@AGENTS.md

## Diretrizes específicas do Claude Code

Este projeto é desenvolvido alternadamente no Antigravity e no Claude Code. As regras abaixo espelham o `GEMINI.md` para que os dois agentes se comportem igual.

1. **Plano antes de mudanças grandes:** para tarefas multi-arquivo ou refatorações estruturais, apresentar o plano (em `implementation_plan.md`) e aguardar aprovação antes de alterar código.
2. **Validação visual:** verificar mudanças de interface no navegador, priorizando viewport mobile de **390px**, antes de dar a tarefa como concluída.
3. **Operações destrutivas:** nunca rodar migrações destrutivas (`DROP TABLE`, `DROP COLUMN` etc.) nem `supabase db reset` contra ambiente remoto sem aprovação explícita do usuário.
4. **Continuidade entre ferramentas:** ao começar, ler `task.md` e `implementation_plan.md` para saber em que ponto o trabalho parou; ao terminar ou pausar, atualizar `task.md` com o que foi feito e o que falta.
