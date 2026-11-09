import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Compass } from "lucide-react";
import { createBrowserRouter, Link, Navigate, Outlet, RouterProvider, useLocation, useParams } from "react-router";
import { Logo } from "./components/brand";
import { AppLayout } from "./components/layout/AppLayout";
import { ToastProvider } from "./components/Toast";
import { Button, EmptyState, PageLoader } from "./components/ui";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UniverseProvider } from "./context/UniverseContext";
import { isSupabaseConfigured } from "./lib/supabase";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { CreateWithAIPage } from "./pages/CreateWithAIPage";
import { CreatureDetailPage } from "./pages/CreatureDetailPage";
import { CreatureEditorPage } from "./pages/CreatureEditorPage";
import { CreaturesPage } from "./pages/CreaturesPage";
import { LoginPage } from "./pages/LoginPage";
import { SettingsPage } from "./pages/SettingsPage";
import { UniverseFormPage } from "./pages/UniverseFormPage";
import { UniversePage } from "./pages/UniversePage";
import { WorldsPage } from "./pages/WorldsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

/** Raiz: provedores que dependem do roteador. */
function Root() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Outlet />
      </ToastProvider>
    </AuthProvider>
  );
}

/** Área autenticada: exige sessão Google. */
function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoader />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return (
    <UniverseProvider>
      <AppLayout />
    </UniverseProvider>
  );
}

/** Remonta o editor ao trocar de criatura (evita reaproveitar estado). */
function EditorRoute() {
  const { creatureId } = useParams();
  return <CreatureEditorPage key={creatureId ?? "nova"} />;
}

function NotFound() {
  return (
    <EmptyState
      icon={<Compass className="size-6" />}
      title="Página não encontrada"
      description="Este caminho não leva a nenhum lugar do bestiário."
      action={
        <Link to="/">
          <Button variant="primary">Voltar aos meus mundos</Button>
        </Link>
      }
    />
  );
}

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/auth/callback", element: <AuthCallbackPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: "/", element: <WorldsPage /> },
          { path: "/mundos/novo", element: <UniverseFormPage /> },
          { path: "/mundos/:universeId", element: <UniversePage /> },
          { path: "/mundos/:universeId/editar", element: <UniverseFormPage /> },
          { path: "/criaturas", element: <CreaturesPage /> },
          { path: "/criaturas/nova", element: <EditorRoute /> },
          { path: "/criaturas/:creatureId", element: <CreatureDetailPage /> },
          { path: "/criaturas/:creatureId/editar", element: <EditorRoute /> },
          { path: "/criar", element: <CreateWithAIPage /> },
          { path: "/configuracoes", element: <SettingsPage /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);

function SetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="card max-w-lg p-8">
        <Logo />
        <h1 className="mt-6 text-3xl font-semibold">Configure o Supabase</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Crie o arquivo <code className="rounded bg-sand px-1">.env.local</code> na raiz do projeto com as variáveis
          <code className="mx-1 rounded bg-sand px-1">VITE_SUPABASE_URL</code> e
          <code className="mx-1 rounded bg-sand px-1">VITE_SUPABASE_ANON_KEY</code> (veja <code className="rounded bg-sand px-1">.env.example</code> e o README) e reinicie o servidor.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
