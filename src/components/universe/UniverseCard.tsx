import { ArrowUpRight, BookOpen, Plus } from "lucide-react";
import { Link, useViewTransitionState } from "react-router";
import { usePrefetch } from "../../hooks/queries";
import type { UniverseWithCount } from "../../lib/types";
import { StoredImage } from "../brand";
import { Badge } from "../ui";

export const FANTASY_LABEL = { baixo: "Fantasia baixa", medio: "Fantasia média", alto: "Fantasia alta" } as const;

export function UniverseCard({ universe, onOpen }: { universe: UniverseWithCount; onOpen?: () => void }) {
  const to = `/mundos/${universe.id}`;
  const prefetch = usePrefetch();
  // Só o cartão clicado recebe o nome da transição: a capa "voa" até a página do universo.
  const flying = useViewTransitionState(to);
  const warm = () => prefetch.universe(universe.id);
  return (
    <Link
      to={to}
      viewTransition
      onClick={onOpen}
      onPointerEnter={warm}
      onFocus={warm}
      onTouchStart={warm}
      className="card collectible-card group flex min-w-0 flex-col overflow-hidden"
    >
      <div className="glint relative aspect-[16/9] overflow-hidden border-b border-line" style={{ viewTransitionName: flying ? "universe-cover" : undefined }}>
        <StoredImage path={universe.cover_path} alt={`Capa de ${universe.name}`} fallbackLabel="Um mundo por descobrir" className="size-full transition-transform duration-500 group-hover:scale-[1.025]" />
        {universe.genre && (
          <span className="absolute left-4 top-4 rounded-full border border-gold/25 bg-night/90 px-3 py-1 text-xs font-medium text-silver">
            {universe.genre}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-3xl leading-tight font-medium group-hover:text-gold">{universe.name}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{universe.description || universe.setting || "Sem descrição."}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">
            <BookOpen className="size-4 text-wine" />
            {universe.creature_count} {universe.creature_count === 1 ? "criatura" : "criaturas"}
          </span>
          <Badge>{FANTASY_LABEL[universe.fantasy_level]}</Badge>
        </div>
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gold">Abrir mundo <ArrowUpRight className="size-3.5" /></span>
      </div>
    </Link>
  );
}

export function NewUniverseCard() {
  return (
    <Link
      to="/mundos/novo"
      viewTransition
      className="collectible-card group flex min-h-72 flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-gold/30 bg-gold/5 p-6 text-center hover:bg-gold/10"
    >
      <span className="flex size-14 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold transition-transform group-hover:scale-105">
        <Plus className="size-7" />
      </span>
      <span className="font-display text-2xl font-semibold text-wine">Criar novo universo</span>
      <span className="max-w-56 text-sm text-muted">Um novo mundo com seu próprio bestiário.</span>
    </Link>
  );
}
