import { MapPin } from "lucide-react";
import { Link } from "react-router";
import { habitatLabel, sizeLabel, threatLevel, typeLabel } from "../../lib/dnd";
import type { CreatureSummary } from "../../lib/types";
import { StoredImage } from "../brand";
import { Badge } from "../ui";

const THREAT_TONE = { baixa: "moss", moderada: "amber", alta: "wine", mortal: "wine" } as const;

export function CreatureCard({ creature }: { creature: CreatureSummary }) {
  const threat = threatLevel(creature.challenge_rating);
  return (
    <Link
      to={`/criaturas/${creature.id}`}
      className="card group flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-pop)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-line">
        <StoredImage path={creature.image_path} alt={creature.name} className="size-full transition-transform duration-500 group-hover:scale-[1.03]" />
        <span className="absolute right-2 top-2 rounded-md border border-wine-line bg-cream/95 px-2 py-0.5 text-xs font-bold text-wine shadow-sm">
          ND {creature.challenge_rating}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="text-xl leading-tight font-semibold text-ink group-hover:text-wine">{creature.name}</h3>
          <p className="text-xs text-muted">
            {typeLabel(creature.creature_type)} · {sizeLabel(creature.size)}
          </p>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-1.5">
          <Badge tone={THREAT_TONE[threat.value]}>Ameaça {threat.label.split(" ")[0].toLowerCase()}</Badge>
          {creature.habitat_tags.slice(0, 2).map((h) => (
            <Badge key={h}>
              <MapPin className="size-3" />
              {habitatLabel(h)}
            </Badge>
          ))}
          {creature.habitat_tags.length > 2 && <Badge>+{creature.habitat_tags.length - 2}</Badge>}
        </div>
      </div>
    </Link>
  );
}

export function CreatureCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-5 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}
