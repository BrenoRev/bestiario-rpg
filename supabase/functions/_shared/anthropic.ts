// Adaptador TEMPORÁRIO da Anthropic (Claude) para texto, usado enquanto não há chave da OpenAI.
// A chave fica só nos secrets das funções (ANTHROPIC_API_KEY). Imagens não passam por aqui.
import Anthropic from "npm:@anthropic-ai/sdk@1.6.0";
import { HttpError, requireEnv } from "./http.ts";
import { type JsonCallOptions, stripForAnthropic } from "./provider.ts";

export const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-opus-5-5";

let client: Anthropic | null = null;
function getClient() {
  client ??= new Anthropic({ apiKey: requireEnv("ANTHROPIC_API_KEY"), timeout: 140_000, maxRetries: 1 });
  return client;
}

export async function callAnthropicJson<T>({
  system,
  prompt,
  schema,
  effort = "medium",
  maxOutputTokens = 32_000,
}: JsonCallOptions): Promise<T> {
  const anthropic = getClient(); // fora do try: falta de chave é erro de configuração (500)
  let message;
  try {
    // Streaming evita timeout HTTP em respostas longas; finalMessage() junta tudo.
    // fallbacks "default": se um classificador de segurança recusar por engano,
    // a API refaz a chamada no modelo de fallback recomendado.
    const stream = anthropic.beta.messages.stream({
      model: ANTHROPIC_MODEL,
      max_tokens: maxOutputTokens,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort, format: { type: "json_schema", schema: stripForAnthropic(schema) } },
      system,
      messages: [{ role: "user", content: prompt }],
    });
    message = await stream.finalMessage();
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      throw new HttpError(429, "O serviço de IA está sobrecarregado. Tente novamente em instantes.");
    }
    if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
      console.error("Anthropic: chave inválida ou sem permissão.");
      throw new HttpError(500, "O serviço de IA ainda não foi configurado no servidor. Avise o administrador.");
    }
    if (err instanceof Anthropic.APIConnectionTimeoutError) {
      throw new HttpError(504, "A IA demorou demais para responder. Tente de novo, talvez com menos detalhamento.");
    }
    if (err instanceof Anthropic.BadRequestError) {
      console.error("Anthropic recusou a requisição:", err.message);
      throw new HttpError(502, "A IA rejeitou a solicitação. Tente reformular o pedido.");
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Erro da Anthropic:", err.status, err.message);
      throw new HttpError(502, "Falha ao consultar a IA. Tente novamente.");
    }
    throw err;
  }

  if (message.stop_reason === "refusal") {
    throw new HttpError(422, "A IA não pôde atender a este pedido. Tente reformular a descrição.");
  }
  if (message.stop_reason === "max_tokens") {
    throw new HttpError(502, "A resposta da IA ficou longa demais. Reduza o detalhamento ou o número de alternativas.");
  }

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("");
  try {
    return JSON.parse(text) as T;
  } catch {
    console.error("Resposta da Anthropic sem JSON válido (tamanho):", text.length);
    throw new HttpError(502, "A IA devolveu uma resposta em formato inesperado. Tente novamente.");
  }
}
