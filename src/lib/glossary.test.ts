import { describe, expect, it } from "vitest";
import { GLOSSARY, GLOSSARY_GROUPS, searchGlossary, type GlossaryEntry } from "./glossary";

const entries = Object.entries(GLOSSARY) as [string, GlossaryEntry][];

describe("glossário", () => {
  it("todo termo tem nome, explicação e um grupo conhecido", () => {
    for (const [key, e] of entries) {
      expect(e.term.trim(), key).not.toBe("");
      expect(e.short.trim().length, key).toBeGreaterThan(20);
      expect(GLOSSARY_GROUPS, key).toContain(e.group);
    }
  });

  it("não repete nomes de termos", () => {
    const terms = entries.map(([, e]) => e.term.toLowerCase());
    expect(new Set(terms).size).toBe(terms.length);
  });

  it("busca sem diferenciar acentos e maiúsculas, também na explicação", () => {
    expect(searchGlossary("classe de armadura").map(([k]) => k)).toContain("ca");
    expect(searchGlossary("LENDARIAS").map(([k]) => k)).toContain("acoesLendarias");
    expect(searchGlossary("dobro de dano").map(([k]) => k)).toContain("danos");
  });

  it("busca vazia devolve tudo; sem resultado devolve lista vazia", () => {
    expect(searchGlossary("  ")).toHaveLength(entries.length);
    expect(searchGlossary("xyzzy")).toEqual([]);
  });
});
