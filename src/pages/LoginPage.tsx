import { BookOpen, Globe2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Navigate, useSearchParams } from "react-router";
import { GoogleIcon, Logo } from "../components/brand";
import { errorMessage } from "../components/Toast";
import { Spinner } from "../components/ui";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  { icon: Globe2, title: "Um bestiário por mundo", text: "Organize criaturas por universo e campanha." },
  { icon: BookOpen, title: "Fichas de D&D 5e", text: "Atributos, ações e ND no formato que você conhece." },
  { icon: Sparkles, title: "IA como parceira criativa", text: "Sugestões e ilustrações que você aceita ou descarta." },
];

export function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [params] = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(params.get("erro"));

  if (!loading && user) return <Navigate to="/" replace />;

  const login = async () => {
    setPending(true);
    setError(null);
    try {
      await signInWithGoogle(); // redireciona para o Google
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden border-r border-line bg-parchment lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Logo />
        <div className="max-w-lg">
          <p className="font-display text-[2.9rem] leading-[1.05] font-semibold text-ink">
            Toda campanha merece o seu próprio <em className="text-wine">compêndio de monstros</em>.
          </p>
          <ul className="mt-10 space-y-5">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-wine-line bg-wine-soft text-wine">
                  <Icon className="size-[1.1rem]" />
                </span>
                <div>
                  <div className="font-display text-xl font-semibold">{title}</div>
                  <div className="text-sm text-muted">{text}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted">Fichas compatíveis com Dungeons &amp; Dragons 5ª edição.</p>
        <svg className="pointer-events-none absolute -right-24 -bottom-24 size-96 text-line" viewBox="0 0 200 200" aria-hidden>
          <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="0.75" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
          <path d="M100 4v192M4 100h192M32 32l136 136M168 32L32 168" stroke="currentColor" strokeWidth="0.4" />
        </svg>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-[2.4rem] leading-tight font-semibold">Bem-vindo ao Bestiario</h1>
          <p className="mt-2 text-sm text-muted">Entre com sua conta Google para acessar seus mundos e criaturas.</p>

          <button
            type="button"
            onClick={login}
            disabled={pending || loading}
            className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-line-strong bg-white text-[0.95rem] font-medium text-[#1f1f1f] shadow-[var(--shadow-soft)] transition-colors hover:bg-[#f8f8f8] disabled:opacity-60 cursor-pointer"
          >
            {pending ? <Spinner className="size-5" /> : <GoogleIcon className="size-5" />}
            {pending ? "Redirecionando…" : "Entrar com Google"}
          </button>

          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-wine-line bg-wine-soft px-3 py-2 text-sm text-wine">
              {error}
            </p>
          )}

          <p className="mt-8 text-xs leading-relaxed text-muted">
            O acesso é feito somente com conta Google. Seus universos e criaturas ficam visíveis apenas para você.
          </p>
        </div>
      </div>
    </div>
  );
}
