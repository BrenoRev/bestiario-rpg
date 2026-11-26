import { ArrowRight, Compass, Globe2, Plus } from "lucide-react";
import { Link } from "react-router";
import { Button, EmptyState, ErrorState } from "../components/ui";
import { NewUniverseCard, UniverseCard } from "../components/universe/UniverseCard";
import { useCurrentUniverse } from "../context/UniverseContext";
import { useAuth } from "../context/AuthContext";
import { useHelp } from "../context/HelpContext";
import { useUniverses } from "../hooks/queries";

export function WorldsPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useUniverses();
  const { setCurrentId } = useCurrentUniverse();
  const { showHelp, openGuide } = useHelp();
  const firstName = ((user?.user_metadata?.full_name as string | undefined) ?? "").split(" ")[0];

  return (
    <>
      <section className="worlds-hero mb-8 flex min-h-[380px] items-center p-6 sm:p-10 lg:p-12" aria-label="Seus universos de campanha">
        <img src="/login-campaign.png" alt="" aria-hidden="true" />
        <div className="animate-rise max-w-xl">
          <p className="chapter-label mb-5">{firstName ? `Seu códice, ${firstName}` : "Seu códice de aventuras"}</p>
          <h1>Todo grande mundo começa com <em className="text-gold">uma história.</em></h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-silver-muted">
            Reúna suas lendas, dê forma às criaturas e prepare o próximo encontro. A próxima página é sua.
          </p>
          <Link to="/mundos/novo" viewTransition className="mt-7 inline-block">
            <Button variant="primary" icon={<Plus className="size-4" />}>Criar novo mundo <ArrowRight className="size-4" /></Button>
          </Link>
        </div>
      </section>

      {showHelp && (
        <div className="mb-10 flex flex-wrap items-center gap-4 rounded-xl border border-line bg-night-raised px-5 py-4">
          <Compass className="size-5 shrink-0 text-gold" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-sm leading-relaxed text-muted"><strong className="font-medium text-silver">Seu primeiro capítulo?</strong> Comece por um mundo. Cada universo tem seu próprio bestiário.</p>
          <Button variant="ghost" size="sm" onClick={openGuide}>Ver guia rápido <ArrowRight className="size-4" /></Button>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="chapter-label mb-2">Arquivo de universos</p>
          <h2 className="text-3xl font-medium sm:text-4xl">Seus mundos, seus destinos.</h2>
        </div>
        {!isLoading && !isError && <span className="text-xs text-muted">{data?.length ?? 0} {(data?.length ?? 0) === 1 ? "mundo registrado" : "mundos registrados"}</span>}
      </div>

      {isError ? (
        <ErrorState message="Não foi possível carregar seus mundos." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton aspect-[16/9]" />
              <div className="space-y-2 p-5">
                <div className="skeleton h-6 w-1/2 rounded" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-4/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : data && data.length === 0 ? (
        <EmptyState
          icon={<Globe2 className="size-6" />}
          title="Este códice ainda guarda páginas em branco."
          description="Um universo é o mundo da sua história: um reino medieval, uma estação espacial, uma cidade assombrada. Crie o primeiro e depois povoe-o de criaturas, à mão ou com a ajuda da IA."
          action={
            <Link to="/mundos/novo">
              <Button variant="primary" icon={<Plus className="size-4" />}>
                Criar meu primeiro universo
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="stagger grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {data?.map((u) => <UniverseCard key={u.id} universe={u} onOpen={() => setCurrentId(u.id)} />)}
          <NewUniverseCard />
        </div>
      )}
    </>
  );
}
