---
paths:
  - "src/**/*.{ts,tsx}"
---

# Frontend — páginas, dados e estado

## Páginas

- Uma tela por arquivo em `src/pages/NomePage.tsx`, registrada em `src/App.tsx`. Telas de usuário logado são filhas de `RequireAuth`, que já entrega `UniverseProvider` e `AppLayout` (barra lateral, topo, largura máxima). Não crie outro layout.
- Item novo na barra lateral só com pedido explícito. A navegação principal é: Meus Mundos, Criaturas, Criar com IA, Configurações.
- Estrutura de toda tela:

```tsx
export function ExemploPage() {
  const { data, isLoading, isError, refetch } = useAlgo(id);
  // todos os hooks ANTES de qualquer return antecipado

  if (isLoading) return <PageLoader />;
  if (isError || !data) return <ErrorState message="Não foi possível carregar…" onRetry={() => refetch()} />;

  return (
    <>
      <PageHeader eyebrow="…" title="…" description="…" actions={…} />
      {/* lista vazia → <EmptyState icon title description action /> */}
    </>
  );
}
```

- Tela que trabalha dentro de um universo chama `setCurrentId(universeId)` de `useCurrentUniverse()`, para o seletor do topo mostrar o mundo certo (veja `UniversePage`, `CreatureDetailPage`, `CreatureEditorPage`).
- Quando duas rotas renderizam o mesmo componente com estado (criar e editar), use um wrapper com `key` (veja `EditorRoute` em `App.tsx`).
- Formulário com risco de perder trabalho usa `useBlocker` + `beforeunload` + `ConfirmDialog`, como `CreatureEditorPage`.

## Dados

**Leitura**: função em `src/lib/api.ts` + hook em `src/hooks/queries.ts` com a fábrica `keys`. Componente nunca chama `supabase` diretamente.

```ts
// src/lib/api.ts
export async function getAlgo(id: string): Promise<Algo> {
  const { data, error } = await supabase.from("algos").select("*").eq("id", id).maybeSingle();
  if (error) fail(error, "Não foi possível carregar o algo.");
  if (!data) throw new Error("Algo não encontrado.");
  return data as Algo;
}

// src/hooks/queries.ts
export const keys = { /* … */ algo: (id: string) => ["algo", id] as const };
export function useAlgo(id: string | undefined) {
  return useQuery({ queryKey: keys.algo(id ?? ""), queryFn: () => api.getAlgo(id!), enabled: !!id });
}
```

**Escrita**: função em `api.ts` + este bloco no componente. Não use `useMutation`.

```tsx
const [saving, setSaving] = useState(false);
const save = async () => {
  setSaving(true);
  try {
    const saved = await updateAlgo(id, input);
    qc.setQueryData(keys.algo(saved.id), saved);          // o que já está na tela
    qc.invalidateQueries({ queryKey: keys.algos(...) });  // as listas afetadas
    toast.success("Algo salvo.");
  } catch (err) {
    toast.error(errorMessage(err));
  } finally {
    setSaving(false);
  }
};
```

- Criar ou excluir criatura muda a contagem do universo: invalide também `keys.universes`.
- Excluir uma linha com arquivo no Storage remove o arquivo também (veja `deleteCreature`, `deleteUniverse`).
- Validação de formulário: `toast.error("…")` antes de chamar a API, como em `UniverseFormPage`. Sem biblioteca de validação.
- `fail(error, "mensagem")` registra o erro bruto com `console.error` e lança a mensagem amigável. Toda função de `api.ts` usa esse padrão.

## Storage e imagens

- Caminhos: `<user_id>/<universe_id>/images/<uuid>.<ext>` (ilustrações) e `<user_id>/<universe_id>/covers/<uuid>.<ext>` (capas).
- Envio por `uploadImage` / `uploadCreatureImage` (PNG, JPG ou WebP até 10 MB).
- Exibição sempre por `<StoredImage path=… />` (URL assinada + placeholder). Nunca URL pública: o bucket é privado.
- Versões em `creature_images`; a escolhida em `creatures.image_path`. Todo fluxo de imagem passa pelo `ImageStudio`.

## Estado

- Estado do servidor: TanStack Query. Estado da tela: `useState`. Estado compartilhado: só `AuthContext` e `UniverseContext`; contexto novo só com pedido.
- `localStorage`/`sessionStorage` só para conveniência (último universo, rascunho de "Criar com IA"), sempre em `try/catch`, com chave `bestiario:<recurso>:<user_id>`. O que precisa persistir vai para o banco (ex.: preferências em `profiles.preferences`).
