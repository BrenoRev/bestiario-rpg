---
paths:
  - "supabase/functions/**/*.ts"
  - "supabase/config.toml"
---

# Edge Functions (Deno)

## Estrutura

- Uma pasta por função em `supabase/functions/<nome>/index.ts`. Código compartilhado fica em `_shared/` e não é duplicado.
- Esqueleto de toda função:

```ts
import { loadUniverse, requireUser } from "../_shared/auth.ts";
import { HttpError, json, readJson, serve } from "../_shared/http.ts";

interface Body { universeId: string; /* … */ }

serve(async (req) => {
  const { supabase, user } = await requireUser(req);   // cliente agindo COMO o usuário: a RLS vale
  const body = await readJson<Body>(req);
  if (!body?.universeId) throw new HttpError(400, "Selecione um universo.");
  const universe = await loadUniverse(supabase, body.universeId);   // 404 se não for do usuário
  // validar e cortar entradas → chamar a IA → normalizar a saída
  return json({ /* resultado */ });
});
```

- `serve` já trata CORS, método `POST` e erro inesperado (500 genérico + `console.error`). O frontend mostra o campo `error` da resposta.
- Erro para o usuário: `throw new HttpError(status, "mensagem em pt-BR")`.

| Status | Quando |
|---|---|
| 400 | entrada inválida ou faltando |
| 401 | sem sessão ou sessão inválida |
| 403 | recurso de outro usuário |
| 404 | não encontrado (inclui universo de outro usuário, que a RLS esconde) |
| 422 | a IA ou o serviço de imagem recusou o pedido |
| 413 | corpo grande demais |
| 429 | cota diária do usuário ou limite do provedor |
| 500 | configuração do servidor (variável faltando) |
| 502 | falha ou resposta inválida do provedor |
| 504 | o provedor passou do tempo-limite |

## Regras

- Sempre `requireUser`: o cliente usa o JWT do usuário e a RLS vale também aqui. **Nunca** use a service role key.
- `readJson` recusa corpo acima de 256 KB (413). CORS vem de `ALLOWED_ORIGINS` (vazio = qualquer origem) e é aplicado pelo `serve` em toda resposta.
- Ação que chama a IA consome a cota diária com `consumeQuota` antes do provedor (`_shared/quota.ts`).
- Funções não gravam fichas: devolvem **propostas**, e quem salva é o app depois da revisão. A única escrita permitida é o arquivo e a linha de versão em `creature_images` no `ai-image`.
- Recurso vindo do corpo (id, caminho de arquivo) é conferido contra o usuário antes do uso (veja o prefixo `<user_id>/` em `ai-image`).
- Entradas de texto cortadas com limite (`clip`) e listas limitadas (`slice`).
- Segredos só via `requireEnv("NOME")`. Variável nova entra em `supabase/functions/.env.example` e no README.
- Imports `npm:` com versão exata, iguais aos já usados (`npm:@supabase/supabase-js@2.119.0`). A OpenAI é chamada por `fetch` em `_shared/openai.ts`, sem SDK. Atualizar versão é uma mudança separada, com pedido.
- Se falhar depois de enviar um arquivo, remova o arquivo (veja o `remove` após erro no insert em `ai-image`).

## Função nova (checklist)

1. Pasta `supabase/functions/<nome>/index.ts` com o esqueleto acima.
2. `[functions.<nome>] verify_jwt = true` em `supabase/config.toml`.
3. Cliente em `src/lib/ai.ts` (ou equivalente em `src/lib/`), usando o `invoke` existente.
4. Deploy documentado no README (`npx supabase functions deploy <nome>`).

## Verificação

- `npm run check:functions` depois de qualquer mudança aqui (checa todas as funções; é o mesmo comando do CI).
- Teste local: `npx supabase start` e `npx supabase functions serve --env-file supabase/functions/.env`.
- Caminhos de erro (400/401/403/404/500) podem ser testados sem chave de IA. Chamada real à IA só com autorização do usuário (custa dinheiro).
