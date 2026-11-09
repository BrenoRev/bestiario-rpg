// Criação e edição manual de fichas. Também recebe rascunhos vindos da IA
// ("Editar manualmente") via location.state.
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useBlocker, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { AIAssistModal } from "../components/creature/AIAssist";
import { CreatureForm } from "../components/creature/CreatureForm";
import { ImageStudio } from "../components/creature/ImageStudio";
import { ConfirmDialog } from "../components/Modal";
import { errorMessage, useToast } from "../components/Toast";
import { Button, EmptyState, ErrorState, PageHeader, PageLoader, Select } from "../components/ui";
import { useCurrentUniverse } from "../context/UniverseContext";
import { keys, useCreature } from "../hooks/queries";
import { attachImagesToCreature, createCreature, updateCreature } from "../lib/api";
import { emptyCreature, normalizeDraft, toDraft } from "../lib/creature";
import type { CreatureDraft, CreatureImage } from "../lib/types";

interface EditorState {
  draft?: CreatureDraft;
  universeId?: string;
  images?: CreatureImage[];
}

export function CreatureEditorPage() {
  const { creatureId } = useParams();
  const editing = !!creatureId;
  const location = useLocation();
  const incoming = (location.state ?? {}) as EditorState;
  const [params] = useSearchParams();
  const { current, universes, setCurrentId, loading: loadingUniverses } = useCurrentUniverse();
  const { data: creature, isLoading, isError } = useCreature(creatureId);
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();

  const [draft, setDraft] = useState<CreatureDraft | null>(null);
  const [initial, setInitial] = useState<string>("");
  const [universeId, setUniverseId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [assist, setAssist] = useState(false);
  const draftImages = useRef<CreatureImage[]>(incoming.images ?? []);
  const skipBlock = useRef(false);

  // Inicializa o formulário (uma vez por criatura/rascunho).
  useEffect(() => {
    if (editing) {
      if (creature) {
        const d = toDraft(creature);
        setDraft(d);
        setInitial(JSON.stringify(d));
        setUniverseId(creature.universe_id);
      }
    } else if (!draft) {
      const d = incoming.draft ? normalizeDraft(incoming.draft) : emptyCreature();
      setDraft(d);
      setInitial(JSON.stringify(incoming.draft ? null : d));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, creature]);

  useEffect(() => {
    if (editing || universeId) return;
    const pick = incoming.universeId ?? params.get("universo") ?? current?.id;
    if (pick) setUniverseId(pick);
  }, [editing, universeId, incoming.universeId, params, current]);

  // O seletor do topo sempre mostra o universo em que a ficha está sendo trabalhada.
  useEffect(() => {
    if (universeId) setCurrentId(universeId);
  }, [universeId, setCurrentId]);

  const dirty = useMemo(() => draft != null && JSON.stringify(draft) !== initial, [draft, initial]);

  // Aviso ao sair com alterações não salvas.
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !skipBlock.current && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const onDraftVersions = useCallback((imgs: CreatureImage[]) => {
    draftImages.current = imgs;
  }, []);

  const save = async () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      toast.error("Dê um nome à criatura antes de salvar.");
      return;
    }
    if (!universeId) {
      toast.error("Escolha o universo da criatura.");
      return;
    }
    setSaving(true);
    try {
      const saved = editing ? await updateCreature(creatureId!, draft) : await createCreature(universeId, draft);
      if (!editing) await attachImagesToCreature(draftImages.current.map((i) => i.id), saved.id);
      qc.setQueryData(keys.creature(saved.id), saved);
      qc.invalidateQueries({ queryKey: keys.creatures(saved.universe_id) });
      qc.invalidateQueries({ queryKey: keys.universes });
      setCurrentId(saved.universe_id);
      toast.success(editing ? "Ficha atualizada." : `“${saved.name}” entrou para o bestiário.`);
      skipBlock.current = true;
      navigate(`/criaturas/${saved.id}`, { replace: !editing });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (editing && isLoading) return <PageLoader />;
  if (editing && (isError || !creature)) return <ErrorState message="Criatura não encontrada." />;
  if (!editing && !loadingUniverses && universes.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="size-6" />}
        title="Crie um universo primeiro"
        description="Toda criatura pertence a um universo."
        action={
          <Link to="/mundos/novo">
            <Button variant="primary">Novo universo</Button>
          </Link>
        }
      />
    );
  }
  if (!draft) return <PageLoader />;

  const actions = (
    <>
      <Button icon={<Sparkles className="size-4" />} onClick={() => setAssist(true)} disabled={!universeId}>
        Assistente de IA
      </Button>
      <Button variant="primary" icon={<Save className="size-4" />} onClick={save} loading={saving}>
        {editing ? "Salvar ficha" : "Salvar no bestiário"}
      </Button>
    </>
  );

  return (
    <>
      <button type="button" onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink cursor-pointer">
        <ArrowLeft className="size-4" /> Voltar
      </button>
      <PageHeader
        title={editing ? `Editar ${creature?.name ?? "criatura"}` : incoming.draft ? "Revisar criatura sugerida" : "Nova criatura"}
        description="Preencha a ficha no padrão de D&D 5e. Você pode pedir sugestões à IA a qualquer momento; nada é aplicado sem sua revisão."
        actions={actions}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <CreatureForm value={draft} onChange={setDraft} />

        <aside className="side-panel space-y-4 [--side-panel-offset:12rem]">
          {!editing && (
            <div className="card p-4">
              <Select label="Universo" value={universeId} onChange={(e) => setUniverseId(e.target.value)}>
                {universes.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
          {universeId && (
            <ImageStudio
              universeId={universeId}
              creatureId={editing ? creatureId! : null}
              creature={draft}
              currentPath={draft.image_path}
              onSelect={(path) => setDraft((d) => (d ? { ...d, image_path: path } : d))}
              onDraftVersions={editing ? undefined : onDraftVersions}
              initialDraftVersions={incoming.images}
            />
          )}
          {dirty && <p className="text-center text-xs text-amber">Há alterações não salvas.</p>}
        </aside>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex justify-end gap-2 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Button onClick={() => navigate(-1)} disabled={saving}>
          Cancelar
        </Button>
        {actions}
      </div>

      {universeId && (
        <AIAssistModal
          open={assist}
          onClose={() => setAssist(false)}
          creature={draft}
          universeId={universeId}
          onApply={(next) => {
            setDraft(next);
            toast.info("Sugestões aplicadas ao formulário. Lembre-se de salvar.");
          }}
        />
      )}

      <ConfirmDialog
        open={blocker.state === "blocked"}
        title="Sair sem salvar?"
        message="As alterações desta ficha serão perdidas."
        confirmLabel="Sair sem salvar"
        onConfirm={() => blocker.proceed?.()}
        onClose={() => blocker.reset?.()}
      />
    </>
  );
}
