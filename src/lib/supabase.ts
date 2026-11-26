import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = createClient(url ?? "http://localhost:54321", anonKey ?? "missing-anon-key", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // PKCE: o retorno do Google traz um código de uso único em ?code=, trocado pela
    // sessão neste navegador (os tokens nunca aparecem na URL).
    flowType: "pkce",
  },
});

export const BUCKET = "bestiario";
