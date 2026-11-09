// Glossário pesquisável de termos de RPG e D&D 5e, para quem está começando.
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GLOSSARY_GROUPS, type GlossaryKey, searchGlossary } from "../../lib/glossary";
import { Modal } from "../Modal";
import { cx } from "../ui";

export function GlossaryDialog({ open, focus, onClose }: { open: boolean; focus: GlossaryKey | null; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchGlossary(query), [query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    if (focus) {
      // Espera o modal montar e leva o termo pedido para a vista.
      const t = setTimeout(() => document.getElementById(`glossario-${focus}`)?.scrollIntoView({ block: "center" }), 60);
      return () => clearTimeout(t);
    }
  }, [open, focus]);

  return (
    <Modal open={open} onClose={onClose} size="lg" title="Glossário" description="Os termos de RPG e de D&D usados no Bestiario, em linguagem simples.">
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Procurar um termo (ex.: CA, dano, lendária)…"
          aria-label="Procurar no glossário"
          className="field h-10 pl-9"
        />
      </div>
      {results.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Nenhum termo encontrado.</p>
      ) : (
        <div className="space-y-6">
          {GLOSSARY_GROUPS.map((group) => {
            const items = results.filter(([, e]) => e.group === group);
            if (!items.length) return null;
            return (
              <section key={group}>
                <h3 className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">{group}</h3>
                <dl className="space-y-2">
                  {items.map(([key, e]) => (
                    <div
                      key={key}
                      id={`glossario-${key}`}
                      className={cx("rounded-lg border px-4 py-3", key === focus && !query ? "border-wine-line bg-wine-soft/50" : "border-line bg-parchment/50")}
                    >
                      <dt className="font-display text-lg leading-tight font-semibold text-ink">{e.term}</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-ink-soft">
                        {e.short}
                        {e.example && <span className="mt-1 block text-[0.82rem] text-muted italic">Ex.: {e.example}</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
