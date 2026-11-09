// Esquema da ficha de criatura (D&D 5e) usado como saída estruturada da IA,
// normalização defensiva e formatação de contexto para os prompts.
import type { UniverseRow } from "./auth.ts";

export const SIZES = ["tiny", "small", "medium", "large", "huge", "gargantuan"] as const;
export const TYPES = [
  "aberration", "beast", "celestial", "construct", "dragon", "elemental", "fey",
  "fiend", "giant", "ooze", "monstrosity", "undead", "plant", "humanoid",
] as const;
export const CRS = [
  "0", "1/8", "1/4", "1/2", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23",
  "24", "25", "26", "27", "28", "29", "30",
] as const;
export const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"] as const;
export const HABITATS = [
  "arctic", "coastal", "desert", "forest", "grassland", "hill", "mountain",
  "swamp", "underdark", "underwater", "urban", "planar",
] as const;

/** Campos da ficha que a IA pode produzir (espelha a tabela public.creatures). */
export const CREATURE_FIELDS = [
  "name", "size", "creature_type", "subtype", "alignment", "challenge_rating",
  "armor_class", "armor_note", "hit_points", "hit_dice", "speed", "abilities",
  "saving_throws", "skills", "damage_vulnerabilities", "damage_resistances",
  "damage_immunities", "condition_immunities", "senses", "languages", "traits",
  "actions", "bonus_actions", "reactions", "legendary_description",
  "legendary_actions", "special_abilities", "habitat_tags", "appearance",
  "habitat", "behavior", "diet", "origin", "curiosities", "weaknesses",
] as const;

const str = { type: "string" } as const;
const int = { type: "integer" } as const;
const strList = { type: "array", items: str } as const;
const entryList = {
  type: "array",
  items: {
    type: "object",
    properties: { name: str, description: str },
    required: ["name", "description"],
    additionalProperties: false,
  },
} as const;

export const CREATURE_SCHEMA = {
  type: "object",
  properties: {
    name: str,
    size: { type: "string", enum: [...SIZES] },
    creature_type: { type: "string", enum: [...TYPES] },
    subtype: str,
    alignment: str,
    challenge_rating: { type: "string", enum: [...CRS] },
    armor_class: int,
    armor_note: str,
    hit_points: int,
    hit_dice: str,
    speed: {
      type: "object",
      properties: { walk: int, climb: int, swim: int, fly: int, burrow: int, hover: { type: "boolean" } },
      required: ["walk", "climb", "swim", "fly", "burrow", "hover"],
      additionalProperties: false,
    },
    abilities: {
      type: "object",
      properties: Object.fromEntries(ABILITIES.map((a) => [a, int])),
      required: [...ABILITIES],
      additionalProperties: false,
    },
    saving_throws: {
      type: "array",
      items: {
        type: "object",
        properties: { ability: { type: "string", enum: [...ABILITIES] }, bonus: int },
        required: ["ability", "bonus"],
        additionalProperties: false,
      },
    },
    skills: {
      type: "array",
      items: {
        type: "object",
        properties: { name: str, bonus: int },
        required: ["name", "bonus"],
        additionalProperties: false,
      },
    },
    damage_vulnerabilities: strList,
    damage_resistances: strList,
    damage_immunities: strList,
    condition_immunities: strList,
    senses: str,
    languages: str,
    traits: entryList,
    actions: entryList,
    bonus_actions: entryList,
    reactions: entryList,
    legendary_description: str,
    legendary_actions: entryList,
    special_abilities: entryList,
    habitat_tags: { type: "array", items: { type: "string", enum: [...HABITATS] } },
    appearance: str,
    habitat: str,
    behavior: str,
    diet: str,
    origin: str,
    curiosities: str,
    weaknesses: str,
  },
  required: [...CREATURE_FIELDS],
  additionalProperties: false,
} as const;

export type CreatureDraft = Record<(typeof CREATURE_FIELDS)[number], unknown>;

// ---------------------------------------------------------------------
// Normalização: a saída estruturada já respeita o esquema, mas o cliente
// também envia fichas editadas à mão. Tudo passa por aqui antes de virar prompt.
// ---------------------------------------------------------------------
const asStr = (v: unknown, max = 8000) => (typeof v === "string" ? v.slice(0, max) : "");
const asInt = (v: unknown, fallback: number, min: number, max: number) => {
  const n = typeof v === "number" ? v : Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
};
const asStrList = (v: unknown) =>
  Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()).map((x) => (x as string).slice(0, 200)).slice(0, 40) : [];
const asEntries = (v: unknown) =>
  Array.isArray(v)
    ? v
        .filter((e) => e && typeof e === "object")
        .map((e) => ({ name: asStr((e as Record<string, unknown>).name, 200), description: asStr((e as Record<string, unknown>).description, 4000) }))
        .filter((e) => e.name || e.description)
        .slice(0, 30)
    : [];
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback;

export function normalizeCreature(raw: unknown): CreatureDraft {
  const c = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const speed = (c.speed ?? {}) as Record<string, unknown>;
  const abilities = (c.abilities ?? {}) as Record<string, unknown>;
  return {
    name: asStr(c.name, 120) || "Criatura sem nome",
    size: oneOf(c.size, SIZES, "medium"),
    creature_type: oneOf(c.creature_type, TYPES, "monstrosity"),
    subtype: asStr(c.subtype, 120),
    alignment: asStr(c.alignment, 120),
    challenge_rating: oneOf(c.challenge_rating, CRS, "1"),
    armor_class: asInt(c.armor_class, 10, 1, 30),
    armor_note: asStr(c.armor_note, 120),
    hit_points: asInt(c.hit_points, 1, 1, 2000),
    hit_dice: asStr(c.hit_dice, 60),
    speed: {
      walk: asInt(speed.walk, 30, 0, 300),
      climb: asInt(speed.climb, 0, 0, 300),
      swim: asInt(speed.swim, 0, 0, 300),
      fly: asInt(speed.fly, 0, 0, 300),
      burrow: asInt(speed.burrow, 0, 0, 300),
      hover: speed.hover === true,
    },
    abilities: Object.fromEntries(ABILITIES.map((a) => [a, asInt(abilities[a], 10, 1, 30)])),
    saving_throws: Array.isArray(c.saving_throws)
      ? (c.saving_throws as Record<string, unknown>[])
          .filter((s) => ABILITIES.includes(s?.ability as never))
          .map((s) => ({ ability: s.ability, bonus: asInt(s.bonus, 0, -10, 30) }))
      : [],
    skills: Array.isArray(c.skills)
      ? (c.skills as Record<string, unknown>[])
          .filter((s) => typeof s?.name === "string" && s.name)
          .map((s) => ({ name: asStr(s.name, 60), bonus: asInt(s.bonus, 0, -10, 30) }))
          .slice(0, 20)
      : [],
    damage_vulnerabilities: asStrList(c.damage_vulnerabilities),
    damage_resistances: asStrList(c.damage_resistances),
    damage_immunities: asStrList(c.damage_immunities),
    condition_immunities: asStrList(c.condition_immunities),
    senses: asStr(c.senses, 400),
    languages: asStr(c.languages, 400),
    traits: asEntries(c.traits),
    actions: asEntries(c.actions),
    bonus_actions: asEntries(c.bonus_actions),
    reactions: asEntries(c.reactions),
    legendary_description: asStr(c.legendary_description, 2000),
    legendary_actions: asEntries(c.legendary_actions),
    special_abilities: asEntries(c.special_abilities),
    habitat_tags: asStrList(c.habitat_tags).filter((h) => HABITATS.includes(h as never)),
    appearance: asStr(c.appearance),
    habitat: asStr(c.habitat),
    behavior: asStr(c.behavior),
    diet: asStr(c.diet),
    origin: asStr(c.origin),
    curiosities: asStr(c.curiosities),
    weaknesses: asStr(c.weaknesses),
  };
}

// ---------------------------------------------------------------------
// Contexto para os prompts
// ---------------------------------------------------------------------
const FANTASY_LEVEL: Record<string, string> = {
  baixo: "baixo (magia rara e sutil, mundo próximo do real)",
  medio: "médio (magia presente, mas não onipresente)",
  alto: "alto (magia abundante, criaturas e fenômenos extraordinários)",
};

export function describeUniverse(u: UniverseRow): string {
  const lines = [
    `Nome: ${u.name}`,
    u.genre && `Gênero/temática: ${u.genre}`,
    u.description && `Descrição geral: ${u.description}`,
    u.setting && `Ambientação: ${u.setting}`,
    u.era && `Época/período: ${u.era}`,
    `Nível de fantasia: ${FANTASY_LEVEL[u.fantasy_level] ?? u.fantasy_level}`,
    u.rules && `Regras e características particulares: ${u.rules}`,
    u.art_style && `Estilo visual da campanha: ${u.art_style}`,
  ].filter(Boolean);
  return lines.join("\n");
}

/**
 * Referência de equilíbrio do Guia do Mestre (Monster Statistics by Challenge Rating).
 * ND final ≈ média do ND defensivo (PV/CA) e do ND ofensivo (dano por rodada/ataque ou CD).
 */
export const CR_TABLE = `ND | BP | CA | PV | Bônus de ataque | Dano/rodada | CD
0 | +2 | ≤13 | 1–6 | ≤+3 | 0–1 | ≤13
1/8 | +2 | 13 | 7–35 | +3 | 2–3 | 13
1/4 | +2 | 13 | 36–49 | +3 | 4–5 | 13
1/2 | +2 | 13 | 50–70 | +3 | 6–8 | 13
1 | +2 | 13 | 71–85 | +3 | 9–14 | 13
2 | +2 | 13 | 86–100 | +3 | 15–20 | 13
3 | +2 | 13 | 101–115 | +4 | 21–26 | 13
4 | +2 | 14 | 116–130 | +5 | 27–32 | 14
5 | +3 | 15 | 131–145 | +6 | 33–38 | 15
6 | +3 | 15 | 146–160 | +6 | 39–44 | 15
7 | +3 | 15 | 161–175 | +6 | 45–50 | 15
8 | +3 | 16 | 176–190 | +7 | 51–56 | 16
9 | +4 | 16 | 191–205 | +7 | 57–62 | 16
10 | +4 | 17 | 206–220 | +7 | 63–68 | 16
11 | +4 | 17 | 221–235 | +8 | 69–74 | 17
12 | +4 | 17 | 236–250 | +8 | 75–80 | 17
13 | +5 | 18 | 251–265 | +8 | 81–86 | 18
14 | +5 | 18 | 266–280 | +8 | 87–92 | 18
15 | +5 | 18 | 281–295 | +8 | 93–98 | 18
16 | +5 | 18 | 296–310 | +9 | 99–104 | 18
17 | +6 | 19 | 311–325 | +10 | 105–110 | 19
18 | +6 | 19 | 326–340 | +10 | 111–116 | 19
19 | +6 | 19 | 341–355 | +10 | 117–122 | 19
20 | +6 | 19 | 356–400 | +10 | 123–140 | 19
21 | +7 | 19 | 401–445 | +11 | 141–158 | 20
22 | +7 | 19 | 446–490 | +11 | 159–176 | 20
23 | +7 | 19 | 491–535 | +11 | 177–194 | 20
24 | +7 | 19 | 536–580 | +12 | 195–212 | 21
25 | +8 | 19 | 581–625 | +12 | 213–230 | 21
26 | +8 | 19 | 626–670 | +12 | 231–248 | 21
27 | +8 | 19 | 671–715 | +13 | 249–266 | 22
28 | +8 | 19 | 716–760 | +13 | 267–284 | 22
29 | +9 | 19 | 761–805 | +13 | 285–302 | 22
30 | +9 | 19 | 806–850 | +14 | 303–320 | 23`;
