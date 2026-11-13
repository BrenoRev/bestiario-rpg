---
paths:
  - "src/**/*.tsx"
  - "src/index.css"
---

# Design e componentes de interface

Identidade: **Códice Vivo**, conforme `DESIGN-SYSTEM.md`, fornecido e aprovado pelo usuário. Casca de navegação em carvão/ameixa, documentos em pergaminho, dourado fosco nas ações e lilás pontual nos recursos de IA. A referência descreve um protótipo; nesta aplicação, autenticação, banco e IA continuam usando as integrações reais existentes. Não introduza simulações. A imagem fornecida está em `public/login-campaign.png`, no login e na abertura de Meus Mundos.

Marca oficial fornecida pelo usuário: `public/logo-bestiario.png` é a logo completa, usada no login, na navegação lateral e nos espaços de apresentação da marca. `public/logo-bestiario-compact.png` é o símbolo compacto, usado no topo móvel, no favicon e nos estados sem capa/ilustração de `StoredImage`. `Logo` enquadra os PNGs em uma janela SVG para eliminar as margens vazias na exibição, preservando os arquivos, as proporções e a transparência. Não recrie a marca com texto ou com o dado `D20`; esse dado continua sendo ícone funcional de RPG/IA. Dentro de um placeholder já nomeado para acessibilidade, use `Logo compact decorative`.

## Use os primitivos existentes

| Arquivo | Componentes |
|---|---|
| `components/ui.tsx` | `Button` (variantes `primary`, `secondary`, `ghost`, `subtle`, `danger`; props `loading`, `icon`, `busyIcon`, `size="sm"`), `IconButton` (exige `label`), `TextInput`, `NumberInput`, `TextArea`, `Select`, `Segmented`, `Toggle`, `Badge` (tons `neutral`, `wine`, `moss`, `amber`), `Spinner`, `PageLoader`, `ArcaneWait` (espera de IA), `EmptyState`, `ErrorState`, `PageHeader`, `cx`, `usePresence`, `prefersReducedMotion` |
| `components/Modal.tsx` | `Modal` (tamanhos `sm`…`xl`, `footer`, `busy`), `ConfirmDialog` |
| `components/Toast.tsx` | `useToast()` (`success`, `error`, `info`), `errorMessage(err)` |
| `components/brand.tsx` | `Logo`, `StoredImage`, `Avatar`, `D20` (dado das ações de IA), `WaxSeal` (selo de "salva no bestiário") |

- Precisa de um primitivo que não existe e vai ser usado em mais de um lugar? Proponha e, aprovado, crie em `ui.tsx` no mesmo estilo.
- `<button>` cru só para chips, abas e itens de menu, copiando as classes de um caso existente (pedidos rápidos em `AIAssist.tsx`, abas em `CreateWithAIPage.tsx`, menus em `Topbar.tsx`).
- Uma ação principal (`variant="primary"`) por área. Ação destrutiva usa `variant="danger"` no botão que a inicia e sempre passa por `ConfirmDialog`, cujo título diz o que será feito.
- Nunca `alert()`, `confirm()` ou `prompt()`.

## Tokens (`src/index.css`)

- **Cores, só por token**: `night`, `night-raised`, `night-soft`, `silver`, `gold`, `arcane`, `danger` e os tokens de papel `page`, `page-light`, `page-ink`, `rubric`. Os aliases anteriores (`paper`, `cream`, `ink`, `wine`, `moss` etc.) são contextuais: escuros por padrão e claros dentro de `.paper-surface`. Nunca use `bg-ink` para escurecer um overlay: use `bg-overlay/75`.
- `.paper-surface` nos formulários de universo, seções do editor, ficha mecânica, narrativa e verbetes. Cartões de mundos/criaturas, preferências, menus e modais são escuros. `.arcane-surface` reserva o lilás à IA; documentos internos continuam em pergaminho. Ação principal: `gold` com texto `night`; ação destrutiva: `danger`.
- Nos formulários de criação e edição de universos e criaturas e no pedido de “Criar com IA”, combine `.paper-surface` com `.parchment-form`: a imagem definitiva fornecida pelo usuário em `public/parchment-vintage.png` cobre cada seção proporcionalmente. Os painéis de pergaminho não têm borda externa; os contornos dos controles são preservados. A referência `bestiario_pergaminho_exemplo.png` orienta os controles: vidro quente translúcido com desfoque discreto, contornos em sépia, texto serifado marrom, títulos em vinho e seleção carmim com borda dourada. Os tokens `form-*` e as regras escopadas em `@layer utilities` ficam em `src/index.css`. O pedido de IA usa `.ai-creation-form` para empilhar as opções de criatividade e detalhamento abaixo de 480 px, preservando a leitura dos rótulos. Não substitua a imagem de fundo ao ajustar controles. Fichas de leitura e verbetes usam o pergaminho padrão.
- `TextInput` e `TextArea` aceitam `icon` decorativo opcional; `Segmented.options` também aceita `icon`. Rótulos continuam ligados ao campo e os ícones não participam do nome acessível. `Button` expõe `data-variant` para o acabamento contextual. Números preservam a fonte de interface e algarismos tabulares; menus nativos de opções têm fundo opaco para leitura. Preserve os estados de foco, seleção e desabilitado.
- Cor nova só com aprovação, e entra como token em `@theme`. Nenhuma cor fica fora dos tokens.
- Classes prontas: `.card`, `.field`, `.label`, `.hint`, `.section-title`, `.stat-rule`, `.stat-heading`, `.skeleton`, `.ornate`, `.drop-cap`, `.glint`, e as de movimento (seção abaixo).
- Sombras: `shadow-[var(--shadow-soft)]` (repouso) e `shadow-[var(--shadow-pop)]` (menus, modais, hover de cartão).
- Cantos: `--radius-ui` (12 px) em controles, `--radius-card` (18 px) em cartões e `--radius-paper` (6 px) em documentos. `.card.paper-surface` aplica os cantos e o material de papel.

## Movimento

- Ambientação global solicitada pelo usuário: `EmberBackground` é montado uma vez em `main.tsx`. Brasas sobem e oscilam sobre o fundo roxo, em um plano fixo atrás do conteúdo, sem receber cliques nem entrar na árvore de acessibilidade. A quantidade cai de 64 para 42 no tablet e 24 no celular. Movimento em CSS, somente `transform` e `opacity`; pausa com a aba oculta e some com `prefers-reduced-motion: reduce`. Cores `ember-*` em `src/index.css`. Preserve o isolamento no `body` e a posição das camadas para manter campos, navegação, modais e avisos acima do efeito.
- Tudo em CSS (`src/index.css`), sem biblioteca de animação. Microinterações usam `--motion-ease`, `--motion-fast`, `--motion-base` e `--motion-slow`. A ambientação de brasas usa variáveis locais `--ember-*` para velocidades e fases individuais.
- Anime só `transform`, `opacity` e `clip-path`. Animação de entrada usa `fill-mode: backwards`, para não deixar `transform`/`clip-path` presos no elemento (cortam sombra e anel de foco).
- `prefers-reduced-motion` desliga tudo no fim do `index.css`; em JS, `prefersReducedMotion()`. Animação nova não precisa de tratamento próprio, mas não pode depender de `animationend` para funcionar.
- Classes: `.animate-fade-in`/`-fade-out`, `.animate-rise` (entrada padrão), `.animate-ink` (revelação da esquerda para a direita, usada em imagem nova), `.animate-stamp` (selo), `.animate-flash` (campo aceito no `DiffReview`), `.animate-roll` (d20), `.animate-ember` (ND mortal), `.animate-spin-slow`, `.animate-modal-*`, `.animate-drawer-*`, `.animate-toast-*`.
- Listas em grade: `.stagger` no contêiner (filhos entram em cascata). Ficha: `StatBlock` já entra com `.sheet-reveal` (linhas riscadas e blocos em sequência); dê `key` nova ao trocar de criatura para repetir.
- Saída animada de algo que desmonta: `usePresence(open)` (veja `Modal`, gaveta do `AppLayout`).
- Troca de página: `viewTransition` em `Link`/`NavLink` e `navigate(to, { viewTransition: true })` nos links de navegação. O conteúdo da página tem o nome `page`. Elemento compartilhado (`creature-image`, `creature-name`, `universe-cover`): o cartão só recebe o nome quando `useViewTransitionState(to)` é verdadeiro, e a página de destino recebe o mesmo nome por prop (`transitionName`). Cada nome só pode existir uma vez na tela. Cartão que leva a uma página com dados chama `usePrefetch()` no hover, foco e toque.
- Espera de IA: `ArcaneWait` (círculo rúnico e frases que se alternam, mais o aviso de duração) e `busyIcon={<D20 className="size-4 animate-roll" />}` no botão que disparou.

## Tipografia

- Títulos (`h1`–`h4` ou `font-display`), crônicas e controles sobre pergaminho: Alegreya, com Georgia como fallback. Interface, navegação e textos gerais: Alegreya Sans/Segoe UI (`font-sans`, padrão). `.page-title` para aberturas e `.narrative-copy` para a prosa. As fontes são importadas uma única vez no início de `src/index.css`, pelo Google Fonts, com pesos 400, 500, 600 e 700, versões normais e itálicas e `display=swap`; os preconnects ficam no `index.html`.
- Números editáveis usam Alegreya Sans com `lining-nums` e `tabular-nums`. Valores editoriais da ficha podem usar Alegreya; `.font-display.tabular-nums` também garante algarismos alinhados e de altura regular.
- Rótulo de seção pequeno: `text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted`.

## Ficha da criatura

- Parte **mecânica** em `.card.paper-surface`, com `stat-rule` entre blocos e `stat-heading` para Ações, Reações etc.
- Parte **narrativa** em `.paper-surface` com `.narrative-copy`. Na página de detalhe, as abas separam mecânica e crônica; propostas de IA podem exibir as duas em sequência.

## Ajuda para quem não conhece RPG

- O público inclui quem nunca jogou RPG. Todo termo técnico novo na interface (de D&D ou do app) ganha uma entrada em `src/lib/glossary.ts`, em linguagem simples e com exemplo quando ajudar.
- Mostre a explicação com a prop `help="<chave>"` dos primitivos (`TextInput`, `NumberInput`, `TextArea`, `Select`, `Segmented`, `Toggle`), com `FieldLabel` em rótulos montados à mão, ou com `<HelpTip term=…>` ao lado de títulos. Nunca ponha o ícone dentro de um `<label>`.
- O guia de boas-vindas (`WelcomeGuide`) e o glossário (`GlossaryDialog`) abrem pelo `useHelp()`. Conteúdo de ajuda novo segue o tom do guia: frases curtas, “você”, sem jargão.
- Dicas extras na tela (avisos de “Primeira vez?”, “Como funciona”) só aparecem com `showHelp` ligado; quem já conhece D&D pode desligá-las nas Configurações.

## Celular

- Teste toda tela a **360 px** de largura: sem rolagem horizontal e sem elemento vazando.
- Alvos de toque com pelo menos 42 px; `.button` e `.icon-button` garantem o mínimo. `IconButton` não encolhe (`shrink-0`). Campos de texto livre ao lado de botões levam `min-w-0`.
- Abaixo de 1024 px, a navegação principal é inferior, com quatro rótulos. Barras de edição usam `.editor-actions` e avisos usam `.toast-stack` para respeitar a navegação e a área segura do dispositivo. O seletor de universo permanece no topo.
- Filhos de grade e flex que contêm texto ou controles largos levam `min-w-0` (sem isso o conteúdo força a largura da página).
- Barras fixas com vários botões precisam caber a 360 px: ícone sem texto no celular (`<span className="hidden sm:inline">`) com `aria-label`.
- O que importa primeiro no celular vem primeiro no DOM ou com `order-first xl:order-none` (ex.: ilustração na ficha, universo ao criar criatura).

## Ícones, layout e acessibilidade

- Ícones só do `lucide-react`: `size-4` em botões, `size-[1.1rem]` na navegação, `size-6` em estados vazios. Exceção: as marcas desenhadas de `brand.tsx` (`Logo`, `D20`, `WaxSeal`).
- Mobile primeiro: grades `sm:grid-cols-2 lg:grid-cols-3`, nada de rolagem horizontal a 390 px. Largura máxima e margens já vêm do `AppLayout`.
- Painel lateral em tela de detalhe/edição: `xl:grid-cols-[minmax(0,1fr)_21rem]` com a classe `.side-panel` (fixo a partir de 1280 px e com rolagem própria quando passa da altura da janela). Antes disso, preserve a largura do formulário com uma coluna. Se a tela tiver barra fixa embaixo, ajuste `[--side-panel-offset:…]` (veja `CreatureEditorPage`). Não use `sticky` puro em painel que pode crescer.
- Carregamento: `PageLoader` para a página, `.skeleton` para cartões, `loading` no botão que disparou a ação.
- `IconButton` sempre com `label`; campos com rótulo (os primitivos ligam `label` e `id`); `role`/`aria-*` como nos componentes existentes (`radiogroup`, `switch`, `tablist`, `dialog`).
