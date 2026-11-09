// Teste de integração de segurança (RLS e Storage) contra o Supabase LOCAL.
// Uso: `npx supabase start` e depois `npm run test:rls`.
//
// Cria dois usuários, assina um JWT para cada um com o segredo do ambiente local
// e confere que nenhum consegue ler, alterar ou apagar dados e arquivos do outro.
// A chave de serviço é usada só aqui, para criar e remover os usuários de teste.
import { execSync } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function localStatus() {
  for (const cmd of ["supabase status -o json", "npx -y supabase status -o json"]) {
    try {
      return JSON.parse(execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
    } catch {
      /* tenta o próximo */
    }
  }
  throw new Error("Supabase local não encontrado. Rode `npx supabase start` antes.");
}

const status = localStatus();
const URL = status.API_URL;
const ANON = status.ANON_KEY;
const SERVICE = status.SERVICE_ROLE_KEY;
const JWT_SECRET = status.JWT_SECRET;
if (!URL?.includes("127.0.0.1") && !URL?.includes("localhost")) throw new Error("Este teste só roda contra o Supabase local.");

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });
let pass = 0;
let fail = 0;
const check = (name, ok, extra = "") => {
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? `  (${extra})` : ""}`);
};

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
function jwtFor(id, email) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64({ alg: "HS256", typ: "JWT" });
  const body = b64({ sub: id, email, role: "authenticated", aud: "authenticated", iat: now, exp: now + 3600 });
  const sig = createHmac("sha256", JWT_SECRET).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${sig}`;
}

async function makeUser(name) {
  const email = `${name.toLowerCase().replace(/\s/g, "")}-${randomUUID().slice(0, 8)}@teste.local`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: name, avatar_url: "https://example.com/a.png" },
  });
  if (error) throw error;
  const token = jwtFor(data.user.id, email);
  return { id: data.user.id, c: createClient(URL, ANON, { accessToken: async () => token }) };
}

const A = await makeUser("Mestre A");
const B = await makeUser("Mestre B");

try {
  // ------------------------------------------------------------ Perfis
  const prof = await A.c.from("profiles").select("*").single();
  check("perfil criado pelo trigger com o nome do cadastro", prof.data?.display_name === "Mestre A", prof.error?.message);
  check("A não lê o perfil de B", (await A.c.from("profiles").select("id").eq("id", B.id)).data?.length === 0);
  const nameUpd = await A.c.from("profiles").update({ display_name: "Novo nome" }).eq("id", A.id).select("display_name");
  check("A altera o próprio nome de exibição", nameUpd.data?.[0]?.display_name === "Novo nome", nameUpd.error?.message);
  const emailUpd = await A.c.from("profiles").update({ email: "falso@x.com" }).eq("id", A.id);
  check("A não altera o e-mail do perfil", !!emailUpd.error);

  // ------------------------------------------------------------ Universos e criaturas
  const u = await A.c.from("universes").insert({ name: "Cinzaprata", fantasy_level: "alto" }).select().single();
  check("A cria universo", u.data?.user_id === A.id, u.error?.message);
  const uid = u.data.id;
  check("B não vê universos de A", (await B.c.from("universes").select("id")).data?.length === 0);
  check("B não cria universo em nome de A", !!(await B.c.from("universes").insert({ name: "x", user_id: A.id })).error);

  const c1 = await A.c.from("creatures").insert({ universe_id: uid, name: "Lobo", challenge_rating: "1/4" }).select().single();
  check("A cria criatura; cr_value gerado (1/4 = 0.25)", Number(c1.data?.cr_value) === 0.25, c1.error?.message);
  check("ND inválido é rejeitado", !!(await A.c.from("creatures").insert({ universe_id: uid, name: "X", challenge_rating: "31" })).error);
  check("B não insere criatura no universo de A", !!(await B.c.from("creatures").insert({ universe_id: uid, name: "Intrusa" })).error);
  check("B não altera criatura de A", (await B.c.from("creatures").update({ name: "H" }).eq("id", c1.data.id).select()).data?.length === 0);
  check("B não exclui universo de A", (await B.c.from("universes").delete().eq("id", uid).select()).data?.length === 0);
  const uB = await B.c.from("universes").insert({ name: "Mundo B" }).select().single();
  const move = await A.c.from("creatures").update({ universe_id: uB.data.id }).eq("id", c1.data.id).select();
  check("A não move criatura para universo de B", !!move.error || move.data?.length === 0);
  const counted = await A.c.from("universes").select("*, creatures(count)").eq("id", uid).single();
  check("contagem de criaturas por universo", counted.data?.creatures?.[0]?.count === 1);

  // ------------------------------------------------------------ Storage
  const png = new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], { type: "image/png" });
  const own = `${A.id}/${uid}/images/t.png`;
  check("A envia arquivo para a própria pasta", !(await A.c.storage.from("bestiario").upload(own, png, { contentType: "image/png" })).error);
  check("A não envia para a pasta de B", !!(await A.c.storage.from("bestiario").upload(`${B.id}/x/t.png`, png, { contentType: "image/png" })).error);
  check("B não baixa arquivo de A", !!(await B.c.storage.from("bestiario").download(own)).error);
  const pub = await fetch(`${URL}/storage/v1/object/public/bestiario/${own}`);
  check("bucket não é público", pub.status >= 400, `status ${pub.status}`);

  // ------------------------------------------------------------ Versões de imagem
  const img = await A.c.from("creature_images").insert({ universe_id: uid, creature_id: c1.data.id, path: own }).select().single();
  check("A registra versão de imagem", !!img.data, img.error?.message);
  check("versão com caminho de outro usuário é rejeitada", !!(await A.c.from("creature_images").insert({ universe_id: uid, path: `${B.id}/x.png` })).error);
  const hijack = await A.c.from("creature_images").update({ path: `${B.id}/x.png` }).eq("id", img.data.id).select();
  check("versão não pode ser apontada para a pasta de outro usuário", !!hijack.error || hijack.data?.length === 0);

  // ------------------------------------------------------------ Cota de IA
  check("A registra uso de IA", !(await A.c.from("ai_usage").insert({ kind: "text" })).error);
  const backdated = await A.c.from("ai_usage").insert({ kind: "text", created_at: "2000-01-01T00:00:00Z" });
  check("A não escolhe a data do registro de uso", !!backdated.error);
  const del = await A.c.from("ai_usage").delete().eq("kind", "text").select();
  check("A não apaga o próprio uso para burlar a cota", (del.data?.length ?? 0) === 0);
  check("B não vê o uso de A", (await B.c.from("ai_usage").select("id")).data?.length === 0);

  // ------------------------------------------------------------ Exclusão em cascata
  await A.c.storage.from("bestiario").remove([own]);
  const delU = await A.c.from("universes").delete().eq("id", uid);
  const left = await admin.from("creatures").select("id").eq("universe_id", uid);
  check("excluir universo apaga criaturas e versões (cascata)", !delU.error && left.data?.length === 0);
} finally {
  await admin.auth.admin.deleteUser(A.id);
  await admin.auth.admin.deleteUser(B.id);
}

console.log(`\n${pass} passaram, ${fail} falharam`);
process.exit(fail ? 1 : 0);
