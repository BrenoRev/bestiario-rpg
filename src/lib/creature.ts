// Operações sobre fichas: ficha vazia, normalização, diferença entre versões.
import {
  ABILITIES, CHALLENGE_RATINGS, CREATURE_TYPES, HABITATS, SIZES,
  abilityMod, abilityShort, formatSpeed, habitatLabel, proficiencyForCR, signed, sizeLabel, typeLabel,
} from "./dnd";
import type { Abilities, Creature, CreatureDraft, Entry, Habitat, Speed } from "./types";

export function emptyCreature(): CreatureDraft {
  return {
    name: "",
    size: "medium",
    creature_type: "monstrosity",
    subtype: "",
    alignment: "",
    challenge_rating: "1",
    proficiency_bonus: 2,
    armor_class: 12,
    armor_note: "",
    hit_points: 11,
    hit_dice: "2d8 + 2",
    speed: { walk: 30, climb: 0, swim: 0, fly: 0, burrow: 0, hover: false },
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    saving_throws: [],
    skills: [],
    damage_vulnerabilities: [],
    damage_resistances: [],
    damage_immunities: [],
    condition_immunities: [],
    senses: "Percepção passiva 10",
    languages: "—",
    traits: [],
    actions: [],
    bonus_actions: [],
    reactions: [],
    legendary_description: "",
    legendary_actions: [],
    special_abilities: [],
    habitat_tags: [],
    appearance: "",
    habitat: "",
    behavior: "",
    diet: "",
    origin: "",
    curiosities: "",
    weaknesses: "",
    notes: "",
    image_path: null,
  };
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const int = (v: unknown, fallback: number) => {
  const n = typeof v === "number" ? v : Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? Math.round(n) : fallback;
};
const strList = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const entries = (v: unknown): Entry[] =>
  Array.isArray(v)
    ? v
        .filter((e) => e && typeof e === "object")
        .map((e) => ({ name: str((e as Entry).name), description: str((e as Entry).description) }))
    : [];

/** Converte qualquer objeto (IA, banco, rascunho salvo) numa ficha válida. */
export function normalizeDraft(raw: unknown): CreatureDraft {
  const base = emptyCreature();
  const c = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const speed = (c.speed ?? {}) as Partial<Speed>;
  const abilities = (c.abilities ?? {}) as Partial<Abilities>;
  const cr = CHALLENGE_RATINGS.includes(str(c.challenge_rating)) ? str(c.challenge_rating) : base.challenge_rating;
  return {
    name: str(c.name),
    size: SIZES.some((s) => s.value === c.size) ? (c.size as CreatureDraft["size"]) : base.size,
    creature_type: CREATURE_TYPES.some((t) => t.value === c.creature_type)
      ? (c.creature_type as CreatureDraft["creature_type"])
      : base.creature_type,
    subtype: str(c.subtype),
    alignment: str(c.alignment),
    challenge_rating: cr,
    proficiency_bonus: c.proficiency_bonus != null ? int(c.proficiency_bonus, proficiencyForCR(cr)) : proficiencyForCR(cr),
    armor_class: int(c.armor_class, base.armor_class),
    armor_note: str(c.armor_note),
    hit_points: int(c.hit_points, base.hit_points),
    hit_dice: str(c.hit_dice),
    speed: {
      walk: int(speed.walk, 0),
      climb: int(speed.climb, 0),
      swim: int(speed.swim, 0),
      fly: int(speed.fly, 0),
      burrow: int(speed.burrow, 0),
      hover: speed.hover === true,
    },
    abilities: Object.fromEntries(ABILITIES.map((a) => [a.value, int(abilities[a.value], 10)])) as Abilities,
    saving_throws: Array.isArray(c.saving_throws)
      ? (c.saving_throws as { ability: string; bonus: unknown }[])
          .filter((s) => ABILITIES.some((a) => a.value === s?.ability))
          .map((s) => ({ ability: s.ability as CreatureDraft["saving_throws"][number]["ability"], bonus: int(s.bonus, 0) }))
      : [],
    skills: Array.isArray(c.skills)
      ? (c.skills as { name: unknown; bonus: unknown }[])
          .filter((s) => typeof s?.name === "string")
          .map((s) => ({ name: str(s.name), bonus: int(s.bonus, 0) }))
      : [],
    damage_vulnerabilities: strList(c.damage_vulnerabilities),
    damage_resistances: strList(c.damage_resistances),
    damage_immunities: strList(c.damage_immunities),
    condition_immunities: strList(c.condition_immunities),
    senses: str(c.senses),
    languages: str(c.languages),
    traits: entries(c.traits),
    actions: entries(c.actions),
    bonus_actions: entries(c.bonus_actions),
    reactions: entries(c.reactions),
    legendary_description: str(c.legendary_description),
    legendary_actions: entries(c.legendary_actions),
    special_abilities: entries(c.special_abilities),
    habitat_tags: strList(c.habitat_tags).filter((h): h is Habitat => HABITATS.some((x) => x.value === h)),
    appearance: str(c.appearance),
    habitat: str(c.habitat),
    behavior: str(c.behavior),
    diet: str(c.diet),
    origin: str(c.origin),
    curiosities: str(c.curiosities),
    weaknesses: str(c.weaknesses),
    notes: str(c.notes),
    image_path: typeof c.image_path === "string" ? c.image_path : null,
  };
}

/** Extrai só o conteúdo editável de uma criatura salva. */
export function toDraft(creature: Creature): CreatureDraft {
  return normalizeDraft(creature);
}

// ---------------------------------------------------------------------
// Diferença entre fichas (revisão das sugestões da IA)
// ---------------------------------------------------------------------
export const FIELD_LABELS: Partial<Record<keyof CreatureDraft, string>> = {
  name: "Nome",
  size: "Tamanho",
  creature_type: "Tipo",
  subtype: "Subtipo",
  alignment: "Tendência",
  challenge_rating: "Nível de Desafio",
  proficiency_bonus: "Bônus de Proficiência",
  armor_class: "Classe de Armadura",
  armor_note: "Origem da CA",
  hit_points: "Pontos de Vida",
  hit_dice: "Dados de Vida",
  speed: "Deslocamento",
  abilities: "Atributos",
  saving_throws: "Testes de resistência",
  skills: "Perícias",
  damage_vulnerabilities: "Vulnerabilidades a dano",
  damage_resistances: "Resistências a dano",
  damage_immunities: "Imunidades a dano",
  condition_immunities: "Imunidades a condições",
  senses: "Sentidos",
  languages: "Idiomas",
  traits: "Traços",
  actions: "Ações",
  bonus_actions: "Ações bônus",
  reactions: "Reações",
  legendary_description: "Descrição das ações lendárias",
  legendary_actions: "Ações lendárias",
  special_abilities: "Habilidades especiais",
  habitat_tags: "Ambientes",
  appearance: "Aparência física",
  habitat: "Habitat",
  behavior: "Comportamento",
  diet: "Alimentação",
  origin: "Origem e história",
  curiosities: "Curiosidades",
  weaknesses: "Fraquezas",
};

/** Campos que a IA pode alterar (notas e imagem ficam sempre com o usuário). */
export const AI_FIELDS = Object.keys(FIELD_LABELS) as (keyof CreatureDraft)[];

const stable = (v: unknown) => JSON.stringify(v);

export function diffCreatures(current: CreatureDraft, proposal: CreatureDraft): (keyof CreatureDraft)[] {
  return AI_FIELDS.filter((key) => stable(current[key]) !== stable(proposal[key]));
}

export function applyFields(
  base: CreatureDraft,
  proposal: CreatureDraft,
  keys: (keyof CreatureDraft)[],
): CreatureDraft {
  const next = { ...base } as Record<keyof CreatureDraft, unknown>;
  for (const key of keys) next[key] = proposal[key];
  const result = next as unknown as CreatureDraft;
  // O bônus de proficiência acompanha o ND quando o ND muda.
  if (keys.includes("challenge_rating") && !keys.includes("proficiency_bonus")) {
    result.proficiency_bonus = proficiencyForCR(result.challenge_rating);
  }
  return result;
}

/** Representação textual de um campo, usada na revisão de alterações. */
export function formatField(key: keyof CreatureDraft, value: unknown): string {
  if (value == null) return "—";
  switch (key) {
    case "size":
      return sizeLabel(String(value));
    case "creature_type":
      return typeLabel(String(value));
    case "speed":
      return formatSpeed(value as Speed);
    case "abilities": {
      const a = value as Abilities;
      return ABILITIES.map((x) => `${x.short} ${a[x.value]} (${signed(abilityMod(a[x.value]))})`).join(" · ");
    }
    case "saving_throws":
      return (value as { ability: string; bonus: number }[]).map((s) => `${abilityShort(s.ability)} ${signed(s.bonus)}`).join(", ") || "—";
    case "skills":
      return (value as { name: string; bonus: number }[]).map((s) => `${s.name} ${signed(s.bonus)}`).join(", ") || "—";
    case "habitat_tags":
      return (value as string[]).map(habitatLabel).join(", ") || "—";
    default:
      break;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    if (typeof value[0] === "string") return value.join(", ");
    return (value as Entry[]).map((e) => `${e.name}. ${e.description}`).join("\n\n");
  }
  const s = String(value);
  return s.trim() ? s : "—";
}

/** Tipos de gênero feminino em português (o tamanho concorda com o tipo: "Fada Média"). */
const FEMININE_TYPES = new Set(["aberration", "beast", "fey", "ooze", "monstrosity", "plant"]);
const FEMININE_SIZES: Record<string, string> = {
  tiny: "Miúda", small: "Pequena", medium: "Média", large: "Grande", huge: "Enorme", gargantuan: "Imensa",
};

export function creatureSubtitle(c: Pick<CreatureDraft, "size" | "creature_type" | "subtype" | "alignment">): string {
  const type = typeLabel(c.creature_type).toLowerCase();
  const size = FEMININE_TYPES.has(c.creature_type) ? FEMININE_SIZES[c.size] ?? sizeLabel(c.size) : sizeLabel(c.size);
  const sub = c.subtype ? ` (${c.subtype})` : "";
  const align = c.alignment ? `, ${c.alignment}` : "";
  return `${type} ${size.toLowerCase()}${sub}${align}`;
}
