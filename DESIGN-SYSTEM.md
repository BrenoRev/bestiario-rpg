# BESTIÁRIO — Códice Vivo
## Design System v2.0 · Direção de arte, interface, interação e movimento

> **Ideia central:** a interface é um artefato entre mundos: a mesa escura em que se prepara uma campanha, o grimório iluminado aberto à sua frente e uma centelha arcana que reage às escolhas do mestre.
>
> **Promessa de experiência:** “Não estou preenchendo uma planilha de monstros. Estou folheando o registro das criaturas do meu mundo.”

**Status:** sistema visual proposto e implementado no protótipo local. **Idioma:** pt-BR. **Plataforma:** web responsiva ≥ 360px. **Escopo:** front-end; IA e autenticação reais não conectadas. **Referências estudadas:** Duna (projeto anterior), Playdate (DESIGN (1).md), Portal (DESIGN (2).md e DESIGN (2)(1).md; os dois arquivos Portal contêm a mesma referência) e as sete imagens fornecidas. Este documento propõe uma linguagem **original**, sem reproduzir logos, capas ou fichas editoriais oficiais de D&D.

---

## 1. Diagnóstico das referências e síntese crítica

| Origem | O que vale preservar | O que não adotar literalmente | Tradução para o Bestiário |
|---|---|---|---|
| **Duna** | Hierarquia editorial, espaços de respiração, cartões calmos, leveza, conteúdo primeiro, serifas apenas quando evocam histórias | Toda a aplicação quase branca e a ilustração restrita a uma landing | Miolo de códice legível, painéis de regras em pergaminho, formulário limpo, títulos muito expressivos |
| **Playdate** | Sensação de objeto físico, interações divertidas com resposta imediata, bandas rítmicas, botões reconhecíveis, linguagem acessível | Amarelo intenso, roxo elétrico, estética de brinquedo, cantos quase quadrados em todos os cards | Controles que reagem ao toque, cartões que parecem objetos colecionáveis, detalhes narrativos de interface |
| **Portal** | Profundidade cinematográfica, superfícies obsidianas, foco na ilustração de abertura, contraste, acento luminoso de baixa frequência | Black absoluto em toda a interface, peso 900 em todos os títulos, halos violeta em cada cartão | Mesa noturna como casca, hero emocional, brilho arcano raríssimo na IA e em foco, camadas de profundidade |
| **RPG/D&D visual** | Pintura épica, ilustrações com pinceladas, margens de pergaminho, títulos capitulares, rubricas de ficha, blocos numéricos e prosa em colunas | Reprodução literal de páginas oficiais, logos e composição exata de editoras | Bloco de atributos original, crônicas separadas, corpo editorial, sinais de mapa/d20/selos e arte de campanha |

**Fórmula visual:** `40% Duna (ordem) + 25% Portal (atmosfera) + 15% Playdate (vida tátil) + 20% códice de fantasia (materialidade e linguagem)`; percentuais são uma decisão criativa, não uma medida objetiva.

### 1.1. Leitura minuciosa das imagens fornecidas

1. **Mosaico de livros e artes de D&D:** capas verticalizadas, cenários em laranja de fogo, pôsteres heroicos, serifas densas, personagens/monstros no primeiro plano. **Aplicação:** imagem como ponto de entrada e contraste entre tipografia literária e conteúdo estruturado. **Não aplicar:** identidade vermelha oficial nem logotipos de D&D como marca própria.
2. **Dados sobre mapa e miniaturas:** materialidade de papel quadriculado, pátina âmbar, grão fotográfico, objetos com brilho localizado, sombras da mesa. **Aplicação:** textura discreta da casca, detalhes como dados e carta de mapa, iluminação suave de lamparina, fundos fotográficos limitados.
3. **Página ilustrada de Bulette:** mancha aquarelada que invade a margem; título em caixa alta, texto narrativo de leitura contínua, bloco de estatísticas separado por regras rubras, valores em seis colunas, seção de ações abaixo. **Aplicação:** preservar organização sem copiar layout: retrato grande na ficha, tipografia de códice, atributos em seis células, faixa rubra e blocos de regras, prosa em coluna própria.
4. **Mosaico de fichas caseiras:** a relação entre ilustração, crônica e mecânica é consistente, mas proporções e relevância das peças variam. **Aplicação:** permitir imagens de proporções diversas, prever vazios graciosos, favorecer a arte do usuário sem perder leitura.
5. **Capa “Livro do Jogador”:** tensão visual criada por escalas, luz quente central e escuro no entorno; vermelho funciona como selo de gravidade. **Aplicação:** hero escuro com imagem luminosa e detalhe rubro, nunca o vermelho como único botão em toda a UI.
6. **Grupo reunido à mesa:** iluminação âmbar das folhas e miniaturas, comunidade e coautoria, penumbra violeta, foco na narrativa partilhada. **Aplicação:** imagem de abertura e narrativa do produto: não é sobre IA criando sozinha, mas sobre o mestre conduzindo a história.
7. **Cidade medieval pintada:** cenário habitado, pinceladas visíveis, paleta azinhavrada, barro, telhas e vestes; profundidade em várias escalas. **Aplicação:** capas de mundos, paisagens de ambientação, arte diegética em vez de gráficos genéricos de SaaS.

### 1.2. A grande decisão: a mesa e o livro coexistem

Não tentar converter cada elemento em pergaminho. **A casca de navegação é um salão de campanha ao anoitecer**, com superfícies de carvão/ameixa; **o conteúdo que o mestre escreve é uma folha iluminada** de pergaminho. Isso cria orientação intuitiva: escuro = navegação/contexto; claro = ler, comparar e editar. A “magia” acontece pontualmente, nunca como ruído contínuo.

---

## 2. Princípios orientadores

1. **Um universo, uma atmosfera.** O mundo tem nome, capa, ambientação e regras; telas nunca devem parecer painel corporativo genérico.
2. **A ficha é um documento, não um dashboard.** A mecânica tem scan rápido; a crônica tem ritmo literário e espaço de leitura.
3. **O mestre tem a última palavra.** IA sugere e compara; interface pede aceite consciente para aplicar cada diferença.
4. **Magia é evento, não decoração permanente.** Luzes pontuais, transições curtas e microinterações em lugar de partículas incessantes.
5. **Novatos são bem-vindos.** Ajuda contextual legível e glossário acessível, com opção de ocultar dicas.
6. **Funciona em mesa e bolso.** Informação essencial nunca depende de hover, arraste ou largura desktop.
7. **A arte é conteúdo.** Ilustrações de usuários são respeitadas; sem filtros/alterações destrutivas automáticas.
8. **Texturas não sacrificam contraste.** Grão e bordas nas camadas decorativas; inputs e valores ficam limpos.

---

## 3. Tokens cromáticos

### 3.1. Paleta principal

| Token CSS | Valor | Papel |
|---|---|---|
| `--night` | `#121018` | Fundo exterior; o salão de campanha |
| `--night-raised` | `#1c1923` | Cartões escuros, cabeçalho e sidebars |
| `--night-soft` | `#29232d` | Campos escuros e segundo plano |
| `--night-border` | `#514250` | Contornos sobre o escuro |
| `--parchment` | `#ede1c5` | Folhas principais e fichas D&D |
| `--parchment-light` | `#f5ecd9` | Superfícies de leitura/equilíbrio |
| `--parchment-dim` | `#d7c5a4` | Componentes e áreas recuadas no papel |
| `--ink` | `#31251f` | Tipografia dentro do pergaminho |
| `--ink-muted` | `#6f5b4d` | Corpo secundário no pergaminho |
| `--silver` | `#ede6d8` | Texto claro sobre a casca escura |
| `--silver-muted` | `#baaeb5` | Metadados escuros |
| `--gold` | `#d7b57d` | CTA, foco, linhas e selo de conquista |
| `--gold-bright` | `#f1dbab` | Hover de ações principais e ornamento bem pontual |
| `--wine` | `#8f413d` | Divisórias e seções do bloco de monstros |
| `--wine-ink` | `#732f2c` | Títulos mecânicos sobre pergaminho |
| `--arcane` | `#bca1df` | IA, revisão e um toque de mistério |
| `--arcane-dim` | `#665374` | Bordas da IA, sem neon em massa |
| `--success` | `#8daa92` | Mensagem de seleção/aprovação |
| `--danger` | `#cf8477` | Exclusão/destruição, somente quando necessário |

**Regras de dosagem:** 55% superfícies escuras, 34% papel, 8% dourados/rubros de estrutura, no máximo 3% acento arcano — contagem aproximada para equilíbrio visual. O dourado **não** deve colorir longos parágrafos. O violeta é indicador de operação assistida, **não** cor padrão da marca.

### 3.2. Contraste e semântica

- Texto em `--night`: `--silver` e `--silver-muted` (quando a leitura não exigir mínimo de contraste alto).
- Texto em `--parchment`: `--ink`; para rótulos, `--ink-muted`; nunca texto ouro claro como corpo.
- Ação principal: fundo `--gold`, texto `--night`.
- Ação secundária: fundo transparente, borda `--night-border` e texto `--silver`; sobre papel, tinta escura com borda envelhecida.
- Perigo: contorno/aviso carmim, com confirmação. Nunca comunicar erro só pela cor.
- Tecnologia de IA: pequena estrela, uma borda lilás e copy explícita de “proposta”, sem disfarçar simulação como modelo real.

---

## 4. Tipografia e voz

| Contexto | Preferência | Fallback | Escala |
|---|---|---|---|
| Títulos, nomes de mundos, capítulo | `EB Garamond` | Georgia, serif | `clamp(42px, 6vw, 76px)` / 1.02 |
| Títulos de cards e fichas | `EB Garamond` | Georgia, serif | 26–36px / 1.05–1.15 |
| Corpo e controles | `Inter` ou sistema | Segoe UI, Arial, sans-serif | 14–16px / 1.5–1.65 |
| Crônica narrativa | `EB Garamond` | Georgia, serif | 19–21px / 1.55 |
| Rótulos de capítulos/metadados | sans 600 | sistema | 10–12px / 0.13em tracking |
| Valores de atributos | `EB Garamond` 600 | Georgia | 25–32px / tabular quando numérico |

**Decisão sobre os originais:** adotar a densidade editorial e tracking apertado do Duna nos títulos, legibilidade do corpo Playdate e contraste dramático do Portal; rejeitar o peso 900 generalizado e preferir uma serifada literária. Letras capitulares, separadores em losango e numeração romana podem ser usados **somente** em aberturas.

**Tom de voz:** cúmplice, evocativo e claro. Exemplos: “Meus mundos”, “Arquivo das criaturas”, “Uma criatura espera para ser descoberta”, “Abrir ficha”, “Forja criativa”; nunca trocar “Salvar ficha” por termo poético ambíguo.

---

## 5. Materiais, formas e superfícies

- `--radius-ui: 12px`: campos, filtros, botões secundários e painéis técnicos.
- `--radius-card: 18px`: mundos e criaturas (conforto de Duna sem ar de SaaS excessivamente fofo).
- `--radius-paper: 6px`: ficha, livro e páginas editoriais; sugerem páginas, não cartão de aplicativo.
- `--radius-pill: 999px`: chips, tabs e botões auxiliares de Playdate/Duna.
- Borda escura: `1px solid rgba(215,181,125,.19)`. Borda de papel: `1px solid rgba(85,53,29,.23)`.
- Sombras: `0 18px 50px rgba(0,0,0,.25)` apenas em hero, overlays e retratos; cartões comuns recebem sombra muito leve.
- **Pergaminho:** gradiente quente, mancha radial translúcida, filete duplo discreto. Nada de textura de papel por cima do texto a ponto de prejudicar leitura.
- **Mesa escura:** fundo radial irregular, vinheta nas bordas, áreas limpas para o conteúdo. Não use um PNG texturizado enorme em toda a interface.
- **Metal envelhecido:** dourado fosco, sem bevel de jogo dos anos 2000. O brilho real aparece somente na interação.

### Componentes-base

1. **Cabeçalho:** marca em símbolo geométrico de d20, wordmark com serifas e microassinatura; links com foco em ouro; ação à direita. Compacto em telas menores.
2. **Hero:** cena pintada da mesa de RPG; gradiente lateral escuro; rótulo de capítulo, título amplo e CTA; uma luz que oscila muito suavemente e profundidade reagindo discretamente ao ponteiro.
3. **Cartão de mundo:** arte/cena como capa, etiqueta de gênero, nome em serif, resumo, rodapé com número de criaturas; hover com translação de 3px e leve clareamento da borda.
4. **Cartão de criatura:** quadro de ilustração ou sigilo; ND visível; título serifado; atributos resumidos; ação explícita.
5. **Ficha do monstro:** painel de papel, cabeçalhos rubros, seis atributos em grade, réguas horizontais, ações agrupadas, legenda e narrativa em aba independente; retrato lateral emoldurado.
6. **Editor:** navegação por capítulos à esquerda, formulário em pergaminho; estados de alteração evidentes; botão “Salvar ficha” fixo na hierarquia.
7. **Forja de IA:** superfície escura, topo arcano e proposta sobre papel; campos comparados antes/depois; a aprovação continua ação humana.
8. **Glossário:** cartões de papel com definições simples, busca sempre evidente.
9. **Modal:** painel escuro com borda ouro, contraste, campo de preenchimento legível; ações reversíveis e foco visível.
10. **Entrada/autenticação:** cena à esquerda e formulário à direita; nenhuma indicação enganosa de login real no protótipo.

---

## 6. Sistemas de movimento (o “vivo” sem distração)

| Elemento | Movimento | Duração/limite | Condição |
|---|---|---|---|
| Hero / clarão | Pequena variação de opacidade e escala | 8–12 segundos | Ambiente, sem piscar |
| Arte do hero | Parallax guiado por ponteiro, deslocamento máximo ≈ 9px | 200–350ms de suavização | Desktop com ponteiro fino |
| Poeira / runas | 3 a 5 pontos luminosos de baixa opacidade | 9–17 segundos, dessíncronos | Apenas hero |
| Card de mundo/criatura | Subida 3px, brilho de borda, arte zoom 1.025x | 180–240ms | Hover/focus-visible |
| Botão | Elevação 2px e leve luz | 180ms | Hover; pressionado retorna |
| Entrada de seção | Fade + deslocamento de 10px | 350–500ms | Ao renderizar / entrar na viewport |
| Modal | Fade + subida 10px | 180ms | Abrir/fechar |
| Campo ativo | Borda muda para ouro, fundo estabiliza | 150ms | Focus-visible |
| Abas | Superfície/linha muda de estado, sem slide excessivo | 160ms | Clique |

**Norma:** respeitar `@media (prefers-reduced-motion: reduce)` eliminando animações, parallax, tremores e scroll animado. Nenhum movimento contínuo deve prejudicar leitura. Evitar áudio por padrão, cursor customizado, partículas em todas as telas, fundos em vídeo e transições longas.

---

## 7. Mapa de páginas e densidade

### Meus Mundos

- Abertura imersiva ocupando 360–500px de altura, com uma fotografia/pintura de mesa de aventureiros e gradiente controlado.
- Subtítulo em forma de capítulo / ritual, CTA “Criar novo mundo” sem ambiguidade.
- Faixa de acolhimento para iniciantes.
- Cards 3 colunas desktop, 2 colunas tablet, 1 coluna mobile, sempre com imagens amplas.

### Mundo / Bestiário

- Caminho de navegação, nome do mundo em serifada e premissa narrativa.
- Chips discretos de época/fantasia; regras do mundo em nota de códice.
- Três indicadores opcionais, sem transformar a experiência em analytics.
- Filtros em fundo escuro; cartões com destaque para a arte e estatísticas curtas.

### Ficha D&D 5e

- Exibir nome em grande escala, tamanho/tipo/alinhamento e ND.
- Separar claramente **Ficha mecânica** e **Crônica & narrativa**.
- Na mecânica: CA, PV, movimento, atributos, resistências, perícias, sentidos, idiomas, traços, ações (normais/bônus/lendárias/reações), habilidades especiais.
- Para cada termo novato, `?` com explicação curta e link para glossário.
- Na narrativa, coluna longa com texto em família serifada e destaque para lendas/rumores.
- Retrato com legenda, opção explícita de enviar/gerenciar ilustração; sem gerar sem pedido.

### Editor

- Até seis passos: identidade, atributos, combate, habilidades, crônica, ilustração.
- Valores e labels claros; PV e bônus calculáveis; ND como referência de balanceamento, não veredito automático.
- Indicador “Alterações não salvas”, confirmação ao descartar, salvar sempre explícito.

### IA

- **Forja de criaturas**: descrição livre + mundo + tipo + ND + criatividade + detalhamento + quantidade; resultados em propostas tabuladas.
- Mistura campo a campo, regeneração e edição manual preservadas.
- **IA na ficha**: diff antes/depois com checkbox; nenhum campo aplicado sem aprovação.
- **Arte**: duas prévias lado a lado, variações e upload; estado simulado avisado.

### Glossário e Configurações

- Glossário pesquisável em linguagem clara; esconder dicas sem perder acesso ao glossário.
- Preferências em painel simples e escuro com opções verificáveis.

---

## 8. Responsividade e acessibilidade

- Base mobile 360px; `box-sizing:border-box`, largura mínima `0` em grids, sem overflow horizontal.
- Grade de atributos: 6 → 3 colunas em celular; valores nunca cortados.
- Menu desktop → navegação móvel inferior com rótulos; não depende de ícone isolado.
- Botões de toque ≥ 42px; labels explícitos; tab order consistente.
- Texto informativo ≥ 12px e corpo padrão 14–16px; ajustar ambientes visuais sem depender de fontes externas.
- Respeitar foco via `:focus-visible`; Escape fecha modal; explicar erros em português.
- Imagens ilustrativas devem ter `alt` coerente; imagens puramente decorativas `aria-hidden="true"`.
- Nunca indicar sucesso/fracasso apenas por cor; flashes e loops desativáveis por preferências do sistema.
- Dar preferência a CSS transform/opacity para animações de baixo custo.

---

## 9. Tokens implementáveis e CSS inicial

```css
:root {
  --night: #121018;
  --night-raised: #1c1923;
  --night-soft: #29232d;
  --night-border: #514250;
  --parchment: #ede1c5;
  --parchment-light: #f5ecd9;
  --parchment-dim: #d7c5a4;
  --ink: #31251f;
  --ink-muted: #6f5b4d;
  --silver: #ede6d8;
  --silver-muted: #baaeb5;
  --gold: #d7b57d;
  --gold-bright: #f1dbab;
  --wine: #8f413d;
  --wine-ink: #732f2c;
  --arcane: #bca1df;
  --arcane-dim: #665374;
  --success: #8daa92;
  --danger: #cf8477;
  --font-display: "EB Garamond", Georgia, "Times New Roman", serif;
  --font-interface: Inter, "Segoe UI", Arial, sans-serif;
  --radius-ui: 12px;
  --radius-card: 18px;
  --radius-paper: 6px;
  --radius-pill: 999px;
  --transition-fast: 180ms cubic-bezier(.2,.8,.2,1);
  --transition-gentle: 420ms cubic-bezier(.22,1,.36,1);
}
```

**Fonte livre de boa aproximação:** `EB Garamond`/Georgia para editorial, `Inter`/Segoe UI para interface. O projeto usa fontes do sistema quando não houver a família específica instalada; não inclui fontes pagas dos design systems de origem.

---

## 10. Exemplos de microcopy e narrativa ambiental

- Hero: **“Toda criatura guarda uma história. Dê vida à sua.”**
- Suporte: “Forje universos, reúna lendas e transforme ideias em encontros memoráveis. O mestre decide cada detalhe.”
- Seção: **“Seus mundos, seus destinos.”**
- Estado vazio: **“Este códice ainda guarda páginas em branco.”**
- Forja: **“Convide uma ideia. Escolha o que permanece.”**
- Alerta IA: **“As propostas são rascunhos. Nada é aplicado à ficha sem sua aprovação.”**
- Salvamento: **“Ficha salva no seu códice.”**
- Informação para iniciante: **“ND indica, aproximadamente, o desafio de uma criatura.”**

---

## 11. Diretrizes para novos assets

- Ilustrações futuras devem privilegiar **pintura fantástica de textura manual**, aquarela/gouache digital e formas orgânicas, com luz quente e sombras púrpura-ardósia.
- Capas de mundos: cenário ambiental, escala épica, personagens pequenos em relação ao mundo; sem tipografia embutida na imagem.
- Criaturas: espécime em destaque, fundo com tinta lavada, silhueta legível; espaço negativo para legenda e dados.
- Fotografias: usadas apenas para a mesa de jogo e objetos físicos de preparação; **não** misturar fotos stock de pessoas sorrindo com ilustrações fantásticas.
- Não usar logo oficial D&D como marca do produto; “D&D 5e” é uma descrição do padrão de ficha, não endosso.
- As imagens de referência que acompanham o protótipo são **assets de demonstração fornecidos pelo usuário**; antes de distribuição comercial, revisar direitos/licenças e substituí-las por imagens originais/autorizadas.

---

## 12. Checklist de consistência para desenvolvimento

- [ ] O primeiro impacto é fantasia/aventura e não um produto corporativo genérico.
- [ ] O usuário entende como criar um mundo em menos de 10 segundos de exploração.
- [ ] Há um contraste claro entre casca escura e documentos de papel.
- [ ] A arte é protagonista quando relevante, sem comprometer o texto.
- [ ] A ficha em D&D 5e tem hierarquia rápida de combate e leitura literária separada.
- [ ] IA se apresenta como coautora opcional e exige aceite explícito.
- [ ] Nenhuma ação destrutiva fica sem confirmação.
- [ ] Motion respeita redução de movimento.
- [ ] A página é utilizável com teclado e em 360px.
- [ ] Estados vazios, validações e mensagens estão em pt-BR.
- [ ] O resultado mantém personalidade mesmo sem imagens disponíveis.

**Resumo:** um códice de fantasia ilustrado, montado sobre uma mesa escura, operado com a clareza de uma aplicação moderna. **Atmosférico no primeiro olhar, legível por horas e controlado pelo mestre em cada decisão.**
