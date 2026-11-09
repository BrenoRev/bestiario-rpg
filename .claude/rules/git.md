# Git, commits e Pull Requests

Vale para todo o repositório.

## Agentes de IA

- Só faça commit, push, merge ou abra PR quando o usuário pedir.
- Nunca use `--force` na `main`, `--no-verify`, nem reescreva histórico já enviado.
- Antes de commitar, rode as verificações de "Pronto quando" (`CLAUDE.md`).

## Branches

- `main` é a branch estável; ninguém commita direto nela.
- Branch por mudança: `<tipo>/<descricao-curta>` em minúsculas e com hífens, com os mesmos tipos dos commits. Ex.: `feat/filtro-por-tendencia`, `fix/capa-nao-remove`, `docs/regras-ia`.

## Commits

Padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/), com o tipo em inglês e a descrição em pt-BR:

```
<tipo>(<escopo opcional>): <descrição no imperativo, minúscula, sem ponto final>

<corpo opcional: o porquê da mudança>
```

| Tipo | Quando |
|---|---|
| `feat` | funcionalidade nova para o usuário |
| `fix` | correção de bug |
| `refactor` | mudança de código sem mudar comportamento |
| `style` | só aparência (CSS, tokens, layout) |
| `docs` | README, CLAUDE.md, `.claude/rules/`, comentários |
| `test` | só testes |
| `chore` | configuração, scripts, dependências |

Escopos usados: `ficha`, `universo`, `bestiario`, `ia`, `imagem`, `auth`, `ui`, `db`, `functions`, `config`.

Exemplos:
- `feat(ficha): adiciona campo de idiomas secretos`
- `fix(imagem): remove arquivo antigo ao trocar a capa`
- `docs: cria regras de padronização para agentes de IA`

- Um commit = uma mudança lógica. A migração vai no mesmo commit do código que a usa.
- Nunca commite `.env`, `.env.local`, `supabase/functions/.env`, `dist/` ou `node_modules/`.

## Pull Requests

- Toda mudança chega à `main` por PR, usando o modelo em `.github/pull_request_template.md`.
- Título do PR no mesmo formato do commit.
- PR pequeno e focado. Mudança de padrão (nova dependência, nova regra) vem num PR separado, com o `CLAUDE.md` ou `.claude/rules/` atualizados.
- Mudança visual leva print de antes e depois, no desktop e no celular.
- Merge por **squash**, para cada PR virar um commit no padrão acima.
