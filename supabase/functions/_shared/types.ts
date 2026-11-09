// Tipos puros compartilhados (sem imports), para poderem ser usados também pelos testes do frontend.

export interface UniverseRow {
  id: string;
  name: string;
  description: string;
  genre: string;
  setting: string;
  era: string;
  fantasy_level: string;
  rules: string;
  art_style: string;
}
