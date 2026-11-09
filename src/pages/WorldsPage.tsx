import { Globe2, Plus } from "lucide-react";
import { Link } from "react-router";
import { Button, EmptyState, ErrorState, PageHeader } from "../components/ui";
import { NewUniverseCard, UniverseCard } from "../components/universe/UniverseCard";
import { useCurrentUniverse } from "../context/UniverseContext";
import { useAuth } from "../context/AuthContext";
import { useUniverses } from "../hooks/queries";

export function WorldsPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useUniverses();
  const { setCurrentId } = useCurrentUniverse();
  const firstName = ((user?.user_metadata?.full_name as string | undefined) ?? "").split(" ")[0];

  return (
    <>
      <PageHeader
        eyebrow={firstName ? `Saudações, ${firstName}` : "Seus universos"}
        title="Meus Mundos"
        description="Cada universo guarda seu próprio bestiário e serve de contexto para a IA."
        actions={
          <Link to="/mundos/novo">
            <Button variant="primary" icon={<Plus className="size-4" />}>
              Novo universo
            </Button>
          </Link>
        }
      />

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
          title="Nenhum mundo por aqui ainda"
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
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {data?.map((u) => <UniverseCard key={u.id} universe={u} onOpen={() => setCurrentId(u.id)} />)}
          <NewUniverseCard />
        </div>
      )}
    </>
  );
}
