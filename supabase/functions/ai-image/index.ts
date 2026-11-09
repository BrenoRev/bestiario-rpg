// Edge Function: ilustração da criatura por IA (OpenAI Images).
//
// 1. Monta o prompt a partir da ficha (aparência, tipo, tamanho), do estilo do
//    universo e das instruções do mestre (buildImagePrompt).
// 2. Gera a ilustração — ou edita a imagem atual quando o mestre pede alterações.
// 3. Guarda o arquivo no Storage (pasta do usuário) como uma VERSÃO em
//    creature_images. A imagem só vira a oficial da ficha quando o mestre aceita.
//
// Só roda quando o usuário pede: nada é gerado automaticamente.
import { loadUniverse, requireUser } from "../_shared/auth.ts";
import { buildImagePrompt, normalizeCreature } from "../_shared/creature.ts";
import { HttpError, json, readJson, serve } from "../_shared/http.ts";
import { generateImage } from "../_shared/openai.ts";
import { consumeQuota } from "../_shared/quota.ts";

interface Body {
  universeId: string;
  creatureId?: string | null;
  creature: unknown;
  instruction?: string;
  baseImagePath?: string | null;
}

const BUCKET = "bestiario";

serve(async (req) => {
  const { supabase, user } = await requireUser(req);
  const body = await readJson<Body>(req);
  if (!body?.universeId) throw new HttpError(400, "Selecione um universo.");

  const universe = await loadUniverse(supabase, body.universeId);
  const creature = normalizeCreature(body.creature);
  const instruction = typeof body.instruction === "string" ? body.instruction.trim().slice(0, 1000) : "";

  if (body.creatureId) {
    const { data, error } = await supabase.from("creatures").select("id").eq("id", body.creatureId).maybeSingle();
    if (error || !data) throw new HttpError(404, "Criatura não encontrada.");
  }

  // Imagem-base para edição (sempre dentro da pasta do próprio usuário).
  let baseImage: Blob | null = null;
  if (body.baseImagePath) {
    if (!body.baseImagePath.startsWith(`${user.id}/`) || body.baseImagePath.includes("..")) {
      throw new HttpError(403, "Imagem inválida.");
    }
    const { data, error } = await supabase.storage.from(BUCKET).download(body.baseImagePath);
    if (error || !data) throw new HttpError(404, "Não foi possível carregar a imagem atual para editar.");
    baseImage = data;
  }

  await consumeQuota(supabase, "image");
  const prompt = buildImagePrompt(creature, universe, instruction, baseImage !== null);
  const bytes = await generateImage(prompt, baseImage);

  // Storage + registro da versão
  const path = `${user.id}/${universe.id}/images/${crypto.randomUUID()}.webp`;
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: "image/webp",
    upsert: false,
  });
  if (upErr) {
    console.error("Falha ao armazenar imagem:", upErr.message);
    throw new HttpError(500, "A imagem foi gerada, mas não pôde ser armazenada.");
  }

  const { data: row, error: insErr } = await supabase
    .from("creature_images")
    .insert({
      universe_id: universe.id,
      creature_id: body.creatureId ?? null,
      path,
      prompt: instruction || "Gerada a partir da ficha",
      source: "ai",
    })
    .select("id, path, prompt, source, created_at, creature_id")
    .single();
  if (insErr) {
    console.error("Falha ao registrar imagem:", insErr.message);
    await supabase.storage.from(BUCKET).remove([path]);
    throw new HttpError(500, "Não foi possível registrar a imagem gerada.");
  }

  return json({ image: row });
});
