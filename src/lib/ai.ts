// Cliente das Edge Functions de IA. As chaves das APIs ficam no servidor;
// o app só envia o JWT do usuário.
import { FunctionsHttpError } from "@supabase/supabase-js";
import { normalizeDraft } from "./creature";
import { supabase } from "./supabase";
import type { AIAlternative, CreatureDraft, CreatureImage, Creativity, Detail } from "./types";

async function invoke<T>(fn: string, body: object): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, { body: body as Record<string, unknown> });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = await error.context.json().catch(() => null);
      throw new Error(payload?.error ?? "A IA não conseguiu concluir o pedido.");
    }
    throw new Error("Não foi possível falar com o servidor de IA. Verifique sua conexão.");
  }
  return data as T;
}

interface CommonOptions {
  universeId: string;
  useUniverseContext: boolean;
  creativity?: Creativity;
  detail?: Detail;
}

const toAlternatives = (list: AIAlternative[]) =>
  list.map((a) => ({ ...a, creature: normalizeDraft(a.creature) }));

export async function generateCreatures(
  opts: CommonOptions & {
    description: string;
    creatureType: string | null;
    challengeRating: string | null;
    count: number;
    avoidNames?: string[];
  },
): Promise<AIAlternative[]> {
  const res = await invoke<{ alternatives: AIAlternative[] }>("ai-creature", { action: "generate", ...opts });
  return toAlternatives(res.alternatives);
}

export async function generateVariations(
  opts: CommonOptions & { creature: CreatureDraft; instruction?: string; count: number },
): Promise<AIAlternative[]> {
  const res = await invoke<{ alternatives: AIAlternative[] }>("ai-creature", { action: "variation", ...opts });
  return toAlternatives(res.alternatives);
}

export async function modifyCreature(
  opts: CommonOptions & { creature: CreatureDraft; instruction: string },
): Promise<{ summary: string; creature: CreatureDraft }> {
  const res = await invoke<{ summary: string; creature: CreatureDraft }>("ai-creature", { action: "modify", ...opts });
  // A IA não toca em notas nem imagem: preservamos do original.
  const creature = normalizeDraft(res.creature);
  creature.notes = opts.creature.notes;
  creature.image_path = opts.creature.image_path;
  // A IA não devolve o Bônus de Proficiência: mantém o atual se o ND não mudou
  // (normalizeDraft já o recalculou pelo ND novo quando mudou).
  if (creature.challenge_rating === opts.creature.challenge_rating) {
    creature.proficiency_bonus = opts.creature.proficiency_bonus;
  }
  return { summary: res.summary, creature };
}

export async function generateCreatureImage(opts: {
  universeId: string;
  creatureId: string | null;
  creature: CreatureDraft;
  instruction?: string;
  baseImagePath?: string | null;
}): Promise<{ image: CreatureImage }> {
  return invoke("ai-image", opts);
}
