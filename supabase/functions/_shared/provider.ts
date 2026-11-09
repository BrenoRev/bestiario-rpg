// Escolha do provedor de texto e adaptação de esquema (módulo puro, testado pelo frontend).
//
// A OpenAI é o provedor padrão. A Anthropic (Claude) é TEMPORÁRIA: serve para validar
// o app enquanto não há chave da OpenAI. Imagens continuam só na OpenAI.

export type TextProvider = "openai" | "anthropic";

/** Opções comuns às chamadas de texto com saída JSON estruturada. */
export interface JsonCallOptions {
  /** Instruções de sistema. */
  system: string;
  /** Pedido do usuário (com os dados entre tags XML). */
  prompt: string;
  /** Nome curto do esquema (letras, números, _ ou -). */
  schemaName: string;
  /** JSON Schema estrito: todo objeto com additionalProperties false e tudo em required. */
  schema: Record<string, unknown>;
  effort?: "low" | "medium" | "high";
  maxOutputTokens?: number;
}

/**
 * `AI_TEXT_PROVIDER` força um provedor. Sem ele: OpenAI se houver `OPENAI_API_KEY`,
 * senão Anthropic se houver `ANTHROPIC_API_KEY`, senão OpenAI (que avisa da falta de chave).
 */
export function pickTextProvider(env: { forced?: string; hasOpenAI: boolean; hasAnthropic: boolean }): TextProvider {
  if (env.forced === "openai" || env.forced === "anthropic") return env.forced;
  if (env.hasOpenAI) return "openai";
  if (env.hasAnthropic) return "anthropic";
  return "openai";
}

/**
 * Extrai o objeto JSON de uma resposta em texto livre (modo sem gramática da Anthropic):
 * aceita JSON puro, cercado por bloco de código markdown ou com texto antes e depois.
 * Devolve null se não houver objeto JSON válido.
 */
export function extractJsonObject(text: string): unknown {
  const candidates: string[] = [];
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) candidates.push(fenced[1]);
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last > first) candidates.push(text.slice(first, last + 1));
  candidates.push(text);
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate.trim());
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch {
      /* tenta o próximo */
    }
  }
  return null;
}
