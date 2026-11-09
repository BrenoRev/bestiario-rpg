// Autenticação nas Edge Functions: valida o JWT do usuário e devolve um
// cliente Supabase que age COMO o usuário — toda leitura/escrita passa pela RLS.
import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2.119.0";
import { HttpError, requireEnv } from "./http.ts";
import type { UniverseRow } from "./types.ts";

export type { UniverseRow };

export interface AuthContext {
  supabase: SupabaseClient;
  user: User;
}

export async function requireUser(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new HttpError(401, "Sessão ausente. Entre novamente.");

  const supabase = createClient(
    requireEnv("SUPABASE_URL"),
    Deno.env.get("SUPABASE_ANON_KEY") ?? requireEnv("SUPABASE_PUBLISHABLE_KEY"),
    {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );

  const token = authHeader.slice("Bearer ".length);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, "Sessão inválida ou expirada. Entre novamente.");
  return { supabase, user: data.user };
}


/** Carrega um universo do usuário (a RLS garante que só o dono o enxerga). */
export async function loadUniverse(supabase: SupabaseClient, universeId: string): Promise<UniverseRow> {
  const { data, error } = await supabase
    .from("universes")
    .select("id, name, description, genre, setting, era, fantasy_level, rules, art_style")
    .eq("id", universeId)
    .maybeSingle();
  if (error) throw new HttpError(500, "Não foi possível carregar o universo.");
  if (!data) throw new HttpError(404, "Universo não encontrado.");
  return data as UniverseRow;
}
