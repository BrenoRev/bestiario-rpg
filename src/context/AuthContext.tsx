import type { AuthError, Session, User } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

/** Mesma política do Supabase Auth: mínimo de 6 caracteres, com letras e números. */
export const MIN_PASSWORD_LENGTH = 6;
export const PASSWORD_RULE = `Pelo menos ${MIN_PASSWORD_LENGTH} caracteres, com letras e números.`;

/** Valida a senha de cadastro no app, antes de enviar (devolve a mensagem do problema ou null). */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "A senha precisa ter letras e números.";
  return null;
}

/**
 * Lê o retorno do login com Google (a página /login, para onde o Google devolve).
 * Devolve a mensagem de erro a mostrar, ou null quando não há erro na URL.
 * O Supabase manda o erro em ?error=… ou em #error=…; um ?code= que sobrou depois
 * da troca (código vencido ou aberto em outro navegador) também é falha.
 */
export function oauthReturnProblem(search: string, hash: string, signedIn: boolean): string | null {
  const query = new URLSearchParams(search);
  const fragment = new URLSearchParams(hash.replace(/^#/, ""));
  const read = (key: string) => query.get(key) ?? fragment.get(key);
  const error = read("error");
  const code = read("error_code");
  if (error || code) {
    if (code === "signup_disabled") return "Novos cadastros estão desativados no momento.";
    if (error === "access_denied") return "Login com Google cancelado.";
    return "Não foi possível entrar com o Google. Tente novamente.";
  }
  if (query.has("code") && !signedIn) return "Não foi possível concluir o login com Google. Tente novamente neste mesmo navegador.";
  return null;
}

interface SignUpResult {
  /** false quando o projeto exige confirmação por e-mail antes do primeiro login. */
  signedIn: boolean;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<SignUpResult>;
  /** Redireciona para o Google; a volta cai em /login, que conclui ou mostra o erro. */
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/** Traduz os erros do Supabase Auth para mensagens em pt-BR (pelo código, não pelo texto). */
function authMessage(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return "E-mail ou senha incorretos.";
    case "user_already_exists":
    case "email_exists":
      return "Já existe uma conta com este e-mail. Entre com sua senha ou com o Google.";
    case "weak_password":
      return `Escolha uma senha mais forte: ${PASSWORD_RULE.toLowerCase()}`;
    case "email_address_invalid":
      return "Este e-mail não é válido.";
    case "email_not_confirmed":
      return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Muitas tentativas seguidas. Aguarde um pouco e tente de novo.";
    case "signup_disabled":
      return "Novos cadastros estão desativados no momento.";
    default:
      console.error(error);
      return "Não foi possível concluir agora. Tente novamente.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      setLoading(false);
      if (event === "SIGNED_OUT") queryClient.clear();
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw new Error(authMessage(error));
      },
      async signUp(name, email, password) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          // O trigger handle_new_user copia full_name para profiles.display_name.
          options: { data: { full_name: name.trim() }, emailRedirectTo: window.location.origin },
        });
        if (error) throw new Error(authMessage(error));
        return { signedIn: !!data.session };
      },
      async signInWithGoogle() {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/login`,
            // Deixa escolher a conta (útil em computador compartilhado).
            queryParams: { prompt: "select_account" },
          },
        });
        if (error) throw new Error(authMessage(error));
      },
      async signOut() {
        await supabase.auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
}
