import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, ChevronRight, Copy, GitBranch, Pencil, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AIAssistModal, VariationsModal } from "../components/creature/AIAssist";
import { ImageStudio } from "../components/creature/ImageStudio";
import { Narrative, StatBlock } from "../components/creature/StatBlock";
import { ConfirmDialog } from "../components/Modal";
import { errorMessage, useToast } from "../components/Toast";
import { Button, ErrorState, PageLoader } from "../components/ui";
import { useHelp } from "../context/HelpContext";
import { useCurrentUniverse } from "../context/UniverseContext";
import { keys, useCreature } from "../hooks/queries";
import { createCreature, deleteCreature, duplicateCreature, updateCreature } from "../lib/api";
import { toDraft } from "../lib/creature";
import type { Creature, CreatureDraft } from "../lib/types";

export function CreatureDetailPage() {
  const { creatureId } = useParams();
  const { data: creature, isLoading, isError } = useCreature(creatureId);
  const { universes, setCurrentId } = useCurrentUniverse();
  const { showHelp, openGlossary } = useHelp();
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const [assist, setAssist] = useState(false);
  const [variations, setVariations] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState<"delete" | "duplicate" | null>(null);

  useEffect(() => {
    if (creature) setCurrentId(creature.universe_id);
  }, [creature, setCurrentId]);

  if (isLoading) return <PageLoader />;
  if (isError || !creature) return <ErrorState message="Criatura não encontrada." />;

  const draft = toDraft(creature);
  const universe = universes.find((u) => u.id === creature.universe_id);

  const refresh = (updated: Creature) => {
    qc.setQueryData(keys.creature(updated.id), updated);
    qc.invalidateQueries({ queryKey: keys.creatures(updated.universe_id) });
  };

  const save = async (patch: Partial<CreatureDraft>) => {
    const updated = await updateCreature(creature.id, patch);
    refresh(updated);
    return updated;
  };

  const duplicate = async () => {
    setBusy("duplicate");
    try {
      const copy = await duplicateCreature(creature);
      qc.invalidateQueries({ queryKey: keys.creatures(copy.universe_id) });
      qc.invalidateQueries({ queryKey: keys.universes });
      toast.success("Ficha duplicada.");
      navigate(`/criaturas/${copy.id}/editar`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setBusy("delete");
    try {
      await deleteCreature(creature);
      qc.invalidateQueries({ queryKey: keys.creatures(creature.universe_id) });
      qc.invalidateQueries({ queryKey: keys.universes });
      qc.removeQueries({ queryKey: keys.creature(creature.id) });
      toast.success(`“${creature.name}” foi removida do bestiário.`);
      navigate("/criaturas");
    } catch (err) {
      toast.error(errorMessage(err));
      setBusy(null);
    }
  };

  return (
    <>
      <nav className="mb-4 flex min-w-0 items-center gap-1 text-sm text-muted" aria-label="Trilha">
        <Link to={`/mundos/${creature.universe_id}`} viewTransition className="max-w-[40%] truncate hover:text-ink" title={universe?.name}>
          {universe?.name ?? "Universo"}
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <Link to="/criaturas" viewTransition className="shrink-0 hover:text-ink">
          Criaturas
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="min-w-0 truncate text-ink-soft">{creature.name}</span>
      </nav>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="primary" icon={<Sparkles className="size-4" />} onClick={() => setAssist(true)}>
          Assistente de IA
        </Button>
        <Button icon={<GitBranch className="size-4" />} onClick={() => setVariations(true)}>
          Sugerir variações
        </Button>
        <Link to={`/criaturas/${creature.id}/editar`}>
          <Button icon={<Pencil className="size-4" />}>Editar</Button>
        </Link>
        <Button icon={<Copy className="size-4" />} onClick={duplicate} loading={busy === "duplicate"}>
          Duplicar
        </Button>
        <Button variant="danger" icon={<Trash2 className="size-4" />} onClick={() => setConfirmDelete(true)}>
          Excluir
        </Button>
        {showHelp && (
          <Button variant="ghost" icon={<BookOpen className="size-4" />} onClick={() => openGlossary("nd")}>
            Como ler esta ficha?
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <StatBlock creature={draft} transitionName="creature-name" />
          <Narrative creature={draft} />
        </div>
        <div className="side-panel order-first lg:order-none">
          <ImageStudio
            universeId={creature.universe_id}
            creatureId={creature.id}
            creature={draft}
            currentPath={creature.image_path}
            transitionName="creature-image"
            onSelect={async (path) => {
              await save({ image_path: path });
            }}
          />
        </div>
      </div>

      <AIAssistModal
        open={assist}
        onClose={() => setAssist(false)}
        creature={draft}
        universeId={creature.universe_id}
        onApply={async (next) => {
          await save(next);
          toast.success("Alterações aplicadas à ficha.");
        }}
      />

      <VariationsModal
        open={variations}
        onClose={() => setVariations(false)}
        creature={draft}
        universeId={creature.universe_id}
        onSave={async (v) => {
          try {
            const created = await createCreature(creature.universe_id, { ...v, image_path: null, notes: "" });
            qc.invalidateQueries({ queryKey: keys.creatures(creature.universe_id) });
            qc.invalidateQueries({ queryKey: keys.universes });
            toast.success(`“${created.name}” foi adicionada ao bestiário.`);
            setVariations(false);
            navigate(`/criaturas/${created.id}`);
          } catch (err) {
            toast.error(errorMessage(err));
          }
        }}
        onEdit={(v) => navigate("/criaturas/nova", { state: { draft: { ...v, image_path: null, notes: "" }, universeId: creature.universe_id } })}
      />

      <ConfirmDialog
        open={confirmDelete}
        title={`Excluir “${creature.name}”?`}
        message="A ficha e todas as versões da ilustração serão apagadas permanentemente."
        confirmLabel="Excluir criatura"
        loading={busy === "delete"}
        onConfirm={remove}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
