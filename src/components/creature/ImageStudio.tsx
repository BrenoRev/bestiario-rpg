// Ilustração da criatura: gerar por IA (só quando o usuário pede), pedir
// alterações por texto, comparar versões, aceitar, substituir, remover ou enviar.
import { useQueryClient } from "@tanstack/react-query";
import { Check, ImagePlus, Images, Sparkles, Trash2, Upload, Wand2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { keys, useCreatureImages } from "../../hooks/queries";
import { generateCreatureImage } from "../../lib/ai";
import { deleteCreatureImage, uploadCreatureImage } from "../../lib/api";
import type { CreatureDraft, CreatureImage } from "../../lib/types";
import { StoredImage } from "../brand";
import { ConfirmDialog } from "../Modal";
import { errorMessage, useToast } from "../Toast";
import { Badge, Button, cx, IconButton } from "../ui";

interface ImageStudioProps {
  universeId: string;
  /** null enquanto a criatura ainda não foi salva (rascunho). */
  creatureId: string | null;
  creature: CreatureDraft;
  currentPath: string | null;
  /** Define (ou remove, com null) a imagem oficial da ficha. */
  onSelect: (path: string | null) => Promise<void> | void;
  /** Versões criadas no modo rascunho, para vincular quando a criatura for salva. */
  onDraftVersions?: (images: CreatureImage[]) => void;
  initialDraftVersions?: CreatureImage[];
}

export function ImageStudio({ universeId, creatureId, creature, currentPath, onSelect, onDraftVersions, initialDraftVersions }: ImageStudioProps) {
  const toast = useToast();
  const qc = useQueryClient();
  const { data: savedVersions = [] } = useCreatureImages(creatureId);
  const [draftVersions, setDraftVersions] = useState<CreatureImage[]>(initialDraftVersions ?? []);
  const versions = creatureId ? savedVersions : draftVersions;

  const [previewPath, setPreviewPath] = useState<string | null>(currentPath);
  const [instruction, setInstruction] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [editFromCurrent, setEditFromCurrent] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [toDelete, setToDelete] = useState<CreatureImage | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setPreviewPath(currentPath), [currentPath]);
  useEffect(() => onDraftVersions?.(draftVersions), [draftVersions, onDraftVersions]);

  const addVersion = (img: CreatureImage) => {
    if (creatureId) qc.invalidateQueries({ queryKey: keys.images(creatureId) });
    else setDraftVersions((v) => [img, ...v]);
    setPreviewPath(img.path);
  };

  const generate = async (withInstruction: boolean) => {
    if (!creature.appearance.trim() && !creature.name.trim()) {
      toast.error("Descreva a aparência da criatura antes de gerar a ilustração.");
      return;
    }
    const base = withInstruction && editFromCurrent ? previewPath : null;
    setGenerating(true);
    try {
      const { image } = await generateCreatureImage({
        universeId,
        creatureId,
        creature,
        instruction: withInstruction ? instruction : undefined,
        baseImagePath: base,
      });
      addVersion(image);
      setShowInstructions(false);
      setInstruction("");
      toast.success("Nova versão pronta. Use “Usar esta imagem” para vinculá-la à ficha.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const img = await uploadCreatureImage(file, universeId, creatureId);
      addVersion(img);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const accept = async (path: string | null) => {
    setBusy(true);
    try {
      await onSelect(path);
      toast.success(path ? "Imagem vinculada à ficha." : "Imagem removida da ficha.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
      setConfirmRemove(false);
    }
  };

  const removeVersion = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await deleteCreatureImage(toDelete);
      if (creatureId) qc.invalidateQueries({ queryKey: keys.images(creatureId) });
      else setDraftVersions((v) => v.filter((x) => x.id !== toDelete.id));
      if (previewPath === toDelete.path) setPreviewPath(currentPath);
      toast.success("Versão excluída.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
      setToDelete(null);
    }
  };

  const previewIsCurrent = previewPath != null && previewPath === currentPath;

  return (
    <section className="card overflow-hidden" aria-label="Ilustração">
      <div className="relative aspect-square border-b border-line bg-parchment">
        <StoredImage path={previewPath} alt={`Ilustração de ${creature.name}`} className="size-full" fallbackLabel="Sem ilustração" />
        {generating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-parchment/85 px-6 text-center backdrop-blur-[2px]">
            <Sparkles className="size-7 animate-pulse text-wine" />
            <p className="font-display text-xl font-semibold text-ink">Ilustrando a criatura…</p>
            <p className="text-xs text-muted">A geração costuma levar de 30 segundos a 1 minuto.</p>
          </div>
        )}
        {previewPath && !generating && (
          <div className="absolute left-3 top-3">
            {previewIsCurrent ? <Badge tone="wine">Imagem da ficha</Badge> : <Badge tone="amber">Pré-visualização</Badge>}
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        {previewPath && !previewIsCurrent && (
          <Button variant="primary" className="w-full" icon={<Check className="size-4" />} onClick={() => accept(previewPath)} loading={busy}>
            Usar esta imagem
          </Button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="subtle" icon={<Sparkles className="size-4" />} onClick={() => generate(false)} disabled={generating || busy}>
            {versions.length ? "Nova versão" : "Gerar imagem"}
          </Button>
          <Button icon={<Wand2 className="size-4" />} onClick={() => setShowInstructions((s) => !s)} disabled={generating || busy}>
            Com instruções
          </Button>
        </div>

        {showInstructions && (
          <div className="animate-fade-in space-y-2 rounded-lg border border-line bg-parchment p-3">
            <textarea
              className="field min-h-20 text-sm"
              placeholder="Ex.: mostre a criatura de perfil, à noite, com olhos brilhando em verde."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              aria-label="Instruções para a ilustração"
            />
            {previewPath && (
              <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-soft">
                <input type="checkbox" className="accent-wine" checked={editFromCurrent} onChange={(e) => setEditFromCurrent(e.target.checked)} />
                Modificar a imagem exibida (em vez de criar do zero)
              </label>
            )}
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowInstructions(false)}>
                Cancelar
              </Button>
              <Button size="sm" variant="primary" disabled={!instruction.trim()} loading={generating} onClick={() => generate(true)}>
                Gerar
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <Button size="sm" variant="ghost" icon={<Upload className="size-4" />} onClick={() => fileRef.current?.click()} disabled={busy || generating}>
            Enviar imagem
          </Button>
          {currentPath && (
            <Button size="sm" variant="ghost" icon={<X className="size-4" />} onClick={() => setConfirmRemove(true)} disabled={busy || generating}>
              Remover da ficha
            </Button>
          )}
        </div>

        {versions.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
              <Images className="size-3.5" /> Versões ({versions.length})
            </div>
            <div className="grid grid-cols-4 gap-2">
              {versions.map((v) => (
                <div key={v.id} className="group relative">
                  <button
                    type="button"
                    title={v.prompt}
                    onClick={() => setPreviewPath(v.path)}
                    className={cx(
                      "block aspect-square w-full overflow-hidden rounded-md border-2 cursor-pointer",
                      v.path === previewPath ? "border-wine" : "border-transparent hover:border-line-strong",
                    )}
                  >
                    <StoredImage path={v.path} alt="Versão da ilustração" className="size-full" />
                  </button>
                  {v.path === currentPath && <Check className="absolute bottom-1 right-1 size-4 rounded-full bg-wine p-0.5 text-cream" />}
                  {v.path !== currentPath && (
                    <IconButton
                      label="Excluir versão"
                      onClick={() => setToDelete(v)}
                      className="absolute right-0.5 top-0.5 size-6 bg-cream/90 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-wine"
                    >
                      <Trash2 className="size-3.5" />
                    </IconButton>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {versions.length === 0 && !currentPath && (
          <p className="flex gap-2 text-xs leading-relaxed text-muted">
            <ImagePlus className="size-4 shrink-0" />
            Nenhuma imagem é gerada automaticamente. Gere uma ilustração a partir da ficha ou envie a sua.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={confirmRemove}
        title="Remover imagem da ficha?"
        message="A ficha ficará sem ilustração. A versão continua salva na galeria e pode ser usada de novo."
        confirmLabel="Remover"
        loading={busy}
        onConfirm={() => accept(null)}
        onClose={() => setConfirmRemove(false)}
      />
      <ConfirmDialog
        open={!!toDelete}
        title="Excluir esta versão?"
        message="O arquivo será apagado permanentemente."
        confirmLabel="Excluir"
        danger
        loading={busy}
        onConfirm={removeVersion}
        onClose={() => setToDelete(null)}
      />
    </section>
  );
}
