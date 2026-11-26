<p align="center">
  <img src="public/logo-bestiario.png" alt="Bestiário" width="320">
</p>

<p align="center">
  Plataforma web para mestres de RPG criarem e organizarem bestiários por universo de campanha,<br>
  com fichas no padrão <strong>D&amp;D 5e</strong> e uma IA que atua como parceira criativa, sem tirar do mestre a palavra final.
</p>

<p align="center">
  <a href="https://bestiario-rpg.vercel.app"><strong>bestiario-rpg.vercel.app</strong></a>
</p>

---

## Sumário

- [Telas](#telas)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Rodar localmente (sem depender do Supabase na nuvem)](#rodar-localmente-sem-depender-do-supabase-na-nuvem)
- [Onde cada coisa é configurada](#onde-cada-coisa-é-configurada)
- [Publicar na nuvem (produção)](#publicar-na-nuvem-produção)
- [Scripts](#scripts)
- [Testes](#testes)
- [Integração e publicação contínuas](#integração-e-publicação-contínuas)
- [Solução de problemas](#solução-de-problemas)
- [Desenvolvendo com IA](#desenvolvendo-com-ia)
- [Notas sobre a IA](#notas-sobre-a-ia)

## Telas

Os prints foram tirados no ambiente local com dados de exemplo e sem ilustrações geradas (por isso os cartões mostram o selo "sem ilustração").

| Login (Google ou e-mail e senha) | Meus Mundos |
|---|---|
| ![Tela de login](docs/prints/01-login.jpg) | ![Meus Mundos](docs/prints/02-meus-mundos.jpg) |

| Universo e seu bestiário | Criaturas com busca, filtros e ordenação |
|---|---|
| ![Página do universo](docs/prints/03-universo.jpg) | ![Lista de criaturas](docs/prints/04-criaturas.jpg) |

| Ficha D&D 5e | Editor da ficha, por etapas |
|---|---|
| ![Ficha da criatura](docs/prints/05-ficha.jpg) | ![Editor da ficha](docs/prints/06-editor.jpg) |

| Criar com IA (Forja de criaturas) | Configurações |
|---|---|
| ![Criar com IA](docs/prints/07-criar-com-ia.jpg) | ![Configurações](docs/prints/08-configuracoes.jpg) |

| Glossário para quem não conhece RPG | |
|---|---|
| ![Glossário](docs/prints/09-glossario.jpg) | |

**No celular** (todas as telas funcionam a partir de 360 px de largura):

| Login | Criaturas | Ficha |
|---|---|---|
| <img src="docs/prints/12-celular-login.jpg" alt="Login no celular" width="260"> | <img src="docs/prints/10-celular-criaturas.jpg" alt="Criaturas no celular" width="260"> | <img src="docs/prints/11-celular-ficha.jpg" alt="Ficha no celular" width="260"> |

## Funcionalidades

- **Login com Google ou com e-mail e senha** (Supabase Auth). Senha com pelo menos 6 caracteres, com letras e números, e mensagens de erro em português.
- **Meus Mundos**: universos com capa, gênero, ambientação, época, nível de fantasia, regras particulares e estilo visual. Cada um tem o próprio bestiário.
- **Criaturas**: grade com busca por nome, filtros por categoria, habitat e nível de ameaça, e ordenação (A–Z, Z–A, ND, recentes). A busca do topo procura em todos os universos.
- **Ficha D&D 5e completa**:
  - informações gerais, atributos, combate, testes de resistência, perícias, resistências e imunidades, sentidos e idiomas;
  - traços, ações, ações bônus, reações, ações lendárias, habilidades especiais e a crônica narrativa;
  - a parte mecânica e a narrativa ficam em abas separadas;
  - calculadoras de PV e de bônus, e a referência de equilíbrio do Guia do Mestre para o ND.
- **Criar, editar, duplicar e excluir** fichas, com confirmação e aviso de alterações não salvas.
- **Criar com IA**: descrição livre e configurações (tipo, ND, criatividade, detalhamento, número de propostas, contexto do universo). As propostas aparecem em abas e podem ser salvas, descartadas, combinadas campo a campo, modificadas, editadas à mão, ilustradas, ou virar base de novas alternativas e variações.
- **IA dentro da ficha**: pedidos rápidos ou pedido livre com foco num campo. Toda sugestão chega como **diferença campo a campo**, e o mestre escolhe o que aplicar.
- **Ilustrações por IA**, só quando pedidas: gerar, novas versões, alterações por texto (inclusive editando a imagem atual), comparar, aceitar, substituir, remover ou enviar a própria imagem. A ilustração segue o estilo visual do universo.
- **Feito também para quem não conhece RPG**: guia de boas-vindas na primeira visita, ícones "?" que explicam cada termo (ND, CA, PV, atributos…) em linguagem simples, glossário pesquisável e dicas para iniciantes. Quem já conhece D&D pode esconder as dicas nas Configurações.
- **Responsivo**: todas as telas funcionam a partir de 360 px de largura, com navegação inferior no celular.

## Arquitetura

A identidade visual segue o **Códice Vivo**: navegação escura, fichas e formulários em pergaminho, ações douradas e acento lilás nos recursos de IA. A referência está em [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md), e os tokens ficam em `src/index.css`.

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7, TanStack Query, lucide-react |
| Autenticação | Supabase Auth com e-mail e senha e com Google (OAuth com PKCE) |
| Banco de dados | Supabase Postgres com Row Level Security |
| Arquivos | Supabase Storage (bucket privado `bestiario`, URLs assinadas) |
| IA (texto) | OpenAI Responses API (`gpt-6.1-sol` por padrão), via Edge Function `ai-creature`, com saída JSON estruturada estrita. **Temporário:** sem chave da OpenAI, usa o Claude (Anthropic) |
| IA (imagens) | OpenAI Image API (`gpt-image-2.5-flare` por padrão), via Edge Function `ai-image` |
| Hospedagem | Vercel (site) e Supabase (banco, arquivos, autenticação e funções) |

```mermaid
flowchart LR
  subgraph Navegador
    UI[React + TanStack Query]
  end
  subgraph Supabase
    Auth[Auth - Google e e-mail]
    DB[(Postgres + RLS)]
    ST[(Storage privado)]
    F1[ai-creature]
    F2[ai-image]
  end
  G[Google]
  OAI[OpenAI API]

  UI -- login --> Auth
  Auth -- OAuth --> G
  UI -- leituras e gravações com o JWT do usuário --> DB
  UI -- upload e URLs assinadas --> ST
  UI -- propostas de ficha --> F1
  UI -- pedido de ilustração --> F2
  F1 -- cota em ai_usage --> DB
  F2 -- cota e versão da imagem --> DB
  F2 -- arquivo WebP --> ST
  F1 -- Responses API --> OAI
  F2 -- Image API --> OAI
```

**Segurança em camadas**
- As chaves de IA ficam **só** nos secrets das Edge Functions; o navegador envia apenas o JWT do usuário.
- As funções usam um cliente Supabase autenticado como o próprio usuário, então até elas passam pela RLS.
- Cada usuário tem uma **cota diária** de pedidos de IA (texto e imagem), registrada em `ai_usage`. Ninguém consegue apagar o próprio histórico para burlar a cota.
- As funções recusam corpos acima de 256 KB e podem restringir as origens com `ALLOWED_ORIGINS`.
- O login com Google usa PKCE: o código de retorno só vale no navegador que pediu o login, e os tokens nunca aparecem na URL.

**A IA propõe, o mestre decide.** As funções nunca gravam fichas: devolvem propostas, e o app só salva o que o mestre aceitar. Notas do mestre e imagem nunca são alteradas pela IA.

### Estrutura

```
src/
  pages/           telas (carregadas sob demanda, uma por rota)
  components/      UI reutilizável, layout, ficha, editor, IA, imagens, universo, ajuda
  context/         sessão (Google e e-mail e senha), universo atual e ajuda
  hooks/queries.ts consultas com TanStack Query
  lib/             tipos, regras de D&D 5e, acesso a dados, cliente de IA, glossário, testes
supabase/
  migrations/      esquema, RLS, Storage, cota de IA
  functions/
    _shared/       auth, HTTP, cota, adaptadores da OpenAI e da Anthropic, esquema da ficha
    ai-creature/   gerar, variar e modificar criaturas
    ai-image/      gerar e editar ilustrações
  tests/           teste de integração de segurança (RLS, Storage, cota)
  config.toml      configuração do Supabase local
docs/prints/       prints usados neste README
.claude/rules/     regras de padronização para agentes de IA (ver CLAUDE.md)
.github/           CI, deploy do Supabase e modelo de PR
```

### Dados

- `profiles` nasce no cadastro (trigger), com o nome informado ou o nome e a foto do Google; o usuário só altera o nome de exibição e as preferências.
- `universes`, `creatures` e `creature_images` pertencem ao usuário (`user_id = auth.uid()`). Criaturas e versões só podem ser gravadas em universos do próprio usuário.
- `creature_images` guarda as versões de ilustração; a escolhida fica em `creatures.image_path`.
- `ai_usage` registra cada pedido à IA para a cota diária.
- Storage: arquivos em `<user_id>/<universe_id>/...`; as políticas só liberam a pasta do próprio usuário.

## Rodar localmente (sem depender do Supabase na nuvem)

O projeto inteiro roda na sua máquina: o Supabase CLI sobe no Docker o mesmo conjunto da nuvem (Postgres, Auth, Storage, Edge Functions, painel e caixa de e-mails de teste). Você não precisa de conta no Supabase, na Vercel nem no Google para usar o app localmente. As chaves de IA e do Google são opcionais.

### O que funciona em cada cenário

| Cenário | O que você precisa | O que funciona |
|---|---|---|
| **Só o local, sem chaves** | Node e Docker | Tudo, menos os recursos de IA e o botão do Google: cadastro e login por e-mail, universos, criaturas, fichas, edição, envio de imagens próprias, busca, filtros, glossário |
| **Local + IA** | o anterior + `supabase/functions/.env` com `OPENAI_API_KEY` (ou `ANTHROPIC_API_KEY`, só para texto) | Também "Criar com IA", assistente da ficha, variações e, com a OpenAI, ilustrações |
| **Local + Google** | o anterior + `supabase/.env` com um cliente OAuth do Google | Também o "Continuar com Google" |
| **Frontend local contra o Supabase da nuvem** | só Node, e o `.env.local` apontando para o projeto | Tudo o que estiver configurado na nuvem (útil para mexer só na interface) |

### 1. Pré-requisitos

- **Node.js 22** (o CI usa a 22; o Vite 8 exige pelo menos 20.19).
- **Docker Desktop** aberto e rodando.
- O **Supabase CLI** não precisa ser instalado: use `npx supabase …`. Se preferir o comando `supabase` direto, instale com `brew install supabase/tap/supabase`.

### 2. Instalar e subir o Supabase local

```bash
npm install
npx supabase start
```

Na primeira vez, o `start` baixa as imagens do Docker (alguns minutos). Ele aplica todas as migrações de `supabase/migrations` e, no fim, mostra os endereços e as chaves do ambiente local:

| Serviço | Endereço |
|---|---|
| API (o app usa este) | http://127.0.0.1:54321 |
| Painel (Studio): tabelas, usuários, arquivos | http://127.0.0.1:54323 |
| Caixa de e-mails de teste (Mailpit) | http://127.0.0.1:54324 |
| Postgres | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |

Para ver as chaves de novo a qualquer momento: `npx supabase status`.

### 3. Apontar o app para o Supabase local

Crie o `.env.local` na raiz (ele é ignorado pelo git) com a URL e a chave **pública** mostradas pelo `start` (`ANON_KEY` ou `PUBLISHABLE_KEY`; nunca a `SERVICE_ROLE_KEY` nem a `SECRET_KEY`):

```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<ANON_KEY mostrada pelo supabase start>
```

Se o `.env.local` já aponta para a nuvem e você quer alternar, guarde uma cópia (ex.: `.env.local.nuvem`) ou passe as variáveis na linha de comando, que têm prioridade sobre o arquivo:

```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY=<ANON_KEY> npm run dev
```

### 4. Rodar o app

```bash
npm run dev     # http://localhost:5173
```

Crie uma conta em **Criar conta**. No ambiente local não há confirmação de e-mail: a conta já entra logada. Os e-mails que o Auth envia (troca de e-mail, por exemplo) aparecem no Mailpit.

### 5. (Opcional) IA no ambiente local

O `supabase start` já serve as Edge Functions e lê os segredos de `supabase/functions/.env`:

```bash
cp supabase/functions/.env.example supabase/functions/.env
# preencha OPENAI_API_KEY (texto e imagens) ou ANTHROPIC_API_KEY (só texto, modo temporário)
npx supabase stop && npx supabase start    # recarrega os segredos
```

Atenção: com chaves reais nesse arquivo, cada pedido de IA feito no app local é cobrado na sua conta da OpenAI ou da Anthropic, como em produção. A cota diária por usuário também vale localmente.

Se você mexer no código das funções e o ambiente local continuar com a versão antiga, rode `npx supabase functions serve --env-file supabase/functions/.env` num terminal à parte, que recarrega a cada alteração.

### 6. (Opcional) Login com Google no ambiente local

1. Crie um cliente OAuth no Google Cloud (passo a passo em [Login com Google](#login-com-google)) e inclua `http://127.0.0.1:54321/auth/v1/callback` nas *Authorized redirect URIs*.
2. Crie o arquivo de credenciais (ignorado pelo git) e reinicie o Supabase local:

```bash
cp supabase/.env.example supabase/.env      # preencha o Client ID e o Client secret
npx supabase stop && npx supabase start
```

Sem esse arquivo, o Supabase local sobe normalmente; só o botão do Google não funciona (o Google recusa o cliente).

### 7. Comandos do dia a dia

| Comando | Para quê |
|---|---|
| `npx supabase status` | endereços e chaves do ambiente local |
| `npx supabase db reset` | apaga o banco local e reaplica todas as migrações (zera usuários e dados) |
| `npx supabase migration new nome_da_mudanca` | cria uma migração nova em `supabase/migrations` |
| `npx supabase stop` | desliga o ambiente local (os dados ficam guardados para o próximo `start`) |
| `npx supabase stop --no-backup` | desliga e apaga os dados locais |

## Onde cada coisa é configurada

| O quê | Onde fica | Quem lê | Exemplo |
|---|---|---|---|
| URL e chave pública do Supabase (frontend) | `.env.local` (local) e *Environment Variables* da Vercel (produção) | o navegador | `.env.example` |
| Chaves de IA, modelos e cotas | `supabase/functions/.env` (local) e `npx supabase secrets set` (produção) | as Edge Functions | `supabase/functions/.env.example` |
| Cliente do Google para o Supabase local | `supabase/.env` | o Supabase CLI | `supabase/.env.example` |
| Cliente do Google em produção | painel do Supabase → *Authentication → Sign In / Providers → Google* | o Supabase Auth | [Login com Google](#login-com-google) |
| Política de senha, confirmação de e-mail, URLs de retorno | `supabase/config.toml` (local) e painel do Supabase → *Authentication* (produção) | o Supabase Auth | [Autenticação](#3-autenticação) |
| Cliente OAuth (origens e URIs de retorno) | Google Cloud Console → *Google Auth Platform → Clients* | o Google | [Login com Google](#login-com-google) |
| Token e senha para o deploy automático | GitHub → *Settings → Secrets and variables → Actions* | o workflow `deploy-supabase.yml` | [Integração e publicação contínuas](#integração-e-publicação-contínuas) |
| Build, rotas e cabeçalhos do site | `vercel.json` | a Vercel | — |

Os arquivos `.env.local`, `supabase/.env` e `supabase/functions/.env` estão no `.gitignore`. Nunca commite chaves; os `.env.example` levam só os nomes das variáveis.

### Variáveis das Edge Functions

| Variável | Padrão | Para quê |
|---|---|---|
| `OPENAI_API_KEY` | (obrigatória para imagens) | chave da OpenAI |
| `ANTHROPIC_API_KEY` | (temporária) | chave da Anthropic; usada para **texto** só enquanto `OPENAI_API_KEY` não existir |
| `ANTHROPIC_MODEL` | `claude-opus-5-5` | modelo do Claude no modo temporário |
| `AI_TEXT_PROVIDER` | (automático) | força `openai` ou `anthropic` para o texto |
| `OPENAI_TEXT_MODEL` | `gpt-6.1-sol` | modelo de texto; precisa aceitar saída estruturada e `reasoning.effort` |
| `OPENAI_IMAGE_MODEL` | `gpt-image-2.5-flare` | modelo de imagem |
| `AI_DAILY_TEXT_LIMIT` | `40` | pedidos de texto por usuário a cada 24 horas |
| `AI_DAILY_IMAGE_LIMIT` | `15` | imagens por usuário a cada 24 horas |
| `ALLOWED_ORIGINS` | (vazio = qualquer) | origens que podem chamar as funções, separadas por vírgula |

## Publicar na nuvem (produção)

Passo a passo para montar o ambiente do zero num projeto novo. No projeto atual tudo isso já está feito, e as publicações seguintes são automáticas (veja [Integração e publicação contínuas](#integração-e-publicação-contínuas)).

### 1. Projeto no Supabase e banco de dados

Crie o projeto em [supabase.com](https://supabase.com) e aplique as migrações:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push            # aplica supabase/migrations
```

### 2. Edge Functions (IA)

```bash
npx supabase secrets set OPENAI_API_KEY=sk-...       # rode no seu terminal; não cole a chave em chats
npx supabase secrets list                            # confere os nomes (os valores não aparecem)
npx supabase functions deploy ai-creature
npx supabase functions deploy ai-image
```

Também dá para enviar todas as variáveis de uma vez: `npx supabase secrets set --env-file supabase/functions/.env`.

### 3. Autenticação

No painel do Supabase, em **Authentication → Sign In / Providers → Email**:
1. Provedor **Email** ativo, com cadastro permitido.
2. **Confirm email** **ligado**. Com o login do Google ativo, isso é obrigatório: o Supabase junta na mesma conta o Google e o e-mail e senha com o mesmo endereço verificado, e sem confirmação alguém poderia cadastrar o e-mail de outra pessoa e herdar a conta dela. O app já avisa o usuário para confirmar pelo link antes de entrar.
3. Senha mínima de **6 caracteres** com **letras e números** (o app valida o mesmo antes de enviar).
4. **Secure password change**, **Secure email change** e **Require current password when updating** ativos.
5. Em **Authentication → URL Configuration**, defina o *Site URL* com a URL do app e inclua `http://localhost:5173/**` em *Redirect URLs* para testar o Google localmente contra o projeto.
6. Em **Authentication → Emails → SMTP Settings**, configure um SMTP próprio (Resend, SendGrid, Amazon SES…) para o cadastro por e-mail funcionar para qualquer pessoa. O serviço de e-mail padrão do Supabase é só para testes: tem limite baixo de envios e pode não entregar para endereços de fora da equipe do projeto.

#### Login com Google

1. No [Google Cloud Console](https://console.cloud.google.com), em **Google Auth Platform**:
   - **Branding**: nome do app (Bestiário), e-mail de suporte e o domínio do site.
   - **Audience**: tipo *External*. Enquanto o app estiver em *Testing*, só os e-mails listados em *Test users* conseguem entrar; publique o app para liberar a todos (os escopos `email` e `profile` não exigem verificação do Google).
   - **Clients → Create client**: tipo *Web application*.
     - *Authorized JavaScript origins*: a URL do app (ex.: `https://bestiario-rpg.vercel.app`) e `http://localhost:5173`.
     - *Authorized redirect URIs*: o callback do Supabase, `https://SEU_PROJECT_REF.supabase.co/auth/v1/callback` (o painel do Supabase mostra o endereço exato na tela do provedor Google). Para o Supabase local, inclua também `http://127.0.0.1:54321/auth/v1/callback`.
2. Copie o *Client ID* e o *Client secret*.
3. No Supabase, em **Authentication → Sign In / Providers → Google**, ative o provedor e cole os dois valores.
4. Teste em uma janela anônima: **Continuar com Google** → escolher a conta → volta para o app já logado, com nome e foto do Google.

Faça esses passos **antes** de publicar o botão: sem o provedor ativo, o clique leva a uma página de erro do Supabase. Deploys de prévia da Vercel voltam do Google para o *Site URL* (produção), onde o login não conclui; para testar o Google numa prévia, inclua o endereço dela em *Redirect URLs*.

### 4. Site na Vercel

O projeto já traz o `vercel.json`. Ele contém o preset Vite, o build em `dist/`, a reescrita de todas as rotas para `index.html` (sem isso, recarregar `/criaturas` daria 404), cabeçalhos de segurança e cache longo para `assets/`.

1. Importe o repositório na Vercel (preset **Vite**, diretório raiz `./`).
2. Em **Settings → Environment Variables**, para *Production* e *Preview*, defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (a chave pública *publishable* ou *anon*; nunca a *secret* ou *service_role*). O botão **Import .env** aceita o seu `.env.local`.
3. Faça o deploy. Cada Pull Request ganha um deploy de prévia.
4. No Supabase, em **Authentication → URL Configuration**, use a URL de produção como *Site URL*.
5. Opcional: restrinja as Edge Functions ao site com `npx supabase secrets set ALLOWED_ORIGINS=https://seu-app.vercel.app,http://localhost:5173`. Os deploys de prévia ficam sem acesso à IA enquanto a restrição estiver ativa.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento em http://localhost:5173 |
| `npm run build` | checagem de tipos e build de produção em `dist/` |
| `npm run preview` | serve o build de produção localmente |
| `npm run typecheck` | só a checagem de tipos |
| `npm test` | testes unitários |
| `npm run test:rls` | teste de integração de segurança contra o Supabase local (rode `npx supabase start` antes) |
| `npm run check:functions` | checagem de tipos das Edge Functions (Deno via Docker), igual ao CI |

## Testes

| O quê | Como rodar | Precisa de |
|---|---|---|
| **Unitários** (Vitest): regras de D&D, revisão campo a campo das sugestões da IA, consistência dos enums entre frontend, funções e banco, normalização da saída da IA, prompt de imagem, glossário, política de senha e retorno do login com Google | `npm test` | só Node |
| **Segurança** (integração): um usuário não lê nem altera dados, arquivos ou a cota de outro; exclusões em cascata | `npm run test:rls` | Supabase local rodando |
| **Tipos das Edge Functions** | `npm run check:functions` | Docker |

O teste de segurança cria usuários de teste no banco **local** (com a chave de serviço local, que nunca é usada pelo app). Ele não chama a IA.

## Integração e publicação contínuas

| Workflow | Quando roda | O que faz |
|---|---|---|
| `.github/workflows/ci.yml` | todo Pull Request e todo push na `main` | **Frontend:** tipos, testes e build. **Edge Functions:** `deno check`. **Banco:** migrações do zero e `npm run test:rls`. |
| `.github/workflows/deploy-supabase.yml` | depois de um CI verde em push na `main` (ou à mão em *Actions → Run workflow*) | aplica as migrações pendentes (`supabase db push`) e publica as Edge Functions no projeto de produção |
| Vercel (integração Git) | push na `main` e cada PR | publica o site; cada PR ganha um deploy de prévia |

Ou seja: **mesclar na `main` publica tudo**, o site pela Vercel e o backend pelo workflow. Migração aplicada em produção não volta atrás: a correção é sempre uma migração nova.

Para o deploy do Supabase funcionar, cadastre no repositório (*Settings → Secrets and variables → Actions*, ou `gh secret set NOME`):
- `SUPABASE_ACCESS_TOKEN` (obrigatório): token pessoal em supabase.com → *Account → Access Tokens*.
- `SUPABASE_DB_PASSWORD` (opcional): senha do banco; sem ela, o CLI usa um papel de login temporário.

Os segredos das funções (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`…) continuam sendo definidos com `npx supabase secrets set`; o workflow não mexe neles. Configurações do Auth (provedores, SMTP, URLs) também não: elas ficam no painel do Supabase.

Recomenda-se proteger a `main` no GitHub exigindo os três checks do CI.

## Solução de problemas

| Sintoma | Causa provável e solução |
|---|---|
| A tela "Configure o Supabase" aparece | Falta o `.env.local` (ou as variáveis `VITE_…`). Crie o arquivo e **reinicie** o `npm run dev`; o Vite só lê o `.env.local` ao iniciar. |
| `zsh: command not found: supabase` | O CLI não está instalado globalmente. Use `npx supabase …` ou instale com `brew install supabase/tap/supabase`. |
| `supabase start` falha com "Cannot connect to the Docker daemon" | Abra o Docker Desktop e espere ele terminar de iniciar. |
| `supabase start` reclama de porta em uso | Outro projeto Supabase está rodando. Pare-o com `npx supabase stop --project-id <id>` ou feche o que usa as portas 54321–54324. |
| "O serviço de IA ainda não foi configurado no servidor" | Falta a chave de IA nas funções: `supabase/functions/.env` (local, reinicie o Supabase) ou `npx supabase secrets set` (produção). |
| Texto com IA funciona, mas "Gerar imagem" falha | Imagens só funcionam com a OpenAI (`OPENAI_API_KEY`). Confira também os créditos da conta e, para os modelos de imagem, a verificação da organização na OpenAI. |
| "Você atingiu o limite de … à IA nas últimas 24 horas" | É a cota por usuário (`AI_DAILY_TEXT_LIMIT` e `AI_DAILY_IMAGE_LIMIT`), contada nas últimas 24 horas. Ela libera aos poucos, conforme os pedidos antigos saem da janela. |
| Google mostra "Erro 400: redirect_uri_mismatch" | A *Authorized redirect URI* do cliente no Google Cloud não é o callback do Supabase (`https://SEU_PROJECT_REF.supabase.co/auth/v1/callback`, ou `http://127.0.0.1:54321/auth/v1/callback` no local). |
| Google mostra "Acesso bloqueado" ou "app não verificado" | O app está em *Testing* no Google Cloud e o e-mail não está em *Test users*. Adicione o e-mail ou publique o app. |
| Clicar em "Continuar com Google" abre uma página JSON com "provider is not enabled" | O provedor Google não está ativo no Supabase (painel em produção; `supabase/.env` e reinício no local). |
| Volta do Google com "Não foi possível concluir o login com Google" | O login foi iniciado em outro navegador ou domínio (ex.: deploy de prévia voltando para produção), ou demorou demais. Tente de novo na mesma aba. |
| Cadastro por e-mail não recebe o link de confirmação | Em produção, configure um SMTP próprio (veja [Autenticação](#3-autenticação)). No local, o e-mail está no Mailpit (http://127.0.0.1:54324). |
| Recarregar uma página na Vercel dá 404 | O `vercel.json` não foi usado (diretório raiz errado na Vercel). Ele precisa estar na raiz do projeto importado. |

## Desenvolvendo com IA

O repositório é **IA-first**. O `CLAUDE.md` traz as regras gerais, e `.claude/rules/` traz as regras por tema: código, textos, design, frontend, ficha de D&D, IA, banco, Edge Functions, segurança, testes e git. Elas valem para pessoas e agentes: siga o padrão existente e não crie padrão novo sem combinar.

Toda mudança chega à `main` por Pull Request, com o modelo em `.github/pull_request_template.md` e commits no padrão Conventional Commits (tipo em inglês, descrição em português).

## Notas sobre a IA

- O texto usa saída estruturada estrita (JSON Schema) e um guia de equilíbrio com a tabela de estatísticas por ND do Guia do Mestre.
- Na modificação, a IA devolve a ficha inteira e o app calcula a diferença. O mestre vê cada campo alterado lado a lado com o atual.
- As chamadas usam `store: false` (o conteúdo não fica guardado na OpenAI) e tempo-limite de 140 s.
- **Modo temporário com o Claude:** enquanto não há `OPENAI_API_KEY`, o texto (gerar, variar e modificar criaturas) usa a Anthropic, com `fallbacks: "default"` (se um filtro de segurança recusar por engano um pedido legítimo, a API refaz a chamada em outro modelo). Imagens continuam indisponíveis até a chave da OpenAI.
- O prompt da imagem é montado a partir da ficha e do estilo visual do universo, sem chamada extra de texto. Nada é gerado sem um clique do usuário.
- Ilustrações de propostas descartadas são apagadas na hora; as abandonadas são recolhidas depois de 7 dias.
- Tipos de criatura: além dos 13 tipos pedidos, o sistema inclui **Humanoide**, que também é tipo oficial de D&D 5e.

## Próximas versões

Compartilhamento de bestiários, biblioteca pública de criaturas e colaboração entre usuários.
