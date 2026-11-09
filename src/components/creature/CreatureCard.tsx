import { MapPin } from "lucide-react";
import { Link, useViewTransitionState } from "react-router";
import { usePrefetch } from "../../hooks/queries";
import { habitatLabel, sizeLabel, threatLevel, typeLabel } from "../../lib/dnd";
import type { CreatureSummary } from "../../lib/types";
import { StoredImage } from "../brand";
import { Badge, cx } from "../ui";

const THREAT_TONE = { baixa: "moss", moderada: "amber", alta: "wine", mortal: "wine" } as const;

export function CreatureCard({ creature }: { creature: CreatureSummary }) {
  const threat = threatLevel(creature.challenge_rating);
  const to = `/criaturas/${creature.id}`;
  const prefetch = usePrefetch();
  // Só o cartão clicado recebe os nomes da transição: a ilustração e o nome "voam" até a ficha.
  const flying = useViewTransitionState(to);
  const warm = () => prefetch.creature(creature.id);
  const strong = threat.value === "alta" || threat.value === "mortal";
  return (
    <Link
      to={to}
      viewTransition
      onPointerEnter={warm}
      onFocus={warm}
      onTouchStart={warm}
      className="card group flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-pop)]"
    >
      <div className="glint relative aspect-[4/3] overflow-hidden border-b border-line" style={{ viewTransitionName: flying ? "creature-image" : undefined }}>
        <StoredImage path={creature.image_path} alt={creature.name} className="size-full transition-transform duration-500 group-hover:scale-[1.03]" />
        <span
          className={cx(
            "absolute right-2 top-2 rounded-md border px-2 py-0.5 text-xs font-bold tabular-nums shadow-sm",
            strong ? "border-wine bg-wine text-cream" : "border-wine-line bg-cream/95 text-wine",
            threat.value === "mortal" && "animate-ember",
          )}
        >
          ND {creature.challenge_rating}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3
            className="w-fit text-xl leading-tight font-semibold text-ink group-hover:text-wine"
            style={{ viewTransitionName: flying ? "creature-name" : undefined }}
          >
            {creature.name}
          </h3>
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
