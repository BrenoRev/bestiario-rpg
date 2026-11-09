// Utilitários HTTP comuns às Edge Functions (CORS, corpo da requisição, respostas e erros).

/** Origens permitidas (ex.: "https://bestiario.app,http://localhost:5173"). Vazio = qualquer origem. */
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

/** Uma ficha completa tem poucos KB; acima disso é erro ou abuso (prompt caro). */
const MAX_BODY_BYTES = 256 * 1024;

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function corsHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (ALLOWED_ORIGINS.length === 0) {
    headers["Access-Control-Allow-Origin"] = "*";
  } else {
    headers["Vary"] = "Origin";
    const origin = req.headers.get("Origin") ?? "";
    if (ALLOWED_ORIGINS.includes(origin)) headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Envolve um handler com CORS, método, tratamento de erros uniforme e cabeçalhos de CORS em toda resposta. */
export function serve(handler: (req: Request) => Promise<Response>) {
  Deno.serve(async (req) => {
    const cors = corsHeaders(req);
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

    let res: Response;
    if (req.method !== "POST") {
      res = json({ error: "Método não permitido." }, 405);
    } else {
      try {
        res = await handler(req);
      } catch (err) {
        if (err instanceof HttpError) {
          res = json({ error: err.message }, err.status);
        } else {
          console.error("Erro inesperado:", err instanceof Error ? err.message : err);
          res = json({ error: "Erro interno ao processar a solicitação." }, 500);
        }
      }
    }
    for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
    return res;
  });
}

export async function readJson<T>(req: Request): Promise<T> {
  if (Number(req.headers.get("Content-Length") ?? 0) > MAX_BODY_BYTES) {
    throw new HttpError(413, "A requisição é grande demais.");
  }
  const text = await req.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) throw new HttpError(413, "A requisição é grande demais.");
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(400, "Corpo da requisição inválido.");
  }
}

export function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    console.error(`Variável de ambiente ${name} não configurada.`);
    throw new HttpError(500, "O serviço de IA ainda não foi configurado no servidor. Avise o administrador.");
  }
  return value;
}
