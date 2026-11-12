import { BookOpen, Plus, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useCreatures } from "../../hooks/queries";
import { CREATURE_LIST_LIMIT } from "../../lib/api";
import { CREATURE_TYPES, HABITATS, THREAT_LEVELS } from "../../lib/dnd";
import { Button, cx, EmptyState, ErrorState, Select } from "../ui";
import { CreatureCard, CreatureCardSkeleton } from "./CreatureCard";

type Sort = "az" | "za" | "cr-asc" | "cr-desc" | "recent";

const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function BestiaryBrowser({ universeId }: { universeId: string }) {
  const { data = [], isLoading, isError, refetch } = useCreatures(universeId);
  const [term, setTerm] = useState("");
  const [type, setType] = useState("");
  const [habitat, setHabitat] = useState("");
  const [threat, setThreat] = useState("");
  const [sort, setSort] = useState<Sort>("az");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const q = normalize(term.trim());
    const t = THREAT_LEVELS.find((x) => x.value === threat);
    const list = data.filter(
      (c) =>
        (!q || normalize(c.name).includes(q)) &&
        (!type || c.creature_type === type) &&
        (!habitat || c.habitat_tags.includes(habitat as never)) &&
        (!t || (c.cr_value >= t.min && c.cr_value <= t.max)),
    );
    const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, "pt-BR");
    switch (sort) {
      case "za":
        return list.sort((a, b) => byName(b, a));
      case "cr-asc":
        return list.sort((a, b) => a.cr_value - b.cr_value || byName(a, b));
      case "cr-desc":
        return list.sort((a, b) => b.cr_value - a.cr_value || byName(a, b));
      case "recent":
        return list.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
      default:
        return list.sort(byName);
    }
  }, [data, term, type, habitat, threat, sort]);

  const activeFilters = [type, habitat, threat].filter(Boolean).length;
  const clear = () => {
    setType("");
    setHabitat("");
    setThreat("");
    setTerm("");
  };

  if (isError) return <ErrorState message="Não foi possível carregar o bestiário." onRetry={() => refetch()} />;

  if (!isLoading && data.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="size-6" />}
        title="O bestiário está vazio"
        description="Registre a primeira criatura deste mundo à mão ou peça ajuda à IA para concebê-la."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link to={`/criaturas/nova?universo=${universeId}`}>
              <Button icon={<Plus className="size-4" />}>Nova criatura</Button>
            </Link>
            <Link to="/criar">
              <Button variant="primary" icon={<Sparkles className="size-4" />}>
                Criar com IA
              </Button>
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <div>
      <div className="card mb-5 p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Pesquisar por nome…"
              aria-label="Pesquisar criatura por nome"
              className="field h-10 pl-9"
            />
          </div>
          <div className="flex min-w-0 gap-2">
            <Button icon={<SlidersHorizontal className="size-4" />} onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
              Filtros{activeFilters ? ` (${activeFilters})` : ""}
            </Button>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Ordenar" className="field h-10 min-w-0 flex-1 cursor-pointer sm:w-auto sm:flex-none">
              <option value="az">Nome (A–Z)</option>
              <option value="za">Nome (Z–A)</option>
              <option value="cr-asc">ND crescente</option>
              <option value="cr-desc">ND decrescente</option>
              <option value="recent">Editadas recentemente</option>
            </select>
          </div>
        </div>
        {showFilters && (
          <div className="animate-fade-in mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-3">
            <Select label="Categoria" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Todas</option>
              {CREATURE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
            <Select label="Habitat" value={habitat} onChange={(e) => setHabitat(e.target.value)}>
              <option value="">Todos</option>
              {HABITATS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </Select>
            <Select label="Nível de ameaça" help="ameaca" value={threat} onChange={(e) => setThreat(e.target.value)}>
              <option value="">Todos</option>
              {THREAT_LEVELS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      <div className="mb-3 flex items-center justify-between text-sm text-muted">
        <span>
          {isLoading ? "Carregando…" : `${filtered.length} de ${data.length} ${data.length === 1 ? "criatura" : "criaturas"}`}
        </span>
        {(activeFilters > 0 || term) && (
          <button type="button" onClick={clear} className="inline-flex items-center gap-1 text-wine hover:underline cursor-pointer">
            <X className="size-3.5" /> Limpar filtros
          </button>
        )}
      </div>

      <div className={cx("grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4", !isLoading && "stagger")}>
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => <CreatureCardSkeleton key={i} />)
          : filtered.map((c) => <CreatureCard key={c.id} creature={c} />)}
      </div>
      {data.length >= CREATURE_LIST_LIMIT && (
        <p className="mt-4 text-center text-xs text-muted">
          Mostrando as primeiras {CREATURE_LIST_LIMIT} criaturas em ordem alfabética. Use a busca global para encontrar as demais.
        </p>
      )}
      {!isLoading && filtered.length === 0 && (
        <p className="card mt-2 px-6 py-10 text-center text-sm text-muted">Nenhuma criatura corresponde à busca e aos filtros.</p>
      )}
    </div>
  );
}
