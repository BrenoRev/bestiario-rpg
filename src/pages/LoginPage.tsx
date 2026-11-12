import { ArrowRight, LockKeyhole, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation } from "react-router";
import { Logo } from "../components/brand";
import { errorMessage } from "../components/Toast";
import { Button, Segmented, TextInput } from "../components/ui";
import { PASSWORD_RULE, passwordProblem, useAuth } from "../context/AuthContext";

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
    <div className="login-page">
      <div className="login-scene flex flex-col justify-between">
        <img src="/login-campaign.png" alt="" aria-hidden="true" className="login-art" fetchPriority="high" />
        <div className="login-scene-content"><Logo /></div>
        <div className="login-scene-content login-story animate-rise">
          <p className="chapter-label mb-4 hidden lg:block">Um mundo de possibilidades</p>
          <h2>Toda criatura guarda uma história. <em className="text-gold">Dê vida à sua.</em></h2>
          <p className="mt-5 hidden max-w-md text-sm leading-relaxed text-silver-muted lg:block">
            Forje universos, reúna lendas e transforme ideias em encontros memoráveis. O mestre decide cada detalhe.
          </p>
          <div className="mt-8 hidden items-center gap-3 border-t border-gold/20 pt-5 text-xs text-silver-muted lg:flex">
            <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
            Seu mundo. Suas criaturas. Suas histórias.
          </div>
        </div>
      </div>

      <main className="login-form-panel">
        <div className="animate-rise w-full max-w-[400px]">
          <p className="chapter-label mb-4">Seu próximo capítulo</p>
          <h1 className="text-[2.75rem] leading-[1.05] font-medium sm:text-5xl">{mode === "entrar" ? "Bem-vindo de volta." : "Sua história começa aqui."}</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {mode === "entrar" ? "Seu códice está à espera. Entre para continuar a construir seus mundos." : "Crie sua conta e abra as primeiras páginas do seu bestiário."}
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
              <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-3 text-sm text-danger">
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
              className="mt-2 min-h-12 w-full"
              loading={pending || loading}
              icon={mode === "entrar" ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}
            >
              {mode === "entrar" ? "Entrar" : "Criar conta"}
              <ArrowRight className="ml-auto size-4" aria-hidden="true" />
            </Button>
          </form>

          <p className="mt-7 flex items-start justify-center gap-2 text-xs leading-relaxed text-muted">
            <LockKeyhole className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Seus universos e criaturas ficam visíveis apenas para você.
          </p>
          <p className="mt-10 text-center text-xs text-muted">Feito para imaginar. Organizado para jogar.</p>
        </div>
      </main>
    </div>
  );
}
