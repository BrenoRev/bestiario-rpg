// Amplia a ilustração privada sem alterar a versão selecionada na ficha.
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSignedUrl } from "../../hooks/queries";
import { StoredImage } from "../brand";
import { Modal } from "../Modal";
import { Button, IconButton, Spinner } from "../ui";

interface ImageViewerProps {
  open: boolean;
  onClose: () => void;
  path: string | null;
  name: string;
}

export function ImageViewer({ open, onClose, path, name }: ImageViewerProps) {
  const { data: url, isError, refetch } = useSignedUrl(path);
  const [zoom, setZoom] = useState(1);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const previousZoom = useRef(1);
  const failed = isError || (!!url && failedUrl === url);
  const ready = !!url && loadedUrl === url && !failed;

  useEffect(() => { setZoom(1); }, [open, path]);

  // Mantém o centro observado ao ampliar; a rolagem nativa funciona com mouse, toque e teclado.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) {
      const ratio = zoom / previousZoom.current;
      viewport.scrollLeft = (viewport.scrollLeft + viewport.clientWidth / 2) * ratio - viewport.clientWidth / 2;
      viewport.scrollTop = (viewport.scrollTop + viewport.clientHeight / 2) * ratio - viewport.clientHeight / 2;
    }
    previousZoom.current = zoom;
  }, [zoom]);

  return (
    <Modal
      open={open && !!path}
      onClose={onClose}
      title="Ilustração da criatura"
      description={<span className="line-clamp-2">{name || "Criatura sem nome"}</span>}
      size="xl"
      centered
      className="image-viewer"
      footer={
        <div className="flex w-full flex-wrap items-center justify-center gap-2">
          <IconButton label="Diminuir zoom" disabled={!ready || zoom <= 1} onClick={() => setZoom((value) => Math.max(1, value - 0.5))}>
            <ZoomOut className="size-5" />
          </IconButton>
          <output className="w-14 text-center text-sm text-ink tabular-nums" aria-live="polite" aria-label="Nível de zoom">
            {Math.round(zoom * 100)}%
          </output>
          <IconButton label="Aumentar zoom" disabled={!ready || zoom >= 3} onClick={() => setZoom((value) => Math.min(3, value + 0.5))}>
            <ZoomIn className="size-5" />
          </IconButton>
          <Button size="sm" icon={<RotateCcw className="size-4" />} disabled={!ready || zoom === 1} onClick={() => setZoom(1)}>
            Ajustar
          </Button>
        </div>
      }
    >
      <div className="image-viewer-stage rounded-xl border border-line bg-night" ref={viewportRef} tabIndex={0} role="region" aria-label="Ilustração ampliada. Amplie e role para explorar os detalhes.">
        {failed ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center" role="alert">
            <p className="text-sm text-silver">Não foi possível carregar a ilustração.</p>
            <Button onClick={() => { setFailedUrl(null); setLoadedUrl(null); void refetch(); }}>Tentar novamente</Button>
          </div>
        ) : (
          <>
            <div className="image-viewer-canvas" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
              <StoredImage
                path={path}
                alt={`Ilustração de ${name || "criatura sem nome"}`}
                fit="contain"
                loading="eager"
                draggable={false}
                className="size-full select-none"
                onLoad={() => { if (url) setLoadedUrl(url); }}
                onError={() => { if (url) setFailedUrl(url); }}
              />
            </div>
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-night/85 text-silver" role="status">
                <Spinner className="size-5" /> Carregando ilustração…
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
