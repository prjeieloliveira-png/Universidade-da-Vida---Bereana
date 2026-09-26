# Plano de Implementação — Correção do Deploy Automático e Cache na Hostinger

Este documento estabelece o diagnóstico preciso e as ações necessárias para resolver o problema de sincronização entre o código local e a versão em produção no link da Hostinger (`https://blanchedalmond-otter-989415.hostingersite.com/dashboard`), em conformidade com as diretrizes `AGENTS.md` e `GEMINI.md`.

---

## 1. Diagnóstico do Problema

Ao inspecionar a resposta HTTP do site em produção:
- O arquivo `index.html` e o bundle `assets/index-Bcg2aZiq.js` na Hostinger possuem timestamp `Fri, 25 Sep 2026 13:52:21 GMT` (correspondente ao commit `6f238ba`).
- O commit `de46dee` (que contém o novo painel financeiro) foi gerado às `19:52:52 GMT`. Embora o workflow do GitHub Actions tenha sido concluído como "sucesso", **os arquivos na Hostinger não foram atualizados**.
- **Causa Raiz 1 (FTP Sync State):** A action `SamKirkland/FTP-Deploy-Action@v4.3.5` utiliza o arquivo `.ftp-deploy-sync-state.json` com `dangerous-clean-slate: false`. Quando a pasta `dist/` é gerada durante o build (fora do Git), a action compara com o estado anterior e deixa de substituir o `index.html` e subir os novos arquivos gerados.
- **Causa Raiz 2 (Cache de Navegador / CDN):** O arquivo `public/.htaccess` não possui diretivas de `Cache-Control` desativando o cache de arquivos HTML. Isso faz com que navegadores e o Hostinger CDN retenham o `index.html` antigo.

---

## 2. Solução Proposta

### 2.1. Ajuste no GitHub Actions (`.github/workflows/deploy.yml`)
- Ativar `dangerous-clean-slate: true`: garante que a pasta de publicação na Hostinger seja limpa a cada deploy, removendo bundles antigos com hashes defasados e forçando a sincronização de 100% dos arquivos do build atual.
- Adicionar `log-level: verbose`: exibe detalhadamente no log do GitHub Actions cada arquivo transferido.

### 2.2. Prevenção de Cache em `public/.htaccess`
- Adicionar cabeçalhos Apache para arquivos `.html`:
  ```apache
  <IfModule mod_headers.c>
    <FilesMatch "\.(html|htm)$">
      Header set Cache-Control "no-cache, no-store, must-revalidate, max-age=0"
      Header set Pragma "no-cache"
      Header set Expires "0"
    </FilesMatch>
  </IfModule>
  ```
  Isso garante que o `index.html` seja sempre requisitado ao servidor, carregando imediatamente os bundles JS/CSS recém-compilados.

---

## 3. Arquivos Envolvidos

1. `.github/workflows/deploy.yml` — Configuração da action de deploy FTP.
2. `public/.htaccess` — Regras de cabeçalho e anti-cache para Apache/Hostinger.

---

## 4. Quality Gate e Validação

1. Executar verificação local:
   ```bash
   npm run build
   ```
2. Commit e push para a branch `main`:
   ```bash
   git add .
   git commit -m "fix(ci): ativa clean-slate no deploy FTP e desativa cache de index.html"
   git push origin main
   ```
3. Acompanhar a execução do GitHub Actions.
4. Validar via requisição HTTP (`curl` / navegador) se `blanchedalmond-otter-989415.hostingersite.com` passou a entregar o novo bundle com a tela financeira reformulada.
