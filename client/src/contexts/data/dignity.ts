/*
 * LES PALIERS DE DIGNITÉ.
 *
 * La Dignité est la seule jauge qui ne tue pas, la seule qui décide du regard
 * des autres, et la seule que le joueur détruit VOLONTAIREMENT à chaque action
 * rentable. C'est donc elle qui porte la tension du jeu — sauf qu'affichée en
 * nombre, elle ne la portait pas : passer de 62 à 56 n'est pas une perte, c'est
 * une transaction. On ne défend que ce qu'on possède, et on ne possède pas un
 * nombre.
 *
 * D'où ces quatre paliers NOMMÉS. Le joueur ne défend plus « 62 », il défend le
 * fait d'être encore présentable. Descendre d'un cran devient un événement — un
 * mot qui change sur son écran — au lieu d'une barre qui raccourcit de trois
 * pixels.
 */

export interface DignityTier {
  /** Valeur minimale (incluse) pour être dans ce palier. */
  min: number;
  fr: string;
  en: string;
  /** Couleur du libellé, du plus digne au plus effacé. */
  color: string;
}

// Du haut vers le bas : l'ordre compte, `dignityTier` prend le premier qui passe.
export const DIGNITY_TIERS: DignityTier[] = [
  { min: 75, fr: 'Encore présentable', en: 'Still presentable', color: '#D9B34A' },
  { min: 50, fr: 'Ça commence à se voir', en: 'It\'s starting to show', color: '#C4913A' },
  { min: 25, fr: 'On change de trottoir', en: 'People cross the street', color: '#B8703A' },
  { min: 0, fr: 'Transparent', en: 'Invisible', color: '#8B5A4A' },
];

export function dignityTier(value: number): DignityTier {
  return DIGNITY_TIERS.find(t => value >= t.min) ?? DIGNITY_TIERS[DIGNITY_TIERS.length - 1];
}

/** 0 = le plus digne, 3 = transparent. Sert à comparer deux états. */
export function dignityTierIndex(value: number): number {
  const i = DIGNITY_TIERS.findIndex(t => value >= t.min);
  return i === -1 ? DIGNITY_TIERS.length - 1 : i;
}

/*
 * CE QUE CHAQUE ACTION COÛTE, EN GROS.
 *
 * Le coût exact dépend du déroulement du mini-jeu ; ces valeurs sont le coût
 * PLANCHER, celui qu'on paie même quand tout se passe bien. Elles ne servent
 * qu'à prévenir : « ça PEUT vous faire descendre », jamais « ça VA ». Une
 * annonce qui promet plus qu'elle ne sait ment au joueur, et ça se remarque.
 */
export const ACTION_DIGNITY_COST: Record<string, number> = {
  beg: 3,      // La Manche : −3 au mieux, davantage si on insiste.
  salvage: 4,  // La Récup' : −4 en remontant proprement, jusqu'à −9 en s'entêtant.
  steal: 6,    // Le vol : −6 au mieux, bien plus si on se fait prendre.
};
