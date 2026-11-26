import { Globe2, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { BestiaryBrowser } from "../components/creature/BestiaryBrowser";
import { Button, EmptyState, PageHeader, PageLoader } from "../components/ui";
import { useCurrentUniverse } from "../context/UniverseContext";

export function CreaturesPage() {
  const { current, loading } = useCurrentUniverse();

  if (loading) return <PageLoader />;
  if (!current) {
    return (
      <EmptyState
        icon={<Globe2 className="size-6" />}
        title="Crie um universo primeiro"
        description="Cada criatura pertence a um universo. Crie o mundo da sua campanha para começar o bestiário."
        action={
          <Link to="/mundos/novo">
            <Button variant="primary" icon={<Plus className="size-4" />}>
              Novo universo
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={
          <span>
            Bestiário de
            {" "}<Link to={`/mundos/${current.id}`} className="normal-case tracking-normal text-gold hover:underline">
              {current.name}
            </Link>
          </span>
        }
        title="Criaturas"
        description="Todas as criaturas registradas neste universo. Troque de universo pelo seletor no topo."
        actions={
          <>
            <Link to={`/criaturas/nova?universo=${current.id}`}>
              <Button icon={<Plus className="size-4" />}>Nova criatura</Button>
            </Link>
            <Link to="/criar">
              <Button variant="primary" icon={<Sparkles className="size-4" />}>
                Criar com IA
              </Button>
            </Link>
          </>
        }
      />
      <BestiaryBrowser universeId={current.id} />
    </>
  );
}
