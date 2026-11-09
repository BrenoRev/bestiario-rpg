---
paths:
  - "src/lib/ai.ts"
  - "src/components/creature/**/*.tsx"
  - "src/pages/CreateWithAIPage.tsx"
  - "src/pages/CreatureDetailPage.tsx"
  - "src/pages/CreatureEditorPage.tsx"
  - "supabase/functions/**/*.ts"
---

# Recursos de IA

## Princípios (não negociáveis)

1. **A IA propõe, o mestre decide.** Nada gerado pela IA vai ao banco sem o usuário aceitar: abas de propostas em "Criar com IA" ou `DiffReview` campo a campo na ficha.
2. A IA preserva o que não foi pedido. Na modificação, o servidor pede a ficha inteira e o app calcula a diferença; só os campos marcados pelo usuário são aplicados (`applyFields`).
3. `notes` (notas do mestre) e `image_path` nunca são alterados pela IA. Ficam fora de `FIELD_LABELS`, e `modifyCreature` os restaura do original.
4. Imagem só com clique explícito. Nenhum efeito, carregamento de página ou salvamento dispara geração.
5. Geração de texto e de imagem são independentes: dá para usar uma sem a outra.

## No app

- Toda chamada passa por `src/lib/ai.ts` (`supabase.functions.invoke`). O resultado é normalizado com `normalizeDraft` antes de chegar ao componente.
- Ajuste em ficha: `AIAssistModal` → `DiffReview` → `onApply`. Pedido rápido novo entra em `PRESETS` (`AIAssist.tsx`).
- Variações: `VariationsModal` (na ficha) ou `VariationRequest` (em "Criar com IA"), sempre como **nova** criatura.
- Combinação de propostas: `CombineModal` reaproveita o `DiffReview`.
- Toda espera de IA mostra o aviso de duração com o ícone `Sparkles` pulsando, e o modal fica com `busy`.
- Preferências do usuário (`profiles.preferences`: criatividade, detalhamento, número de propostas, contexto do universo) são o valor inicial dos controles.
- "Usar contexto do universo" vem ligado por padrão.

## No servidor

- Provedor único: **OpenAI**. Toda chamada passa por `supabase/functions/_shared/openai.ts`; não chame a API em outro lugar nem adicione outro provedor sem pedido.
- Texto: ação nova vira um `action` em `supabase/functions/ai-creature/index.ts`, reaproveitando `SYSTEM`, `contextBlock` e os esquemas. Não crie outra função para texto.
- `callOpenAIJson` (Responses API) cuida de: modelo por `OPENAI_TEXT_MODEL` (padrão `gpt-6.1-sol`), saída estruturada com `text.format` (`json_schema`, `strict: true`), `reasoning.effort`, `store: false`, tempo-limite, recusa, resposta incompleta e erros HTTP.
- `effort`: `"medium"` para gerar ou alterar fichas; `"low"` para tarefas curtas.
- Esquema JSON estrito: todo objeto com `additionalProperties: false` e todas as propriedades em `required`; raiz é objeto. `minItems`/`maxItems` e `minimum`/`maximum` são aceitos; `minLength`/`maxLength` não (corte na normalização).
- Toda ação de IA chama `consumeQuota(supabase, "text" | "image")` **antes** do provedor (cota diária por usuário em `ai_usage`).
- Saída do modelo é dado não confiável: passe por `normalizeCreature` (ou equivalente) antes de devolver.
- Prompts:
  - em pt-BR (a moldura do prompt de imagem é em inglês);
  - texto do usuário ou do banco entre tags XML (`<ideia_do_mestre>`, `<universo>`, `<ficha_atual>`, `<pedido_do_mestre>`), com o sistema dizendo que é descrição e não instrução;
  - entradas cortadas com `clip`;
  - modificações deixam explícita a regra de preservar o resto da ficha.
- Imagem: só em `ai-image`, via `generateImage`. Modelo por `OPENAI_IMAGE_MODEL` (padrão `gpt-image-2.5-flare`), WebP 1024×1024, qualidade `medium`. O prompt é montado por `buildImagePrompt` (`_shared/creature.ts`), sem chamada extra de texto.
- Edição de imagem só com imagem-base dentro da pasta do próprio usuário.

## Custos

Chamadas reais à OpenAI custam dinheiro. Não rode testes, scripts ou loops que as disparem sem autorização do usuário. Para validar a lógica, use os testes de `src/lib` e os caminhos de erro das funções sem chave configurada.
