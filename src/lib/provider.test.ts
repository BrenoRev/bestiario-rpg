// Escolha do provedor de texto das Edge Functions e leitura do JSON no modo sem gramática (Anthropic).
import { describe, expect, it } from "vitest";
import { extractJsonObject, pickTextProvider } from "../../supabase/functions/_shared/provider.ts";

describe("pickTextProvider", () => {
  it("usa a OpenAI quando a chave dela existe", () => {
    expect(pickTextProvider({ hasOpenAI: true, hasAnthropic: true })).toBe("openai");
  });

  it("usa a Anthropic temporariamente quando só ela tem chave", () => {
    expect(pickTextProvider({ hasOpenAI: false, hasAnthropic: true })).toBe("anthropic");
  });

  it("sem nenhuma chave, fica na OpenAI (que avisa da falta de configuração)", () => {
    expect(pickTextProvider({ hasOpenAI: false, hasAnthropic: false })).toBe("openai");
  });

  it("AI_TEXT_PROVIDER força o provedor; valor desconhecido é ignorado", () => {
    expect(pickTextProvider({ forced: "anthropic", hasOpenAI: true, hasAnthropic: true })).toBe("anthropic");
    expect(pickTextProvider({ forced: "xyz", hasOpenAI: false, hasAnthropic: true })).toBe("anthropic");
  });
});

describe("extractJsonObject", () => {
  it("lê JSON puro", () => {
    expect(extractJsonObject('{"a":1}')).toEqual({ a: 1 });
  });

  it("lê JSON dentro de bloco de código markdown", () => {
    expect(extractJsonObject('Aqui está:\n```json\n{"a": {"b": [1, 2]}}\n```')).toEqual({ a: { b: [1, 2] } });
  });

  it("lê JSON com texto antes e depois", () => {
    expect(extractJsonObject('Claro! {"summary":"ok","creature":{}} Espero que ajude.')).toEqual({ summary: "ok", creature: {} });
  });

  it("devolve null sem objeto JSON válido", () => {
    expect(extractJsonObject("não sei")).toBeNull();
    expect(extractJsonObject("[1, 2]")).toBeNull();
    expect(extractJsonObject('{"a": ')).toBeNull();
  });
});
