import { useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Pencil, Plus, ScrollText, Sparkles, Trash2, Wand } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { StoredImage } from "../components/brand";
import { BestiaryBrowser } from "../components/creature/BestiaryBrowser";
import { ConfirmDialog } from "../components/Modal";
import { errorMessage, useToast } from "../components/Toast";
import { Badge, Button, ErrorState, PageLoader } from "../components/ui";
import { FANTASY_LABEL } from "../components/universe/UniverseCard";
import { useCurrentUniverse } from "../context/UniverseContext";
import { keys, useUniverse } from "../hooks/queries";
import { deleteUniverse } from "../lib/api";

export function UniversePage() {
  const { universeId } = useParams();
  const { data: universe, isLoading, isError } = useUniverse(universeId);
  const { universes, setCurrentId } = useCurrentUniverse();
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    if (universe) setCurrentId(universe.id);
  }, [universe, setCurrentId]);

  if (isLoading) return <PageLoader />;
  if (isError || !universe) return <ErrorState message="Universo não encontrado." />;

  const count = universes.find((u) => u.id === universe.id)?.creature_count;

  const remove = async () => {
    setDeleting(true);
    try {
      await deleteUniverse(universe);
      qc.invalidateQueries({ queryKey: keys.universes });
      qc.removeQueries({ queryKey: keys.creatures(universe.id) });
      toast.success(`“${universe.name}” foi excluído.`);
      navigate("/");
    } catch (err) {
      toast.error(errorMessage(err));
      setDeleting(false);
    }
  };

  const details = [
    { icon: ScrollText, label: "Ambientação", text: universe.setting },
    { icon: CalendarClock, label: "Época", text: universe.era },
    { icon: Wand, label: "Regras particulares", text: universe.rules },
  ].filter((d) => d.text.trim());

  return (
    <>
      <section className="card mb-8 overflow-hidden">
        <div className="grid md:grid-cols-[minmax(0,22rem)_1fr]">
          <StoredImage path={universe.cover_path} alt={`Capa de ${universe.name}`} className="aspect-[16/10] size-full border-b border-line [view-transition-name:universe-cover] md:aspect-auto md:min-h-64 md:border-b-0 md:border-r" fallbackLabel="Sem capa" />
          <div className="flex flex-col p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              {universe.genre && <Badge tone="wine">{universe.genre}</Badge>}
              <Badge>{FANTASY_LABEL[universe.fantasy_level]}</Badge>
              {count != null && <Badge tone="moss">{count} {count === 1 ? "criatura" : "criaturas"}</Badge>}
            </div>
            <h1 className="mt-3 text-[2.4rem] leading-tight font-semibold">{universe.name}</h1>
            {universe.description && <p className="mt-2 max-w-3xl text-[0.95rem] leading-relaxed text-ink-soft">{universe.description}</p>}
            {details.length > 0 && (
              <dl className="mt-5 grid gap-4 lg:grid-cols-3">
                {details.map(({ icon: Icon, label, text }) => (
                  <div key={label}>
                    <dt className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
                      <Icon className="size-3.5" /> {label}
                    </dt>
                    <dd className="mt-1 line-clamp-4 text-sm leading-relaxed text-ink-soft" title={text}>
                      {text}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="mt-auto flex flex-wrap gap-2 pt-6">
              <Link to={`/mundos/${universe.id}/editar`}>
                <Button size="sm" icon={<Pencil className="size-4" />}>
                  Editar universo
                </Button>
              </Link>
              <Button size="sm" variant="danger" icon={<Trash2 className="size-4" />} onClick={() => setConfirm(true)}>
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-3xl font-semibold">Bestiário</h2>
        <div className="flex gap-2">
          <Link to={`/criaturas/nova?universo=${universe.id}`}>
            <Button icon={<Plus className="size-4" />}>Nova criatura</Button>
          </Link>
          <Link to="/criar">
            <Button variant="primary" icon={<Sparkles className="size-4" />}>
              Criar com IA
            </Button>
          </Link>
        </div>
      </div>
      <BestiaryBrowser universeId={universe.id} />

      <ConfirmDialog
        open={confirm}
        title={`Excluir “${universe.name}”?`}
        message={
          <>
            O universo, <strong>todas as suas criaturas</strong> e as imagens associadas serão apagados permanentemente. Esta ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir universo"
        loading={deleting}
        onConfirm={remove}
        onClose={() => setConfirm(false)}
      />
    </>
  );
}
