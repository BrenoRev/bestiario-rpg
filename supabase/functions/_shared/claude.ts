// Chamada ao Claude com saída JSON estruturada (output_config.format).
// A chave fica só no servidor (ANTHROPIC_API_KEY nos secrets da função).
import Anthropic from "npm:@anthropic-ai/sdk@1.6.0";
import { HttpError, requireEnv } from "./http.ts";

let client: Anthropic | null = null;
function getClient() {
  client ??= new Anthropic({ apiKey: requireEnv("ANTHROPIC_API_KEY") });
  return client;
}

export const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-opus-5-5";

interface JsonCallOptions {
  system: string;
  prompt: string;
  schema: Record<string, unknown>;
  effort?: "low" | "medium" | "high";
  maxTokens?: number;
}

export async function callClaudeJson<T>({
  system,
  prompt,
  schema,
  effort = "medium",
  maxTokens = 32000,
}: JsonCallOptions): Promise<T> {
  let message;
  try {
    // Streaming evita timeout HTTP em respostas longas; finalMessage() junta tudo.
    // fallbacks "default": se um classificador de segurança recusar por engano,
    // a API refaz a chamada no modelo de fallback recomendado.
    const stream = getClient().beta.messages.stream({
      model: MODEL,
      max_tokens: maxTokens,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort, format: { type: "json_schema", schema } },
      system,
      messages: [{ role: "user", content: prompt }],
    });
    message = await stream.finalMessage();
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      throw new HttpError(429, "A IA está sobrecarregada no momento. Tente novamente em instantes.");
    }
    if (err instanceof Anthropic.AuthenticationError) {
      throw new HttpError(500, "Chave da API de IA inválida no servidor.");
    }
    if (err instanceof Anthropic.BadRequestError) {
      console.error("Claude bad request:", err.message);
      throw new HttpError(502, "A IA rejeitou a solicitação. Tente reformular o pedido.");
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Claude API error:", err.status, err.message);
      throw new HttpError(502, "Falha ao consultar a IA. Tente novamente.");
    }
    throw err;
  }

  if (message.stop_reason === "refusal") {
    throw new HttpError(422, "A IA não pôde atender a este pedido. Tente reformular a descrição.");
  }
  if (message.stop_reason === "max_tokens") {
    throw new HttpError(502, "A resposta da IA ficou longa demais. Reduza o nível de detalhamento ou o número de alternativas.");
  }

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("");
  try {
    return JSON.parse(text) as T;
  } catch {
    console.error("Resposta não-JSON da IA:", text.slice(0, 500));
    throw new HttpError(502, "A IA devolveu uma resposta em formato inesperado. Tente novamente.");
  }
}
