// Ponto único para chamadas de texto: escolhe o provedor (OpenAI por padrão,
// Anthropic temporária) e repassa a chamada. As funções só importam `callJson`.
import { callAnthropicJson } from "./anthropic.ts";
import { callOpenAIJson } from "./openai.ts";
import { type JsonCallOptions, pickTextProvider, type TextProvider } from "./provider.ts";

export function textProvider(): TextProvider {
  return pickTextProvider({
    forced: Deno.env.get("AI_TEXT_PROVIDER"),
    hasOpenAI: !!Deno.env.get("OPENAI_API_KEY"),
    hasAnthropic: !!Deno.env.get("ANTHROPIC_API_KEY"),
  });
}

export function callJson<T>(opts: JsonCallOptions): Promise<T> {
  return textProvider() === "anthropic" ? callAnthropicJson<T>(opts) : callOpenAIJson<T>(opts);
}
