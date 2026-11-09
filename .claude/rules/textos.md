# Idioma e textos de interface

Vale para todo o repositório.

## Idioma

- Interface, mensagens de erro, toasts, comentários, nomes de teste, documentação e mensagens de commit: **português do Brasil**.
- Identificadores (variáveis, funções, tipos, tabelas, colunas, chaves de enum): **inglês**.
- Exceções já existentes, que devem ser mantidas: rotas em português (`/mundos`, `/criaturas`, `/criar`, `/configuracoes`) e os valores de enum de domínio já criados em português (`fantasy_level`: `baixo`/`medio`/`alto`; `Creativity`; `Detail`). Conceito novo usa chave em inglês.
- D&D 5e usa a terminologia da tradução oficial brasileira: Classe de Armadura (CA), Pontos de Vida (PV), Dados de Vida, Nível de Desafio (ND), Bônus de Proficiência, testes de resistência, perícias, vantagem/desvantagem, CD. Atributos: FOR, DES, CON, INT, SAB, CAR.

## Tom

- Fale com o usuário por **você**, de forma direta e cordial. Ele é o **mestre**; os mundos são **universos**; as fichas são **criaturas**; o conjunto é o **bestiário**.
- A IA é apresentada como assistente que **sugere** e **propõe**. Nunca escreva que a IA "cria a criatura definitiva" ou "decide".
- Sem jargão técnico na interface (nada de "RLS", "JWT", "Edge Function", "storage").
- Termos de RPG podem aparecer (são o vocabulário do produto), mas sempre com explicação disponível pelo glossário (`src/lib/glossary.ts`). Quem nunca jogou RPG precisa conseguir usar o app.

## Formas

| Elemento | Padrão | Exemplos do app |
|---|---|---|
| Botão | verbo no infinitivo, maiúscula só na primeira palavra | "Salvar no bestiário", "Gerar sugestões", "Excluir universo" |
| Título de página | substantivo, curto | "Meus Mundos", "Criaturas", "Configurações" |
| Título de confirmação | pergunta com o nome do item entre aspas curvas | "Excluir “Lobo de Cinza”?" |
| Corpo de confirmação | o que acontece + se dá para desfazer | "…serão apagados permanentemente. Esta ação não pode ser desfeita." |
| Toast de sucesso | frase curta com ponto final | "Ficha atualizada.", "Universo criado. Hora de povoá-lo!" |
| Erro | o que deu errado + o que fazer, sem culpar o usuário | "Não foi possível salvar a criatura.", "Dê um nome à criatura antes de salvar." |
| Estado vazio | título + uma frase de próximo passo + ação | "O bestiário está vazio" + "Nova criatura" |
| Espera de IA | o que está acontecendo + quanto demora | "Isso pode levar até um minuto." |
| Placeholder | começa com "Ex.:" | "Ex.: neutro e mau" |

- Aspas curvas (“ ”) em textos de interface; reticências como caractere único (…).
- Números com formato brasileiro: `toLocaleString("pt-BR")`, vírgula decimal ("7,5 m").
- Deslocamento aparece em metros na ficha (30 pés = 9 m); no editor, o campo é em pés e o rótulo diz isso.
