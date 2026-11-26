import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Button, cx, IconButton, usePresence } from "./ui";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  /** Impede fechar por Esc/clique fora enquanto uma ação está em andamento. */
  busy?: boolean;
}

const SIZES = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };

export function Modal({ open, onClose, title, description, children, footer, size = "md", busy }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  // Fica montado durante a animação de saída.
  const { mounted, closing } = usePresence(open);
  // Refs evitam re-executar o efeito a cada render do pai (o que roubava o foco de quem digita).
  const onCloseRef = useRef(onClose);
  const busyRef = useRef(busy);
  onCloseRef.current = onClose;
  busyRef.current = busy;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busyRef.current) onCloseRef.current();
      if (e.key !== "Tab") return;
      const controls = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
      ) ?? []).filter((el) => el.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || document.activeElement === panelRef.current)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div className={cx("fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6", closing && "pointer-events-none")}>
      <div
        className={cx("absolute inset-0 bg-overlay/75 backdrop-blur-sm", closing ? "animate-fade-out" : "animate-fade-in")}
        onClick={() => !busy && onClose()}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cx(
          closing ? "animate-modal-out" : "animate-modal-in",
          "relative flex max-h-[92dvh] w-full min-w-0 flex-col rounded-t-2xl border border-gold/25 bg-cream shadow-[var(--shadow-pop)] outline-none sm:rounded-2xl",
          SIZES[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-3xl font-medium leading-tight">{title}</h2>
            {description && <p id={descriptionId} className="mt-2 text-sm text-muted">{description}</p>}
          </div>
          <IconButton label="Fechar" onClick={onClose} disabled={busy} className="-mr-2 -mt-1">
            <X className="size-5" />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-parchment/60 px-5 py-3 rounded-b-xl">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      busy={loading}
      footer={
        <>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm leading-relaxed text-ink-soft">{message}</div>
    </Modal>
  );
}
