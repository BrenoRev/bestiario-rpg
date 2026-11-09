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
  // Lista os arquivos, apaga as linhas (cascata) e só então os arquivos: se o banco
  // falhar, nenhuma ficha fica apontando para imagem apagada.
  const files = await listFolder(`${uid}/${universe.id}`);
  const { error } = await supabase.from("universes").delete().eq("id", universe.id);
  if (error) fail(error, "Não foi possível excluir o universo.");
  await removeFiles(files);
}

// ---------------------------------------------------------------- Criaturas
/** Teto de linhas por consulta do PostgREST (max_rows). A listagem avisa quando chega nele. */
export const CREATURE_LIST_LIMIT = 1000;

const SUMMARY_COLUMNS =
  "id, universe_id, name, size, creature_type, challenge_rating, cr_value, habitat_tags, image_path, updated_at";

export async function listCreatures(universeId: string): Promise<CreatureSummary[]> {
  const { data, error } = await supabase
    .from("creatures")
    .select(SUMMARY_COLUMNS)
    .eq("universe_id", universeId)
    .order("name")
    .limit(CREATURE_LIST_LIMIT);
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
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_SIDE = 1600;

/** Reduz a imagem para no máximo 1600 px no maior lado, em WebP. Fotos de vários MB viram poucas centenas de KB. */
async function prepareImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.88));
    // Sem redução e sem ganho de tamanho: mantém o original.
    if (!blob || !MIME_EXT[blob.type] || (scale === 1 && blob.size >= file.size)) return file;
    return blob;
  } catch {
    return file; // navegador sem suporte: envia como está
  }
}

export async function uploadImage(file: File, universeId: string, folder: "images" | "covers"): Promise<string> {
  if (!MIME_EXT[file.type]) throw new Error("Use uma imagem PNG, JPG ou WebP.");
  const image = await prepareImage(file);
  if (image.size > MAX_UPLOAD_BYTES) throw new Error("A imagem deve ter no máximo 10 MB.");
  const uid = await currentUserId();
  const path = `${uid}/${universeId}/${folder}/${crypto.randomUUID()}.${MIME_EXT[image.type]}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, image, { contentType: image.type });
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

async function listFolder(prefix: string): Promise<string[]> {
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
  return files;
}

async function removeFiles(paths: string[]): Promise<void> {
  for (let i = 0; i < paths.length; i += 100) {
    await supabase.storage.from(BUCKET).remove(paths.slice(i, i + 100));
  }
}

/** Apaga versões de ilustração que ainda não pertencem a nenhuma criatura (proposta descartada). */
export async function deleteDraftImages(images: CreatureImage[]): Promise<void> {
  const drafts = images.filter((i) => !i.creature_id);
  if (!drafts.length) return;
  const { error } = await supabase.from("creature_images").delete().in("id", drafts.map((i) => i.id)).is("creature_id", null);
  if (error) return console.error(error);
  await removeFiles(drafts.map((i) => i.path));
}

/**
 * Coleta de lixo preguiçosa: versões de rascunho abandonadas há mais de `days` dias
 * (sessões de "Criar com IA" nunca salvas). Nunca apaga imagem em uso por uma ficha.
 */
export async function cleanupOrphanImages(days = 7): Promise<void> {
  const before = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("creature_images")
    .select("id, path")
    .is("creature_id", null)
    .lt("created_at", before)
    .limit(200);
  if (!data?.length) return;
  const { data: used } = await supabase.from("creatures").select("image_path").in("image_path", data.map((d) => d.path));
  const inUse = new Set((used ?? []).map((u) => u.image_path as string));
  const orphans = data.filter((d) => !inUse.has(d.path));
  if (!orphans.length) return;
  const { error } = await supabase.from("creature_images").delete().in("id", orphans.map((o) => o.id));
  if (error) return console.error(error);
  await removeFiles(orphans.map((o) => o.path));
}

// URLs assinadas em lote: os pedidos feitos no mesmo instante (ex.: uma grade de
// cartões) viram uma única chamada a createSignedUrls, com cache de 50 minutos.
const SIGNED_TTL_SECONDS = 3600;
const signedCache = new Map<string, { url: string; expires: number }>();
let pendingSigned = new Map<string, { resolve: (url: string) => void; reject: (err: Error) => void }[]>();
let signedTimer: ReturnType<typeof setTimeout> | null = null;

async function flushSignedUrls(): Promise<void> {
  const batch = pendingSigned;
  pendingSigned = new Map();
  signedTimer = null;
  const paths = [...batch.keys()];
  try {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_TTL_SECONDS);
    if (error) throw error;
    const byPath = new Map((data ?? []).map((d) => [d.path, d]));
    for (const path of paths) {
      const url = byPath.get(path)?.signedUrl;
      const waiters = batch.get(path) ?? [];
      if (!url) {
        waiters.forEach((w) => w.reject(new Error("Imagem indisponível.")));
      } else {
        signedCache.set(path, { url, expires: Date.now() + 50 * 60 * 1000 });
        waiters.forEach((w) => w.resolve(url));
      }
    }
  } catch {
    for (const waiters of batch.values()) waiters.forEach((w) => w.reject(new Error("Imagem indisponível.")));
  }
}

export function signedUrl(path: string): Promise<string> {
  const hit = signedCache.get(path);
  if (hit && hit.expires > Date.now()) return Promise.resolve(hit.url);
  return new Promise((resolve, reject) => {
    const waiters = pendingSigned.get(path) ?? [];
    waiters.push({ resolve, reject });
    pendingSigned.set(path, waiters);
    signedTimer ??= setTimeout(() => void flushSignedUrls(), 10);
  });
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
