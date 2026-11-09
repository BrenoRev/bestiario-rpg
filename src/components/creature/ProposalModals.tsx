// Modais de "Criar com IA": pedir variação de uma proposta e combinar campos entre propostas.
import { Combine, GitBranch, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { generateVariations } from "../../lib/ai";
import { applyFields, diffCreatures } from "../../lib/creature";
import type { AIAlternative, CreatureDraft, CreatureImage, Creativity, Detail } from "../../lib/types";
import { Modal } from "../Modal";
import { errorMessage, useToast } from "../Toast";
import { Badge, Button, Select, TextArea } from "../ui";
import { DiffReview } from "./AIAssist";

/** Uma proposta da IA na sessão de criação (ainda não salva, ou já salva com `savedId`). */
export interface Proposal extends AIAlternative {
  key: string;
  images: CreatureImage[];
  savedId?: string;
}

interface Settings {
  useContext: boolean;
  creativity: Creativity;
  detail: Detail;
}

// ---------------------------------------------------------------- Variação
export function VariationRequest({
  open,
  onClose,
  base,
  universeId,
  settings,
  onResult,
}: {
  open: boolean;
  onClose: () => void;
  base: CreatureDraft;
  universeId: string;
  settings: Pick<Settings, "useContext" | "creativity" | "detail">;
  onResult: (alts: AIAlternative[]) => void;
}) {
  const toast = useToast();
  const [instruction, setInstruction] = useState("");
  const [count, setCount] = useState("1");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const alts = await generateVariations({
        universeId,
        useUniverseContext: settings.useContext,
        creativity: settings.creativity,
        detail: settings.detail,
        creature: base,
        instruction,
        count: Number(count),
      });
      onResult(alts);
      setInstruction("");
      onClose();
      toast.success(alts.length > 1 ? "Variações adicionadas às propostas." : "Variação adicionada às propostas.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={loading}
      title={`Variação de ${base.name || "criatura"}`}
      description="A variação entra como uma nova proposta; a atual continua disponível."
      footer={
        <>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" icon={<GitBranch className="size-4" />} onClick={run} loading={loading}>
            {loading ? "Criando…" : "Criar variação"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextArea
          label="Que tipo de variação? (opcional)"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Ex.: uma versão jovem e mais fraca; uma rainha da colmeia; uma forma corrompida por magia."
          disabled={loading}
        />
        <Select label="Quantidade" value={count} onChange={(e) => setCount(e.target.value)} disabled={loading}>
          <option value="1">1 variação</option>
          <option value="2">2 variações</option>
          <option value="3">3 variações</option>
        </Select>
        {loading && (
          <p className="flex items-center gap-2 rounded-lg bg-parchment px-3 py-2 text-xs text-muted">
            <Sparkles className="size-4 animate-pulse text-wine" /> Criando a variação…
          </p>
        )}
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------- Combinar
export function CombineModal({
  open,
  onClose,
  target,
  others,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  target: Proposal;
  others: Proposal[];
  onApply: (next: CreatureDraft) => void;
}) {
  const [sourceKey, setSourceKey] = useState("");
  const [selected, setSelected] = useState<Set<keyof CreatureDraft>>(new Set());
  const source = others.find((o) => o.key === sourceKey) ?? others[0];

  useEffect(() => {
    if (open) {
      setSourceKey(others[0]?.key ?? "");
      setSelected(new Set());
    }
  }, [open, others]);

  if (!source) return null;
  const changed = diffCreatures(target.creature, source.creature);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`Combinar em “${target.creature.name}”`}
      description="Escolha uma outra proposta e marque os campos que quer trazer dela. O restante permanece como está."
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            variant="primary"
            icon={<Combine className="size-4" />}
            disabled={selected.size === 0}
            onClick={() => {
              onApply(applyFields(target.creature, source.creature, [...selected]));
              onClose();
            }}
          >
            Trazer {selected.size || ""} {selected.size === 1 ? "campo" : "campos"}
          </Button>
        </>
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Select label="Trazer campos de" value={source.key} onChange={(e) => {
          setSourceKey(e.target.value);
          setSelected(new Set());
        }} wrapperClassName="min-w-60 flex-1">
          {others.map((o) => (
            <option key={o.key} value={o.key}>
              {o.creature.name}
            </option>
          ))}
        </Select>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set(changed))}>
            Marcar todos
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            Limpar
          </Button>
        </div>
      </div>
      <Badge tone="neutral" className="mb-3">
        “Atual” é {target.creature.name}; “Proposta” é {source.creature.name}
      </Badge>
      <DiffReview
        current={target.creature}
        proposal={source.creature}
        selected={selected}
        onToggle={(key) =>
          setSelected((s) => {
            const next = new Set(s);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
          })
        }
      />
    </Modal>
  );
}
