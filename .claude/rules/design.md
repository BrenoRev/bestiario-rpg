---
paths:
  - "src/**/*.tsx"
  - "src/index.css"
---

# Design e componentes de interface

Identidade: bestiário antigo, mas limpo e legível. Papel envelhecido, pergaminho, destaque em vinho, texto marrom-escuro, bordas finas, cantos levemente arredondados. Sem ornamento, textura forte ou sombra pesada.

## Use os primitivos existentes

| Arquivo | Componentes |
|---|---|
| `components/ui.tsx` | `Button` (variantes `primary`, `secondary`, `ghost`, `subtle`, `danger`; props `loading`, `icon`, `size="sm"`), `IconButton` (exige `label`), `TextInput`, `NumberInput`, `TextArea`, `Select`, `Segmented`, `Toggle`, `Badge` (tons `neutral`, `wine`, `moss`, `amber`), `Spinner`, `PageLoader`, `EmptyState`, `ErrorState`, `PageHeader`, `cx` |
| `components/Modal.tsx` | `Modal` (tamanhos `sm`…`xl`, `footer`, `busy`), `ConfirmDialog` |
| `components/Toast.tsx` | `useToast()` (`success`, `error`, `info`), `errorMessage(err)` |
| `components/brand.tsx` | `Logo`, `StoredImage`, `Avatar` |

- Precisa de um primitivo que não existe e vai ser usado em mais de um lugar? Proponha e, aprovado, crie em `ui.tsx` no mesmo estilo.
- `<button>` cru só para chips, abas e itens de menu, copiando as classes de um caso existente (pedidos rápidos em `AIAssist.tsx`, abas em `CreateWithAIPage.tsx`, menus em `Topbar.tsx`).
- Uma ação principal (`variant="primary"`) por área. Ação destrutiva usa `variant="danger"` no botão que a inicia e sempre passa por `ConfirmDialog`, cujo título diz o que será feito.
- Nunca `alert()`, `confirm()` ou `prompt()`.

## Tokens (`src/index.css`)

- **Cores, só por token**: `paper` (fundo), `parchment` e `cream` (superfícies), `sand`, `line` e `line-strong` (bordas), `ink`, `ink-soft` e `muted` (texto), `wine`, `wine-dark`, `wine-soft`, `wine-line` e `wine-tint` (destaque), `moss`, `moss-soft` e `moss-line` (positivo, ambientes), `amber`, `amber-soft` e `amber-line` (atenção). Ex.: `bg-cream`, `text-wine`, `border-line`, `bg-ink/40`.
- Cor nova só com aprovação, e entra como token em `@theme`. Nenhuma cor fica fora dos tokens.
- Classes prontas: `.card`, `.field`, `.label`, `.hint`, `.section-title`, `.stat-rule`, `.stat-heading`, `.skeleton`, `.animate-fade-in`.
- Sombras: `shadow-[var(--shadow-soft)]` (repouso) e `shadow-[var(--shadow-pop)]` (menus, modais, hover de cartão).
- Cantos: `rounded-lg` em controles; `.card` ou `rounded-[var(--radius-card)]` em cartões.

## Tipografia

- Títulos (`h1`–`h4` ou `font-display`): Cormorant Garamond, serifada. Textos, formulários e dados: Inter (`font-sans`, padrão).
- Números em campos, tabelas e atributos: sans com `tabular-nums`. A serifa tem algarismos antigos e confunde "14" com "ı4".
- Rótulo de seção pequeno: `text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted`.

## Ficha da criatura

- Parte **mecânica** em `.card` (creme), com `stat-rule` entre blocos e `stat-heading` para Ações, Reações etc.
- Parte **narrativa** ("Crônica") em `bg-parchment`. Mantenha essa separação em qualquer tela nova da ficha.

## Ajuda para quem não conhece RPG

- O público inclui quem nunca jogou RPG. Todo termo técnico novo na interface (de D&D ou do app) ganha uma entrada em `src/lib/glossary.ts`, em linguagem simples e com exemplo quando ajudar.
- Mostre a explicação com a prop `help="<chave>"` dos primitivos (`TextInput`, `NumberInput`, `TextArea`, `Select`, `Segmented`, `Toggle`), com `FieldLabel` em rótulos montados à mão, ou com `<HelpTip term=…>` ao lado de títulos. Nunca ponha o ícone dentro de um `<label>`.
- O guia de boas-vindas (`WelcomeGuide`) e o glossário (`GlossaryDialog`) abrem pelo `useHelp()`. Conteúdo de ajuda novo segue o tom do guia: frases curtas, “você”, sem jargão.
- Dicas extras na tela (avisos de “Primeira vez?”, “Como funciona”) só aparecem com `showHelp` ligado; quem já conhece D&D pode desligá-las nas Configurações.

## Celular

- Teste toda tela a **360 px** de largura: sem rolagem horizontal e sem elemento vazando.
- Alvos de toque com pelo menos 36 px (`min-h-9`/`size-9`); `IconButton` não encolhe (`shrink-0`). Campos de texto livre ao lado de botões levam `min-w-0`.
- Filhos de grade e flex que contêm texto ou controles largos levam `min-w-0` (sem isso o conteúdo força a largura da página).
- Barras fixas com vários botões precisam caber a 360 px: ícone sem texto no celular (`<span className="hidden sm:inline">`) com `aria-label`.
- O que importa primeiro no celular vem primeiro no DOM ou com `order-first lg:order-none` (ex.: ilustração na ficha, universo ao criar criatura).

## Ícones, layout e acessibilidade

- Ícones só do `lucide-react`: `size-4` em botões, `size-[1.1rem]` na navegação, `size-6` em estados vazios.
- Mobile primeiro: grades `sm:grid-cols-2 lg:grid-cols-3`, nada de rolagem horizontal a 390 px. Largura máxima e margens já vêm do `AppLayout`.
- Painel lateral em tela de detalhe/edição: `lg:grid-cols-[minmax(0,1fr)_21rem]` com a classe `.side-panel` (fixo no desktop e com rolagem própria quando passa da altura da janela). Se a tela tiver barra fixa embaixo, ajuste `[--side-panel-offset:…]` (veja `CreatureEditorPage`). Não use `sticky` puro em painel que pode crescer.
- Carregamento: `PageLoader` para a página, `.skeleton` para cartões, `loading` no botão que disparou a ação.
- `IconButton` sempre com `label`; campos com rótulo (os primitivos ligam `label` e `id`); `role`/`aria-*` como nos componentes existentes (`radiogroup`, `switch`, `tablist`, `dialog`).
