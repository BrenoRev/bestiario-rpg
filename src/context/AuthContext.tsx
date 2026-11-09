import type { AuthError, Session, User } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const MIN_PASSWORD_LENGTH = 8;

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
      return "Já existe uma conta com este e-mail. Entre com sua senha.";
    case "weak_password":
      return `Escolha uma senha mais forte, com pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
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
