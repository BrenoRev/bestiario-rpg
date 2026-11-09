export type FantasyLevel = "baixo" | "medio" | "alto";

export interface Universe {
  id: string;
  user_id: string;
  name: string;
  description: string;
  genre: string;
  setting: string;
  era: string;
  fantasy_level: FantasyLevel;
  rules: string;
  art_style: string;
  cover_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface UniverseWithCount extends Universe {
  creature_count: number;
}

export type UniverseInput = Pick<
  Universe,
  "name" | "description" | "genre" | "setting" | "era" | "fantasy_level" | "rules" | "art_style" | "cover_path"
>;

export type Size = "tiny" | "small" | "medium" | "large" | "huge" | "gargantuan";
export type CreatureType =
  | "aberration" | "beast" | "celestial" | "construct" | "dragon" | "elemental" | "fey"
  | "fiend" | "giant" | "ooze" | "monstrosity" | "undead" | "plant" | "humanoid";
export type Ability = "str" | "dex" | "con" | "int" | "wis" | "cha";
export type Habitat =
  | "arctic" | "coastal" | "desert" | "forest" | "grassland" | "hill" | "mountain"
  | "swamp" | "underdark" | "underwater" | "urban" | "planar";

export interface Entry {
  name: string;
  description: string;
}

export interface Speed {
  walk: number;
  climb: number;
  swim: number;
  fly: number;
  burrow: number;
  hover: boolean;
}

export type Abilities = Record<Ability, number>;

export interface SavingThrow {
  ability: Ability;
  bonus: number;
}

export interface Skill {
  name: string;
  bonus: number;
}

/** Conteúdo editável da ficha (sem id, dono ou datas). */
export interface CreatureDraft {
  name: string;
  size: Size;
  creature_type: CreatureType;
  subtype: string;
  alignment: string;
  challenge_rating: string;
  proficiency_bonus: number;
  armor_class: number;
  armor_note: string;
  hit_points: number;
  hit_dice: string;
  speed: Speed;
  abilities: Abilities;
  saving_throws: SavingThrow[];
  skills: Skill[];
  damage_vulnerabilities: string[];
  damage_resistances: string[];
  damage_immunities: string[];
  condition_immunities: string[];
  senses: string;
  languages: string;
  traits: Entry[];
  actions: Entry[];
  bonus_actions: Entry[];
  reactions: Entry[];
  legendary_description: string;
  legendary_actions: Entry[];
  special_abilities: Entry[];
  habitat_tags: Habitat[];
  appearance: string;
  habitat: string;
  behavior: string;
  diet: string;
  origin: string;
  curiosities: string;
  weaknesses: string;
  notes: string;
  image_path: string | null;
}

export interface Creature extends CreatureDraft {
  id: string;
  user_id: string;
  universe_id: string;
  cr_value: number;
  created_at: string;
  updated_at: string;
}

export type CreatureSummary = Pick<
  Creature,
  "id" | "universe_id" | "name" | "size" | "creature_type" | "challenge_rating" | "cr_value" | "habitat_tags" | "image_path" | "updated_at"
>;

export interface CreatureImage {
  id: string;
  universe_id?: string;
  creature_id: string | null;
  path: string;
  prompt: string;
  source: "ai" | "upload";
  created_at: string;
}

export type Creativity = "convencional" | "equilibrado" | "inusitado";
export type Detail = "resumido" | "padrao" | "detalhado";

export interface Preferences {
  creativity?: Creativity;
  detail?: Detail;
  alternatives?: number;
  useUniverseContext?: boolean;
}

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  preferences: Preferences;
}

export interface AIAlternative {
  concept: string;
  design_notes: string;
  creature: CreatureDraft;
}
