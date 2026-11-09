// Assistência de IA dentro da ficha. Toda sugestão chega como PROPOSTA:
// o mestre vê campo a campo o que mudaria e escolhe o que aplicar.
import { ArrowLeft, BookPlus, Check, PenLine, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { generateVariations, modifyCreature } from "../../lib/ai";
import { AI_FIELDS, applyFields, diffCreatures, FIELD_LABELS, formatField } from "../../lib/creature";
import type { AIAlternative, CreatureDraft, Creativity, Detail } from "../../lib/types";
import { useProfile } from "../../hooks/queries";
import { Modal } from "../Modal";
import { errorMessage, useToast } from "../Toast";
import { D20 } from "../brand";
import { ArcaneWait, Button, cx, Segmented, Select, TextArea, Toggle } from "../ui";
import { Narrative, StatBlock } from "./StatBlock";

// ---------------------------------------------------------------- Revisão de diferenças
export function DiffReview({
  current,
  proposal,
  summary,
  selected,
  onToggle,
}: {
  current: CreatureDraft;
  proposal: CreatureDraft;
  summary?: string;
  selected: Set<keyof CreatureDraft>;
  onToggle: (key: keyof CreatureDraft) => void;
}) {
  const changed = useMemo(() => diffCreatures(current, proposal), [current, proposal]);
  // Campos que o mestre acabou de marcar piscam em verde (os marcados de início, não).
  const [marked, setMarked] = useState<Set<keyof CreatureDraft>>(new Set());
  const toggle = (key: keyof CreatureDraft) => {
    if (!selected.has(key)) setMarked((m) => new Set(m).add(key));
    onToggle(key);
  };
  return (
    <div className="space-y-4">
      {summary && (
        <div className="flex gap-3 rounded-lg border border-wine-line bg-wine-soft/60 px-4 py-3 text-sm text-ink">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-wine" />
          <p className="leading-relaxed">{summary}</p>
        </div>
      )}
      {changed.length === 0 ? (
        <p className="rounded-lg border border-line bg-parchment px-4 py-6 text-center text-sm text-muted">
          A IA não propôs alterações na ficha. Tente detalhar mais o pedido.
        </p>
      ) : (
        <>
          <p className="text-xs text-muted">
            {changed.length} {changed.length === 1 ? "campo alterado" : "campos alterados"}. Desmarque o que não quiser aplicar; o restante da ficha fica como está.
          </p>
          <ul className="space-y-3">
            {changed.map((key) => {
              const on = selected.has(key);
              return (
                <li
                  key={key}
                  className={cx(
                    "rounded-lg border transition-[opacity,border-color,background-color] duration-300",
                    on ? "border-wine-line bg-cream" : "border-line bg-parchment/50 opacity-70",
                    on && marked.has(key) && "animate-flash",
                  )}
                >
                  <label className="flex cursor-pointer items-center gap-2.5 border-b border-line/70 px-4 py-2.5">
                    <input type="checkbox" className="accent-wine size-4" checked={on} onChange={() => toggle(key)} />
                    <span className="font-display text-lg font-semibold text-ink">{FIELD_LABELS[key] ?? key}</span>
                  </label>
                  <div className="grid gap-3 px-4 py-3 md:grid-cols-2">
                    <div>
                      <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">Atual</div>
                      <p className="whitespace-pre-line text-[0.85rem] leading-relaxed text-ink-soft line-through decoration-wine/30">{formatField(key, current[key])}</p>
                    </div>
                    <div>
                      <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-wine">Proposta</div>
                      <p className="whitespace-pre-line text-[0.85rem] leading-relaxed text-ink">{formatField(key, proposal[key])}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Pedidos rápidos
const PRESETS = [
  { label: "Sugerir novas habilidades", prompt: "Sugira 2 ou 3 novas habilidades (traços, ações ou reações) interessantes e coerentes com o conceito, mantendo o Nível de Desafio equilibrado." },
  { label: "Criar possíveis fraquezas", prompt: "Crie fraquezas exploráveis pelos jogadores, tanto narrativas quanto mecânicas (vulnerabilidades, comportamentos previsíveis, condições que a afetam), descritas no campo de fraquezas e, se fizer sentido, refletidas nas estatísticas." },
  { label: "Comportamento mais ameaçador", prompt: "Torne o comportamento da criatura mais ameaçador e memorável: táticas mais inteligentes, sinais inquietantes da sua presença, forma de caçar. Ajuste as mecânicas só se for necessário para refletir isso." },
  { label: "Adaptar ao universo atual", prompt: "Adapte a criatura ao universo atual: ajuste origem, aparência, habitat, idiomas e habilidades para que pertençam naturalmente a este mundo, à sua época e ao seu nível de fantasia." },
  { label: "Mais coerente com a ambientação", prompt: "Revise a ficha procurando incoerências com a ambientação do universo e corrija apenas o que destoa." },
  { label: "Equilibrar o Nível de Desafio", prompt: "Revise as estatísticas para que fiquem equilibradas com o Nível de Desafio atual, seguindo as diretrizes do Guia do Mestre (PV, CA, bônus de ataque, dano por rodada e CDs). Explique os ajustes." },
];

const FOCUS: { value: string; label: string }[] = [
  { value: "", label: "Qualquer parte da ficha" },
  ...AI_FIELDS.map((k) => ({ value: k, label: FIELD_LABELS[k] ?? k })),
];

export const CREATIVITY_OPTIONS: { value: Creativity; label: string; hint: string }[] = [
  { value: "convencional", label: "Convencional", hint: "Arquétipos clássicos" },
  { value: "equilibrado", label: "Equilibrado", hint: "Base clássica com um toque original" },
  { value: "inusitado", label: "Inusitado", hint: "Surpreendente e pouco comum" },
];

export const DETAIL_OPTIONS: { value: Detail; label: string }[] = [
  { value: "resumido", label: "Resumido" },
  { value: "padrao", label: "Padrão" },
  { value: "detalhado", label: "Detalhado" },
];

interface AIAssistModalProps {
  open: boolean;
  onClose: () => void;
  creature: CreatureDraft;
  universeId: string;
  /** Recebe a ficha com as alterações escolhidas. Pode salvar no banco ou só atualizar o formulário. */
  onApply: (next: CreatureDraft) => Promise<void> | void;
  initialFocus?: keyof CreatureDraft | "";
  title?: string;
}

export function AIAssistModal({ open, onClose, creature, universeId, onApply, initialFocus = "", title }: AIAssistModalProps) {
  const toast = useToast();
  const { data: profile } = useProfile();
  const [instruction, setInstruction] = useState("");
  const [focus, setFocus] = useState<string>(initialFocus);
  const [useContext, setUseContext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<{ summary: string; creature: CreatureDraft } | null>(null);
  const [selected, setSelected] = useState<Set<keyof CreatureDraft>>(new Set());

  useEffect(() => {
    if (open) {
      setResult(null);
      setInstruction("");
      setFocus(initialFocus);
      setUseContext(profile?.preferences?.useUniverseContext ?? true);
    }
    // Reinicia só ao abrir: um refetch do perfil não pode apagar a sugestão em revisão.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const run = async (text = instruction) => {
    const ask = text.trim();
    if (!ask) {
      toast.error("Escreva o que você quer que a IA faça ou escolha um pedido rápido.");
      return;
    }
    const focusLabel = focus ? FIELD_LABELS[focus as keyof CreatureDraft] : null;
    const finalInstruction = focusLabel ? `Altere somente "${focusLabel}" (e o que depender diretamente disso). ${ask}` : ask;
    setLoading(true);
    try {
      const res = await modifyCreature({
        universeId,
        useUniverseContext: useContext,
        detail: profile?.preferences?.detail,
        creature,
        instruction: finalInstruction,
      });
      setResult(res);
      setSelected(new Set(diffCreatures(creature, res.creature)));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const apply = async () => {
    if (!result) return;
    setApplying(true);
    try {
      await onApply(applyFields(creature, result.creature, [...selected]));
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  const toggle = (key: keyof CreatureDraft) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={loading || applying}
      size="lg"
      title={title ?? (result ? "Revise as sugestões" : "Assistente de IA")}
      description={result ? "Nada foi alterado ainda. Escolha o que aplicar à ficha." : `Peça ajustes para “${creature.name || "esta criatura"}”. A IA preserva o que você não pediu para mudar.`}
      footer={
        result ? (
          <>
            <Button icon={<ArrowLeft className="size-4" />} onClick={() => setResult(null)} disabled={applying}>
              Ajustar pedido
            </Button>
            <Button icon={<RefreshCw className="size-4" />} busyIcon={<D20 className="size-4 animate-roll" />} onClick={() => run()} loading={loading} disabled={applying}>
              Outra sugestão
            </Button>
            <Button variant="primary" icon={<Check className="size-4" />} onClick={apply} loading={applying} disabled={selected.size === 0 || loading}>
              Aplicar {selected.size > 0 ? `(${selected.size})` : ""}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="primary" icon={<Wand2 className="size-4" />} busyIcon={<D20 className="size-4 animate-roll" />} onClick={() => run()} loading={loading}>
              {loading ? "Pensando…" : "Pedir sugestão"}
            </Button>
          </>
        )
      }
    >
      {result ? (
        <DiffReview current={creature} proposal={result.creature} summary={result.summary} selected={selected} onToggle={toggle} />
      ) : (
        <div className="space-y-4">
          <div>
            <span className="label">Pedidos rápidos</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setInstruction(p.prompt);
                    void run(p.prompt);
                  }}
                  className="min-h-9 rounded-full border border-line bg-parchment px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-wine-line hover:bg-wine-soft hover:text-wine cursor-pointer disabled:opacity-50"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_16rem]">
            <TextArea
              label="Ou descreva o que quer mudar"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Ex.: troque a mordida por um ataque de espinhos venenosos e deixe a criatura noturna."
              className="min-h-28"
              disabled={loading}
            />
            <Select label="Foco da alteração" value={focus} onChange={(e) => setFocus(e.target.value)} disabled={loading} hint="Restringe a IA a um campo específico.">
              {FOCUS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
          </div>
          <Toggle checked={useContext} onChange={setUseContext} label="Usar contexto do universo" description="Considera ambientação, época e regras do mundo." />
          {loading && (
            <ArcaneWait
              size="sm"
              className="animate-fade-in rounded-lg bg-parchment px-3 py-2.5"
              phrases={["A IA está revisando a ficha…", "Relendo cada linha…", "Pesando o Nível de Desafio…", "Anotando as sugestões…"]}
              note="Isso costuma levar de 20 a 60 segundos."
            />
          )}
        </div>
      )}
    </Modal>
  );
}

// ---------------------------------------------------------------- Variações
export function AlternativePreview({ alt }: { alt: AIAlternative }) {
  return (
    <div className="space-y-4">
      {(alt.concept || alt.design_notes) && (
        <div className="rounded-lg border border-line bg-parchment px-4 py-3 text-sm">
          {alt.concept && <p className="font-medium text-ink">{alt.concept}</p>}
          {alt.design_notes && <p className="mt-1.5 text-xs leading-relaxed text-muted">{alt.design_notes}</p>}
        </div>
      )}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <StatBlock creature={alt.creature} />
        <Narrative creature={alt.creature} showNotes={false} />
      </div>
    </div>
  );
}

export function VariationsModal({
  open,
  onClose,
  creature,
  universeId,
  onSave,
  onEdit,
}: {
  open: boolean;
  onClose: () => void;
  creature: CreatureDraft;
  universeId: string;
  onSave: (draft: CreatureDraft) => Promise<void>;
  onEdit: (draft: CreatureDraft) => void;
}) {
  const toast = useToast();
  const { data: profile } = useProfile();
  const [instruction, setInstruction] = useState("");
  const [count, setCount] = useState("2");
  const [creativity, setCreativity] = useState<Creativity>("equilibrado");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const [alts, setAlts] = useState<AIAlternative[]>([]);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (open) {
      setAlts([]);
      setTab(0);
      setCreativity(profile?.preferences?.creativity ?? "equilibrado");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const run = async () => {
    setLoading(true);
    try {
      const res = await generateVariations({
        universeId,
        useUniverseContext: profile?.preferences?.useUniverseContext ?? true,
        creativity,
        detail: profile?.preferences?.detail,
        creature,
        instruction,
        count: Number(count),
      });
      setAlts(res);
      setTab(0);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const current = alts[tab];

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={loading || saving != null}
      size="xl"
      title={`Variações de ${creature.name || "criatura"}`}
      description="Cada variação é uma nova criatura. A original não é alterada."
      footer={
        current ? (
          <>
            <Button icon={<RefreshCw className="size-4" />} busyIcon={<D20 className="size-4 animate-roll" />} onClick={run} loading={loading}>
              Gerar outras
            </Button>
            <Button icon={<PenLine className="size-4" />} onClick={() => onEdit(current.creature)}>
              Editar antes de salvar
            </Button>
            <Button
              variant="primary"
              icon={<BookPlus className="size-4" />}
              loading={saving === tab}
              onClick={async () => {
                setSaving(tab);
                try {
                  await onSave(current.creature);
                } finally {
                  setSaving(null);
                }
              }}
            >
              Salvar no bestiário
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="primary" icon={<Sparkles className="size-4" />} busyIcon={<D20 className="size-4 animate-roll" />} onClick={run} loading={loading}>
              {loading ? "Criando variações…" : "Gerar variações"}
            </Button>
          </>
        )
      }
    >
      {current ? (
        <div>
          {alts.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-1.5" role="tablist">
              {alts.map((a, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === tab}
                  onClick={() => setTab(i)}
                  className={cx(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium cursor-pointer",
                    i === tab ? "border-wine bg-wine-soft text-wine" : "border-line bg-cream text-ink-soft hover:border-line-strong",
                  )}
                >
                  {a.creature.name || `Variação ${i + 1}`}
                </button>
              ))}
            </div>
          )}
          <AlternativePreview key={tab} alt={current} />
        </div>
      ) : (
        <div className="space-y-4">
          <TextArea
            label="Que tipo de variação? (opcional)"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Ex.: uma versão anciã e mais poderosa; uma subespécie do deserto; um filhote."
            disabled={loading}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Segmented label="Criatividade" value={creativity} onChange={setCreativity} options={CREATIVITY_OPTIONS} />
            <Select label="Quantidade" value={count} onChange={(e) => setCount(e.target.value)} disabled={loading}>
              <option value="1">1 variação</option>
              <option value="2">2 variações</option>
              <option value="3">3 variações</option>
            </Select>
          </div>
          {loading && (
            <ArcaneWait
              size="sm"
              className="animate-fade-in rounded-lg bg-parchment px-3 py-2.5"
              phrases={["Criando variações…", "Cruzando linhagens…", "Ajustando garras e presas…", "Escrevendo as crônicas…"]}
              note="Pode levar até um minuto."
            />
          )}
        </div>
      )}
    </Modal>
  );
}
