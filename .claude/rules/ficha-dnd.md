---
paths:
  - "src/lib/**/*.ts"
  - "src/components/creature/**/*.tsx"
  - "src/pages/Creature*.tsx"
  - "src/pages/CreateWithAIPage.tsx"
  - "supabase/functions/**/*.ts"
  - "supabase/migrations/**/*.sql"
---

# Domínio: a ficha de criatura (D&D 5e)

## Onde mora cada coisa

- **Regras e rótulos de D&D**: `src/lib/dnd.ts`. Listas `{ value, label }` (valor em inglês, rótulo em pt-BR), `sizeLabel`, `typeLabel`, `habitatLabel`, `abilityMod`, `proficiencyForCR`, `xpForCR`, `crGuide`, `formatSpeed`. Nunca escreva rótulo de enum ou regra de D&D direto num componente.
- **Lógica da ficha**: `src/lib/creature.ts`. `emptyCreature`, `normalizeDraft`, `toDraft`, `diffCreatures`, `applyFields`, `formatField`, `creatureSubtitle`, `FIELD_LABELS`, `AI_FIELDS`.
- **Tipos**: `CreatureDraft` é o conteúdo editável; `Creature` = draft + `id`, `user_id`, `universe_id`, `cr_value` (gerado no banco) e datas; `CreatureSummary` é o recorte da listagem.
- **Esquema da IA**: `supabase/functions/_shared/creature.ts` (`CREATURE_FIELDS`, `CREATURE_SCHEMA`, `normalizeCreature`, `CR_TABLE`).

## Regras de D&D aplicadas

- Modificador = piso((valor − 10) / 2). Bônus de Proficiência segue o ND (0–4: +2 … 29–30: +9) e é recalculado quando o ND muda.
- PV = média dos Dados de Vida; o dado depende do tamanho (Miúdo d4 … Imenso d20).
- ND aceito: `0`, `1/8`, `1/4`, `1/2`, `1`…`30`. Ordenação e filtros usam `cr_value` (numérico, gerado no banco).
- Deslocamento é guardado em **pés** e mostrado em metros (30 pés = 9 m).
- Concordância de gênero no subtítulo: "fada média", "dragão enorme" (`creatureSubtitle`).
- O tipo **Humanoide** existe além dos 13 do pedido original, porque é oficial no D&D 5e.

## Enums em três lugares

Tamanho, tipo, ND e ambientes existem em `src/lib/dnd.ts`, em `supabase/functions/_shared/creature.ts` e no `check` da tabela na migração. Mudou um, mude os três (o `check` muda por migração nova). O `src/lib/consistency.test.ts` falha se eles divergirem.

## Campo novo na ficha (checklist)

1. Migração nova: `alter table public.creatures add column … not null default …`.
2. `src/lib/types.ts`: `CreatureDraft`.
3. `src/lib/creature.ts`: `emptyCreature`, `normalizeDraft` e, se a IA puder alterar, `FIELD_LABELS` (mais `formatField` se o valor for estruturado).
4. `supabase/functions/_shared/creature.ts`: `CREATURE_FIELDS`, `CREATURE_SCHEMA`, `normalizeCreature` (se a IA gera o campo).
5. Prompt `SYSTEM` em `supabase/functions/ai-creature/index.ts`, se o campo precisar de orientação.
6. Edição em `CreatureForm.tsx`; exibição em `StatBlock` (mecânica) ou `Narrative` (narrativa), ambos em `StatBlock.tsx`.
7. Se aparece no cartão ou nos filtros: `SUMMARY_COLUMNS` (`api.ts`), `CreatureSummary`, `CreatureCard`, `BestiaryBrowser`.
8. Teste em `src/lib/creature.test.ts`.

## Campo novo no universo (checklist)

Migração → `Universe` e `UniverseInput` (`types.ts`) → `emptyUniverse` e `UniverseForm` → desestruturação no `useEffect` de `UniverseFormPage` → exibição em `UniversePage` → se a IA deve considerá-lo: `UniverseRow`, o `select` de `loadUniverse` e `describeUniverse` em `supabase/functions/_shared/`.
