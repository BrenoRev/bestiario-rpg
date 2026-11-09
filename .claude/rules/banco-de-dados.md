---
paths:
  - "supabase/migrations/**/*.sql"
  - "supabase/config.toml"
---

# Banco de dados, RLS e Storage

## Migrações

- Uma migração nova por mudança: `supabase/migrations/AAAAMMDDHHMMSS_descricao_curta.sql` (descrição em snake_case, ex.: `20261120143000_add_creature_languages.sql`).
- **Nunca edite uma migração existente**, nem para corrigir. Escreva outra.
- Comentários do SQL em pt-BR, como em `20261108000000_init.sql`.
- A migração entra no mesmo commit que o código que depende dela.
- Teste com `npx supabase db reset` e `npm run test:rls` no banco local antes de dizer que terminou.

## Modelo de tabela nova

```sql
create table public.exemplos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  universe_id uuid not null references public.universes (id) on delete cascade,   -- se pertence a um universo
  name        text not null check (char_length(name) between 1 and 120),
  kind        text not null default 'a' check (kind in ('a', 'b')),              -- "enum" = text + check
  details     jsonb not null default '[]'::jsonb,                                 -- listas estruturadas
  notes       text not null default '',                                           -- texto opcional: '' em vez de null
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index exemplos_universe_idx on public.exemplos (universe_id);

create trigger exemplos_updated_at
  before update on public.exemplos
  for each row execute function public.set_updated_at();

alter table public.exemplos enable row level security;

create policy "exemplos_select_own" on public.exemplos
  for select to authenticated using (user_id = (select auth.uid()));
create policy "exemplos_insert_own" on public.exemplos
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.universes u
                where u.id = universe_id and u.user_id = (select auth.uid()))
  );
create policy "exemplos_update_own" on public.exemplos
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.universes u
                where u.id = universe_id and u.user_id = (select auth.uid()))
  );
create policy "exemplos_delete_own" on public.exemplos
  for delete to authenticated using (user_id = (select auth.uid()));
```

## Regras

- **Toda tabela tem RLS e as quatro políticas** (`<tabela>_<operação>_own`). Tabela filha confere no `with check` que o pai também é do usuário: isso impede mover a linha para o universo de outra pessoa.
- `(select auth.uid())`, com o `select`, nas políticas.
- `user_id` sempre com `default auth.uid()`: o app não envia o dono.
- Enums são `text` + `check`, não `create type`. Enum da ficha também muda em `src/lib/dnd.ts` e `supabase/functions/_shared/creature.ts`.
- Texto opcional é `not null default ''`; listas são `jsonb` ou `text[]` com default vazio. `null` só onde "ausente" tem significado (ex.: `image_path`, `cover_path`, `creature_id` de rascunho).
- Coluna derivada: `generated always as (…) stored` (veja `creatures.cr_value`).
- Exclusão em cascata pelas FKs (`on delete cascade`). Arquivos do Storage não somem com a linha: o app remove (veja `deleteCreature`).
- Função `security definer` sempre com `set search_path = ''` e nomes qualificados (`public.…`).
- Coluna que o usuário não deve editar: `revoke update`/`insert` na tabela e `grant` só nas colunas permitidas (veja `profiles` e `ai_usage` em `20261109000000_hardening.sql`).
- Tabela de registro (ex.: `ai_usage`) não tem políticas de update/delete: ninguém apaga o próprio histórico.
- Proibido: `grant` amplo, política `using (true)`, desligar RLS, usar a service role para contornar política.
- Contagem e junção usam o embed do PostgREST (`creatures(count)`, `universes(name)`) em vez de view ou RPC, a não ser que haja pedido.

## Storage

- Bucket único `bestiario`, privado. As políticas liberam só a pasta cujo primeiro segmento é o `auth.uid()`.
- Caminhos novos seguem `<user_id>/<universe_id>/<pasta>/<uuid>.<ext>`.
- Tabela que guarda caminho de arquivo confere no `insert` que `split_part(path, '/', 1) = (select auth.uid())::text` (veja `creature_images`).
- Bucket novo ou bucket público só com pedido explícito.

## Autenticação

- Cadastro e login por e-mail e senha no Supabase Auth. `config.toml`: `[auth.email] enabled = true`, `enable_confirmations = false`, `secure_password_change = true`, `double_confirm_changes = true`; `[auth] minimum_password_length = 6`, `password_requirements = "letters_digits"`. Produção usa a mesma política; se mudar lá, mude aqui e em `passwordProblem` (`AuthContext.tsx`).
- O nome do cadastro vai em `options.data.full_name` no `signUp`; o perfil nasce pelo trigger `on_auth_user_created` → `handle_new_user`. Não crie perfil pelo app.
- Sem provedores OAuth, salvo pedido explícito.
