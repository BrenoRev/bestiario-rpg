// Editor completo da ficha D&D 5e. Componente controlado: recebe a ficha e
// devolve a ficha inteira atualizada a cada alteração.
import { ArrowDown, ArrowUp, Calculator, Plus, Scale, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";
import { useId, useRef, useState } from "react";
import {
  ABILITIES, ALIGNMENTS, CHALLENGE_RATINGS, CONDITIONS, CREATURE_TYPES, DAMAGE_TYPES, HABITATS, SIZES, SKILLS,
  abilityMod, averageFromDice, crGuide, proficiencyForCR, signed, suggestHitDice, xpForCR,
} from "../../lib/dnd";
import type { Ability, CreatureDraft, Entry, Speed } from "../../lib/types";
import type { GlossaryKey } from "../../lib/glossary";
import { HelpTip } from "../help/HelpTip";
import { Button, cx, FieldLabel, IconButton, NumberInput, Select, TextArea, TextInput } from "../ui";

type Patch = <K extends keyof CreatureDraft>(key: K, value: CreatureDraft[K]) => void;

function Section({ id, title, description, children, tone = "mech", help }: { id: string; title: string; description?: string; children: ReactNode; tone?: "mech" | "story"; help?: GlossaryKey }) {
  return (
    <section id={id} className={cx("paper-surface parchment-form scroll-mt-40 border border-line", tone === "story" && "prose-sheet")}>
      <div className="mb-4">
        <div className="flex items-center gap-1.5">
          <h2 className="section-title">{title}</h2>
          {help && <HelpTip term={help} />}
        </div>
        {description && <p className="form-description mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------- Listas de traços/ações
function EntryListEditor({ label, items, onChange, addLabel, help }: { label: string; items: Entry[]; onChange: (v: Entry[]) => void; addLabel: string; help?: GlossaryKey }) {
  const update = (i: number, patch: Partial<Entry>) => onChange(items.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <span className="label mb-0">{label}</span>
          {help && <HelpTip term={help} />}
        </span>
        <span className="text-xs text-muted">{items.length || "nenhum"}</span>
      </div>
      <div className="space-y-2.5">
        {items.map((e, i) => (
          <div key={i} className="rounded-lg border border-line bg-parchment/60 p-3">
            <div className="flex items-center gap-2">
              <input
                className="field h-9 min-w-0 font-semibold"
                placeholder="Nome (ex.: Mordida, Faro Aguçado)"
                value={e.name}
                onChange={(ev) => update(i, { name: ev.target.value })}
                aria-label={`${label}: nome ${i + 1}`}
              />
              <IconButton label="Mover para cima" onClick={() => move(i, -1)} disabled={i === 0} className="size-8">
                <ArrowUp className="size-4" />
              </IconButton>
              <IconButton label="Mover para baixo" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="size-8">
                <ArrowDown className="size-4" />
              </IconButton>
              <IconButton label="Remover" onClick={() => onChange(items.filter((_, j) => j !== i))} className="size-8 hover:text-wine">
                <Trash2 className="size-4" />
              </IconButton>
            </div>
            <textarea
              className="field mt-2 min-h-20 resize-y text-[0.88rem] leading-relaxed"
              placeholder="Descrição. Ex.: Ataque Corpo-a-Corpo com Arma: +5 para atingir, alcance 1,5 m, um alvo. Acerto: 10 (2d6 + 3) de dano perfurante."
              value={e.description}
              onChange={(ev) => update(i, { description: ev.target.value })}
              aria-label={`${label}: descrição ${i + 1}`}
            />
          </div>
        ))}
      </div>
      <Button size="sm" variant="ghost" className="mt-2" icon={<Plus className="size-4" />} onClick={() => onChange([...items, { name: "", description: "" }])}>
        {addLabel}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------- Tags
function TagInput({ label, values, onChange, suggestions, help }: { label: string; values: string[]; onChange: (v: string[]) => void; suggestions: string[]; help?: GlossaryKey }) {
  const [draft, setDraft] = useState("");
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const add = (raw: string) => {
    const v = raw.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div>
      <FieldLabel label={label} help={help} />
      <div className="field flex min-h-10 cursor-text flex-wrap items-center gap-1.5 py-1.5" onClick={() => inputRef.current?.focus()}>
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-md border border-line bg-sand/70 px-2 py-0.5 text-xs">
            {v}
            <button
              type="button"
              aria-label={`Remover ${v}`}
              onClick={(e) => {
                e.stopPropagation();
                onChange(values.filter((x) => x !== v));
              }}
              className="-my-1 -mr-1.5 inline-flex size-7 items-center justify-center rounded text-muted hover:text-wine cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          list={listId}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={() => draft && add(draft)}
          placeholder={values.length ? "" : "Digite e pressione Enter"}
          className="min-h-7 min-w-32 flex-1 bg-transparent text-sm outline-none"
          aria-label={label}
        />
        <datalist id={listId}>
          {suggestions.filter((s) => !values.includes(s)).map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Formulário
export function CreatureForm({ value, onChange }: { value: CreatureDraft; onChange: (next: CreatureDraft) => void }) {
  const c = value;
  const set: Patch = (key, v) => onChange({ ...c, [key]: v });
  const setSpeed = (key: keyof Speed, v: number | boolean) => set("speed", { ...c.speed, [key]: v });
  const setAbility = (key: Ability, v: number) => set("abilities", { ...c.abilities, [key]: Math.max(1, Math.min(30, v || 1)) });
  const guide = crGuide(c.challenge_rating);
  const avgFromDice = averageFromDice(c.hit_dice);

  const toggleSave = (ability: Ability) => {
    const has = c.saving_throws.some((s) => s.ability === ability);
    set(
      "saving_throws",
      has
        ? c.saving_throws.filter((s) => s.ability !== ability)
        : [...c.saving_throws, { ability, bonus: abilityMod(c.abilities[ability]) + c.proficiency_bonus }].sort(
            (a, b) => ABILITIES.findIndex((x) => x.value === a.ability) - ABILITIES.findIndex((x) => x.value === b.ability),
          ),
    );
  };

  const recalcSkills = () =>
    set(
      "skills",
      c.skills.map((s) => {
        const def = SKILLS.find((k) => k.name === s.name);
        return def ? { ...s, bonus: abilityMod(c.abilities[def.ability]) + c.proficiency_bonus } : s;
      }),
    );

  return (
    <div className="space-y-5">
      <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Capítulos da ficha">
        {[
          ["identidade", "Identidade"], ["atributos", "Atributos"], ["combate", "Combate"],
          ["defesas", "Defesas e perícias"], ["habilidades", "Habilidades"], ["cronica", "Crônica"],
        ].map(([id, label], i) => (
          <a key={id} href={`#ficha-${id}`} className="flex min-h-11 items-center gap-2 rounded-xl border border-line bg-cream px-3 py-2 text-xs text-ink-soft hover:border-gold/50 hover:text-gold">
            <span className="text-gold" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span> {label}
          </a>
        ))}
      </nav>
      {/* ------------------------------------------------ Informações gerais */}
      <Section id="ficha-identidade" title="Informações gerais">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextInput label="Nome da criatura" required value={c.name} onChange={(e) => set("name", e.target.value)} wrapperClassName="sm:col-span-2 lg:col-span-3" maxLength={120} placeholder="Ex.: Espreitador das Raízes" />
          <Select label="Tamanho" help="tamanho" value={c.size} onChange={(e) => set("size", e.target.value as CreatureDraft["size"])}>
            {SIZES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
          <Select label="Tipo de criatura" help="tipo" value={c.creature_type} onChange={(e) => set("creature_type", e.target.value as CreatureDraft["creature_type"])}>
            {CREATURE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          <TextInput label="Subtipo / etiquetas" help="subtipo" value={c.subtype} onChange={(e) => set("subtype", e.target.value)} placeholder="Ex.: metamorfo" />
          <div>
            <TextInput label="Tendência" help="tendencia" list="alignments" value={c.alignment} onChange={(e) => set("alignment", e.target.value)} placeholder="Ex.: neutro e mau" />
            <datalist id="alignments">
              {ALIGNMENTS.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </div>
          <Select
            label="Nível de Desafio (ND)"
            help="nd"
            value={c.challenge_rating}
            onChange={(e) => onChange({ ...c, challenge_rating: e.target.value, proficiency_bonus: proficiencyForCR(e.target.value) })}
            hint={`${xpForCR(c.challenge_rating).toLocaleString("pt-BR")} XP`}
          >
            {CHALLENGE_RATINGS.map((cr) => (
              <option key={cr} value={cr}>
                ND {cr}
              </option>
            ))}
          </Select>
          <NumberInput label="Bônus de Proficiência" help="bonusProficiencia" value={c.proficiency_bonus} onValue={(n) => set("proficiency_bonus", n)} min={2} max={9} hint="Ajustado automaticamente pelo ND." />
        </div>
        {guide && (
          <div className="mt-4 flex gap-3 rounded-lg border border-line bg-parchment px-4 py-3 text-xs text-ink-soft">
            <Scale className="mt-0.5 size-4 shrink-0 text-wine" />
            <p>
              <span className="font-semibold text-ink">Referência para ND {c.challenge_rating} (Guia do Mestre):</span> CA ≈ {guide.ac} · PV {guide.hp[0]}–{guide.hp[1]} · ataque {signed(guide.atk)} · dano/rodada {guide.dmg[0]}–{guide.dmg[1]} · CD {guide.dc}. O ND final é a média do ND defensivo e ofensivo; criaturas oficiais costumam ter menos PV e compensar com resistências ou dano.
            </p>
          </div>
        )}
      </Section>

      {/* ------------------------------------------------ Atributos */}
      <Section id="ficha-atributos" title="Atributos" help="atributos" description="Notas de 1 a 30; 10 é a média humana. O número embaixo é o modificador usado nas jogadas.">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {ABILITIES.map((a) => (
            <div key={a.value} className="form-choice rounded-lg border border-line bg-parchment/70 p-2.5 text-center">
              <label htmlFor={`ab-${a.value}`} className="block text-xs font-bold tracking-wider text-wine" title={a.label}>
                {a.short}
              </label>
              <input
                id={`ab-${a.value}`}
                type="number"
                min={1}
                max={30}
                value={c.abilities[a.value]}
                onChange={(e) => setAbility(a.value, Number(e.target.value))}
                className="field ability-input mt-1 text-center font-semibold tabular-nums"
              />
              <div className="mt-1 text-xs text-muted tabular-nums">{signed(abilityMod(c.abilities[a.value]))}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------ Combate */}
      <Section id="ficha-combate" title="Estatísticas de combate">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumberInput label="Classe de Armadura (CA)" help="ca" value={c.armor_class} onValue={(n) => set("armor_class", n)} min={1} max={30} />
          <TextInput label="Origem da CA" value={c.armor_note} onChange={(e) => set("armor_note", e.target.value)} placeholder="Ex.: armadura natural" />
          <NumberInput label="Pontos de Vida (PV)" help="pv" value={c.hit_points} onValue={(n) => set("hit_points", n)} min={1} />
          <TextInput
            label="Dados de Vida"
            help="dadosVida"
            value={c.hit_dice}
            onChange={(e) => set("hit_dice", e.target.value)}
            placeholder="Ex.: 8d10 + 16"
            hint={avgFromDice != null ? `Média: ${avgFromDice} PV` : "Formato: 8d10 + 16"}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" icon={<Calculator className="size-4" />} disabled={avgFromDice == null} onClick={() => avgFromDice != null && set("hit_points", avgFromDice)}>
            PV pela média dos dados
          </Button>
          <Button size="sm" variant="ghost" icon={<Calculator className="size-4" />} onClick={() => set("hit_dice", suggestHitDice(c.size, c.abilities.con, c.hit_points))}>
            Dados de vida pelos PV
          </Button>
        </div>

        <div className="mt-5">
          <FieldLabel label="Deslocamento (em pés; 30 pés = 9 m)" help="deslocamento" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {(
              [
                ["walk", "Caminhada"],
                ["climb", "Escalada"],
                ["swim", "Natação"],
                ["fly", "Voo"],
                ["burrow", "Escavação"],
              ] as const
            ).map(([key, label]) => (
              <NumberInput key={key} label={label} value={c.speed[key]} onValue={(n) => setSpeed(key, Math.max(0, n))} min={0} step={5} />
            ))}
          </div>
          <label className="mt-2 inline-flex min-h-9 cursor-pointer items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" className="accent-wine" checked={c.speed.hover} onChange={(e) => setSpeed("hover", e.target.checked)} />
            Pode pairar
          </label>
        </div>
      </Section>

      {/* ------------------------------------------------ Resistências */}
      <Section id="ficha-defesas" title="Resistências e vulnerabilidades" description="Testes de resistência, perícias, defesas, sentidos e idiomas.">
        <div>
          <FieldLabel label="Testes de resistência (marque os pontos fortes)" help="testesResistencia" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {ABILITIES.map((a) => {
              const save = c.saving_throws.find((s) => s.ability === a.value);
              return (
                <div key={a.value} className={cx("form-choice rounded-lg border", save ? "border-wine-line bg-wine-soft/60" : "border-line bg-parchment/60")}>
                  <label className="flex min-h-10 cursor-pointer items-center gap-2 px-2 text-sm font-semibold">
                    <input type="checkbox" className="accent-wine" checked={!!save} onChange={() => toggleSave(a.value)} />
                    {a.short}
                  </label>
                  {save && (
                    <input
                      type="number"
                      aria-label={`Bônus de resistência de ${a.label}`}
                      value={save.bonus}
                      onChange={(e) =>
                        set(
                          "saving_throws",
                          c.saving_throws.map((s) => (s.ability === a.value ? { ...s, bonus: Number(e.target.value) } : s)),
                        )
                      }
                      className="field save-bonus mx-2 mb-2 w-[calc(100%-1rem)] tabular-nums"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="label mb-0">Perícias</span>
              <HelpTip term="pericias" />
            </span>
            {c.skills.length > 0 && (
              <Button size="sm" variant="ghost" icon={<Calculator className="size-4" />} onClick={recalcSkills}>
                Recalcular bônus
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {c.skills.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  list="skills-list"
                  className="field h-9"
                  value={s.name}
                  aria-label="Perícia"
                  onChange={(e) => set("skills", c.skills.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                />
                <input
                  type="number"
                  aria-label={`Bônus de ${s.name}`}
                  className="field h-9 w-24 tabular-nums"
                  value={s.bonus}
                  onChange={(e) => set("skills", c.skills.map((x, j) => (j === i ? { ...x, bonus: Number(e.target.value) } : x)))}
                />
                <IconButton label="Remover perícia" onClick={() => set("skills", c.skills.filter((_, j) => j !== i))} className="hover:text-wine">
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
            ))}
            <datalist id="skills-list">
              {SKILLS.map((s) => (
                <option key={s.name} value={s.name} />
              ))}
            </datalist>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="mt-2"
            icon={<Plus className="size-4" />}
            onClick={() => {
              const next = SKILLS.find((k) => !c.skills.some((s) => s.name === k.name)) ?? SKILLS[0];
              set("skills", [...c.skills, { name: next.name, bonus: abilityMod(c.abilities[next.ability]) + c.proficiency_bonus }]);
            }}
          >
            Adicionar perícia
          </Button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TagInput help="danos" label="Vulnerabilidades a dano" values={c.damage_vulnerabilities} onChange={(v) => set("damage_vulnerabilities", v)} suggestions={DAMAGE_TYPES} />
          <TagInput help="danos" label="Resistências a dano" values={c.damage_resistances} onChange={(v) => set("damage_resistances", v)} suggestions={DAMAGE_TYPES} />
          <TagInput help="danos" label="Imunidades a dano" values={c.damage_immunities} onChange={(v) => set("damage_immunities", v)} suggestions={DAMAGE_TYPES} />
          <TagInput help="condicoes" label="Imunidades a condições" values={c.condition_immunities} onChange={(v) => set("condition_immunities", v)} suggestions={CONDITIONS} />
          <TextInput label="Sentidos" help="sentidos" value={c.senses} onChange={(e) => set("senses", e.target.value)} placeholder="Ex.: visão no escuro 18 m, Percepção passiva 14" />
          <TextInput label="Idiomas" help="idiomas" value={c.languages} onChange={(e) => set("languages", e.target.value)} placeholder="Ex.: Comum, Silvestre; telepatia 18 m" />
        </div>
      </Section>

      {/* ------------------------------------------------ Características */}
      <Section id="ficha-habilidades" title="Características especiais" description="Traços passivos, ações e habilidades no formato dos livros de D&D.">
        <div className="space-y-6">
          <EntryListEditor help="tracos" label="Traços passivos" items={c.traits} onChange={(v) => set("traits", v)} addLabel="Adicionar traço" />
          <EntryListEditor help="acoes" label="Ações" items={c.actions} onChange={(v) => set("actions", v)} addLabel="Adicionar ação" />
          <EntryListEditor help="acoesBonus" label="Ações bônus" items={c.bonus_actions} onChange={(v) => set("bonus_actions", v)} addLabel="Adicionar ação bônus" />
          <EntryListEditor help="reacoes" label="Reações" items={c.reactions} onChange={(v) => set("reactions", v)} addLabel="Adicionar reação" />
          <div className="rounded-lg border border-dashed border-line-strong p-4">
            <TextArea
              label="Ações lendárias (só para criaturas muito poderosas)"
              help="acoesLendarias"
              value={c.legendary_description}
              onChange={(e) => set("legendary_description", e.target.value)}
              className="min-h-16"
              placeholder="Ex.: A criatura pode realizar 3 ações lendárias, escolhidas entre as opções abaixo…"
            />
            <div className="mt-3">
              <EntryListEditor label="Opções de ação lendária" items={c.legendary_actions} onChange={(v) => set("legendary_actions", v)} addLabel="Adicionar ação lendária" />
            </div>
          </div>
          <EntryListEditor help="habilidadesEspeciais" label="Habilidades especiais" items={c.special_abilities} onChange={(v) => set("special_abilities", v)} addLabel="Adicionar habilidade especial" />
        </div>
      </Section>

      {/* ------------------------------------------------ Narrativa */}
      <Section id="ficha-cronica" title="Descrição narrativa" tone="story" description="A crônica da criatura: o que os jogadores veem, ouvem e descobrem.">
        <div className="mb-4">
          <FieldLabel label="Ambientes" help="ambientes" />
          <div className="flex flex-wrap gap-1.5">
            {HABITATS.map((h) => {
              const on = c.habitat_tags.includes(h.value);
              return (
                <button
                  key={h.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set("habitat_tags", on ? c.habitat_tags.filter((x) => x !== h.value) : [...c.habitat_tags, h.value])}
                  className={cx(
                    "min-h-9 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    on ? "border-moss bg-moss-soft text-moss" : "border-line bg-cream text-muted hover:text-ink",
                  )}
                >
                  {h.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextArea label="Aparência física" value={c.appearance} onChange={(e) => set("appearance", e.target.value)} wrapperClassName="md:col-span-2" hint="Seja concreto: formas, cores e texturas. É a base para gerar a ilustração." />
          <TextArea label="Habitat" value={c.habitat} onChange={(e) => set("habitat", e.target.value)} />
          <TextArea label="Comportamento" value={c.behavior} onChange={(e) => set("behavior", e.target.value)} />
          <TextArea label="Alimentação" value={c.diet} onChange={(e) => set("diet", e.target.value)} />
          <TextArea label="Fraquezas" value={c.weaknesses} onChange={(e) => set("weaknesses", e.target.value)} />
          <TextArea label="Origem e história" value={c.origin} onChange={(e) => set("origin", e.target.value)} />
          <TextArea label="Curiosidades" value={c.curiosities} onChange={(e) => set("curiosities", e.target.value)} />
          <TextArea label="Notas do mestre (privadas, a IA não altera)" value={c.notes} onChange={(e) => set("notes", e.target.value)} wrapperClassName="md:col-span-2" />
        </div>
      </Section>
    </div>
  );
}
