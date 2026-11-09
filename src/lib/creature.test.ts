import { describe, expect, it } from "vitest";
import { applyFields, diffCreatures, emptyCreature, formatField, normalizeDraft } from "./creature";

describe("normalizeDraft", () => {
  it("preenche uma ficha válida a partir de dados incompletos ou inválidos", () => {
    const d = normalizeDraft({ name: "Lobo", size: "colossal", challenge_rating: "99", abilities: { str: "14" }, habitat_tags: ["forest", "lua"] });
    expect(d.name).toBe("Lobo");
    expect(d.size).toBe("medium");
    expect(d.challenge_rating).toBe("1");
    expect(d.abilities.str).toBe(14);
    expect(d.abilities.dex).toBe(10);
    expect(d.habitat_tags).toEqual(["forest"]);
  });

  it("calcula o bônus de proficiência pelo ND quando ele não vem", () => {
    expect(normalizeDraft({ challenge_rating: "13" }).proficiency_bonus).toBe(5);
    expect(normalizeDraft({ challenge_rating: "13", proficiency_bonus: 4 }).proficiency_bonus).toBe(4);
  });
});

describe("revisão de alterações da IA", () => {
  const base = { ...emptyCreature(), name: "Espreitador", appearance: "Pele de casca.", notes: "segredo do mestre" };

  it("lista só os campos que mudaram", () => {
    const proposal = { ...base, appearance: "Pele de casca e musgo.", armor_class: 15 };
    expect(diffCreatures(base, proposal).sort()).toEqual(["appearance", "armor_class"]);
  });

  it("ignora notas e imagem, que pertencem ao mestre", () => {
    const proposal = { ...base, notes: "outra coisa", image_path: "x.webp" };
    expect(diffCreatures(base, proposal)).toEqual([]);
  });

  it("aplica apenas os campos escolhidos", () => {
    const proposal = { ...base, appearance: "Nova", armor_class: 18, behavior: "Caça à noite" };
    const next = applyFields(base, proposal, ["behavior"]);
    expect(next.behavior).toBe("Caça à noite");
    expect(next.appearance).toBe(base.appearance);
    expect(next.armor_class).toBe(base.armor_class);
    expect(next.notes).toBe("segredo do mestre");
  });

  it("acompanha o bônus de proficiência quando o ND é aplicado", () => {
    const proposal = { ...base, challenge_rating: "9" };
    expect(applyFields(base, proposal, ["challenge_rating"]).proficiency_bonus).toBe(4);
  });

  it("formata campos estruturados para leitura", () => {
    expect(formatField("saving_throws", [{ ability: "dex", bonus: 5 }])).toBe("DES +5");
    expect(formatField("traits", [{ name: "Faro", description: "Vantagem em Percepção." }])).toBe("Faro. Vantagem em Percepção.");
    expect(formatField("damage_resistances", [])).toBe("—");
  });
});

describe("creatureSubtitle", () => {
  it("concorda o tamanho com o gênero do tipo", async () => {
    const { creatureSubtitle } = await import("./creature");
    expect(creatureSubtitle({ size: "medium", creature_type: "fey", subtype: "metamorfo", alignment: "neutro e mau" })).toBe("fada média (metamorfo), neutro e mau");
    expect(creatureSubtitle({ size: "huge", creature_type: "dragon", subtype: "", alignment: "" })).toBe("dragão enorme");
    expect(creatureSubtitle({ size: "tiny", creature_type: "beast", subtype: "", alignment: "" })).toBe("besta miúda");
  });
});
