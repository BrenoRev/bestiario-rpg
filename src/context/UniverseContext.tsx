// Universo em que o mestre está trabalhando. Fica salvo por usuário no
// navegador para que "Criaturas" e "Criar com IA" abram no mesmo mundo.
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useUniverses } from "../hooks/queries";
import type { UniverseWithCount } from "../lib/types";
import { useAuth } from "./AuthContext";

interface UniverseState {
  universes: UniverseWithCount[];
  loading: boolean;
  current: UniverseWithCount | null;
  setCurrentId: (id: string) => void;
}

const UniverseContext = createContext<UniverseState | null>(null);

const storageKey = (uid: string) => `bestiario:universe:${uid}`;
const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* armazenamento indisponível: segue sem lembrar */
  }
};

export function UniverseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: universes = [], isLoading } = useUniverses();
  const [currentId, setId] = useState<string | null>(null);

  useEffect(() => {
    if (user) setId(read(storageKey(user.id)));
  }, [user]);

  const setCurrentId = useCallback(
    (id: string) => {
      setId(id);
      if (user) write(storageKey(user.id), id);
    },
    [user],
  );

  const current = useMemo(
    () => universes.find((u) => u.id === currentId) ?? universes[0] ?? null,
    [universes, currentId],
  );

  const value = useMemo(
    () => ({ universes, loading: isLoading, current, setCurrentId }),
    [universes, isLoading, current, setCurrentId],
  );

  return <UniverseContext.Provider value={value}>{children}</UniverseContext.Provider>;
}

export function useCurrentUniverse(): UniverseState {
  const ctx = useContext(UniverseContext);
  if (!ctx) throw new Error("useCurrentUniverse fora do UniverseProvider");
  return ctx;
}
