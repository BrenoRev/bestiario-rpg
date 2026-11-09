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

/** Palavras-chave que a saída estruturada da Anthropic não aceita (a OpenAI aceita algumas). */
const UNSUPPORTED_BY_ANTHROPIC = new Set([
  "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf",
  "minLength", "maxLength", "pattern",
  "minItems", "maxItems", "uniqueItems",
]);

/** Remove, em qualquer profundidade, as restrições que a Anthropic rejeitaria. Os limites continuam valendo na normalização. */
export function stripForAnthropic<T>(schema: T): T {
  if (Array.isArray(schema)) return schema.map((s) => stripForAnthropic(s)) as T;
  if (schema && typeof schema === "object") {
    return Object.fromEntries(
      Object.entries(schema as Record<string, unknown>)
        .filter(([key]) => !UNSUPPORTED_BY_ANTHROPIC.has(key))
        .map(([key, value]) => [key, stripForAnthropic(value)]),
    ) as T;
  }
  return schema;
}
