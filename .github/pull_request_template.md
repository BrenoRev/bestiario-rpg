## O que muda

<!-- Uma ou duas frases: o que esta mudança faz e por quê. -->

## Como testar

<!-- Passos para conferir na interface ou comandos para rodar. -->

## Checklist

- [ ] `npm run typecheck`, `npm test` e `npm run build` passam
- [ ] Mexeu em `supabase/functions/`: `npm run check:functions` passa
- [ ] Mexeu no banco: migração **nova** (nenhuma antiga editada) e `npx supabase db reset` aplica sem erro
- [ ] Tabela nova tem RLS com as quatro políticas
- [ ] Tela nova ou alterada tem carregamento, erro e vazio, e funciona a 390 px sem rolagem horizontal
- [ ] Textos de interface em pt-BR, cores por token, ícones do lucide-react
- [ ] Sugestões de IA passam por revisão do usuário antes de serem salvas
- [ ] Nenhum segredo, `.env` ou chave no código
- [ ] Se um padrão mudou, `CLAUDE.md` / `.claude/rules/` foram atualizados

## Prints

<!-- Para mudanças visuais: antes e depois, desktop e celular. -->
