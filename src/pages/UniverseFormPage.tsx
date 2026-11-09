import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { errorMessage, useToast } from "../components/Toast";
import { Button, ErrorState, PageHeader, PageLoader } from "../components/ui";
import { emptyUniverse, UniverseForm } from "../components/universe/UniverseForm";
import { useCurrentUniverse } from "../context/UniverseContext";
import { keys, useUniverse } from "../hooks/queries";
import { createUniverse, removeFile, updateUniverse, uploadImage } from "../lib/api";
import type { UniverseInput } from "../lib/types";

export function UniverseFormPage() {
  const { universeId } = useParams();
  const editing = !!universeId;
  const { data: universe, isLoading, isError } = useUniverse(universeId);
  const [value, setValue] = useState<UniverseInput>(emptyUniverse());
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const { setCurrentId } = useCurrentUniverse();

  useEffect(() => {
    if (universe) {
      const { name, description, genre, setting, era, fantasy_level, rules, art_style, cover_path } = universe;
      setValue({ name, description, genre, setting, era, fantasy_level, rules, art_style, cover_path });
    }
  }, [universe]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.name.trim()) {
      toast.error("Dê um nome ao universo.");
      return;
    }
    setSaving(true);
    try {
      const previousCover = universe?.cover_path ?? null;
      let saved = editing
        ? await updateUniverse(universeId!, { ...value, cover_path: coverFile ? previousCover : value.cover_path })
        : await createUniverse({ ...value, cover_path: null });

      // A capa é um passo à parte: se falhar, o universo já salvo segue em frente
      // (salvar de novo criaria um universo duplicado).
      if (coverFile) {
        let uploaded: string | null = null;
        try {
          uploaded = await uploadImage(coverFile, saved.id, "covers");
          saved = await updateUniverse(saved.id, { cover_path: uploaded });
        } catch (err) {
          if (uploaded) await removeFile(uploaded);
          toast.error(`O universo foi salvo, mas a capa não. ${errorMessage(err)}`);
        }
      }
      // Capa trocada ou removida: apaga o arquivo antigo.
      if (previousCover && previousCover !== saved.cover_path) await removeFile(previousCover);

      qc.invalidateQueries({ queryKey: keys.universes });
      qc.setQueryData(keys.universe(saved.id), saved);
      setCurrentId(saved.id);
      toast.success(editing ? "Universo atualizado." : "Universo criado. Hora de povoá-lo!");
      navigate(`/mundos/${saved.id}`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (editing && isLoading) return <PageLoader />;
  if (editing && isError) return <ErrorState message="Universo não encontrado." />;

  return (
    <form onSubmit={save}>
      <Link to={editing ? `/mundos/${universeId}` : "/"} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Voltar
      </Link>
      <PageHeader
        title={editing ? `Editar ${universe?.name ?? "universo"}` : "Novo universo"}
        description="Descreva o mundo da sua campanha. Quanto mais contexto, mais coerentes ficam as criaturas sugeridas pela IA."
        actions={
          <Button type="submit" variant="primary" icon={<Save className="size-4" />} loading={saving}>
            {editing ? "Salvar alterações" : "Criar universo"}
          </Button>
        }
      />
      <UniverseForm value={value} onChange={setValue} coverFile={coverFile} onCoverFile={setCoverFile} />
      <div className="mt-6 flex justify-end gap-2 border-t border-line pt-5">
        <Button onClick={() => navigate(-1)} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" icon={<Save className="size-4" />} loading={saving}>
          {editing ? "Salvar alterações" : "Criar universo"}
        </Button>
      </div>
    </form>
  );
}
