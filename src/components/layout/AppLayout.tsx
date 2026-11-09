import { BookOpen, Globe2, Menu, Settings, Sparkles, X } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { useCurrentUniverse } from "../../context/UniverseContext";
import { Logo, StoredImage } from "../brand";
import { cx, IconButton, PageLoader } from "../ui";
import { Topbar, UniverseSwitcher } from "./Topbar";

const NAV = [
  { to: "/", label: "Meus Mundos", icon: Globe2, end: true },
  { to: "/criaturas", label: "Criaturas", icon: BookOpen },
  { to: "/criar", label: "Criar com IA", icon: Sparkles },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { current } = useCurrentUniverse();
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-5 pb-6">
        <Logo />
      </div>
      {/* No celular o seletor do topo some: a troca de universo fica aqui no menu. */}
      {onNavigate && (
        <div className="px-3 pb-4 md:hidden">
          <UniverseSwitcher />
        </div>
      )}
      <nav className="flex flex-col gap-0.5 px-3" aria-label="Navegação principal">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cx(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-wine-soft text-wine" : "text-ink-soft hover:bg-sand/70 hover:text-ink",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cx("size-[1.1rem]", isActive ? "text-wine" : "text-muted group-hover:text-ink-soft")} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {current && (
        <div className="mt-auto p-3">
          <NavLink
            to={`/mundos/${current.id}`}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg border border-line bg-parchment p-2.5 transition-colors hover:border-line-strong"
          >
            <StoredImage path={current.cover_path} alt="" className="size-10 shrink-0 rounded-md" />
            <div className="min-w-0">
              <div className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">Universo atual</div>
              <div className="truncate font-display text-base font-semibold text-ink">{current.name}</div>
            </div>
          </NavLink>
        </div>
      )}
    </div>
  );
}

export function AppLayout() {
  const [drawer, setDrawer] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setDrawer(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      {/* Barra lateral fixa (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-parchment lg:block">
        <Sidebar />
      </aside>

      {/* Gaveta (mobile) */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawer(false)} aria-hidden />
          <aside className="animate-fade-in absolute inset-y-0 left-0 w-72 border-r border-line bg-parchment shadow-[var(--shadow-pop)]">
            <IconButton label="Fechar menu" onClick={() => setDrawer(false)} className="absolute right-3 top-4">
              <X className="size-5" />
            </IconButton>
            <Sidebar onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <Topbar
          menuButton={
            <IconButton label="Abrir menu" onClick={() => setDrawer(true)} className="lg:hidden">
              <Menu className="size-5" />
            </IconButton>
          }
        />
        <main className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
