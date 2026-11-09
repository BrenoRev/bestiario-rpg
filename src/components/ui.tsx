// Componentes de interface reutilizáveis.
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { forwardRef, useEffect, useId, useState } from "react";
import type { GlossaryKey } from "../lib/glossary";
import { HelpTip } from "./help/HelpTip";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export { cx };

// ------------------------------------------------------------------ Botões
type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-wine text-cream hover:bg-wine-dark border border-wine shadow-[var(--shadow-soft)]",
  secondary: "bg-cream text-ink border border-line hover:border-line-strong hover:bg-parchment",
  ghost: "text-ink-soft hover:bg-sand/70 border border-transparent",
  subtle: "bg-wine-soft text-wine border border-wine-line/70 hover:bg-wine-tint",
  danger: "bg-cream text-wine border border-wine-line hover:bg-wine-soft",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
  loading?: boolean;
  icon?: ReactNode;
  /** Ícone mostrado durante `loading` no lugar do spinner (ex.: o d20 rolando nas ações de IA). */
  busyIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", loading, icon, busyIcon, className, children, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors whitespace-nowrap",
        "disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer",
        size === "sm" ? "h-8 px-3 text-[0.8rem]" : "h-10 px-4 text-sm",
        VARIANTS[variant],
        className,
      )}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (busyIcon ?? <Loader2 className="size-4 animate-spin" aria-hidden />) : icon}
      {children}
    </button>
  );
});

export function IconButton({
  label,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-sand/70 hover:text-ink transition-colors cursor-pointer disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

// ------------------------------------------------------------------ Campos
interface FieldShellProps {
  label?: string;
  hint?: ReactNode;
  /** Termo do glossário explicado por um ícone "?" ao lado do rótulo. */
  help?: GlossaryKey;
  className?: string;
  children: (id: string) => ReactNode;
}

/** Rótulo de campo, com o ícone de ajuda fora do <label> (botão dentro de label é inválido). */
export function FieldLabel({ htmlFor, label, help }: { htmlFor?: string; label: string; help?: GlossaryKey }) {
  if (!help) {
    return (
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
    );
  }
  return (
    <div className="mb-[0.35rem] flex items-center gap-1">
      <label htmlFor={htmlFor} className="label mb-0">
        {label}
      </label>
      <HelpTip term={help} />
    </div>
  );
}

export function FieldShell({ label, hint, help, className, children }: FieldShellProps) {
  const id = useId();
  return (
    <div className={className}>
      {label && <FieldLabel htmlFor={id} label={label} help={help} />}
      {children(id)}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

type WithLabel = { label?: string; hint?: ReactNode; help?: GlossaryKey; wrapperClassName?: string };

export function TextInput({ label, hint, help, wrapperClassName, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & WithLabel) {
  return (
    <FieldShell label={label} hint={hint} help={help} className={wrapperClassName}>
      {(id) => <input id={id} className={cx("field", className)} {...rest} />}
    </FieldShell>
  );
}

export function NumberInput({
  label,
  hint,
  help,
  wrapperClassName,
  className,
  value,
  onValue,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & WithLabel & { value: number; onValue: (n: number) => void }) {
  return (
    <FieldShell label={label} hint={hint} help={help} className={wrapperClassName}>
      {(id) => (
        <input
          id={id}
          type="number"
          inputMode="numeric"
          className={cx("field tabular-nums", className)}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onValue(e.target.value === "" ? 0 : Number(e.target.value))}
          {...rest}
        />
      )}
    </FieldShell>
  );
}

export function TextArea({ label, hint, help, wrapperClassName, className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & WithLabel) {
  return (
    <FieldShell label={label} hint={hint} help={help} className={wrapperClassName}>
      {(id) => <textarea id={id} className={cx("field min-h-24 resize-y leading-relaxed", className)} {...rest} />}
    </FieldShell>
  );
}

export function Select({
  label,
  hint,
  help,
  wrapperClassName,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & WithLabel) {
  return (
    <FieldShell label={label} hint={hint} help={help} className={wrapperClassName}>
      {(id) => (
        <select id={id} className={cx("field cursor-pointer pr-8", className)} {...rest}>
          {children}
        </select>
      )}
    </FieldShell>
  );
}

/** Controle segmentado (opções exclusivas). */
export function Segmented<T extends string>({
  label,
  help,
  value,
  options,
  onChange,
}: {
  label?: string;
  help?: GlossaryKey;
  value: T;
  options: { value: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      {label && <FieldLabel label={label} help={help} />}
      <div role="radiogroup" aria-label={label} className="flex rounded-lg border border-line bg-parchment p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            title={o.hint}
            onClick={() => onChange(o.value)}
            className={cx(
              "min-h-9 min-w-0 flex-1 rounded-md px-1.5 py-1.5 text-[0.78rem] leading-tight font-medium transition-colors cursor-pointer sm:px-2.5 sm:text-[0.8rem]",
              value === o.value ? "bg-cream text-wine shadow-[var(--shadow-soft)] border border-line" : "text-muted hover:text-ink border border-transparent",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  help,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  help?: GlossaryKey;
}) {
  return (
    <div className="flex items-start gap-1">
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative mt-0.5 inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors cursor-pointer",
          checked ? "bg-wine border-wine" : "bg-sand border-line-strong",
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 size-3.5 rounded-full bg-cream shadow transition-transform",
            checked ? "translate-x-[1.1rem]" : "translate-x-0.5",
          )}
        />
      </button>
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="block text-xs text-muted">{description}</span>}
      </span>
    </label>
    {help && <HelpTip term={help} className="mt-1" />}
    </div>
  );
}

// ------------------------------------------------------------------ Movimento
/** O usuário pediu ao sistema para reduzir animações. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Mantém um elemento montado durante a animação de saída.
 * `closing` fica verdadeiro nesse intervalo: use-o para trocar a classe de entrada pela de saída.
 */
export function usePresence(open: boolean, ms = 180): { mounted: boolean; closing: boolean } {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    if (prefersReducedMotion()) {
      setMounted(false);
      return;
    }
    const t = window.setTimeout(() => setMounted(false), ms);
    return () => window.clearTimeout(t);
  }, [open, ms]);
  return { mounted: open || mounted, closing: !open && mounted };
}

/** Círculo rúnico: dois anéis girando em sentidos opostos. */
function RuneCircle({ className }: { className?: string }) {
  const ticks = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <g className="origin-center animate-[turn_18s_linear_infinite]">
        <circle cx="50" cy="50" r="47" fill="none" className="stroke-wine-line" strokeWidth="1" />
        <circle cx="50" cy="50" r="41" fill="none" className="stroke-wine" strokeWidth="0.8" strokeDasharray="1 4.5" />
        {ticks.map((a) => (
          <path
            key={a}
            d={a % 45 === 0 ? "M50 3.5l1.6 3-1.6 3-1.6-3z" : "M50 4.5v3.5"}
            transform={`rotate(${a} 50 50)`}
            className={a % 45 === 0 ? "fill-wine stroke-none" : "stroke-wine-line"}
            strokeWidth="1"
          />
        ))}
      </g>
      <g className="origin-center animate-[turn_11s_linear_infinite_reverse]">
        <circle cx="50" cy="50" r="33" fill="none" className="stroke-wine-line" strokeWidth="0.8" />
        <path d="M50 20 76 65H24z M50 80 24 35h52z" fill="none" className="stroke-wine" strokeWidth="1" strokeLinejoin="round" />
      </g>
      <circle cx="50" cy="50" r="7" className="fill-wine-soft stroke-wine animate-pulse" strokeWidth="1" />
    </svg>
  );
}

/**
 * Espera de recurso de IA: círculo rúnico e frases que se alternam.
 * `note` diz quanto costuma demorar (ex.: "Isso pode levar até um minuto.").
 */
export function ArcaneWait({
  phrases,
  note,
  size = "md",
  className,
}: {
  phrases: string[];
  note: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (phrases.length < 2) return;
    const t = window.setInterval(() => setIndex((n) => (n + 1) % phrases.length), 3800);
    return () => window.clearInterval(t);
  }, [phrases.length]);
  const sm = size === "sm";
  return (
    <div role="status" className={cx(sm ? "flex items-center gap-3 text-left" : "flex flex-col items-center gap-4 text-center", className)}>
      <RuneCircle className={sm ? "size-11 shrink-0" : "size-24"} />
      <div className="min-w-0">
        <span className="sr-only">
          {phrases[0]} {note}
        </span>
        <p key={index} aria-hidden className={cx("animate-rise font-display font-semibold text-ink", sm ? "text-lg leading-tight" : "text-2xl leading-snug")}>
          {phrases[index]}
        </p>
        <p aria-hidden className="mt-0.5 text-xs text-muted">
          {note}
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Diversos
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cx("animate-spin text-wine", className ?? "size-5")} aria-label="Carregando" />;
}

export function PageLoader({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted">
      <Spinner className="size-6" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "wine" | "moss" | "amber"; className?: string }) {
  const tones = {
    neutral: "bg-sand/80 text-ink-soft border-line",
    wine: "bg-wine-soft text-wine border-wine-line",
    moss: "bg-moss-soft text-moss border-moss-line",
    amber: "bg-amber-soft text-amber border-amber-line",
  };
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[0.7rem] font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-wine-line bg-wine-soft text-wine">{icon}</div>
      <h3 className="text-2xl font-semibold">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-10 text-center">
      <p className="text-sm text-wine">{message}</p>
      {onRetry && (
        <Button size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{eyebrow}</div>}
        <h1 className="text-[2.1rem] leading-tight font-semibold">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
