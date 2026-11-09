# Bestiario — regras para agentes de IA

Plataforma para mestres de RPG criarem bestiários por universo, com fichas de D&D 5e e uma IA que propõe e o mestre decide.

Este repositório é **IA-first**: a maior parte do código é escrita com o Claude. Estas regras existem para que qualquer pedido novo saia no mesmo padrão do que já existe, seja quem for que estiver pedindo.

**Regra de ouro: copie o padrão que já existe. Não invente um padrão novo sem que alguém peça.**

## Regras detalhadas (`.claude/rules/`)

As regras por tema ficam em `.claude/rules/`. As marcadas "sempre" carregam em toda sessão; as outras carregam sozinhas quando um arquivo do caminho indicado é lido ou editado.

| Arquivo | Assunto | Quando carrega |
|---|---|---|
| `textos.md` | idioma, tom e textos de interface | sempre |
| `seguranca.md` | isolamento de dados, chaves, entradas não confiáveis | sempre |
| `git.md` | branches, commits, Pull Requests | sempre |
| `codigo.md` | estilo de TypeScript, nomes, exports, comentários | `src/**`, `supabase/functions/**` |
| `frontend.md` | páginas, leitura e escrita de dados, Storage, estado | `src/**` |
| `design.md` | identidade visual, tokens, componentes, acessibilidade | `src/**/*.tsx`, `src/index.css` |
| `ficha-dnd.md` | regras de D&D 5e e checklists de campo novo | `src/lib/**`, telas e componentes da ficha, `supabase/**` |
| `ia.md` | princípios e implementação dos recursos de IA | `src/lib/ai.ts`, telas de IA, `supabase/functions/**` |
| `banco-de-dados.md` | migrações, RLS, Storage, autenticação | `supabase/migrations/**`, `supabase/config.toml` |
| `edge-functions.md` | estrutura, erros e checklist de função nova | `supabase/functions/**`, `supabase/config.toml` |
| `testes.md` | o que e como testar | `src/lib/**`, `*.test.ts` |

## Como trabalhar num pedido

1. **Leia as regras do tema** em `.claude/rules/` (tabela acima), se ainda não foram carregadas.
2. **Ache o modelo.** Procure na tabela "Onde está o modelo" o arquivo mais parecido com o que foi pedido. Siga a mesma estrutura, os mesmos nomes, o mesmo tratamento de erro e o mesmo texto de interface.
3. **Faça só o que foi pedido.** Não refatore, não renomeie, não reformate e não "melhore" código fora do escopo. Se notar um problema fora do escopo, cite-o na resposta final em vez de corrigir.
4. **Sem precedente? Pare e pergunte.** Se o pedido só puder ser feito com algo que ainda não existe no repositório (veja "Proibido sem pedido explícito"), não decida sozinho. Explique o que falta, proponha uma forma e espere a aprovação. Se for aprovado, implemente **e atualize o `CLAUDE.md` ou a regra em `.claude/rules/` na mesma mudança**.
5. **Verifique antes de dizer que terminou** (seção "Pronto quando"). Na resposta final, diga o que foi verificado e o que não foi.

## Proibido sem pedido explícito

- Adicionar dependência (npm no frontend, `npm:` novo nas Edge Functions) ou trocar versão de uma existente.
- Criar camada ou pasta nova de primeiro nível (`services/`, `utils/`, `store/`, `styles/`, `api/`…).
- Trazer outra forma de fazer o que já tem dono: estado global (Redux, Zustand), busca de dados (SWR, axios, `useMutation`), estilo (CSS Modules, styled-components, bibliotecas de componentes), roteamento, formulários (react-hook-form, zod no frontend).
- Chamar o Supabase (`supabase.from`, `.storage`, `.functions`) fora de `src/lib/api.ts` e `src/lib/ai.ts`.
- Usar a service role key, no frontend ou nas Edge Functions.
- Editar uma migração que já existe. Toda mudança de banco é uma migração nova.
- Aplicar sugestão da IA sem revisão do usuário, deixar a IA alterar `notes` ou `image_path`, ou gerar imagem sem clique explícito.
- Adicionar outro provedor de IA (o projeto usa só a OpenAI) ou fixar modelo no código. Os modelos vêm das variáveis de ambiente.
- Cor em hex, fonte ou sombra fora de `src/index.css`.
- Adicionar login social / OAuth ou outro método de autenticação.
- Texto de interface em inglês, `alert()`, `confirm()` ou `prompt()`.

## Stack (fixa)

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, TypeScript estrito, Vite, Tailwind CSS 4, React Router 7 (data router), TanStack Query 5, lucide-react |
| Auth | Supabase Auth com e-mail e senha (cadastro e login básicos, sem OAuth) |
| Banco | Supabase Postgres com RLS em todas as tabelas |
| Arquivos | Supabase Storage, bucket privado `bestiario`, URLs assinadas |
| IA | Somente OpenAI, via Edge Functions em Deno: Responses API (texto com saída JSON estruturada) e Image API (ilustração), com cota diária por usuário |
| Testes | Vitest para a lógica pura em `src/lib` |

## Comandos

| Comando | Para quê |
|---|---|
| `npm run dev` | app em http://localhost:5173 (precisa de `.env.local`) |
| `npm run typecheck` | checagem de tipos do frontend |
| `npm test` | testes unitários (inclui a consistência dos enums entre frontend, funções e banco) |
| `npm run test:rls` | teste de segurança (RLS, Storage, cota) contra o Supabase local |
| `npm run build` | tipos + build de produção |
| `npm run check:functions` | checagem de tipos das Edge Functions (Deno via Docker) |
| `npx supabase start` | sobe o Supabase local (Docker) e aplica as migrações |
| `npx supabase db reset` | reaplica todas as migrações do zero no banco local |

## Mapa do repositório

```
src/
  pages/            uma tela por arquivo (*Page.tsx), registrada em App.tsx
  components/       ui.tsx (primitivos), Modal.tsx, Toast.tsx, brand.tsx, layout/, creature/, universe/
  context/          sessão (AuthContext) e universo atual (UniverseContext)
  hooks/queries.ts  leituras com TanStack Query e a fábrica de chaves `keys`
  lib/              types.ts, dnd.ts (regras e rótulos de D&D), creature.ts (lógica da ficha),
                    api.ts (todo acesso a dados), ai.ts (chamadas de IA), supabase.ts (cliente)
supabase/
  migrations/       SQL versionado: esquema, RLS, Storage
  functions/        _shared/ (auth, http, claude, esquema da ficha) + uma pasta por função
  config.toml       ambiente local
vercel.json         deploy do frontend (reescrita SPA, cabeçalhos, cache)
```

## Onde está o modelo (copie daqui)

| Para fazer… | Siga |
|---|---|
| Tela de listagem em grade | `src/pages/WorldsPage.tsx`, `src/components/creature/BestiaryBrowser.tsx` |
| Tela de detalhe com ações e exclusão | `src/pages/CreatureDetailPage.tsx` |
| Formulário de criar/editar simples | `src/pages/UniverseFormPage.tsx` + `src/components/universe/UniverseForm.tsx` |
| Formulário com aviso de alterações não salvas | `src/pages/CreatureEditorPage.tsx` |
| Ler dados | função em `src/lib/api.ts` + hook em `src/hooks/queries.ts` |
| Gravar dados | função em `src/lib/api.ts` + o bloco try/catch/toast de `.claude/rules/frontend.md` |
| Modal, confirmação, aviso | `Modal` e `ConfirmDialog` (`src/components/Modal.tsx`), `useToast` (`src/components/Toast.tsx`) |
| Recurso de IA na interface | `src/lib/ai.ts` + `AIAssistModal` / `DiffReview` (`src/components/creature/AIAssist.tsx`) |
| Ação de IA nova no servidor | `supabase/functions/ai-creature/index.ts` |
| Campo novo na ficha ou no universo | checklists em `.claude/rules/ficha-dnd.md` |
| Tabela nova | modelo de migração em `.claude/rules/banco-de-dados.md` |
| Edge Function nova | checklist em `.claude/rules/edge-functions.md` |
| Commit e Pull Request | `.claude/rules/git.md` e `.github/pull_request_template.md` |
| Teste | `src/lib/creature.test.ts`, `src/lib/dnd.test.ts` |

## Idioma

Interface, comentários e documentação em **português do Brasil**; identificadores em **inglês**. Exceções e tom dos textos em `.claude/rules/textos.md`.

## Princípios do produto (não negociáveis)

1. **A IA propõe, o mestre decide.** Toda sugestão passa por revisão (abas de propostas ou `DiffReview` campo a campo) antes de chegar ao banco.
2. A IA nunca altera `notes` (notas do mestre) nem `image_path`.
3. Imagens só são geradas com um clique explícito do usuário.
4. Cada usuário só vê e altera os próprios dados: RLS em toda tabela, arquivos em `<user_id>/…`, chaves de API só nos secrets das Edge Functions.
5. As fichas seguem D&D 5e.
6. O visual é de bestiário antigo, mas limpo: tokens de `src/index.css`, bordas finas, sem ornamento nem sombra pesada.

## Pronto quando

- [ ] `npm run typecheck`, `npm test` e `npm run build` passam.
- [ ] Mexeu em `supabase/functions/`: `npm run check:functions` passa.
- [ ] Mexeu em `supabase/migrations/`: `npx supabase db reset` aplica sem erro e `npm run test:rls` passa.
- [ ] Lógica nova em `src/lib/` tem teste em `*.test.ts` ao lado.
- [ ] Tela nova ou alterada tem estado de carregamento, de erro e de vazio, e funciona a 390 px de largura sem rolagem horizontal.
- [ ] Ação destrutiva pede confirmação com `ConfirmDialog`; ação com rede mostra carregamento e trata erro com toast.
- [ ] Textos em pt-BR, ícones do lucide-react, cores pelos tokens.
- [ ] Se um padrão mudou com aprovação, o `CLAUDE.md` ou a regra em `.claude/rules/` foi atualizado.

## Mantendo estas regras

Estas regras fazem parte do código. Regra que não bate com o código é um bug: corrija a regra ou o código, e diga qual na resposta. Mudança de padrão aprovada entra no `CLAUDE.md` ou em `.claude/rules/` na mesma mudança que a introduz. Cada regra fica num lugar só: aponte para ela em vez de copiar o conteúdo.
