# Plano de Implementação — Enquadramento (recorte) de foto antes do upload

Permitir que, ao escolher uma foto (câmera ou arquivos), o usuário enquadre o rosto antes do envio ao Supabase Storage. O componente será compartilhado, para reutilização em qualquer upload futuro de foto (professores, equipes etc.).

---

## 1. Fluxo do usuário

1. Toca em **Câmera** ou **Arquivos** e escolhe a imagem.
2. Abre um modal de enquadramento em tela cheia (mobile-first, 390px):
   - arrastar para posicionar e **pinça** (ou controle deslizante) para zoom;
   - botão para **girar 90°** (fotos de celular às vezes vêm deitadas);
   - guia circular sobre a área de recorte, indicando como a miniatura vai ficar.
3. **Confirmar** → a imagem recortada é enviada; **Cancelar** → nada é enviado.
4. Com uma foto já salva, um botão **Reenquadrar** reabre o modal com a foto atual.

## 2. Decisões técnicas

- **Biblioteca:** `react-easy-crop` (leve, ~10 KB gzip, suporte nativo a toque/pinça, sem dependências).
- **Proporção do recorte:** 3:4 (serve à ficha impressa 3×4 e, centralizada, às miniaturas circulares). *A confirmar com o usuário.*
- **Saída:** recorte feito em `<canvas>` no navegador, exportado como **JPEG, largura máx. 600 px, qualidade 0,85**. Isso reduz fotos de 3–5 MB para ~80–150 KB, o que acelera o envio em internet móvel instável.
- **Caminho no Storage:** `<personId>/photo.jpg` (sempre `.jpg`, sobrescrevendo a anterior); o cache da URL assinada é invalidado após o envio.

## 3. Arquivos

| Arquivo | Ação |
|---|---|
| `package.json` | adicionar `react-easy-crop` |
| `src/shared/utils/cropImage.ts` (+ teste) | funções puras: cálculo do tamanho de saída e geração do JPEG recortado/girado via canvas |
| `src/shared/components/ImageCropModal.tsx` | modal reutilizável de enquadramento (zoom, girar, confirmar/cancelar) |
| `src/features/registrations/components/PhotoUpload.tsx` | abrir o modal ao escolher o arquivo e enviar o resultado recortado; botão **Reenquadrar** |

Todos dentro dos limites de 250 linhas por componente. Nenhuma alteração de banco ou migração.

## 4. Quality Gate e Validação

- `npm run lint && npm run typecheck && npm run test`
- Validação visual no navegador em **390px**: escolher foto, enquadrar, confirmar e conferir a miniatura no card e na ficha de impressão.
