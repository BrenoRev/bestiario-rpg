// "Criar com IA": o mestre descreve a ideia, a IA propõe alternativas e o
// mestre aceita, descarta, combina, modifica, pede variações ou ilustra.
import { useQueryClient } from "@tanstack/react-query";
import {
  BookPlus, ChevronDown, ChevronUp, Combine, ExternalLink, GitBranch, Lightbulb, PenLine,
  RefreshCw, Sparkles, Wand2, X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AIAssistModal, CREATIVITY_OPTIONS, DETAIL_OPTIONS } from "../components/creature/AIAssist";
import { ImageStudio } from "../components/creature/ImageStudio";
import { CombineModal, type Proposal, VariationRequest } from "../components/creature/ProposalModals";
import { D20, WaxSeal } from "../components/brand";
import { Narrative, StatBlock, StatBlockSkeleton } from "../components/creature/StatBlock";
import { errorMessage, useToast } from "../components/Toast";
import { ArcaneWait, Button, cx, EmptyState, PageHeader, PageLoader, Segmented, Select, TextArea, Toggle } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useHelp } from "../context/HelpContext";
import { useCurrentUniverse } from "../context/UniverseContext";
import { keys, useProfile } from "../hooks/queries";
import { generateCreatures } from "../lib/ai";
import { attachImagesToCreature, cleanupOrphanImages, createCreature, deleteDraftImages } from "../lib/api";
import { normalizeDraft } from "../lib/creature";
import { CHALLENGE_RATINGS, CREATURE_TYPES } from "../lib/dnd";
import type { AIAlternative, CreatureImage, Creativity, Detail } from "../lib/types";

interface Settings {
  description: string;
  creatureType: string;
  challengeRating: string;
  creativity: Creativity;
  detail: Detail;
  count: number;
  useContext: boolean;
}

const EXAMPLES = [
  "Quero uma criatura que habita florestas antigas, possui aparência humanoide e caça viajantes durante a noite.",
  "Um enxame de mariposas que se alimenta de memórias e deixa as vítimas confusas.",
  "Um guardião de pedra construído para proteger um templo submerso, já meio tomado por corais.",
  "Um predador das dunas que imita o som de água corrente para atrair caravanas.",
];

const CREATING = ["Consultando os tomos antigos…", "Rolando os Dados de Vida…", "Equilibrando o Nível de Desafio…", "Afiando garras e presas…", "Escrevendo a crônica…"];
const rollingD20 = <D20 className="size-4 animate-roll" />;

const newKey = () => crypto.randomUUID();
const storageKey = (uid: string) => `bestiario:criar:${uid}`;

/**
 * Restaura a sessão salva no navegador. Tudo passa por normalização: uma sessão gravada
 * por uma versão anterior do app (campos faltando ou a mais) não pode derrubar a tela.
 */
function loadSession(uid: string | undefined): { settings?: Settings; proposals?: Proposal[]; active?: number } {
  if (!uid) return {};
  try {
    const raw = JSON.parse(sessionStorage.getItem(storageKey(uid)) ?? "{}") as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === "string" ? v : "");
    const proposals: Proposal[] = (Array.isArray(raw.proposals) ? raw.proposals : [])
      .filter((p): p is Record<string, unknown> => !!p && typeof p === "object")
      .map((p) => ({
        key: str(p.key) || newKey(),
        concept: str(p.concept),
        design_notes: str(p.design_notes),
        creature: normalizeDraft(p.creature),
        images: Array.isArray(p.images) ? (p.images as CreatureImage[]).filter((i) => i && typeof i.path === "string") : [],
        savedId: str(p.savedId) || undefined,
      }));
    const s = (raw.settings ?? {}) as Partial<Settings>;
    const settings: Settings | undefined = raw.settings
      ? {
          description: str(s.description),
          creatureType: str(s.creatureType),
          challengeRating: str(s.challengeRating),
          creativity: CREATIVITY_OPTIONS.some((o) => o.value === s.creativity) ? (s.creativity as Creativity) : "equilibrado",
          detail: DETAIL_OPTIONS.some((o) => o.value === s.detail) ? (s.detail as Detail) : "padrao",
          count: [1, 2, 3].includes(Number(s.count)) ? Number(s.count) : 2,
          useContext: s.useContext !== false,
        }
      : undefined;
    const active = Math.min(Math.max(0, Number(raw.active) || 0), Math.max(0, proposals.length - 1));
    return { settings, proposals, active };
  } catch {
    return {};
  }
}

export function CreateWithAIPage() {
  const { user } = useAuth();
  const { current, universes, setCurrentId, loading } = useCurrentUniverse();
  const { data: profile } = useProfile();
  const { showHelp } = useHelp();
  const toast = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const saved = useMemo(() => loadSession(user?.id), [user?.id]);
  const [settings, setSettings] = useState<Settings>(
    saved.settings ?? {
      description: "",
      creatureType: "",
      challengeRating: "",
      creativity: "equilibrado",
      detail: "padrao",
      count: 2,
      useContext: true,
    },
  );
  const [proposals, setProposals] = useState<Proposal[]>(saved.proposals ?? []);
  const [active, setActive] = useState(saved.active ?? 0);
  const [formOpen, setFormOpen] = useState(!(saved.proposals?.length));
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<null | "modify" | "variation" | "combine">(null);
  const [prefsApplied, setPrefsApplied] = useState(!!saved.settings);

  const universeId = current?.id ?? "";

  // Preferências do perfil como padrão (só na primeira visita da sessão).
  useEffect(() => {
    if (prefsApplied || !profile) return;
    const p = profile.preferences ?? {};
    setSettings((s) => ({
      ...s,
      creativity: p.creativity ?? s.creativity,
      detail: p.detail ?? s.detail,
      count: p.alternatives ?? s.count,
      useContext: p.useUniverseContext ?? s.useContext,
    }));
    setPrefsApplied(true);
  }, [profile, prefsApplied]);

  // Recolhe ilustrações de rascunho abandonadas há mais de 7 dias.
  useEffect(() => {
    void cleanupOrphanImages();
  }, []);

  // Guarda a sessão de criação para não perder propostas ao navegar.
  useEffect(() => {
    if (!user) return;
    try {
      sessionStorage.setItem(storageKey(user.id), JSON.stringify({ settings, proposals, active, universeId }));
    } catch {
      /* sem armazenamento: segue sem persistir */
    }
  }, [user, settings, proposals, active, universeId]);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setSettings((s) => ({ ...s, [k]: v }));
  const proposal = proposals[Math.min(active, proposals.length - 1)];

  const updateProposal = useCallback((key: string, patch: Partial<Proposal>) => {
    setProposals((list) => list.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  }, []);

  const toProposals = (alts: AIAlternative[]): Proposal[] => alts.map((a) => ({ ...a, key: newKey(), images: [] }));

  const generate = async (mode: "replace" | "more") => {
    if (!settings.description.trim()) {
      toast.error("Descreva a criatura que você imagina.");
      return;
    }
    if (!universeId) return;
    setGenerating(true);
    try {
      const alts = await generateCreatures({
        universeId,
        useUniverseContext: settings.useContext,
        description: settings.description,
        creatureType: settings.creatureType || null,
        challengeRating: settings.challengeRating || null,
        creativity: settings.creativity,
        detail: settings.detail,
        count: settings.count,
        avoidNames: mode === "more" ? proposals.map((p) => p.creature.name) : undefined,
      });
      const fresh = toProposals(alts);
      if (mode === "replace") {
        // Mantém as propostas já salvas; troca o resto.
        const keep = proposals.filter((p) => p.savedId);
        setProposals([...keep, ...fresh]);
        setActive(keep.length);
      } else {
        setProposals((list) => [...list, ...fresh]);
        setActive(proposals.length);
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const discard = (key: string) => {
    const removed = proposals.find((p) => p.key === key);
    if (removed && !removed.savedId) void deleteDraftImages(removed.images);
    setProposals((list) => {
      const idx = list.findIndex((p) => p.key === key);
      const next = list.filter((p) => p.key !== key);
      setActive((a) => Math.max(0, Math.min(a > idx ? a - 1 : a, next.length - 1)));
      if (next.length === 0) setFormOpen(true);
      return next;
    });
  };

  const saveProposal = async () => {
    if (!proposal || !universeId) return;
    setSaving(true);
    try {
      const created = await createCreature(universeId, proposal.creature);
      await attachImagesToCreature(proposal.images.map((i) => i.id), created.id);
      updateProposal(proposal.key, { savedId: created.id });
      qc.invalidateQueries({ queryKey: keys.creatures(universeId) });
      qc.invalidateQueries({ queryKey: keys.universes });
      toast.success(`“${created.name}” foi salva no bestiário de ${current?.name}.`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onDraftVersions = useCallback(
    (imgs: CreatureImage[]) => {
      if (proposal) updateProposal(proposal.key, { images: imgs });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [proposal?.key, updateProposal],
  );

  if (loading) return <PageLoader />;
  if (!current) {
    return (
      <EmptyState
        icon={<Sparkles className="size-6" />}
        title="Crie um universo primeiro"
        description="A IA usa o contexto do universo para criar criaturas coerentes com o seu mundo."
        action={
          <Link to="/mundos/novo">
            <Button variant="primary">Novo universo</Button>
          </Link>
        }
      />
    );
  }

  const form = (
    <section className="card p-5 sm:p-6">
      <TextArea
        label="Descreva a criatura que você imagina"
        hint="Escreva com as suas palavras: aparência, onde vive, o que faz. Não precisa saber as regras do jogo."
        value={settings.description}
        onChange={(e) => set("description", e.target.value)}
        placeholder={EXAMPLES[0]}
        className="min-h-36 text-[0.95rem]"
        maxLength={4000}
        disabled={generating}
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <Lightbulb className="size-3.5" /> Exemplos:
        </span>
        {EXAMPLES.slice(1).map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => set("description", ex)}
            className="max-w-xs truncate rounded-full border border-line bg-parchment px-2.5 py-0.5 text-xs text-ink-soft hover:border-wine-line hover:text-wine cursor-pointer"
            title={ex}
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select label="Universo" value={universeId} onChange={(e) => setCurrentId(e.target.value)} disabled={generating}>
          {universes.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>
        <Select label="Tipo de criatura" help="tipo" value={settings.creatureType} onChange={(e) => set("creatureType", e.target.value)} disabled={generating}>
          <option value="">Deixar a IA decidir</option>
          {CREATURE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <Select label="Nível de desafio desejado" help="nd" value={settings.challengeRating} onChange={(e) => set("challengeRating", e.target.value)} disabled={generating}>
          <option value="">Deixar a IA decidir</option>
          {CHALLENGE_RATINGS.map((cr) => (
            <option key={cr} value={cr}>
              ND {cr}
            </option>
          ))}
        </Select>
        <Select label="Alternativas" help="propostas" value={String(settings.count)} onChange={(e) => set("count", Number(e.target.value))} disabled={generating}>
          <option value="1">1 proposta</option>
          <option value="2">2 propostas</option>
          <option value="3">3 propostas</option>
        </Select>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Segmented label="Nível de criatividade" help="criatividade" value={settings.creativity} onChange={(v) => set("creativity", v)} options={CREATIVITY_OPTIONS} />
        <Segmented label="Nível de detalhamento" help="detalhamento" value={settings.detail} onChange={(v) => set("detail", v)} options={DETAIL_OPTIONS} />
      </div>
      <div className="mt-5 flex flex-col gap-4 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Toggle
          checked={settings.useContext}
          onChange={(v) => set("useContext", v)}
          label={`Usar contexto de “${current.name}”`}
          help="contextoUniverso"
          description="Ambientação, época, nível de fantasia e regras do universo."
        />
        <Button
          variant="primary"
          icon={<D20 className="size-4" />}
          busyIcon={rollingD20}
          onClick={() => generate("replace")}
          loading={generating}
          className="h-11 px-6"
        >
          {generating ? "Gerando sugestões…" : "Gerar sugestões"}
        </Button>
      </div>
    </section>
  );

  // Espera da geração com o pedido aberto: ficha em branco com o círculo rúnico por cima.
  const waitingSheet = generating && (formOpen || proposals.length === 0);
  const waitNote = `A IA está concebendo ${settings.count > 1 ? `${settings.count} propostas` : "a proposta"}. Isso pode levar até um minuto.`;

  return (
    <>
      <PageHeader
        eyebrow={`Universo: ${current.name}`}
        title="Criar com IA"
        description="Descreva sua ideia. A IA propõe fichas de D&D 5e que você pode aceitar, descartar, combinar ou modificar. Nada entra no bestiário sem sua confirmação."
      />

      {proposals.length > 0 && !formOpen ? (
        <div className="card mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <p className="line-clamp-2 flex-1 text-sm text-ink-soft">
            <span className="font-semibold text-ink">Sua ideia:</span> {settings.description}
          </p>
          <div className="flex flex-wrap gap-2 sm:shrink-0">
            <Button size="sm" icon={<ChevronDown className="size-4" />} onClick={() => setFormOpen(true)}>
              Editar pedido
            </Button>
            <Button size="sm" variant="subtle" icon={<RefreshCw className="size-4" />} busyIcon={rollingD20} onClick={() => generate("more")} loading={generating}>
              Gerar novas alternativas
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          {proposals.length === 0 && showHelp && <HowItWorks />}
          {form}
          {proposals.length > 0 && (
            <div className="mt-2 flex justify-end">
              <Button size="sm" variant="ghost" icon={<ChevronUp className="size-4" />} onClick={() => setFormOpen(false)}>
                Recolher
              </Button>
            </div>
          )}
        </div>
      )}

      {waitingSheet && (
        <div className="animate-fade-in mb-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="relative">
            <StatBlockSkeleton />
            <div className="absolute inset-0 flex items-center justify-center rounded-[var(--radius-card)] bg-cream/70 px-4 backdrop-blur-[1px]">
              <ArcaneWait phrases={CREATING} note={waitNote} />
            </div>
          </div>
          <div className="card hidden overflow-hidden lg:block" aria-hidden>
            <div className="skeleton aspect-square" />
          </div>
        </div>
      )}

      {generating && proposals.length > 0 && !formOpen && (
        <ArcaneWait
          size="sm"
          className="animate-fade-in card mb-4 px-4 py-3"
          phrases={["Gerando novas alternativas…", ...CREATING]}
          note="Isso pode levar até um minuto."
        />
      )}

      {proposal && !waitingSheet && (
        <div className="animate-fade-in">
          {/* Abas das propostas */}
          <div className="mb-4 flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Propostas da IA">
            {proposals.map((p, i) => (
              <div
                key={p.key}
                className={cx(
                  "flex items-center rounded-lg border text-sm font-medium",
                  i === active ? "border-wine bg-wine-soft text-wine" : "border-line bg-cream text-ink-soft hover:border-line-strong",
                )}
              >
                <button role="tab" aria-selected={i === active} onClick={() => setActive(i)} className="flex items-center gap-1.5 py-1.5 pl-3 pr-1.5 cursor-pointer">
                  {p.savedId && <WaxSeal label="Salva no bestiário" className="size-4" />}
                  <span className="max-w-48 truncate">{p.creature.name || `Proposta ${i + 1}`}</span>
                </button>
                <button
                  type="button"
                  aria-label={`Descartar ${p.creature.name}`}
                  title="Descartar proposta"
                  onClick={() => discard(p.key)}
                  className="mr-1 rounded p-1 text-muted hover:bg-sand hover:text-wine cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Ações */}
          <div className="card mb-5 p-4">
            {(proposal.concept || proposal.design_notes) && (
              <div className="mb-4">
                {proposal.concept && <p className="font-display text-xl font-semibold leading-snug text-ink">{proposal.concept}</p>}
                {proposal.design_notes && <p className="mt-1.5 text-sm leading-relaxed text-muted">{proposal.design_notes}</p>}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {proposal.savedId ? (
                <Link to={`/criaturas/${proposal.savedId}`}>
                  <Button variant="subtle" icon={<ExternalLink className="size-4" />}>
                    Ver no bestiário
                  </Button>
                </Link>
              ) : (
                <Button variant="primary" icon={<BookPlus className="size-4" />} onClick={saveProposal} loading={saving}>
                  Salvar no bestiário
                </Button>
              )}
              <Button icon={<RefreshCw className="size-4" />} busyIcon={rollingD20} onClick={() => generate("more")} loading={generating}>
                Novas alternativas
              </Button>
              <Button icon={<Wand2 className="size-4" />} onClick={() => setModal("modify")}>
                Modificar característica
              </Button>
              <Button icon={<GitBranch className="size-4" />} onClick={() => setModal("variation")}>
                Pedir variação
              </Button>
              {proposals.length > 1 && (
                <Button icon={<Combine className="size-4" />} onClick={() => setModal("combine")}>
                  Combinar
                </Button>
              )}
              <Button
                icon={<PenLine className="size-4" />}
                onClick={() => navigate("/criaturas/nova", { state: { draft: proposal.creature, universeId, images: proposal.images } })}
              >
                Editar manualmente
              </Button>
            </div>
            {proposal.savedId && (
              <p className="mt-3 text-xs text-muted">
                Esta proposta já está no bestiário. Alterações feitas aqui não mudam a ficha salva; edite-a pela página da criatura.
              </p>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
            {/* key: ao trocar de proposta, a ficha nova entra com a revelação. */}
            <div key={proposal.key} className="space-y-6">
              <StatBlock creature={proposal.creature} />
              <Narrative creature={proposal.creature} showNotes={false} />
            </div>
            <div className="side-panel">
              <ImageStudio
                key={proposal.key}
                universeId={universeId}
                creatureId={null}
                creature={proposal.creature}
                currentPath={proposal.creature.image_path}
                onSelect={(path) => updateProposal(proposal.key, { creature: { ...proposal.creature, image_path: path } })}
                onDraftVersions={onDraftVersions}
                initialDraftVersions={proposal.images}
              />
            </div>
          </div>
        </div>
      )}

      {proposal && (
        <>
          <AIAssistModal
            open={modal === "modify"}
            onClose={() => setModal(null)}
            title="Modificar característica"
            creature={proposal.creature}
            universeId={universeId}
            onApply={(next) => updateProposal(proposal.key, { creature: next })}
          />
          <VariationRequest
            open={modal === "variation"}
            onClose={() => setModal(null)}
            base={proposal.creature}
            universeId={universeId}
            settings={settings}
            onResult={(alts) => {
              const fresh = toProposals(alts);
              setProposals((list) => [...list, ...fresh]);
              setActive(proposals.length);
            }}
          />
          <CombineModal
            open={modal === "combine"}
            onClose={() => setModal(null)}
            target={proposal}
            others={proposals.filter((p) => p.key !== proposal.key)}
            onApply={(next) => updateProposal(proposal.key, { creature: next })}
          />
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------- Como funciona
const HOW_STEPS = [
  { icon: PenLine, title: "Descreva a ideia", text: "Com as suas palavras, como contaria a um amigo." },
  { icon: Sparkles, title: "A IA propõe fichas", text: "Números do jogo e história, prontos para usar." },
  { icon: BookPlus, title: "Você decide", text: "Ajuste, combine ou descarte. Só entra no bestiário o que você salvar." },
];

function HowItWorks() {
  return (
    <ol className="mb-5 grid gap-3 sm:grid-cols-3" aria-label="Como funciona">
      {HOW_STEPS.map(({ icon: Icon, title, text }, i) => (
        <li key={title} className="flex gap-3 rounded-[var(--radius-card)] border border-line bg-parchment p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-wine-line bg-wine-soft text-wine">
            <Icon className="size-4" />
          </span>
          <div>
            <div className="font-display text-lg leading-tight font-semibold">
              {i + 1}. {title}
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">{text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
