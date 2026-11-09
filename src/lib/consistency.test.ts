// Garante que a ficha fala a mesma língua no frontend, nas Edge Functions e no banco.
// Se um enum mudar em um lugar e não nos outros, este teste falha.
import { describe, expect, it } from "vitest";
import * as edge from "../../supabase/functions/_shared/creature.ts";
import { CHALLENGE_RATINGS, CREATURE_TYPES, HABITATS, SIZES } from "./dnd";

const migrations = import.meta.glob("../../supabase/migrations/*.sql", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const sql = Object.keys(migrations).sort().map((k) => migrations[k]).join("\n");

/** Valores do último `check (<coluna> in (...))` encontrado nas migrações. */
function sqlEnum(column: string): string[] {
  const matches = [...sql.matchAll(new RegExp(`check \\(${column} in \\(([^)]*)\\)\\)`, "g"))];
  const last = matches.at(-1);
  if (!last) throw new Error(`check de ${column} não encontrado nas migrações`);
  return [...last[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

describe("enums da ficha", () => {
  it("tamanhos iguais no frontend, nas funções e no banco", () => {
    const front = SIZES.map((s) => s.value);
    expect([...edge.SIZES]).toEqual(front);
    expect(sqlEnum("size")).toEqual(front);
  });

  it("tipos de criatura iguais no frontend, nas funções e no banco", () => {
    const front = CREATURE_TYPES.map((t) => t.value);
    expect([...edge.TYPES]).toEqual(front);
    expect(sqlEnum("creature_type")).toEqual(front);
  });

  it("níveis de desafio iguais e aceitos pelo check do banco", () => {
    expect([...edge.CRS]).toEqual(CHALLENGE_RATINGS);
    const pattern = sql.match(/challenge_rating ~ '([^']+)'/)?.[1];
    expect(pattern).toBeDefined();
    const re = new RegExp(pattern!);
    for (const cr of CHALLENGE_RATINGS) expect(re.test(cr), `ND ${cr}`).toBe(true);
    expect(re.test("31")).toBe(false);
  });

  it("ambientes iguais no frontend e nas funções", () => {
    expect([...edge.HABITATS]).toEqual(HABITATS.map((h) => h.value));
  });
});

describe("normalizeCreature (saída da IA no servidor)", () => {
  it("corrige valores fora do esquema e limita números", () => {
    const c = edge.normalizeCreature({
      name: "",
      size: "colossal",
      challenge_rating: "99",
      armor_class: 99,
      hit_points: -5,
      abilities: { str: 50, dex: "x" },
      habitat_tags: ["forest", "lua"],
      traits: [{ name: "Faro", description: "Vantagem." }, "lixo"],
    });
    expect(c.name).toBe("Criatura sem nome");
    expect(c.size).toBe("medium");
    expect(c.challenge_rating).toBe("1");
    expect(c.armor_class).toBe(30);
    expect(c.hit_points).toBe(1);
    expect(c.abilities).toMatchObject({ str: 30, dex: 10 });
    expect(c.habitat_tags).toEqual(["forest"]);
    expect(c.traits).toEqual([{ name: "Faro", description: "Vantagem." }]);
  });

  it("o esquema estrito lista todos os campos como obrigatórios", () => {
    expect([...edge.CREATURE_SCHEMA.required].sort()).toEqual(Object.keys(edge.CREATURE_SCHEMA.properties).sort());
    expect(edge.CREATURE_SCHEMA.additionalProperties).toBe(false);
  });
});

describe("buildImagePrompt", () => {
  const creature = edge.normalizeCreature({ name: "Lobo de Cinza", size: "large", creature_type: "beast", appearance: "Pelagem cinzenta e olhos de brasa." });
  const universe = { genre: "Fantasia sombria", setting: "", era: "", art_style: "" };

  it("descreve a criatura com o estilo padrão de gravura", () => {
    const p = edge.buildImagePrompt(creature, universe, "", false);
    expect(p).toContain("Lobo de Cinza");
    expect(p).toContain("Pelagem cinzenta e olhos de brasa.");
    expect(p).toContain("antique bestiary engraving");
    expect(p).toContain("No text");
  });

  it("usa o estilo do universo e as instruções na edição", () => {
    const p = edge.buildImagePrompt(creature, { ...universe, art_style: "xilogravura" }, "de perfil, à noite", true);
    expect(p).toContain("Edit the provided illustration");
    expect(p).toContain("xilogravura");
    expect(p).toContain("de perfil, à noite");
  });
});
