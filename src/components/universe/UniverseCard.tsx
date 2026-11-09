import { BookOpen, Plus } from "lucide-react";
import { Link } from "react-router";
import type { UniverseWithCount } from "../../lib/types";
import { StoredImage } from "../brand";
import { Badge } from "../ui";

export const FANTASY_LABEL = { baixo: "Fantasia baixa", medio: "Fantasia média", alto: "Fantasia alta" } as const;

export function UniverseCard({ universe, onOpen }: { universe: UniverseWithCount; onOpen?: () => void }) {
  return (
    <Link
      to={`/mundos/${universe.id}`}
      onClick={onOpen}
      className="card group flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-pop)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden border-b border-line">
        <StoredImage path={universe.cover_path} alt={`Capa de ${universe.name}`} className="size-full transition-transform duration-500 group-hover:scale-[1.03]" />
        {universe.genre && (
          <span className="absolute left-3 top-3 rounded-md border border-line bg-cream/95 px-2 py-0.5 text-[0.7rem] font-semibold text-ink-soft shadow-sm">
            {universe.genre}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-2xl leading-tight font-semibold group-hover:text-wine">{universe.name}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{universe.description || universe.setting || "Sem descrição."}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft">
            <BookOpen className="size-4 text-wine" />
            {universe.creature_count} {universe.creature_count === 1 ? "criatura" : "criaturas"}
          </span>
          <Badge>{FANTASY_LABEL[universe.fantasy_level]}</Badge>
        </div>
      </div>
    </Link>
  );
}

export function NewUniverseCard() {
  return (
    <Link
      to="/mundos/novo"
      className="group flex min-h-72 flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border-2 border-dashed border-wine-line bg-wine-soft/40 p-6 text-center transition-colors hover:border-wine hover:bg-wine-soft"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-wine text-cream shadow-[var(--shadow-soft)] transition-transform group-hover:scale-105">
        <Plus className="size-7" />
      </span>
      <span className="font-display text-2xl font-semibold text-wine">Criar novo universo</span>
      <span className="max-w-56 text-sm text-muted">Um novo mundo com seu próprio bestiário.</span>
    </Link>
  );
}
