// Retorno do Google. O supabase-js troca o código PKCE pela sessão sozinho
// (detectSessionInUrl); aqui só esperamos a sessão e voltamos ao app.
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router";
import { PageLoader } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export function AuthCallbackPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const error = params.get("error_description") ?? hash.get("error_description");

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (error || loading || user) return;
    // Se a troca de código não gerar sessão em alguns segundos, volta ao login.
    const t = setTimeout(() => navigate("/login?erro=" + encodeURIComponent("Não foi possível concluir o login. Tente novamente."), { replace: true }), 8000);
    return () => clearTimeout(t);
  }, [error, loading, user, navigate]);

  if (error) return <Navigate to={`/login?erro=${encodeURIComponent("Login cancelado ou não autorizado.")}`} replace />;
  return (
    <div className="flex min-h-screen items-center justify-center">
      <PageLoader label="Concluindo login com Google…" />
    </div>
  );
}
