import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, Globe2, LogOut, Plus, Search, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useCurrentUniverse } from "../../context/UniverseContext";
import { useProfile } from "../../hooks/queries";
import { searchCreatures } from "../../lib/api";
import { typeLabel } from "../../lib/dnd";
import { Avatar } from "../brand";
import { cx, Spinner } from "../ui";

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function GlobalSearch() {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { universes, setCurrentId } = useCurrentUniverse();
  const q = useDebounced(term.trim(), 250);
  useClickOutside(ref, () => setOpen(false));

  const { data: creatures = [], isFetching } = useQuery({
    queryKey: ["search", q],
    queryFn: () => searchCreatures(q),
    enabled: q.length >= 2,
  });
  const worlds = q.length >= 2 ? universes.filter((u) => u.name.toLowerCase().includes(q.toLowerCase())).slice(0, 4) : [];
  const items = [
    ...worlds.map((u) => ({ key: `u-${u.id}`, go: () => navigate(`/mundos/${u.id}`), label: u.name, meta: "Universo", universeId: u.id })),
    ...creatures.map((c) => ({
      key: `c-${c.id}`,
      go: () => navigate(`/criaturas/${c.id}`),
      label: c.name,
      meta: `${typeLabel(c.creature_type)} · ND ${c.challenge_rating} · ${c.universe_name}`,
      universeId: c.universe_id,
    })),
  ];

  const choose = (i: number) => {
    const item = items[i];
    if (!item) return;
    setCurrentId(item.universeId);
    item.go();
    setOpen(false);
    setTerm("");
  };

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(items.length - 1, a + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
          } else if (e.key === "Enter") {
            choose(active);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder="Buscar criaturas e universos…"
        aria-label="Buscar criaturas e universos"
        className="field h-10 pl-9"
      />
      {open && q.length >= 2 && (
        <div className="animate-fade-in absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-lg border border-line bg-cream shadow-[var(--shadow-pop)]">
          {isFetching && items.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted">
              <Spinner className="size-4" /> Buscando…
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted">Nada encontrado para “{q}”.</div>
          ) : (
            <ul role="listbox" className="max-h-80 overflow-y-auto py-1">
              {items.map((item, i) => (
                <li key={item.key}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(i)}
                    className={cx("flex w-full flex-col items-start px-4 py-2 text-left cursor-pointer", i === active && "bg-wine-soft/70")}
                  >
                    <span className="font-display text-base font-semibold text-ink">{item.label}</span>
                    <span className="text-xs text-muted">{item.meta}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Dropdown({ trigger, children, align = "right" }: { trigger: (open: boolean) => ReactNode; children: (close: () => void) => ReactNode; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((o) => !o)}>{trigger(open)}</div>
      {open && (
        <div
          className={cx(
            "animate-fade-in absolute top-12 z-40 min-w-60 overflow-hidden rounded-lg border border-line bg-cream py-1 shadow-[var(--shadow-pop)]",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

const menuItem = "flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-ink-soft hover:bg-sand/60 hover:text-ink cursor-pointer";

export function UniverseSwitcher() {
  const { universes, current, setCurrentId } = useCurrentUniverse();
  const navigate = useNavigate();
  if (!current) return null;
  return (
    <Dropdown
      align="left"
      trigger={(open) => (
        <button
          type="button"
          aria-expanded={open}
          className="flex h-10 max-w-56 items-center gap-2 rounded-lg border border-line bg-cream px-3 text-sm hover:border-line-strong cursor-pointer"
        >
          <Globe2 className="size-4 shrink-0 text-wine" />
          <span className="truncate font-medium">{current.name}</span>
          <ChevronDown className="size-4 shrink-0 text-muted" />
        </button>
      )}
    >
      {(close) => (
        <>
          <div className="px-4 pb-1 pt-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">Trocar de universo</div>
          <div className="max-h-72 overflow-y-auto">
            {universes.map((u) => (
              <button
                key={u.id}
                type="button"
                className={menuItem}
                onClick={() => {
                  setCurrentId(u.id);
                  close();
                }}
              >
                <Check className={cx("size-4", u.id === current.id ? "text-wine" : "invisible")} />
                <span className="flex-1 truncate">{u.name}</span>
                <span className="text-xs text-muted">{u.creature_count}</span>
              </button>
            ))}
          </div>
          <div className="my-1 border-t border-line" />
          <button
            type="button"
            className={menuItem}
            onClick={() => {
              close();
              navigate("/mundos/novo");
            }}
          >
            <Plus className="size-4" /> Novo universo
          </button>
        </>
      )}
    </Dropdown>
  );
}

function ProfileMenu() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const name = profile?.display_name ?? (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "";
  const avatar = profile?.avatar_url ?? (user?.user_metadata?.avatar_url as string | undefined);
  return (
    <Dropdown
      trigger={(open) => (
        <button type="button" aria-label="Perfil" aria-expanded={open} className="rounded-full cursor-pointer">
          <Avatar url={avatar} name={name} className="size-9" />
        </button>
      )}
    >
      {(close) => (
        <>
          <div className="border-b border-line px-4 py-3">
            <div className="truncate text-sm font-semibold text-ink">{name}</div>
            <div className="truncate text-xs text-muted">{user?.email}</div>
          </div>
          <Link to="/configuracoes" className={menuItem} onClick={close}>
            <Settings className="size-4" /> Configurações
          </Link>
          <button type="button" className={menuItem} onClick={() => void signOut()}>
            <LogOut className="size-4" /> Sair da conta
          </button>
        </>
      )}
    </Dropdown>
  );
}

export function Topbar({ menuButton }: { menuButton: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {menuButton}
        <div className="hidden md:block">
          <UniverseSwitcher />
        </div>
        <div className="flex flex-1 justify-end md:justify-center">
          <GlobalSearch />
        </div>
        <ProfileMenu />
      </div>
    </header>
  );
}
