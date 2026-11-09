// Adaptador único da OpenAI: toda chamada de IA (texto e imagem) passa por aqui.
// A chave fica só nos secrets das funções (OPENAI_API_KEY).
import { HttpError, requireEnv } from "./http.ts";
import type { JsonCallOptions } from "./provider.ts";

const API = "https://api.openai.com/v1";

/** Modelo de texto (Responses API). Precisa aceitar saída estruturada e `reasoning.effort`. */
export const TEXT_MODEL = Deno.env.get("OPENAI_TEXT_MODEL") ?? "gpt-6.1-sol";
/** Modelo de imagem (Image API). */
export const IMAGE_MODEL = Deno.env.get("OPENAI_IMAGE_MODEL") ?? "gpt-image-2.5-flare";

/** Abaixo do limite de execução das Edge Functions (150 s no plano gratuito). */
const TIMEOUT_MS = 140_000;

async function request(path: string, init: RequestInit): Promise<Response> {
  // Fora do try: falta de chave é erro de configuração (500), não de rede.
  const apiKey = requireEnv("OPENAI_API_KEY");
  try {
    return await fetch(`${API}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${apiKey}`, ...init.headers },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof DOMException && (err.name === "TimeoutError" || err.name === "AbortError")) {
      throw new HttpError(504, "A IA demorou demais para responder. Tente de novo, talvez com menos detalhamento.");
    }
    console.error("Falha de rede com a OpenAI:", err instanceof Error ? err.message : err);
    throw new HttpError(502, "Não foi possível falar com o serviço de IA. Tente novamente.");
  }
}

/** Traduz erros HTTP da OpenAI em mensagens para o usuário, sem vazar detalhes. */
async function failFromResponse(res: Response, what: "texto" | "imagem"): Promise<never> {
  const detail = await res.text().catch(() => "");
  console.error(`OpenAI (${what}) respondeu ${res.status}:`, detail.slice(0, 500));
  if (res.status === 401 || res.status === 403) throw new HttpError(500, "Chave da OpenAI inválida ou sem permissão no servidor.");
  if (res.status === 429) throw new HttpError(429, "O serviço de IA está sobrecarregado. Tente novamente em instantes.");
  if (res.status === 400 && /safety|moderation|content_policy/i.test(detail)) {
    throw new HttpError(422, "O serviço de IA recusou este pedido. Tente descrever de outra forma.");
  }
  throw new HttpError(502, what === "imagem" ? "Falha ao gerar a imagem. Tente novamente." : "Falha ao consultar a IA. Tente novamente.");
}

// ---------------------------------------------------------------- Texto

interface ResponsesPayload {
  status?: string;
  incomplete_details?: { reason?: string } | null;
  output?: { type: string; content?: { type: string; text?: string; refusal?: string }[] }[];
}

/** Chama a Responses API com saída JSON estruturada e devolve o objeto já parseado. */
export async function callOpenAIJson<T>({
  system,
  prompt,
  schemaName,
  schema,
  effort = "medium",
  maxOutputTokens = 32_000,
}: JsonCallOptions): Promise<T> {
  const res = await request("/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: TEXT_MODEL,
      instructions: system,
      input: prompt,
      reasoning: { effort },
      max_output_tokens: maxOutputTokens,
      text: { format: { type: "json_schema", name: schemaName, schema, strict: true } },
      store: false, // não guardar o conteúdo dos mestres na OpenAI
    }),
  });
  if (!res.ok) await failFromResponse(res, "texto");

  const payload = (await res.json()) as ResponsesPayload;

  if (payload.status === "incomplete") {
    const reason = payload.incomplete_details?.reason;
    if (reason === "content_filter") throw new HttpError(422, "A IA não pôde atender a este pedido. Tente reformular a descrição.");
    throw new HttpError(502, "A resposta da IA ficou longa demais. Reduza o detalhamento ou o número de alternativas.");
  }

  const contents = (payload.output ?? []).filter((item) => item.type === "message").flatMap((item) => item.content ?? []);
  if (contents.some((c) => c.type === "refusal")) {
    throw new HttpError(422, "A IA não pôde atender a este pedido. Tente reformular a descrição.");
  }

  // Usa o último texto que é JSON válido (alguns modelos podem emitir mais de uma mensagem).
  const texts = contents.filter((c) => c.type === "output_text" && typeof c.text === "string").map((c) => c.text as string);
  for (const text of texts.reverse()) {
    try {
      return JSON.parse(text) as T;
    } catch {
      /* tenta o anterior */
    }
  }
  console.error("Resposta da IA sem JSON válido. Itens:", (payload.output ?? []).map((i) => i.type).join(","));
  throw new HttpError(502, "A IA devolveu uma resposta em formato inesperado. Tente novamente.");
}

// ---------------------------------------------------------------- Imagem
/** Gera uma ilustração (ou edita `baseImage`) e devolve os bytes em WebP. */
export async function generateImage(prompt: string, baseImage: Blob | null): Promise<Uint8Array> {
  let res: Response;
  if (baseImage) {
    const form = new FormData();
    form.append("model", IMAGE_MODEL);
    form.append("prompt", prompt);
    form.append("image", new File([baseImage], "base", { type: baseImage.type || "image/png" }));
    form.append("size", "1024x1024");
    form.append("quality", "medium");
    form.append("output_format", "webp");
    form.append("output_compression", "85");
    res = await request("/images/edits", { method: "POST", body: form });
  } else {
    res = await request("/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt,
        size: "1024x1024",
        quality: "medium",
        output_format: "webp",
        output_compression: 85,
        n: 1,
      }),
    });
  }
  if (!res.ok) await failFromResponse(res, "imagem");

  const payload = await res.json();
  const b64 = payload?.data?.[0]?.b64_json;
  if (typeof b64 !== "string") throw new HttpError(502, "O serviço de imagens não devolveu uma imagem.");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}
