// Escolha do provedor de texto das Edge Functions e adaptação do esquema para a Anthropic.
import { describe, expect, it } from "vitest";
import { CREATURE_SCHEMA } from "../../supabase/functions/_shared/creature.ts";
import { pickTextProvider, stripForAnthropic } from "../../supabase/functions/_shared/provider.ts";

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

describe("stripForAnthropic", () => {
  it("remove restrições não aceitas em qualquer profundidade e mantém o resto", () => {
    const schema = {
      type: "object",
      properties: {
        alternatives: { type: "array", minItems: 1, maxItems: 3, items: { type: "object", properties: { n: { type: "integer", minimum: 0 } } } },
        size: { type: "string", enum: ["a", "b"] },
      },
      required: ["alternatives", "size"],
      additionalProperties: false,
    };
    const out = stripForAnthropic(schema);
    expect(JSON.stringify(out)).not.toMatch(/minItems|maxItems|minimum/);
    expect(out.properties.size.enum).toEqual(["a", "b"]);
    expect(out.required).toEqual(["alternatives", "size"]);
    expect(out.additionalProperties).toBe(false);
  });

  it("não altera o esquema da ficha, que já é compatível", () => {
    expect(stripForAnthropic(CREATURE_SCHEMA)).toEqual(CREATURE_SCHEMA);
  });
});
