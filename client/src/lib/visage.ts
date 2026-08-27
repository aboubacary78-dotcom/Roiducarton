/*
 * L'ATELIER DU VISAGE — le catalogue de ce qu'on peut choisir.
 *
 * Le portrait carton était entièrement tiré de la graine du personnage : une
 * douzaine de tirages indépendants (peau, cheveux, yeux, bouche…) dérivés du
 * même `seed`. C'est ce qui donne à chaque SDF sa tête, sans qu'aucun visage
 * n'ait à être dessiné à la main.
 *
 * Ce module ne remplace pas ce mécanisme : il l'OUVRE. Chaque tirage peut être
 * remplacé par un choix, et ce qui n'est pas choisi reste tiré. Un visage
 * partiellement composé est donc parfaitement valable — on décide de la barbe
 * et on laisse le hasard faire le reste.
 *
 * La correspondance avec `CardboardAvatar` tient sur une seule règle : la clé
 * d'un trait EST le sel de son tirage. Renommer l'un sans l'autre casse le
 * lien en silence — d'où le contrôle de `scripts/test-atelier.mjs`, qui relit
 * les deux fichiers et compare.
 */

export interface TraitVisage {
  /** Le sel du tirage dans CardboardAvatar. C'est aussi la clé de stockage. */
  cle: string;
  fr: string;
  en: string;
  /** Nombre de valeurs possibles. */
  n: number;
  /**
   * Trait à deux états (avec / sans). Le tirage d'origine est « une chance
   * sur n », et un choix vaut 0 pour « oui », 1 pour « non ».
   */
  binaire?: boolean;
  /** Réservé à un genre : la barbe aux hommes, les boucles aux femmes. */
  reserve?: 'm' | 'f';
  /** Libellés des valeurs, quand elles se nomment mieux qu'un numéro. */
  valeurs?: { fr: string; en: string }[];
  /*
   * PALETTE — pour les réglages qui sont une COULEUR.
   *
   * « Teint : 1 2 3 4 5 6 7 8 » ne dit rien à personne, et c'est pire sur un
   * écran qu'on vend : il faut cliquer huit fois pour voir ce qu'on achète.
   * Ces réglages-là s'affichent en pastilles de la vraie couleur, prise dans
   * la palette que le dessin utilise — pas une copie, qui dériverait.
   */
  palette?: 'skin' | 'hair' | 'hat' | 'bg';
}

/*
 * L'ORDRE COMPTE : c'est celui de l'écran, et il va du plus visible au plus
 * discret. Quelqu'un qui abandonne à mi-chemin a déjà choisi ce qui se voit.
 */
export const TRAITS_VISAGE: TraitVisage[] = [
  {
    cle: 'skin', fr: 'Teint', en: 'Skin', n: 8, palette: 'skin',
  },
  /*
   * La forme du crâne vient en deuxième parce qu'elle décide de la SILHOUETTE,
   * et que la silhouette est ce qui se lit en premier — avant la couleur des
   * yeux, avant la coiffure, et à toutes les tailles.
   */
  {
    cle: 'face', fr: 'Visage', en: 'Face', n: 4,
    valeurs: [
      { fr: 'Ovale', en: 'Oval' },
      { fr: 'Carré', en: 'Square' },
      { fr: 'Allongé', en: 'Long' },
      { fr: 'Rond', en: 'Round' },
    ],
  },
  {
    cle: 'hairstyle', fr: 'Coiffure', en: 'Hair', n: 7,
    valeurs: [
      { fr: 'Crâne nu', en: 'Bald' },
      { fr: 'Court', en: 'Short' },
      { fr: 'Touffe', en: 'Tuft' },
      { fr: 'Raie', en: 'Parted' },
      { fr: 'Volume', en: 'Volume' },
      { fr: 'Dégarni', en: 'Thinning' },
      { fr: 'Longs', en: 'Long' },
    ],
  },
  { cle: 'hair', fr: 'Couleur de cheveux', en: 'Hair colour', n: 10, palette: 'hair' },
  {
    cle: 'eyes', fr: 'Regard', en: 'Eyes', n: 4,
    valeurs: [
      { fr: 'Points', en: 'Dots' },
      { fr: 'Ronds', en: 'Round' },
      { fr: 'Traits', en: 'Lines' },
      { fr: 'Fatigué', en: 'Tired' },
    ],
  },
  {
    cle: 'brow', fr: 'Sourcils', en: 'Brows', n: 3,
    valeurs: [
      { fr: 'Aucun', en: 'None' },
      { fr: 'Droits', en: 'Straight' },
      { fr: 'Relevés', en: 'Raised' },
    ],
  },
  {
    cle: 'mouth', fr: 'Bouche', en: 'Mouth', n: 5,
    valeurs: [
      { fr: 'Neutre', en: 'Neutral' },
      { fr: 'Sourire', en: 'Smile' },
      { fr: 'Grimace', en: 'Grimace' },
      { fr: 'Bouche ronde', en: 'Round' },
      { fr: 'Rictus', en: 'Smirk' },
    ],
  },
  {
    cle: 'beard', fr: 'Barbe', en: 'Beard', n: 4, reserve: 'm',
    valeurs: [
      // Ces libellés mentaient : « Moustache » dessinait une barbe pleine et
      // « Barbe pleine » un bouc minuscule. Le dessin a été remis dans l'ordre
      // annoncé — c'est un écran qu'on vend, il doit dire vrai.
      { fr: 'Rasé', en: 'Clean' },
      { fr: 'Moustache', en: 'Moustache' },
      { fr: 'Bouc', en: 'Goatee' },
      { fr: 'Barbe pleine', en: 'Full beard' },
    ],
  },
  {
    cle: 'glasses', fr: 'Lunettes', en: 'Glasses', n: 5,
    valeurs: [
      { fr: 'Aucunes', en: 'None' },
      { fr: 'Aucunes', en: 'None' },
      { fr: 'Rondes', en: 'Round' },
      { fr: 'Carrées', en: 'Square' },
      { fr: 'Solaires', en: 'Shades' },
    ],
  },
  {
    cle: 'hat', fr: 'Couvre-chef', en: 'Headwear', n: 4,
    valeurs: [
      { fr: 'Aucun', en: 'None' },
      { fr: 'Bonnet', en: 'Beanie' },
      { fr: 'Casquette', en: 'Cap' },
      { fr: 'Aucun', en: 'None' },
    ],
  },
  { cle: 'hatc', fr: 'Couleur du couvre-chef', en: 'Headwear colour', n: 6, palette: 'hat' },
  {
    cle: 'freckles', fr: 'Taches de rousseur', en: 'Freckles', n: 4, binaire: true,
  },
  {
    cle: 'scar', fr: 'Cicatrice', en: 'Scar', n: 7, binaire: true, reserve: 'm',
  },
  {
    cle: 'earring', fr: "Boucles d'oreilles", en: 'Earrings', n: 3, binaire: true, reserve: 'f',
  },
  { cle: 'bg', fr: 'Fond', en: 'Background', n: 7, palette: 'bg' },
];

/** Un visage composé : sel → valeur choisie. Ce qui manque reste tiré au sort. */
export type Visage = Record<string, number>;

/** Les traits proposés pour ce genre (la barbe aux hommes, etc.). */
export function traitsPour(gender: 'm' | 'f' | undefined): TraitVisage[] {
  return TRAITS_VISAGE.filter(t => !t.reserve || t.reserve === gender);
}

/** Combien de valeurs un trait propose RÉELLEMENT au choix. */
export function nbChoix(t: TraitVisage): number {
  return t.binaire ? 2 : t.n;
}

/** Le nom d'une valeur, quand elle en a un. Sinon, son rang. */
export function nomValeur(t: TraitVisage, v: number, en: boolean): string {
  if (t.binaire) return v === 0 ? (en ? 'Yes' : 'Oui') : (en ? 'No' : 'Non');
  const nom = t.valeurs?.[v];
  if (nom) return en ? nom.en : nom.fr;
  return `${v + 1}`;
}
