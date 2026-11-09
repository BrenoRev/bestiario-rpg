import { Feather } from "lucide-react";
import { useSignedUrl } from "../hooks/queries";
import { cx } from "./ui";

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cx("flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 64 64" className="size-8 shrink-0" aria-hidden>
        <rect width="64" height="64" rx="14" fill="#6b1d2a" />
        <path d="M18 14h20a8 8 0 0 1 8 8v28H26a8 8 0 0 1-8-8z" fill="none" stroke="#f3ead8" strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M26 50a8 8 0 0 1 0-16h20" fill="none" stroke="#f3ead8" strokeWidth="3.5" />
        <path d="M27 22l3 4 4-6 4 6 3-4" fill="none" stroke="#f3ead8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!compact && <span className="font-display text-[1.6rem] font-semibold tracking-wide text-ink">Bestiario</span>}
    </div>
  );
}

/** Imagem do Storage privado (URL assinada) com placeholder de gravura. */
export function StoredImage({
  path,
  alt,
  className,
  fallbackLabel,
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}) {
  const { data: url, isLoading, isError } = useSignedUrl(path);
  if (path && isLoading) return <div className={cx("skeleton", className)} />;
  if (!path || isError || !url) {
    return (
      <div
        className={cx(
          "flex flex-col items-center justify-center gap-1.5 bg-[radial-gradient(circle_at_50%_40%,var(--color-parchment),var(--color-sand))] text-line-strong",
          className,
        )}
        role="img"
        aria-label={fallbackLabel ?? "Sem ilustração"}
      >
        <Feather className="size-8" strokeWidth={1.25} />
        {fallbackLabel && <span className="text-[0.7rem] font-medium uppercase tracking-widest text-muted/70">{fallbackLabel}</span>}
      </div>
    );
  }
  return <img src={url} alt={alt} className={cx("object-cover", className)} loading="lazy" />;
}

export function Avatar({ url, name, className }: { url?: string | null; name?: string | null; className?: string }) {
  const initial = (name ?? "?").trim().charAt(0).toUpperCase();
  return url ? (
    <img src={url} alt="" referrerPolicy="no-referrer" className={cx("rounded-full object-cover border border-line", className ?? "size-8")} />
  ) : (
    <span className={cx("inline-flex items-center justify-center rounded-full bg-wine text-cream text-sm font-semibold", className ?? "size-8")}>
      {initial}
    </span>
  );
}
