# Bestiario

Plataforma web para mestres de RPG criarem e organizarem bestiários por universo de campanha, com fichas no padrão **D&D 5e** e uma IA que atua como parceira criativa (texto e ilustrações), sem tirar do mestre a palavra final.

## Funcionalidades

- **Login exclusivo com Google** (Supabase Auth, OAuth com PKCE). Sem cadastro por e-mail e senha.
- **Meus Mundos**: universos com capa, gênero, ambientação, época, nível de fantasia, regras particulares e estilo visual. Cada um tem o próprio bestiário.
- **Criaturas**: grade com busca por nome, filtros por categoria, habitat e nível de ameaça, e ordenação (A–Z, Z–A, ND, recentes).
- **Ficha D&D 5e completa**: informações gerais, atributos, combate, testes de resistência, perícias, resistências e imunidades, sentidos, idiomas, traços, ações, ações bônus, reações, ações lendárias, habilidades especiais e a crônica narrativa. A parte mecânica e a narrativa são visualmente separadas. Há calculadoras (PV pelos dados de vida, bônus de perícias e resistências, BP pelo ND) e a referência de equilíbrio do Guia do Mestre para o ND escolhido.
- **Criar, editar, duplicar e excluir** fichas, com confirmação e aviso de alterações não salvas.
- **Criar com IA**: descrição livre e configurações (tipo, ND, criatividade, detalhamento, número de propostas, contexto do universo). As propostas aparecem em abas e podem ser salvas, descartadas, combinadas (campo a campo), modificadas, editadas à mão, ilustradas, ou servir de base para novas alternativas e variações.
- **IA dentro da ficha**: pedidos rápidos (novas habilidades, fraquezas, comportamento mais ameaçador, adaptar ao universo, coerência com a ambientação, equilibrar o ND) ou pedido livre com foco num campo. Toda sugestão chega como **diferença campo a campo**. O mestre marca o que aplicar e o resto da ficha fica intacto.
- **Ilustrações por IA**, só quando pedidas: gerar, gerar novas versões, pedir alterações por texto (inclusive editando a imagem atual), comparar versões, aceitar, substituir, remover ou enviar a própria imagem. A imagem escolhida fica no Supabase Storage, vinculada à ficha.

## Arquitetura

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, React Router, TanStack Query, lucide-react |
| Autenticação | Supabase Auth, provedor Google |
| Banco de dados | Supabase Postgres com Row Level Security |
| Arquivos | Supabase Storage (bucket privado `bestiario`, URLs assinadas) |
| IA (texto) | Claude (`claude-opus-5-5`) via Edge Function `ai-creature`, com saída JSON estruturada |
| IA (imagens) | OpenAI Images (`gpt-image-1`) via Edge Function `ai-image`; o Claude redige o prompt visual a partir da ficha e do universo |

As chaves de IA ficam **só** nos secrets das Edge Functions. O navegador envia apenas o JWT do usuário. As funções usam um cliente Supabase autenticado como o próprio usuário, então toda leitura e escrita delas também passa pela RLS.

```
src/
  components/      UI reutilizável, layout, ficha, editor, IA, imagens, universo
  context/         sessão (Google) e universo atual
  hooks/queries.ts consultas com TanStack Query
  lib/             tipos, regras de D&D 5e, acesso a dados, cliente de IA
  pages/           telas (login, mundos, criaturas, ficha, editor, Criar com IA, configurações)
supabase/
  migrations/      esquema, RLS, bucket e políticas de Storage
  functions/
    _shared/       auth, HTTP, esquema da ficha, chamada ao Claude
    ai-creature/   gerar, variar e modificar criaturas
    ai-image/      gerar e editar ilustrações
```

### Dados e segurança

- `profiles` é criado automaticamente no primeiro login, por trigger, com nome e foto da conta Google, e guarda as preferências de IA.
- `universes` pertence ao usuário (`user_id = auth.uid()`).
- `creatures` guarda a ficha D&D 5e. Na inserção e na atualização, a política exige que o universo de destino também seja do usuário.
- `creature_images` guarda as versões de ilustração. A escolhida fica em `creatures.image_path`.
- Storage: arquivos em `<user_id>/<universe_id>/...`, e as políticas só liberam a pasta do próprio usuário.

## Como rodar

### 1. Pré-requisitos

- Node.js 20 ou superior
- Um projeto no [Supabase](https://supabase.com) e o [Supabase CLI](https://supabase.com/docs/guides/cli) (`npx supabase` funciona)
- Chaves da [Anthropic](https://console.anthropic.com) e da [OpenAI](https://platform.openai.com) (imagens)
- Um projeto no Google Cloud para o OAuth

### 2. Banco de dados

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push            # aplica supabase/migrations
```

### 3. Login com Google

1. No Google Cloud Console, em **APIs e serviços → Credenciais**, crie um **ID do cliente OAuth** do tipo *Aplicativo da Web*.
2. Em *URIs de redirecionamento autorizados*, adicione `https://SEU_PROJECT_REF.supabase.co/auth/v1/callback`.
3. No Supabase, em **Authentication → Sign In / Providers → Google**, ative o provedor e cole o Client ID e o Client Secret.
4. Em **Authentication → URL Configuration**, defina o *Site URL* (ex.: `http://localhost:5173` em desenvolvimento) e adicione `http://localhost:5173/auth/callback`, mais a URL de produção com `/auth/callback`, em *Redirect URLs*.
5. Em **Authentication → Sign In / Providers → Email**, desative o provedor de e-mail para que o acesso seja só pelo Google.

### 4. Edge Functions (IA)

```bash
cp supabase/functions/.env.example supabase/functions/.env   # preencha as chaves
npx supabase secrets set --env-file supabase/functions/.env
npx supabase functions deploy ai-creature
npx supabase functions deploy ai-image
```

Variáveis opcionais: `ANTHROPIC_MODEL` (padrão `claude-opus-5-5`) e `OPENAI_IMAGE_MODEL` (padrão `gpt-image-1`).

### 5. Frontend

```bash
cp .env.example .env.local      # VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (Project Settings → API)
npm install
npm run dev                     # http://localhost:5173
```

Para produção, `npm run build` gera `dist/`, que pode ser publicado em qualquer hospedagem estática (Vercel, Netlify, Cloudflare Pages). Configure a hospedagem para reescrever todas as rotas para `index.html` (SPA) e acrescente a URL de produção nas Redirect URLs do Supabase.

### Desenvolvimento local com o Supabase CLI

`supabase/config.toml` já traz o Google habilitado e o login por e-mail desativado:

```bash
export SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=...
export SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=...
npx supabase start                                    # Postgres, Auth, Storage, Edge Runtime (Docker)
npx supabase functions serve --env-file supabase/functions/.env
```

No Google Cloud, adicione também `http://127.0.0.1:54321/auth/v1/callback` como URI de redirecionamento.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | checagem de tipos e build de produção |
| `npm test` | testes unitários (regras de D&D 5e e revisão de alterações da IA) |
| `npm run typecheck` | só a checagem de tipos |

## Notas sobre a IA

- A geração de texto usa saída estruturada (JSON Schema) e um guia de equilíbrio com a tabela de estatísticas por ND do Guia do Mestre. O ND final é tratado como a média do ND defensivo e do ofensivo.
- Na modificação, a IA devolve a ficha inteira e o app calcula a diferença. O mestre vê cada campo alterado lado a lado com o atual. Notas do mestre e imagem nunca são alteradas pela IA.
- As chamadas ao Claude usam `fallbacks: "default"`: se um classificador de segurança recusar um pedido legítimo por engano, a API refaz a chamada no modelo de fallback recomendado. Para desligar, remova `betas` e `fallbacks` em `supabase/functions/_shared/claude.ts`.
- Cada geração de imagem consome créditos da OpenAI (qualidade `medium`, 1024×1024, WebP). Nada é gerado sem um clique do usuário.
- Tipos de criatura: além dos 13 tipos pedidos, o sistema inclui **Humanoide**, que também é tipo oficial de D&D 5e.

## Próximas versões

Compartilhamento de bestiários, biblioteca pública de criaturas e colaboração entre usuários.
