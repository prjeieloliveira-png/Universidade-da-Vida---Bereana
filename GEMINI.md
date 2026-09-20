# Diretrizes Específicas do Antigravity (GEMINI.md)

Este arquivo contém exclusivamente as instruções operacionais e salvaguardas para o agente Antigravity neste projeto:

1. **Implementation Plan Obrigatório:**
   - Sempre gerar um `implementation_plan.md` antes de executar qualquer tarefa multi-arquivo ou refatoração estrutural.
   - Aguardar a aprovação explícita do usuário antes de iniciar as alterações de código.

2. **Validação Visual no Browser Integrado:**
   - Sempre verificar o resultado visual de alterações de interface no navegador integrado utilizando captura de tela (screenshot / subagent).
   - Validar prioritariamente em viewport mobile (**390px**) antes de dar a tarefa como concluída.

3. **Proteção Contra Operações Destrutivas:**
   - **Nunca** rodar migrações destrutivas (ex.: `DROP TABLE`, `DROP COLUMN`, comandos que causem perda de dados) sem aprovação explícita do usuário.
   - **Nunca** executar comandos destrutivos como `supabase db reset` contra qualquer ambiente remoto (staging/produção) sem aprovação explícita.
