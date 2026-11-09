// Tabelas e regras de D&D 5e usadas pela ficha (rótulos em português).
import type { Ability, CreatureType, Habitat, Size, Speed } from "./types";

export const SIZES: { value: Size; label: string; die: number }[] = [
  { value: "tiny", label: "Miúdo", die: 4 },
  { value: "small", label: "Pequeno", die: 6 },
  { value: "medium", label: "Médio", die: 8 },
  { value: "large", label: "Grande", die: 10 },
  { value: "huge", label: "Enorme", die: 12 },
  { value: "gargantuan", label: "Imenso", die: 20 },
];

export const CREATURE_TYPES: { value: CreatureType; label: string }[] = [
  { value: "aberration", label: "Aberração" },
  { value: "beast", label: "Besta" },
  { value: "celestial", label: "Celestial" },
  { value: "construct", label: "Constructo" },
  { value: "dragon", label: "Dragão" },
  { value: "elemental", label: "Elemental" },
  { value: "fey", label: "Fada" },
  { value: "fiend", label: "Ínfero" },
  { value: "giant", label: "Gigante" },
  { value: "ooze", label: "Gosma" },
  { value: "monstrosity", label: "Monstruosidade" },
  { value: "undead", label: "Morto-vivo" },
  { value: "plant", label: "Planta" },
  { value: "humanoid", label: "Humanoide" },
];

export const HABITATS: { value: Habitat; label: string }[] = [
  { value: "arctic", label: "Ártico" },
  { value: "coastal", label: "Litoral" },
  { value: "desert", label: "Deserto" },
  { value: "forest", label: "Floresta" },
  { value: "grassland", label: "Planície" },
  { value: "hill", label: "Colinas" },
  { value: "mountain", label: "Montanha" },
  { value: "swamp", label: "Pântano" },
  { value: "underdark", label: "Subterrâneo" },
  { value: "underwater", label: "Submarino" },
  { value: "urban", label: "Urbano" },
  { value: "planar", label: "Planar" },
];

export const ABILITIES: { value: Ability; short: string; label: string }[] = [
  { value: "str", short: "FOR", label: "Força" },
  { value: "dex", short: "DES", label: "Destreza" },
  { value: "con", short: "CON", label: "Constituição" },
  { value: "int", short: "INT", label: "Inteligência" },
  { value: "wis", short: "SAB", label: "Sabedoria" },
  { value: "cha", short: "CAR", label: "Carisma" },
];

export const SKILLS: { name: string; ability: Ability }[] = [
  { name: "Acrobacia", ability: "dex" },
  { name: "Arcanismo", ability: "int" },
  { name: "Atletismo", ability: "str" },
  { name: "Atuação", ability: "cha" },
  { name: "Enganação", ability: "cha" },
  { name: "Furtividade", ability: "dex" },
  { name: "História", ability: "int" },
  { name: "Intimidação", ability: "cha" },
  { name: "Intuição", ability: "wis" },
  { name: "Investigação", ability: "int" },
  { name: "Lidar com Animais", ability: "wis" },
  { name: "Medicina", ability: "wis" },
  { name: "Natureza", ability: "int" },
  { name: "Percepção", ability: "wis" },
  { name: "Persuasão", ability: "cha" },
  { name: "Prestidigitação", ability: "dex" },
  { name: "Religião", ability: "int" },
  { name: "Sobrevivência", ability: "wis" },
];

export const DAMAGE_TYPES = [
  "ácido", "contundente", "cortante", "elétrico", "fogo", "força", "frio", "necrótico",
  "perfurante", "psíquico", "radiante", "trovejante", "veneno",
  "contundente, cortante e perfurante de ataques não mágicos",
];

export const CONDITIONS = [
  "agarrado", "amedrontado", "atordoado", "caído", "cego", "enfeitiçado", "envenenado",
  "exaustão", "impedido", "incapacitado", "inconsciente", "invisível", "paralisado",
  "petrificado", "surdo",
];

export const ALIGNMENTS = [
  "leal e bom", "neutro e bom", "caótico e bom", "leal e neutro", "neutro",
  "caótico e neutro", "leal e mau", "neutro e mau", "caótico e mau", "sem tendência",
  "qualquer tendência",
];

export const CHALLENGE_RATINGS = [
  "0", "1/8", "1/4", "1/2", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23",
  "24", "25", "26", "27", "28", "29", "30",
];

const XP: Record<string, number> = {
  "0": 10, "1/8": 25, "1/4": 50, "1/2": 100, "1": 200, "2": 450, "3": 700, "4": 1100,
  "5": 1800, "6": 2300, "7": 2900, "8": 3900, "9": 5000, "10": 5900, "11": 7200,
  "12": 8400, "13": 10000, "14": 11500, "15": 13000, "16": 15000, "17": 18000,
  "18": 20000, "19": 22000, "20": 25000, "21": 33000, "22": 41000, "23": 50000,
  "24": 62000, "25": 75000, "26": 90000, "27": 105000, "28": 120000, "29": 135000,
  "30": 155000,
};

/** Referência do Guia do Mestre: estatísticas típicas por ND. */
const CR_GUIDE: Record<string, { ac: number; hp: [number, number]; atk: number; dmg: [number, number]; dc: number }> = {
  "0": { ac: 13, hp: [1, 6], atk: 3, dmg: [0, 1], dc: 13 },
  "1/8": { ac: 13, hp: [7, 35], atk: 3, dmg: [2, 3], dc: 13 },
  "1/4": { ac: 13, hp: [36, 49], atk: 3, dmg: [4, 5], dc: 13 },
  "1/2": { ac: 13, hp: [50, 70], atk: 3, dmg: [6, 8], dc: 13 },
  "1": { ac: 13, hp: [71, 85], atk: 3, dmg: [9, 14], dc: 13 },
  "2": { ac: 13, hp: [86, 100], atk: 3, dmg: [15, 20], dc: 13 },
  "3": { ac: 13, hp: [101, 115], atk: 4, dmg: [21, 26], dc: 13 },
  "4": { ac: 14, hp: [116, 130], atk: 5, dmg: [27, 32], dc: 14 },
  "5": { ac: 15, hp: [131, 145], atk: 6, dmg: [33, 38], dc: 15 },
  "6": { ac: 15, hp: [146, 160], atk: 6, dmg: [39, 44], dc: 15 },
  "7": { ac: 15, hp: [161, 175], atk: 6, dmg: [45, 50], dc: 15 },
  "8": { ac: 16, hp: [176, 190], atk: 7, dmg: [51, 56], dc: 16 },
  "9": { ac: 16, hp: [191, 205], atk: 7, dmg: [57, 62], dc: 16 },
  "10": { ac: 17, hp: [206, 220], atk: 7, dmg: [63, 68], dc: 16 },
  "11": { ac: 17, hp: [221, 235], atk: 8, dmg: [69, 74], dc: 17 },
  "12": { ac: 17, hp: [236, 250], atk: 8, dmg: [75, 80], dc: 17 },
  "13": { ac: 18, hp: [251, 265], atk: 8, dmg: [81, 86], dc: 18 },
  "14": { ac: 18, hp: [266, 280], atk: 8, dmg: [87, 92], dc: 18 },
  "15": { ac: 18, hp: [281, 295], atk: 8, dmg: [93, 98], dc: 18 },
  "16": { ac: 18, hp: [296, 310], atk: 9, dmg: [99, 104], dc: 18 },
  "17": { ac: 19, hp: [311, 325], atk: 10, dmg: [105, 110], dc: 19 },
  "18": { ac: 19, hp: [326, 340], atk: 10, dmg: [111, 116], dc: 19 },
  "19": { ac: 19, hp: [341, 355], atk: 10, dmg: [117, 122], dc: 19 },
  "20": { ac: 19, hp: [356, 400], atk: 10, dmg: [123, 140], dc: 19 },
  "21": { ac: 19, hp: [401, 445], atk: 11, dmg: [141, 158], dc: 20 },
  "22": { ac: 19, hp: [446, 490], atk: 11, dmg: [159, 176], dc: 20 },
  "23": { ac: 19, hp: [491, 535], atk: 11, dmg: [177, 194], dc: 20 },
  "24": { ac: 19, hp: [536, 580], atk: 12, dmg: [195, 212], dc: 21 },
  "25": { ac: 19, hp: [581, 625], atk: 12, dmg: [213, 230], dc: 21 },
  "26": { ac: 19, hp: [626, 670], atk: 12, dmg: [231, 248], dc: 21 },
  "27": { ac: 19, hp: [671, 715], atk: 13, dmg: [249, 266], dc: 22 },
  "28": { ac: 19, hp: [716, 760], atk: 13, dmg: [267, 284], dc: 22 },
  "29": { ac: 19, hp: [761, 805], atk: 13, dmg: [285, 302], dc: 22 },
  "30": { ac: 19, hp: [806, 850], atk: 14, dmg: [303, 320], dc: 23 },
};

export const THREAT_LEVELS = [
  { value: "baixa", label: "Baixa (ND 0–4)", min: 0, max: 4 },
  { value: "moderada", label: "Moderada (ND 5–10)", min: 5, max: 10 },
  { value: "alta", label: "Alta (ND 11–16)", min: 11, max: 16 },
  { value: "mortal", label: "Mortal (ND 17+)", min: 17, max: 30 },
] as const;

export function crToNumber(cr: string): number {
  if (cr === "1/8") return 0.125;
  if (cr === "1/4") return 0.25;
  if (cr === "1/2") return 0.5;
  const n = Number(cr);
  return Number.isFinite(n) ? n : 0;
}

export function proficiencyForCR(cr: string): number {
  const n = crToNumber(cr);
  if (n < 5) return 2;
  return Math.min(9, 2 + Math.ceil((n - 4) / 4));
}

export function xpForCR(cr: string): number {
  return XP[cr] ?? 0;
}

export function crGuide(cr: string) {
  return CR_GUIDE[cr];
}

export function threatLevel(cr: string) {
  const n = crToNumber(cr);
  return THREAT_LEVELS.find((t) => n >= t.min && n <= t.max) ?? THREAT_LEVELS[0];
}

export function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function signed(n: number): string {
  return n >= 0 ? `+${n}` : `−${Math.abs(n)}`;
}

export const sizeLabel = (s: string) => SIZES.find((x) => x.value === s)?.label ?? s;
export const typeLabel = (t: string) => CREATURE_TYPES.find((x) => x.value === t)?.label ?? t;
export const habitatLabel = (h: string) => HABITATS.find((x) => x.value === h)?.label ?? h;
export const abilityShort = (a: string) => ABILITIES.find((x) => x.value === a)?.short ?? a;
export const hitDieForSize = (s: Size) => SIZES.find((x) => x.value === s)?.die ?? 8;

const feetToMeters = (ft: number) => {
  const m = ft * 0.3;
  return Number.isInteger(m) ? `${m}` : m.toFixed(1).replace(".", ",");
};

export function formatSpeed(speed: Speed): string {
  const parts: string[] = [];
  if (speed.walk > 0) parts.push(`${feetToMeters(speed.walk)} m`);
  if (speed.burrow > 0) parts.push(`escavação ${feetToMeters(speed.burrow)} m`);
  if (speed.climb > 0) parts.push(`escalada ${feetToMeters(speed.climb)} m`);
  if (speed.fly > 0) parts.push(`voo ${feetToMeters(speed.fly)} m${speed.hover ? " (pairar)" : ""}`);
  if (speed.swim > 0) parts.push(`natação ${feetToMeters(speed.swim)} m`);
  return parts.length ? parts.join(", ") : "0 m";
}

/** Média de uma expressão de dados de vida como "8d10 + 16". */
export function averageFromDice(expr: string): number | null {
  const m = expr.replace(/\s+/g, "").replace(/−/g, "-").match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!m) return null;
  const count = Number(m[1]);
  const die = Number(m[2]);
  const bonus = m[3] ? Number(m[3]) : 0;
  return Math.max(1, Math.floor(count * ((die + 1) / 2)) + bonus);
}

/** Sugere dados de vida para chegar perto de um total de PV. */
export function suggestHitDice(size: Size, conScore: number, targetHp: number): string {
  const die = hitDieForSize(size);
  const con = abilityMod(conScore);
  const perDie = (die + 1) / 2 + con;
  const count = Math.max(1, Math.round(targetHp / Math.max(1, perDie)));
  const bonus = count * con;
  return `${count}d${die}${bonus ? ` ${bonus > 0 ? "+" : "-"} ${Math.abs(bonus)}` : ""}`;
}
