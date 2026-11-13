import { useSignedUrl } from "../hooks/queries";
import { cx } from "./ui";

/** O enquadramento remove só a margem vazia da exibição; os PNGs originais ficam intactos. */
export function Logo({ className, compact, decorative }: { className?: string; compact?: boolean; decorative?: boolean }) {
  return (
    <svg
      viewBox={compact ? "158 56 938 1110" : "7 183 1661 608"}
      width={compact ? 938 : 1661}
      height={compact ? 1110 : 608}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Bestiário"}
      aria-hidden={decorative || undefined}
      focusable="false"
      className={cx("brand-logo", compact ? "brand-logo--compact" : "brand-logo--full", className)}
    >
      <image
        href={compact ? "/logo-bestiario-compact.png" : "/logo-bestiario.png"}
        width={compact ? 1254 : 1672}
        height={compact ? 1254 : 941}
      />
    </svg>
  );
}

/** Dado de 20 faces no traço dos ícones do lucide (24×24, `currentColor`). Gira com `animate-roll`. */
export function D20({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 2 21 7v10l-9 5-9-5V7z" />
      <path d="M12 7 17 15H7z" />
      <path d="M12 2v5M21 7l-4 8M3 7l4 8M21 17l-4-2M3 17l4-2M12 22l-5-7M12 22l5-7" strokeWidth="1.25" />
    </svg>
  );
}

// Borda ondulada do selo: 14 gomos em volta do centro.
const SEAL_EDGE = (() => {
  const n = 14;
  const pt = (r: number, a: number) => `${(12 + r * Math.cos(a)).toFixed(2)} ${(12 + r * Math.sin(a)).toFixed(2)}`;
  let d = `M${pt(10.4, 0)}`;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    d += ` Q${pt(12.2, (a0 + a1) / 2)} ${pt(10.4, a1)}`;
  }
  return `${d}Z`;
})();

/** Selo de cera vinho com um visto: marca o que já entrou no bestiário. Carimba ao aparecer. */
export function WaxSeal({ className, label }: { className?: string; label?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cx("animate-stamp shrink-0", className ?? "size-4")} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <path d={SEAL_EDGE} className="fill-wine" />
      <circle cx="12" cy="12" r="7.2" fill="none" className="stroke-wine-tint" strokeWidth="0.9" />
      <path d="m8.4 12.2 2.4 2.4 4.8-5" fill="none" className="stroke-cream" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Imagem do Storage privado (URL assinada) com a marca compacta quando não há imagem. */
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
          "image-placeholder flex flex-col items-center justify-center gap-3",
          className,
        )}
        role="img"
        aria-label={fallbackLabel ?? "Sem ilustração"}
      >
        <Logo compact decorative className="placeholder-logo" />
        {fallbackLabel && <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-silver-muted">{fallbackLabel}</span>}
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
    <span className={cx("inline-flex items-center justify-center rounded-full border border-gold/35 bg-gold/10 text-gold text-sm font-semibold", className ?? "size-8")}>
      {initial}
    </span>
  );
}
