// Glossário em linguagem simples, para quem não conhece RPG nem D&D 5e.
// Usado pelos ícones de ajuda (HelpTip) e pela janela de glossário.

export interface GlossaryEntry {
  /** Nome do termo como aparece na interface. */
  term: string;
  /** Explicação de uma ou duas frases, sem jargão. */
  short: string;
  /** Exemplo concreto (opcional). */
  example?: string;
  group: "Conceitos" | "Ficha" | "Atributos e testes" | "Combate" | "Universo" | "IA";
}

export const GLOSSARY = {
  // --------------------------------------------------------------- Conceitos
  rpg: { group: "Conceitos", term: "RPG de mesa", short: "Jogo em que um grupo cria uma história junto: cada jogador interpreta um personagem e um mestre narra o mundo e controla tudo o que não é dos jogadores, inclusive os monstros." },
  mestre: { group: "Conceitos", term: "Mestre", short: "Quem conduz a partida: descreve o mundo, interpreta os outros personagens e decide o que os monstros fazem. O Bestiario é feito para o mestre preparar suas criaturas." },
  dnd: { group: "Conceitos", term: "D&D 5e", short: "Dungeons & Dragons, 5ª edição: o sistema de regras de RPG mais usado. As fichas do Bestiario seguem o formato dele, mas você pode usá-las em qualquer história." },
  universo: { group: "Conceitos", term: "Universo", short: "O mundo da sua história ou campanha. Cada universo tem o próprio bestiário e serve de contexto para a IA criar criaturas que combinem com ele.", example: "Um reino medieval sombrio, uma estação espacial, uma cidade assombrada." },
  bestiario: { group: "Conceitos", term: "Bestiário", short: "Uma enciclopédia de criaturas e monstros. Aqui, cada universo tem o seu." },
  ficha: { group: "Conceitos", term: "Ficha", short: "A página de uma criatura: os números usados no jogo (parte mecânica) e a descrição para a história (crônica)." },
  // --------------------------------------------------------------- Ficha
  nd: { group: "Ficha", term: "Nível de Desafio (ND)", short: "O quão perigosa a criatura é. Um grupo de 4 personagens de nível igual ao ND costuma vencê-la com esforço. Vai de 0 (inofensiva) a 30 (lendária).", example: "Um lobo tem ND 1/4; um dragão adulto, ND 15 ou mais." },
  ameaca: { group: "Ficha", term: "Nível de ameaça", short: "Um resumo do ND em faixas: baixa (ND 0–4), moderada (5–10), alta (11–16) e mortal (17+). Ajuda a filtrar o bestiário." },
  xp: { group: "Ficha", term: "XP", short: "Pontos de experiência que os jogadores ganham ao derrotar a criatura. Sai automaticamente do ND." },
  tamanho: { group: "Ficha", term: "Tamanho", short: "Do Miúdo (um gato) ao Imenso (um dragão ancião). Muda o espaço que a criatura ocupa e o dado usado nos pontos de vida." },
  tipo: { group: "Ficha", term: "Tipo de criatura", short: "A categoria da criatura, como Besta (animais), Morto-vivo, Dragão ou Fada. Algumas magias e habilidades afetam só certos tipos." },
  subtipo: { group: "Ficha", term: "Subtipo", short: "Uma etiqueta extra que especifica o tipo.", example: "Metamorfo, demônio, elfo." },
  tendencia: { group: "Ficha", term: "Tendência", short: "A personalidade moral da criatura em duas partes: ordem × caos e bem × mal. Criaturas sem consciência, como animais, são “sem tendência”.", example: "Leal e bom, caótico e mau, neutro." },
  bonusProficiencia: { group: "Ficha", term: "Bônus de Proficiência", short: "Um bônus somado ao que a criatura faz bem (ataques, perícias treinadas). Cresce com o ND e é calculado sozinho." },
  ambientes: { group: "Ficha", term: "Ambientes", short: "Os lugares onde a criatura costuma ser encontrada. Servem para filtrar o bestiário." },
  // --------------------------------------------------------------- Atributos e testes
  atributos: { group: "Atributos e testes", term: "Atributos", short: "Seis notas de 1 a 30 que descrevem a criatura: Força (FOR), Destreza (DES), Constituição (CON), Inteligência (INT), Sabedoria (SAB) e Carisma (CAR). 10 é a média humana." },
  modificador: { group: "Atributos e testes", term: "Modificador", short: "O número entre parênteses ao lado do atributo. É o que de fato se soma às jogadas de dado.", example: "Força 16 dá +3; Força 8 dá −1." },
  testesResistencia: { group: "Atributos e testes", term: "Testes de resistência", short: "Jogadas para resistir a um efeito, como veneno ou uma magia. Marque os atributos em que a criatura é especialmente resistente." },
  pericias: { group: "Atributos e testes", term: "Perícias", short: "Coisas em que a criatura é treinada, cada uma ligada a um atributo.", example: "Furtividade (Destreza), Percepção (Sabedoria)." },
  cd: { group: "Atributos e testes", term: "CD (Classe de Dificuldade)", short: "O número que alguém precisa alcançar no dado para resistir a um efeito da criatura.", example: "“CD 13 de Constituição” = role 1d20 + Constituição e tire 13 ou mais." },
  sentidos: { group: "Atributos e testes", term: "Sentidos", short: "Como a criatura percebe o mundo, incluindo visão no escuro e a Percepção passiva (o quão difícil é passar despercebido por ela)." },
  idiomas: { group: "Atributos e testes", term: "Idiomas", short: "As línguas que a criatura entende e fala. Use “—” se ela não fala." },
  // --------------------------------------------------------------- Combate
  ca: { group: "Combate", term: "Classe de Armadura (CA)", short: "O quão difícil é acertar a criatura. Um ataque precisa tirar esse número ou mais para acertar. 10 é fácil; 20 é muito difícil." },
  pv: { group: "Combate", term: "Pontos de Vida (PV)", short: "Quanto dano a criatura aguenta antes de cair." },
  dadosVida: { group: "Combate", term: "Dados de Vida", short: "A fórmula de dados que gera os PV. O botão ao lado calcula a média automaticamente.", example: "“8d10 + 16” = oito dados de 10 lados, mais 16." },
  deslocamento: { group: "Combate", term: "Deslocamento", short: "Quanto a criatura se move por turno, em pés (30 pés = 9 metros). Pode andar, escalar, nadar, voar ou escavar." },
  danos: { group: "Combate", term: "Vulnerabilidades, resistências e imunidades", short: "Vulnerável: recebe o dobro de dano daquele tipo. Resistente: recebe metade. Imune: não recebe nada.", example: "Um elemental de fogo é imune a fogo e vulnerável a frio." },
  condicoes: { group: "Combate", term: "Imunidade a condições", short: "Efeitos que não afetam a criatura, como ficar envenenada, amedrontada ou paralisada." },
  tracos: { group: "Combate", term: "Traços", short: "Habilidades sempre ativas, que não gastam o turno.", example: "“Faro aguçado”: tem vantagem para farejar." },
  acoes: { group: "Combate", term: "Ações", short: "O que a criatura faz no seu turno: atacar, lançar um sopro, usar uma magia. Cada turno tem uma ação." },
  acoesBonus: { group: "Combate", term: "Ações bônus", short: "Ações rápidas que a criatura pode fazer além da ação principal, no mesmo turno." },
  reacoes: { group: "Combate", term: "Reações", short: "Algo que a criatura faz em resposta a um evento, até fora do seu turno.", example: "Aparar um golpe ou contra-atacar quando é atingida." },
  acoesLendarias: { group: "Combate", term: "Ações lendárias", short: "Ações extras que criaturas muito poderosas fazem no fim do turno dos jogadores. Deixe em branco para criaturas comuns." },
  habilidadesEspeciais: { group: "Combate", term: "Habilidades especiais", short: "Qualquer outra capacidade marcante que não seja ataque comum, como conjurar magias ou efeitos do covil." },
  // --------------------------------------------------------------- Universo
  nivelFantasia: { group: "Universo", term: "Nível de fantasia", short: "Quanta magia e quanto sobrenatural existem no mundo: baixo (quase realista), médio ou alto (magia por toda parte). A IA usa isso para calibrar as criaturas." },
  regrasUniverso: { group: "Universo", term: "Regras particulares", short: "Verdades do seu mundo que a IA deve respeitar.", example: "“Não existem dragões”, “a magia tem um preço”." },
  estiloVisual: { group: "Universo", term: "Estilo visual", short: "Como as ilustrações devem parecer. Em branco, o padrão é gravura de bestiário antigo.", example: "Aquarela sombria, pintura a óleo, desenho a nanquim." },
  // --------------------------------------------------------------- IA
  criatividade: { group: "IA", term: "Criatividade", short: "Convencional segue monstros clássicos; Equilibrado mistura o clássico com um toque original; Inusitado arrisca ideias surpreendentes." },
  detalhamento: { group: "IA", term: "Detalhamento", short: "Quanto texto a IA escreve: Resumido para algo rápido, Padrão como nos livros, Detalhado com história, ganchos e táticas." },
  contextoUniverso: { group: "IA", term: "Contexto do universo", short: "Quando ligado, a IA lê a descrição, a época e as regras do seu universo para criar algo que combine com ele." },
  propostas: { group: "IA", term: "Propostas", short: "Versões diferentes da mesma ideia. Compare, combine o que gostar de cada uma e salve só a que quiser." },
} satisfies Record<string, GlossaryEntry>;

export type GlossaryKey = keyof typeof GLOSSARY;

export const GLOSSARY_GROUPS: GlossaryEntry["group"][] = ["Conceitos", "Ficha", "Atributos e testes", "Combate", "Universo", "IA"];

const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Busca por termo ou explicação, sem diferenciar acentos e maiúsculas. */
export function searchGlossary(query: string): [GlossaryKey, GlossaryEntry][] {
  const q = normalize(query.trim());
  const all = Object.entries(GLOSSARY) as [GlossaryKey, GlossaryEntry][];
  if (!q) return all;
  return all.filter(([, e]) => normalize(`${e.term} ${e.short} ${e.example ?? ""}`).includes(q));
}
