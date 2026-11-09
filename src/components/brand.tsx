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

/** Ícone oficial do Google ("G" multicolorido). */
export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
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
