-- =====================================================================
-- Bestiario — esquema inicial
-- Perfis, universos, criaturas (D&D 5e), versões de imagem, storage e RLS.
-- Cada linha pertence a um usuário (user_id = auth.uid()) e as políticas
-- garantem que ninguém leia ou altere dados de outra conta.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Utilitário: updated_at automático
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Perfis (dados da conta Google)
-- ---------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text,
  display_name text,
  avatar_url   text,
  preferences  jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cria o perfil automaticamente no primeiro login com Google.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Universos / campanhas
-- ---------------------------------------------------------------------
create table public.universes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 120),
  description   text not null default '',
  genre         text not null default '',
  setting       text not null default '',
  era           text not null default '',
  fantasy_level text not null default 'medio' check (fantasy_level in ('baixo', 'medio', 'alto')),
  rules         text not null default '',
  art_style     text not null default '',
  cover_path    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index universes_user_id_idx on public.universes (user_id, created_at desc);

create trigger universes_updated_at
  before update on public.universes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Criaturas — ficha de monstro D&D 5e
-- ---------------------------------------------------------------------
create table public.creatures (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null default auth.uid() references auth.users (id) on delete cascade,
  universe_id            uuid not null references public.universes (id) on delete cascade,

  -- Informações gerais
  name                   text not null check (char_length(name) between 1 and 120),
  size                   text not null default 'medium'
                           check (size in ('tiny', 'small', 'medium', 'large', 'huge', 'gargantuan')),
  creature_type          text not null default 'monstrosity'
                           check (creature_type in ('aberration', 'beast', 'celestial', 'construct', 'dragon',
                                                    'elemental', 'fey', 'fiend', 'giant', 'ooze',
                                                    'monstrosity', 'undead', 'plant', 'humanoid')),
  subtype                text not null default '',
  alignment              text not null default '',
  challenge_rating       text not null default '1'
                           check (challenge_rating ~ '^(0|1/8|1/4|1/2|[1-9]|1[0-9]|2[0-9]|30)$'),
  cr_value               numeric generated always as (
                           case challenge_rating
                             when '1/8' then 0.125
                             when '1/4' then 0.25
                             when '1/2' then 0.5
                             else challenge_rating::numeric
                           end
                         ) stored,
  proficiency_bonus      smallint not null default 2,

  -- Estatísticas de combate
  armor_class            smallint not null default 10,
  armor_note             text not null default '',
  hit_points             integer not null default 1,
  hit_dice               text not null default '',
  speed                  jsonb not null default '{"walk": 30}'::jsonb,

  -- Atributos
  abilities              jsonb not null default '{"str":10,"dex":10,"con":10,"int":10,"wis":10,"cha":10}'::jsonb,

  -- Resistências, perícias e sentidos
  saving_throws          jsonb not null default '[]'::jsonb,
  skills                 jsonb not null default '[]'::jsonb,
  damage_vulnerabilities text[] not null default '{}',
  damage_resistances     text[] not null default '{}',
  damage_immunities      text[] not null default '{}',
  condition_immunities   text[] not null default '{}',
  senses                 text not null default '',
  languages              text not null default '',

  -- Características especiais
  traits                 jsonb not null default '[]'::jsonb,
  actions                jsonb not null default '[]'::jsonb,
  bonus_actions          jsonb not null default '[]'::jsonb,
  reactions              jsonb not null default '[]'::jsonb,
  legendary_description  text not null default '',
  legendary_actions      jsonb not null default '[]'::jsonb,
  special_abilities      jsonb not null default '[]'::jsonb,

  -- Descrição narrativa
  habitat_tags           text[] not null default '{}',
  appearance             text not null default '',
  habitat                text not null default '',
  behavior               text not null default '',
  diet                   text not null default '',
  origin                 text not null default '',
  curiosities            text not null default '',
  weaknesses             text not null default '',
  notes                  text not null default '',

  image_path             text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index creatures_universe_idx on public.creatures (universe_id, name);
create index creatures_user_idx on public.creatures (user_id);
create index creatures_habitat_tags_idx on public.creatures using gin (habitat_tags);

create trigger creatures_updated_at
  before update on public.creatures
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Imagens (versões geradas por IA ou enviadas pelo usuário)
-- A imagem escolhida fica em creatures.image_path; esta tabela guarda o
-- histórico de versões para comparar, reutilizar e remover.
-- ---------------------------------------------------------------------
create table public.creature_images (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  universe_id uuid not null references public.universes (id) on delete cascade,
  creature_id uuid references public.creatures (id) on delete cascade,
  path        text not null,
  prompt      text not null default '',
  source      text not null default 'ai' check (source in ('ai', 'upload')),
  created_at  timestamptz not null default now()
);

create index creature_images_creature_idx on public.creature_images (creature_id, created_at desc);
create index creature_images_universe_idx on public.creature_images (universe_id);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.universes       enable row level security;
alter table public.creatures       enable row level security;
alter table public.creature_images enable row level security;

-- Perfis: cada um vê e edita só o próprio.
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Universos
create policy "universes_select_own" on public.universes
  for select to authenticated using (user_id = (select auth.uid()));
create policy "universes_insert_own" on public.universes
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "universes_update_own" on public.universes
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "universes_delete_own" on public.universes
  for delete to authenticated using (user_id = (select auth.uid()));

-- Criaturas: além de ser dono da linha, o universo de destino precisa ser seu.
create policy "creatures_select_own" on public.creatures
  for select to authenticated using (user_id = (select auth.uid()));
create policy "creatures_insert_own" on public.creatures
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.universes u
                where u.id = universe_id and u.user_id = (select auth.uid()))
  );
create policy "creatures_update_own" on public.creatures
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.universes u
                where u.id = universe_id and u.user_id = (select auth.uid()))
  );
create policy "creatures_delete_own" on public.creatures
  for delete to authenticated using (user_id = (select auth.uid()));

-- Imagens
create policy "creature_images_select_own" on public.creature_images
  for select to authenticated using (user_id = (select auth.uid()));
create policy "creature_images_insert_own" on public.creature_images
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.universes u
                where u.id = universe_id and u.user_id = (select auth.uid()))
    and (creature_id is null or exists (select 1 from public.creatures c
                where c.id = creature_id and c.user_id = (select auth.uid())))
    and split_part(path, '/', 1) = (select auth.uid())::text
  );
create policy "creature_images_update_own" on public.creature_images
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (creature_id is null or exists (select 1 from public.creatures c
                where c.id = creature_id and c.user_id = (select auth.uid())))
  );
create policy "creature_images_delete_own" on public.creature_images
  for delete to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- Storage: bucket privado; cada usuário só acessa a pasta <user_id>/...
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bestiario', 'bestiario', false, 10485760,
        array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "bestiario_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'bestiario' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "bestiario_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'bestiario' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "bestiario_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'bestiario' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'bestiario' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "bestiario_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'bestiario' and (storage.foldername(name))[1] = (select auth.uid())::text);
