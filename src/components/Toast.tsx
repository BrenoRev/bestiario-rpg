import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cx, prefersReducedMotion } from "./ui";

type Tone = "success" | "error" | "info";
interface Toast {
  id: number;
  tone: Tone;
  message: string;
  /** Em animação de saída; sai da lista logo depois. */
  leaving?: boolean;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    const remove = () => setToasts((t) => t.filter((x) => x.id !== id));
    if (prefersReducedMotion()) return remove();
    setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    setTimeout(remove, 180);
  }, []);
  const push = useCallback(
    (tone: Tone, message: string) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t.slice(-3), { id, tone, message }]);
      setTimeout(() => dismiss(id), tone === "error" ? 7000 : 4000);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
    }),
    [push],
  );

  const icons = {
    success: <CheckCircle2 className="size-4 text-moss" />,
    error: <AlertCircle className="size-4 text-danger" />,
    info: <Info className="size-4 text-ink-soft" />,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="toast-stack pointer-events-none fixed right-4 left-4 z-[60] flex flex-col items-end gap-2 sm:left-auto">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={cx(
              t.leaving ? "animate-toast-out" : "animate-toast-in",
              "pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-lg border bg-cream px-3.5 py-3 text-sm shadow-[var(--shadow-pop)]",
              t.tone === "error" ? "border-danger/40" : "border-line",
            )}
          >
            <span className="mt-0.5">{icons[t.tone]}</span>
            <span className="flex-1 text-ink">{t.message}</span>
            <button className="-my-2 -mr-2 flex size-10 shrink-0 items-center justify-center text-muted hover:text-ink cursor-pointer" onClick={() => dismiss(t.id)} aria-label="Fechar aviso">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast fora do ToastProvider");
  return ctx;
}

/** Mensagem legível de qualquer erro. */
export function errorMessage(err: unknown, fallback = "Algo deu errado. Tente novamente."): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
