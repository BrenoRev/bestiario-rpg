import { describe, expect, it } from "vitest";
import { abilityMod, averageFromDice, crToNumber, formatSpeed, proficiencyForCR, signed, suggestHitDice, threatLevel, xpForCR } from "./dnd";

describe("regras de D&D 5e", () => {
  it("calcula modificadores de atributo", () => {
    expect(abilityMod(1)).toBe(-5);
    expect(abilityMod(9)).toBe(-1);
    expect(abilityMod(10)).toBe(0);
    expect(abilityMod(11)).toBe(0);
    expect(abilityMod(18)).toBe(4);
    expect(abilityMod(30)).toBe(10);
  });

  it("deriva o bônus de proficiência do ND", () => {
    const cases: [string, number][] = [
      ["0", 2], ["1/8", 2], ["4", 2], ["5", 3], ["8", 3], ["9", 4], ["12", 4],
      ["13", 5], ["16", 5], ["17", 6], ["20", 6], ["21", 7], ["24", 7], ["25", 8], ["28", 8], ["29", 9], ["30", 9],
    ];
    for (const [cr, pb] of cases) expect(proficiencyForCR(cr), `ND ${cr}`).toBe(pb);
  });

  it("converte ND fracionário e XP", () => {
    expect(crToNumber("1/8")).toBe(0.125);
    expect(crToNumber("1/2")).toBe(0.5);
    expect(crToNumber("17")).toBe(17);
    expect(xpForCR("1/4")).toBe(50);
    expect(xpForCR("10")).toBe(5900);
  });

  it("classifica o nível de ameaça", () => {
    expect(threatLevel("1/2").value).toBe("baixa");
    expect(threatLevel("5").value).toBe("moderada");
    expect(threatLevel("16").value).toBe("alta");
    expect(threatLevel("21").value).toBe("mortal");
  });

  it("calcula a média dos dados de vida", () => {
    expect(averageFromDice("8d10 + 16")).toBe(60);
    expect(averageFromDice("2d8+2")).toBe(11);
    expect(averageFromDice("3d6 − 3")).toBe(7);
    expect(averageFromDice("texto")).toBeNull();
  });

  it("sugere dados de vida que a média consegue ler de volta", () => {
    const dice = suggestHitDice("large", 14, 60);
    expect(dice).toBe("8d10 + 16");
    expect(averageFromDice(dice)).toBe(60);
    expect(averageFromDice(suggestHitDice("small", 6, 7))).not.toBeNull();
  });

  it("formata deslocamento em metros", () => {
    expect(formatSpeed({ walk: 30, climb: 0, swim: 0, fly: 60, burrow: 0, hover: true })).toBe("9 m, voo 18 m (pairar)");
    expect(formatSpeed({ walk: 25, climb: 0, swim: 0, fly: 0, burrow: 0, hover: false })).toBe("7,5 m");
    expect(formatSpeed({ walk: 0, climb: 0, swim: 0, fly: 0, burrow: 0, hover: false })).toBe("0 m");
  });

  it("formata bônus com sinal", () => {
    expect(signed(3)).toBe("+3");
    expect(signed(0)).toBe("+0");
    expect(signed(-2)).toBe("−2");
  });
});
