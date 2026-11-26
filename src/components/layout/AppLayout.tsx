import { BookOpen, Globe2, Settings, Sparkles } from "lucide-react";
import { Suspense, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useCurrentUniverse } from "../../context/UniverseContext";
import { Logo, StoredImage } from "../brand";
import { cx, PageLoader } from "../ui";
import { Topbar } from "./Topbar";

const NAV = [
  { to: "/", label: "Meus Mundos", mobileLabel: "Mundos", icon: Globe2, end: true },
  { to: "/criaturas", label: "Criaturas", mobileLabel: "Criaturas", icon: BookOpen },
  { to: "/criar", label: "Criar com IA", mobileLabel: "Forja", icon: Sparkles },
  { to: "/configuracoes", label: "Configurações", mobileLabel: "Ajustes", icon: Settings },
];

function Sidebar() {
  const { current } = useCurrentUniverse();
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-8 pb-10">
        <Link to="/" aria-label="Bestiário — Meus Mundos"><Logo /></Link>
      </div>
      <p className="mb-4 px-7 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted">Seu códice</p>
      <nav className="flex flex-col gap-2 px-4" aria-label="Navegação principal">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            viewTransition
            className={({ isActive }) =>
              cx(
                "group flex min-h-12 items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
                isActive ? "border-gold/25 bg-gold/10 text-gold" : "border-transparent text-muted hover:bg-night-soft hover:text-silver",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cx("size-[1.1rem]", isActive ? "text-gold" : "text-muted group-hover:text-silver")} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4">
        {current && (
          <NavLink
            to={`/mundos/${current.id}`}
            viewTransition
            className="flex items-center gap-3 rounded-xl border border-line bg-night-soft/40 p-3 transition-colors hover:border-gold/40"
          >
            <StoredImage path={current.cover_path} alt="" className="size-10 shrink-0 rounded-md" />
            <div className="min-w-0">
              <div className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">Universo atual</div>
              <div className="truncate font-display text-base font-semibold text-ink">{current.name}</div>
            </div>
          </NavLink>
        )}
        <p className="mt-5 border-t border-line pt-5 text-center text-xs leading-relaxed text-muted">
          A IA propõe. <span className="text-gold">Você decide.</span>
        </p>
      </div>
    </div>
  );
}

export function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
      {/* Barra lateral fixa (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-night-raised lg:block">
        <Sidebar />
      </aside>

      <div className="lg:pl-64">
        <Topbar
          mobileBrand={
            <Link to="/" aria-label="Bestiário — Meus Mundos" className="shrink-0 lg:hidden"><Logo compact /></Link>
          }
        />
        {/* `page`: nome da transição entre telas (index.css). */}
        <main id="conteudo" tabIndex={-1} className="mx-auto w-full min-w-0 max-w-[1440px] px-4 pt-6 pb-28 outline-none [view-transition-name:page] sm:px-6 lg:px-10 lg:py-10">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <nav className="mobile-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-night-raised/95 backdrop-blur-lg lg:hidden" aria-label="Navegação principal móvel">
        {NAV.map(({ to, label, mobileLabel, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            viewTransition
            aria-label={label}
            className={({ isActive }) => cx(
              "flex min-h-[4.5rem] min-w-0 flex-col items-center justify-center gap-1.5 px-1 text-xs",
              isActive ? "bg-gold/5 text-gold" : "text-muted hover:text-silver",
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            {mobileLabel}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
