// Ficha de monstro no formato de D&D 5e (parte mecânica) e a crônica
// (parte narrativa), visualmente separadas.
import { ABILITIES, abilityMod, abilityShort, formatSpeed, habitatLabel, signed, xpForCR } from "../../lib/dnd";
import { creatureSubtitle } from "../../lib/creature";
import type { CreatureDraft, Entry } from "../../lib/types";
import { Badge, cx } from "../ui";

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="text-[0.9rem] leading-relaxed">
      <span className="font-semibold text-wine">{label}</span> {children}
    </p>
  );
}

function Entries({ items }: { items: Entry[] }) {
  return (
    <div className="space-y-2">
      {items.map((e, i) => (
        <p key={i} className="text-[0.9rem] leading-relaxed whitespace-pre-line">
          <span className="font-semibold italic text-ink">{e.name}.</span> {e.description}
        </p>
      ))}
    </div>
  );
}

const nonEmpty = (list: string[]) => list.filter((x) => x.trim()).join(", ");

/**
 * Ficha mecânica. Ao montar, os blocos entram em sequência e as linhas são riscadas
 * (`.sheet-reveal`); dê uma `key` nova ao trocar de criatura para repetir o efeito.
 * `transitionName` liga o nome à transição de página (só onde houver uma ficha na tela).
 */
export function StatBlock({ creature, compact, transitionName }: { creature: CreatureDraft; compact?: boolean; transitionName?: string }) {
  const c = creature;
  const saves = c.saving_throws.map((s) => `${abilityShort(s.ability)} ${signed(s.bonus)}`).join(", ");
  const skills = c.skills.map((s) => `${s.name} ${signed(s.bonus)}`).join(", ");
  const hasLegendary = c.legendary_actions.length > 0;

  return (
    <article className={cx("sheet-reveal", !compact && "card ornate px-5 py-5 sm:px-7 sm:py-6")} aria-label="Ficha de estatísticas">
      <header>
        <h2 className="w-fit text-[2rem] leading-none font-bold text-wine" style={{ viewTransitionName: transitionName }}>
          {c.name || "Criatura sem nome"}
        </h2>
        <p className="mt-1.5 text-sm italic text-ink-soft first-letter:uppercase">{creatureSubtitle(c)}</p>
      </header>

      <hr className="stat-rule" />
      <div className="space-y-0.5">
        <Line label="Classe de Armadura">
          {c.armor_class}
          {c.armor_note ? ` (${c.armor_note})` : ""}
        </Line>
        <Line label="Pontos de Vida">
          {c.hit_points}
          {c.hit_dice ? ` (${c.hit_dice})` : ""}
        </Line>
        <Line label="Deslocamento">{formatSpeed(c.speed)}</Line>
      </div>

      <hr className="stat-rule" />
      <div className="grid grid-cols-3 gap-y-2 text-center sm:grid-cols-6">
        {ABILITIES.map((a) => (
          <div key={a.value}>
            <div className="text-xs font-bold tracking-wider text-wine" title={a.label}>
              {a.short}
            </div>
            <div className="text-[0.9rem] tabular-nums">
              {c.abilities[a.value]} ({signed(abilityMod(c.abilities[a.value]))})
            </div>
          </div>
        ))}
      </div>

      <hr className="stat-rule" />
      <div className="space-y-0.5">
        {saves && <Line label="Testes de Resistência">{saves}</Line>}
        {skills && <Line label="Perícias">{skills}</Line>}
        {nonEmpty(c.damage_vulnerabilities) && <Line label="Vulnerabilidades a Dano">{nonEmpty(c.damage_vulnerabilities)}</Line>}
        {nonEmpty(c.damage_resistances) && <Line label="Resistências a Dano">{nonEmpty(c.damage_resistances)}</Line>}
        {nonEmpty(c.damage_immunities) && <Line label="Imunidades a Dano">{nonEmpty(c.damage_immunities)}</Line>}
        {nonEmpty(c.condition_immunities) && <Line label="Imunidades a Condições">{nonEmpty(c.condition_immunities)}</Line>}
        <Line label="Sentidos">{c.senses || "—"}</Line>
        <Line label="Idiomas">{c.languages || "—"}</Line>
        <div className="flex flex-wrap gap-x-6">
          <Line label="Nível de Desafio">
            {c.challenge_rating} ({xpForCR(c.challenge_rating).toLocaleString("pt-BR")} XP)
          </Line>
          <Line label="Bônus de Proficiência">{signed(c.proficiency_bonus)}</Line>
        </div>
      </div>

      {c.traits.length > 0 && (
        <>
          <hr className="stat-rule" />
          <Entries items={c.traits} />
        </>
      )}

      {c.actions.length > 0 && (
        <>
          <h3 className="stat-heading">Ações</h3>
          <Entries items={c.actions} />
        </>
      )}
      {c.bonus_actions.length > 0 && (
        <>
          <h3 className="stat-heading">Ações Bônus</h3>
          <Entries items={c.bonus_actions} />
        </>
      )}
      {c.reactions.length > 0 && (
        <>
          <h3 className="stat-heading">Reações</h3>
          <Entries items={c.reactions} />
        </>
      )}
      {hasLegendary && (
        <>
          <h3 className="stat-heading">Ações Lendárias</h3>
          {c.legendary_description && <p className="mb-2 text-[0.9rem] leading-relaxed">{c.legendary_description}</p>}
          <Entries items={c.legendary_actions} />
        </>
      )}
      {c.special_abilities.length > 0 && (
        <>
          <h3 className="stat-heading">Habilidades Especiais</h3>
          <Entries items={c.special_abilities} />
        </>
      )}
    </article>
  );
}

const NARRATIVE: { key: keyof CreatureDraft; label: string }[] = [
  { key: "appearance", label: "Aparência física" },
  { key: "habitat", label: "Habitat" },
  { key: "behavior", label: "Comportamento" },
  { key: "diet", label: "Alimentação" },
  { key: "origin", label: "Origem e história" },
  { key: "weaknesses", label: "Fraquezas" },
  { key: "curiosities", label: "Curiosidades" },
];

export function Narrative({ creature, showNotes = true }: { creature: CreatureDraft; showNotes?: boolean }) {
  const filled = NARRATIVE.filter((n) => String(creature[n.key] ?? "").trim());
  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-parchment px-5 py-5 sm:px-7" aria-label="Descrição narrativa">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="section-title">Crônica</h2>
        {creature.habitat_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {creature.habitat_tags.map((h) => (
              <Badge key={h} tone="moss">
                {habitatLabel(h)}
              </Badge>
            ))}
          </div>
        )}
      </div>
      {filled.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Nenhuma descrição narrativa ainda.</p>
      ) : (
        <div className="stagger mt-3 space-y-4">
          {filled.map((n, i) => (
            <div key={n.key}>
              <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted">{n.label}</h3>
              <p className={cx("mt-1 text-[0.92rem] leading-relaxed whitespace-pre-line text-ink", i === 0 && "drop-cap")}>{String(creature[n.key])}</p>
            </div>
          ))}
        </div>
      )}
      {showNotes && creature.notes.trim() && (
        <div className="mt-5 rounded-lg border border-dashed border-line-strong bg-cream/70 px-4 py-3">
          <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted">Notas do mestre</h3>
          <p className="mt-1 text-sm leading-relaxed whitespace-pre-line">{creature.notes}</p>
        </div>
      )}
    </section>
  );
}

/** Ficha em branco enquanto a IA escreve (mesmo formato do `StatBlock`). */
export function StatBlockSkeleton() {
  return (
    <div className="card ornate px-5 py-5 sm:px-7 sm:py-6" aria-hidden>
      <div className="skeleton h-8 w-1/2 rounded" />
      <div className="skeleton mt-2 h-3 w-1/3 rounded" />
      <hr className="stat-rule opacity-40" />
      <div className="space-y-2">
        <div className="skeleton h-3 w-2/5 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
      <hr className="stat-rule opacity-40" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton h-9 rounded" />
        ))}
      </div>
      <hr className="stat-rule opacity-40" />
      <div className="space-y-2">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-11/12 rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
      </div>
    </div>
  );
}
