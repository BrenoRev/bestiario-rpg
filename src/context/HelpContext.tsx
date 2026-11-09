// Ajuda para quem não conhece RPG: guia de boas-vindas, glossário e preferência
// de mostrar os ícones "?". O guia abre sozinho na primeira visita.
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { GlossaryDialog } from "../components/help/GlossaryDialog";
import { WelcomeGuide } from "../components/help/WelcomeGuide";
import { keys, useProfile } from "../hooks/queries";
import { updateProfile } from "../lib/api";
import type { GlossaryKey } from "../lib/glossary";
import { useCurrentUniverse } from "./UniverseContext";

interface HelpState {
  /** Mostrar os ícones de ajuda (preferência do usuário; padrão: sim). */
  showHelp: boolean;
  openGuide: () => void;
  openGlossary: (focus?: GlossaryKey) => void;
}

// Fora do provedor (ex.: tela de login), a ajuda fica visível mas não abre janelas.
const HelpContext = createContext<HelpState>({ showHelp: true, openGuide: () => {}, openGlossary: () => {} });

export function HelpProvider({ children }: { children: ReactNode }) {
  const { data: profile } = useProfile();
  const { universes, loading } = useCurrentUniverse();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [guideOpen, setGuideOpen] = useState(false);
  const [glossary, setGlossary] = useState<{ open: boolean; focus: GlossaryKey | null }>({ open: false, focus: null });
  const autoOpened = useRef(false);

  const prefs = profile?.preferences ?? {};

  // Primeira visita: abre o guia uma vez, quando o perfil carrega.
  useEffect(() => {
    if (!profile || loading || autoOpened.current) return;
    autoOpened.current = true;
    if (!profile.preferences?.onboardingDone) setGuideOpen(true);
  }, [profile, loading]);

  const closeGuide = useCallback(async () => {
    setGuideOpen(false);
    if (!profile || profile.preferences?.onboardingDone) return;
    try {
      const updated = await updateProfile({ preferences: { ...profile.preferences, onboardingDone: true } });
      qc.setQueryData(keys.profile, updated);
    } catch {
      /* não é crítico: no pior caso o guia aparece de novo na próxima visita */
    }
  }, [profile, qc]);

  const value = useMemo<HelpState>(
    () => ({
      showHelp: prefs.showHelp !== false,
      openGuide: () => setGuideOpen(true),
      openGlossary: (focus) => setGlossary({ open: true, focus: focus ?? null }),
    }),
    [prefs.showHelp],
  );

  const hasUniverses = universes.length > 0;

  return (
    <HelpContext.Provider value={value}>
      {children}
      <WelcomeGuide
        open={guideOpen}
        onClose={() => void closeGuide()}
        finalAction={
          hasUniverses
            ? { label: "Começar", onClick: () => void closeGuide() }
            : {
                label: "Criar meu primeiro universo",
                onClick: () => {
                  void closeGuide();
                  navigate("/mundos/novo");
                },
              }
        }
      />
      <GlossaryDialog open={glossary.open} focus={glossary.focus} onClose={() => setGlossary({ open: false, focus: null })} />
    </HelpContext.Provider>
  );
}

export function useHelp(): HelpState {
  return useContext(HelpContext);
}
