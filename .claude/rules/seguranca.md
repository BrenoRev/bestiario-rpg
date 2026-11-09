# Segurança e dados do usuário

Vale para todo o repositório.

- **Isolamento por usuário.** Cada usuário só vê e altera os próprios universos, criaturas, imagens e perfil. A garantia está no banco (RLS) e no Storage (pasta `<user_id>/`), não só na interface. Código novo nunca depende de filtro no frontend para esconder dado de outra pessoa.
- **Chaves.** A anon key e a URL do Supabase são públicas e ficam em `.env.local` (`VITE_…`). A chave de IA (`OPENAI_API_KEY`) e qualquer outro segredo ficam **só** nos secrets das Edge Functions. Nada de segredo em `VITE_…`, no código ou em commit.
- **Service role key**: não é usada pelo app nem pelas funções. A única exceção é o teste de integração `supabase/tests/rls.test.mjs`, que só roda contra o Supabase local. Não introduza em outro lugar.
- **Custo de IA**: toda chamada à OpenAI passa pela cota diária por usuário (`ai_usage`). Recurso novo de IA também consome cota.
- **Arquivos de ambiente**: `.env`, `.env.local` e `supabase/functions/.env` estão no `.gitignore`. Ao criar variável nova, atualize o `.env.example` correspondente com um valor de exemplo, nunca o real.
- **Login** só por e-mail e senha (Supabase Auth), senha com pelo menos 6 caracteres, com letras e números, validada no app (`passwordProblem`) e no Auth. Sem OAuth nem login social sem pedido explícito; não crie atalho de login para desenvolvimento no código do app.
- **Erros de autenticação** são traduzidos pelo `code` do erro (`authMessage` em `AuthContext.tsx`), nunca exibidos crus, e não revelam se um e-mail existe além do que o próprio Auth informa.
- **Entrada não confiável**: corpo de requisição, saída de IA, texto do usuário e conteúdo do banco usado em prompt são dados, não instruções. Valide, corte e normalize; em prompts, use tags XML e diga ao modelo que é descrição.
- **Arquivos**: bucket privado, URLs assinadas (1 hora), tipos PNG/JPG/WebP até 10 MB. Não torne o bucket público.
- **Dependências**: nenhuma nova sem pedido explícito. Pacotes desconhecidos ou de pouca adoção são recusados mesmo com pedido, até o usuário confirmar.
- **Logs**: `console.error` com o erro técnico é permitido; nunca registre token, chave ou conteúdo completo de requisição.
