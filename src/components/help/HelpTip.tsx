// Ícone "?" ao lado de um termo: explica em linguagem simples o que ele significa.
// Não importa de ../ui para evitar ciclo (ui.tsx usa este componente nos rótulos).
import { BookOpen, HelpCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useHelp } from "../../context/HelpContext";
import { GLOSSARY, type GlossaryEntry, type GlossaryKey } from "../../lib/glossary";

const WIDTH = 288;

export function HelpTip({ term, className }: { term: GlossaryKey; className?: string }) {
  const { showHelp, openGlossary } = useHelp();
  const entry: GlossaryEntry = GLOSSARY[term];
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // Calcula a posição a partir do ícone: abre para baixo e, se não couber, para cima.
  // Devolve null quando o ícone saiu da tela.
  const place = () => {
    const r = buttonRef.current?.getBoundingClientRect();
    if (!r || r.bottom < 0 || r.top > window.innerHeight) return null;
    const width = Math.min(WIDTH, window.innerWidth - 16);
    const left = Math.min(Math.max(8, r.left - 12), window.innerWidth - width - 8);
    const height = popRef.current?.offsetHeight ?? 180;
    const below = r.bottom + 6;
    const top = below + height > window.innerHeight - 8 ? Math.max(8, r.top - height - 6) : below;
    return { top, left, width };
  };

  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    // Ao rolar ou redimensionar, a explicação acompanha o ícone (no celular a página costuma
    // rolar um pouco logo após o toque); só fecha quando o ícone sai da tela.
    let frame = 0;
    const follow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setPos(place()));
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!popRef.current?.contains(t) && !buttonRef.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos !== null]);

  if (!showHelp) return null;

  const toggle = () => setPos((p) => (p ? null : place()));

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle();
        }}
        aria-label={`O que é ${entry.term}?`}
        aria-expanded={!!pos}
        className={`help-tip -my-2 -mx-1.5 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full p-1.5 text-muted transition-colors hover:text-wine ${className ?? ""}`}
      >
        <HelpCircle className="size-3.5" />
      </button>
      {pos &&
        createPortal(
          <div
            ref={popRef}
            role="dialog"
            aria-label={entry.term}
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            className="animate-fade-in fixed z-[70] rounded-lg border border-line bg-cream p-3.5 text-left shadow-[var(--shadow-pop)]"
          >
            <div className="font-display text-lg leading-tight font-semibold text-ink">{entry.term}</div>
            <p className="mt-1 text-[0.82rem] leading-relaxed text-ink-soft">{entry.short}</p>
            {entry.example && <p className="mt-1.5 text-[0.78rem] leading-relaxed text-muted italic">Ex.: {entry.example}</p>}
            <button
              type="button"
              onClick={() => {
                setPos(null);
                openGlossary(term);
              }}
              className="mt-2 inline-flex min-h-8 cursor-pointer items-center gap-1.5 text-xs font-semibold text-wine hover:underline"
            >
              <BookOpen className="size-3.5" /> Ver o glossário completo
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
