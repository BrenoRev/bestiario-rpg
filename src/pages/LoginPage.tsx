import { BookOpen, Globe2, LogIn, Sparkles, UserPlus } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation } from "react-router";
import { Logo } from "../components/brand";
import { errorMessage } from "../components/Toast";
import { Button, Segmented, TextInput } from "../components/ui";
import { PASSWORD_RULE, passwordProblem, useAuth } from "../context/AuthContext";

const FEATURES = [
  { icon: Globe2, title: "Um bestiário por mundo", text: "Organize criaturas por universo e campanha." },
  { icon: BookOpen, title: "Fichas de D&D 5e", text: "Atributos, ações e ND no formato que você conhece." },
  { icon: Sparkles, title: "IA como parceira criativa", text: "Sugestões e ilustrações que você aceita ou descarta." },
];

type Mode = "entrar" | "criar";

export function LoginPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const [mode, setMode] = useState<Mode>("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!loading && user) return <Navigate to={from} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (mode === "criar" && !name.trim()) return setError("Diga como quer ser chamado.");
    if (!email.trim()) return setError("Informe seu e-mail.");
    if (!password) return setError("Informe sua senha.");
    if (mode === "criar") {
      const problem = passwordProblem(password);
      if (problem) return setError(problem);
    }
    setPending(true);
    try {
      if (mode === "entrar") {
        await signIn(email, password);
      } else {
        const { signedIn } = await signUp(name, email, password);
        if (!signedIn) {
          setNotice("Conta criada. Confirme seu e-mail pelo link que enviamos e depois entre.");
          setMode("entrar");
        }
      }
      // Com sessão, o redirecionamento acontece no próximo render (Navigate acima).
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
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
          <h1 className="text-[2.4rem] leading-tight font-semibold">{mode === "entrar" ? "Bem-vindo de volta" : "Crie sua conta"}</h1>
          <p className="mt-2 text-sm text-muted">
            {mode === "entrar" ? "Entre para acessar seus mundos e criaturas." : "Leva um minuto. Depois é só começar o seu primeiro bestiário."}
          </p>

          <div className="mt-8">
            <Segmented<Mode>
              value={mode}
              onChange={switchMode}
              options={[
                { value: "entrar", label: "Entrar" },
                { value: "criar", label: "Criar conta" },
              ]}
            />
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            {mode === "criar" && (
              <TextInput label="Nome" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Ex.: Mestre Ana" />
            )}
            <TextInput label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
            <TextInput
              label="Senha"
              type="password"
              autoComplete={mode === "entrar" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint={mode === "criar" ? PASSWORD_RULE : undefined}
            />

            {error && (
              <p role="alert" className="rounded-lg border border-wine-line bg-wine-soft px-3 py-2 text-sm text-wine">
                {error}
              </p>
            )}
            {notice && (
              <p role="status" className="rounded-lg border border-moss-line bg-moss-soft px-3 py-2 text-sm text-moss">
                {notice}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="h-11 w-full"
              loading={pending || loading}
              icon={mode === "entrar" ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}
            >
              {mode === "entrar" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <p className="mt-8 text-xs leading-relaxed text-muted">Seus universos e criaturas ficam visíveis apenas para você.</p>
        </div>
      </div>
    </div>
  );
}
