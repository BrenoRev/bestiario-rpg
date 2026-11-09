---
paths:
  - "src/**/*.test.ts"
  - "src/lib/**/*.ts"
  - "supabase/tests/**"
---

# Testes

- Vitest, arquivo `<modulo>.test.ts` ao lado do módulo em `src/lib/` (veja `dnd.test.ts`, `creature.test.ts`).
- Teste a **lógica pura**: regras de D&D, normalização de dados, diferença e aplicação de propostas, formatação.
- Nomes de `describe` e `it` em pt-BR, descrevendo o comportamento ("deriva o bônus de proficiência do ND").
- Toda função nova ou alterada em `src/lib/` (exceto o acesso a dados de `api.ts` e `ai.ts`) ganha ou atualiza teste.
- Bug corrigido em lógica pura ganha um teste que falharia antes da correção.
- Sem chamada de rede, banco ou IA nos testes unitários.
- `src/lib/consistency.test.ts` confere que os enums da ficha são iguais no frontend, nas funções e nas migrações, e testa `normalizeCreature` e `buildImagePrompt`. Mudou enum ou esquema? Ele precisa continuar passando.
- Integração de segurança: `npm run test:rls` (exige `npx supabase start`) cria dois usuários e confere RLS, Storage e cota. Tabela ou política nova ganha casos nele.
- Não há testes de componente nem E2E no repositório; não introduza Testing Library, Playwright ou similar sem pedido.
- `npm test` precisa passar antes de dizer que terminou; mexeu em migração ou política, `npm run test:rls` também.
