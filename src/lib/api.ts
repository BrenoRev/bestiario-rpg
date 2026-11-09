// Acesso a dados (Supabase). Toda consulta passa pela RLS: o usuário só
// enxerga e altera os próprios universos, criaturas, imagens e arquivos.
import { BUCKET, supabase } from "./supabase";
import { normalizeDraft } from "./creature";
import type {
  Creature, CreatureDraft, CreatureImage, CreatureSummary, Preferences, Profile,
  Universe, UniverseInput, UniverseWithCount,
} from "./types";

function fail(error: { message: string } | null, fallback: string): never {
  console.error(error);
  throw new Error(fallback);
}

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("Sessão expirada. Entre novamente.");
  return id;
}

// ---------------------------------------------------------------- Universos
export async function listUniverses(): Promise<UniverseWithCount[]> {
  const { data, error } = await supabase
    .from("universes")
    .select("*, creatures(count)")
    .order("created_at", { ascending: false });
  if (error) fail(error, "Não foi possível carregar seus mundos.");
  return (data ?? []).map((row) => {
    const { creatures, ...u } = row as Universe & { creatures: { count: number }[] };
    return { ...u, creature_count: creatures?.[0]?.count ?? 0 };
  });
}

export async function getUniverse(id: string): Promise<Universe> {
  const { data, error } = await supabase.from("universes").select("*").eq("id", id).maybeSingle();
  if (error) fail(error, "Não foi possível carregar o universo.");
  if (!data) throw new Error("Universo não encontrado.");
  return data as Universe;
}

export async function createUniverse(input: UniverseInput): Promise<Universe> {
  const { data, error } = await supabase.from("universes").insert(input).select("*").single();
  if (error) fail(error, "Não foi possível criar o universo.");
  return data as Universe;
}

export async function updateUniverse(id: string, input: Partial<UniverseInput>): Promise<Universe> {
  const { data, error } = await supabase.from("universes").update(input).eq("id", id).select("*").single();
  if (error) fail(error, "Não foi possível salvar o universo.");
  return data as Universe;
}

export async function deleteUniverse(universe: Universe): Promise<void> {
  const uid = await currentUserId();
  // Arquivos primeiro (capa e todas as imagens do universo), depois as linhas.
  await removeFolder(`${uid}/${universe.id}`);
  const { error } = await supabase.from("universes").delete().eq("id", universe.id);
  if (error) fail(error, "Não foi possível excluir o universo.");
}

// ---------------------------------------------------------------- Criaturas
const SUMMARY_COLUMNS =
  "id, universe_id, name, size, creature_type, challenge_rating, cr_value, habitat_tags, image_path, updated_at";

export async function listCreatures(universeId: string): Promise<CreatureSummary[]> {
  const { data, error } = await supabase
    .from("creatures")
    .select(SUMMARY_COLUMNS)
    .eq("universe_id", universeId)
    .order("name");
  if (error) fail(error, "Não foi possível carregar o bestiário.");
  return (data ?? []) as CreatureSummary[];
}

export async function getCreature(id: string): Promise<Creature> {
  const { data, error } = await supabase.from("creatures").select("*").eq("id", id).maybeSingle();
  if (error) fail(error, "Não foi possível carregar a criatura.");
  if (!data) throw new Error("Criatura não encontrada.");
  return data as Creature;
}

export async function createCreature(universeId: string, draft: CreatureDraft): Promise<Creature> {
  const payload = { ...normalizeDraft(draft), universe_id: universeId };
  if (!payload.name.trim()) throw new Error("Dê um nome à criatura.");
  const { data, error } = await supabase.from("creatures").insert(payload).select("*").single();
  if (error) fail(error, "Não foi possível salvar a criatura.");
  return data as Creature;
}

export async function updateCreature(id: string, draft: Partial<CreatureDraft>): Promise<Creature> {
  if (draft.name !== undefined && !draft.name.trim()) throw new Error("Dê um nome à criatura.");
  const { data, error } = await supabase.from("creatures").update(draft).eq("id", id).select("*").single();
  if (error) fail(error, "Não foi possível salvar as alterações.");
  return data as Creature;
}

export async function duplicateCreature(creature: Creature): Promise<Creature> {
  const draft = normalizeDraft(creature);
  draft.name = `${creature.name} (cópia)`.slice(0, 120);
  // A cópia recebe um arquivo próprio, para que excluir uma não apague a imagem da outra.
  if (creature.image_path) {
    const ext = creature.image_path.split(".").pop() ?? "webp";
    const target = `${creature.image_path.split("/").slice(0, 2).join("/")}/images/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).copy(creature.image_path, target);
    draft.image_path = error ? null : target;
  }
  const copy = await createCreature(creature.universe_id, draft);
  if (copy.image_path) {
    await supabase.from("creature_images").insert({
      universe_id: copy.universe_id,
      creature_id: copy.id,
      path: copy.image_path,
      prompt: "Cópia da imagem original",
      source: "upload",
    });
  }
  return copy;
}

export async function deleteCreature(creature: Pick<Creature, "id" | "image_path">): Promise<void> {
  const { data: images } = await supabase.from("creature_images").select("path").eq("creature_id", creature.id);
  const paths = new Set((images ?? []).map((i) => i.path as string));
  if (creature.image_path) paths.add(creature.image_path);
  const { error } = await supabase.from("creatures").delete().eq("id", creature.id);
  if (error) fail(error, "Não foi possível excluir a criatura.");
  if (paths.size) await supabase.storage.from(BUCKET).remove([...paths]);
}

export interface SearchResult {
  id: string;
  name: string;
  creature_type: string;
  challenge_rating: string;
  universe_id: string;
  universe_name: string;
}

export async function searchCreatures(term: string): Promise<SearchResult[]> {
  const q = term.trim().replace(/[%_,()]/g, " ");
  if (!q) return [];
  const { data, error } = await supabase
    .from("creatures")
    .select("id, name, creature_type, challenge_rating, universe_id, universes(name)")
    .ilike("name", `%${q}%`)
    .order("name")
    .limit(12);
  if (error) fail(error, "Falha na busca.");
  return (data ?? []).map((row) => {
    const r = row as unknown as SearchResult & { universes: { name: string } | null };
    return { ...r, universe_name: r.universes?.name ?? "" };
  });
}

// ---------------------------------------------------------------- Imagens
export async function listCreatureImages(creatureId: string): Promise<CreatureImage[]> {
  const { data, error } = await supabase
    .from("creature_images")
    .select("id, creature_id, path, prompt, source, created_at")
    .eq("creature_id", creatureId)
    .order("created_at", { ascending: false });
  if (error) fail(error, "Não foi possível carregar as versões da imagem.");
  return (data ?? []) as CreatureImage[];
}

/** Vincula versões geradas antes de a criatura existir (rascunho) à criatura salva. */
export async function attachImagesToCreature(imageIds: string[], creatureId: string): Promise<void> {
  if (!imageIds.length) return;
  const { error } = await supabase.from("creature_images").update({ creature_id: creatureId }).in("id", imageIds);
  if (error) console.error(error);
}

export async function deleteCreatureImage(image: CreatureImage): Promise<void> {
  const { error } = await supabase.from("creature_images").delete().eq("id", image.id);
  if (error) fail(error, "Não foi possível remover a versão.");
  await supabase.storage.from(BUCKET).remove([image.path]);
}

const MIME_EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

export async function uploadImage(file: File, universeId: string, folder: "images" | "covers"): Promise<string> {
  const ext = MIME_EXT[file.type];
  if (!ext) throw new Error("Use uma imagem PNG, JPG ou WebP.");
  if (file.size > 10 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 10 MB.");
  const uid = await currentUserId();
  const path = `${uid}/${universeId}/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) fail(error, "Falha ao enviar a imagem.");
  return path;
}

/** Envia uma imagem do usuário e registra como versão da criatura. */
export async function uploadCreatureImage(
  file: File,
  universeId: string,
  creatureId: string | null,
): Promise<CreatureImage> {
  const path = await uploadImage(file, universeId, "images");
  const { data, error } = await supabase
    .from("creature_images")
    .insert({ universe_id: universeId, creature_id: creatureId, path, prompt: "Imagem enviada", source: "upload" })
    .select("id, creature_id, path, prompt, source, created_at")
    .single();
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    fail(error, "Não foi possível registrar a imagem.");
  }
  return data as CreatureImage;
}

export async function removeFile(path: string | null | undefined): Promise<void> {
  if (path) await supabase.storage.from(BUCKET).remove([path]);
}

async function removeFolder(prefix: string): Promise<void> {
  const files: string[] = [];
  const walk = async (dir: string) => {
    const { data } = await supabase.storage.from(BUCKET).list(dir, { limit: 1000 });
    for (const item of data ?? []) {
      const full = `${dir}/${item.name}`;
      if (item.id) files.push(full);
      else await walk(full); // pastas não têm id
    }
  };
  await walk(prefix);
  for (let i = 0; i < files.length; i += 100) {
    await supabase.storage.from(BUCKET).remove(files.slice(i, i + 100));
  }
}

const signedCache = new Map<string, { url: string; expires: number }>();

export async function signedUrl(path: string): Promise<string> {
  const hit = signedCache.get(path);
  if (hit && hit.expires > Date.now()) return hit.url;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error || !data) throw new Error("Imagem indisponível.");
  signedCache.set(path, { url: data.signedUrl, expires: Date.now() + 50 * 60 * 1000 });
  return data.signedUrl;
}

// ---------------------------------------------------------------- Perfil
export async function getProfile(): Promise<Profile | null> {
  const uid = await currentUserId();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
  if (error) fail(error, "Não foi possível carregar o perfil.");
  return data as Profile | null;
}

export async function updateProfile(input: { display_name?: string | null; preferences?: Preferences }): Promise<Profile> {
  const uid = await currentUserId();
  const { data, error } = await supabase.from("profiles").update(input).eq("id", uid).select("*").single();
  if (error) fail(error, "Não foi possível salvar as preferências.");
  return data as Profile;
}
