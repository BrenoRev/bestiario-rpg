-- =====================================================================
-- Endurecimento após auditoria
-- 1. Cota de uso de IA por usuário (proteção de custo).
-- 2. Versões de imagem só podem apontar para a pasta do próprio usuário.
-- 3. O usuário só altera nome de exibição e preferências do perfil.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Registro de uso de IA. As Edge Functions contam as linhas das últimas
--    24 horas antes de chamar a OpenAI. Sem políticas de update/delete:
--    ninguém consegue apagar o próprio histórico para burlar a cota.
-- ---------------------------------------------------------------------
create table public.ai_usage (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('text', 'image')),
  created_at timestamptz not null default now()
);

create index ai_usage_user_kind_idx on public.ai_usage (user_id, kind, created_at desc);

alter table public.ai_usage enable row level security;

create policy "ai_usage_select_own" on public.ai_usage
  for select to authenticated using (user_id = (select auth.uid()));
create policy "ai_usage_insert_own" on public.ai_usage
  for insert to authenticated with check (user_id = (select auth.uid()));

-- Não deixa o cliente escolher a data do registro.
revoke insert on public.ai_usage from authenticated, anon;
grant insert (kind) on public.ai_usage to authenticated;

-- ---------------------------------------------------------------------
-- 2. creature_images: o caminho também é conferido na atualização.
-- ---------------------------------------------------------------------
drop policy "creature_images_update_own" on public.creature_images;
create policy "creature_images_update_own" on public.creature_images
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and split_part(path, '/', 1) = (select auth.uid())::text
    and (creature_id is null or exists (select 1 from public.creatures c
                where c.id = creature_id and c.user_id = (select auth.uid())))
  );

-- ---------------------------------------------------------------------
-- 3. profiles: e-mail e foto vêm da conta (Auth) e não são editáveis pelo app.
-- ---------------------------------------------------------------------
revoke update on public.profiles from authenticated, anon;
grant update (display_name, preferences) on public.profiles to authenticated;
