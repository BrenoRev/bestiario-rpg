---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "supabase/functions/**/*.ts"
---

# Código TypeScript — estilo e nomes

Vale para o frontend e para as Edge Functions. Descreve o estilo que o código já segue.

## Formatação

- 2 espaços, aspas duplas, ponto e vírgula, vírgula final em listas e objetos de várias linhas (o `.editorconfig` cuida de indentação e fim de linha).
- Linhas de até ~140 caracteres; classes Tailwind longas podem passar disso numa linha só.
- Não reformate arquivos inteiros nem mude o estilo de código que você não está alterando.

## TypeScript

- Modo estrito, sem `any`. Para dado externo (resposta de API, saída de IA, `localStorage`), receba como `unknown` e normalize (veja `normalizeDraft`, `normalizeCreature`).
- Tipos de domínio ficam em `src/lib/types.ts` (frontend) ou junto do módulo em `_shared/` (funções). Não redefina um tipo que já existe; derive com `Pick`, `Omit`, `Partial`.
- Importe tipos com `import type` (o projeto usa `verbatimModuleSyntax`).
- Sem `// @ts-ignore` e sem `as` para calar erro real. `as` só para estreitar dado já validado ou resposta do Supabase.
- `!` (non-null) só onde o `enabled` da query ou uma checagem anterior já garante o valor, como nos hooks de `queries.ts`.

## Nomes

| O quê | Convenção | Exemplo |
|---|---|---|
| Componente, tipo, interface | `PascalCase` | `CreatureCard`, `CreatureDraft` |
| Função, variável, hook | `camelCase`; hooks começam com `use` | `listCreatures`, `useCreature` |
| Lista ou tabela constante | `UPPER_SNAKE_CASE` | `SIZES`, `CREATURE_TYPES`, `FIELD_LABELS` |
| Página | `NomePage` em `src/pages/NomePage.tsx` | `UniversePage` |
| Arquivo de um componente principal | `PascalCase.tsx` | `ImageStudio.tsx` |
| Arquivo que agrupa primitivos | minúsculo | `ui.tsx`, `brand.tsx` |
| Módulo de lógica | `camelCase.ts` | `creature.ts`, `dnd.ts` |
| Teste | `<modulo>.test.ts` ao lado do módulo | `dnd.test.ts` |
| Tabela e coluna | `snake_case`, tabela no plural | `creature_images.creature_id` |

- Identificadores em inglês; textos para o usuário e comentários em pt-BR (veja `textos.md`).
- Funções de dados começam pelo verbo da operação: `list…`, `get…`, `create…`, `update…`, `delete…`, `duplicate…`, `upload…`, `search…`.

## Exports e módulos

- Export nomeado em tudo. A única exceção é `export default function App` em `src/App.tsx`.
- Sem barrels (`index.ts` que só reexporta).
- Imports relativos (`../lib/api`); não há alias de caminho configurado.

## Comentários

- Arquivo com papel não óbvio começa com um comentário curto dizendo para que serve (como `ImageStudio.tsx` e `ai-creature/index.ts`).
- Comente o **porquê**, não o quê. Ex.: "A cópia recebe um arquivo próprio, para que excluir uma não apague a imagem da outra."
- Sem código comentado, sem `TODO` sem dono ou contexto, sem `console.log` esquecido. `console.error` só para registrar o erro bruto antes de mostrar a mensagem amigável.

## React

- Componentes funcionais com hooks. Todos os hooks ficam antes de qualquer `return` antecipado.
- Props tipadas inline ou numa `interface NomeProps` logo acima do componente.
- Funções assíncronas em handlers: `async () => { … }`. Ao passar uma promise para um handler que não espera, use `void` (`onClick={() => void signOut()}`).
- `useMemo`/`useCallback` só quando a identidade importa (dependência de efeito, contexto) ou o cálculo é caro, como já está no código.
