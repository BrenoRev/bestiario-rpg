// Cota diária de IA por usuário: protege a conta da OpenAI contra uso abusivo.
// Cada chamada registra uma linha em public.ai_usage (a RLS impede apagar ou editar).
import type { SupabaseClient } from "npm:@supabase/supabase-js@2.119.0";
import { HttpError } from "./http.ts";

export type AiKind = "text" | "image";

const limit = (name: string, fallback: number) => {
  const n = Number(Deno.env.get(name));
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const LIMITS: Record<AiKind, number> = {
  text: limit("AI_DAILY_TEXT_LIMIT", 40),
  image: limit("AI_DAILY_IMAGE_LIMIT", 15),
};

/**
 * Confere a cota das últimas 24 horas e registra o uso. É chamada ANTES do provedor,
 * para que pedidos repetidos que falham também contem (evita martelar a API).
 */
export async function consumeQuota(supabase: SupabaseClient, kind: AiKind): Promise<void> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("kind", kind)
    .gte("created_at", since);
  if (error) {
    console.error("Falha ao ler a cota de IA:", error.message);
    throw new HttpError(500, "Não foi possível verificar seu limite de uso da IA.");
  }
  if ((count ?? 0) >= LIMITS[kind]) {
    const what = kind === "image" ? `${LIMITS.image} imagens` : `${LIMITS.text} pedidos de texto`;
    throw new HttpError(429, `Você atingiu o limite de ${what} à IA nas últimas 24 horas. Tente novamente mais tarde.`);
  }
  const { error: insertError } = await supabase.from("ai_usage").insert({ kind });
  if (insertError) {
    console.error("Falha ao registrar uso de IA:", insertError.message);
    throw new HttpError(500, "Não foi possível registrar o uso da IA.");
  }
}
