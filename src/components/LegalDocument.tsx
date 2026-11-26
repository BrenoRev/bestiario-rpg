// Estrutura das páginas públicas de texto (política de privacidade e termos de uso):
// abertas sem login, com o documento em pergaminho e os links entre elas.
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Link } from "react-router";
import { Logo } from "./brand";

/** Contato público do projeto (Issues do repositório no GitHub). */
export const CONTACT_URL = "https://github.com/BrenoRev/bestiario-rpg/issues";

export function LegalDocument({ title, updated, intro, children }: { title: string; updated: string; intro: ReactNode; children: ReactNode }) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · Bestiário`;
    return () => {
      document.title = previous;
    };
  }, [title]);

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" aria-label="Bestiário, página inicial">
            <Logo className="h-12 w-auto" decorative />
          </Link>
          <Link to="/login" className="inline-flex min-h-11 items-center gap-1.5 px-1 text-sm text-muted hover:text-ink">
            <ArrowLeft className="size-4" /> Voltar ao Bestiário
          </Link>
        </header>

        <article className="card paper-surface min-w-0 p-6 sm:p-10">
          <p className="chapter-label text-gold-ink">Atualizado em {updated}</p>
          <h1 className="mt-3 text-4xl leading-tight font-semibold text-ink sm:text-5xl">{title}</h1>
          <div className="mt-5 text-base leading-relaxed text-ink-soft">{intro}</div>
          <div className="mt-8 space-y-8">{children}</div>
          <p className="mt-10 border-t border-line pt-6 text-sm leading-relaxed text-ink-soft">
            Dúvidas ou pedidos? Abra uma solicitação na{" "}
            <a href={CONTACT_URL} target="_blank" rel="noreferrer" className="font-semibold text-wine underline underline-offset-2">
              página do projeto no GitHub
            </a>
            .
          </p>
        </article>

        <nav className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted" aria-label="Documentos">
          <Link to="/privacidade" className="inline-flex min-h-11 items-center hover:text-ink">
            Política de privacidade
          </Link>
          <Link to="/termos" className="inline-flex min-h-11 items-center hover:text-ink">
            Termos de uso
          </Link>
        </nav>
      </div>
    </div>
  );
}

/** Seção numerada do documento. */
export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-wine">{title}</h2>
      <div className="mt-3 space-y-3 text-[0.95rem] leading-relaxed text-ink-soft [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_strong]:text-ink [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}
