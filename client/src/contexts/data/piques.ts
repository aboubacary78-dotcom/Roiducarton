/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LES PIQUES — CE QUE LE JEU PENSE DE VOUS, ET QU'IL NE GARDE PAS POUR LUI.
 *
 * Le jeu commente déjà ses moments — « Vingt minutes les bras dans les ordures
 * pour rien. Même les rats vous ont regardé avec pitié. » — et c'est ce qui
 * l'empêche d'être un simulateur de misère. Trente phrases de plus, pour les
 * cinq instants où le joueur relève la tête en attendant une réaction.
 *
 * TROIS RÈGLES D'ÉCRITURE, ET ELLES SE VOIENT :
 *
 *   1. COURT. Douze mots maximum. Un toast vit deux secondes en haut de
 *      l'écran pendant que le pouce travaille en bas ; une phrase qu'il faut
 *      relire n'est jamais lue.
 *
 *   2. LA FORME CHANGE. La première version faisait trente fois « constat,
 *      point, chute » — et une structure qu'on voit venir dès la deuxième
 *      vanne n'a plus aucune percussion. Il y a donc maintenant des phrases
 *      d'un seul bloc (« Le vigile n'a même pas eu à courir »), des faux
 *      compliments (« Record personnel »), des décalages de registre
 *      administratif (« Arrondi au supérieur »), et des tierces personnes qui
 *      commentent à votre place (« Un pigeon s'est écarté. Par respect »).
 *
 *   3. DU CONCRET, ET AUCUN ADOUCISSANT. Un chiffre, un objet, un geste. La
 *      première version disait « la honte, ça s'use, vous êtes PRESQUE
 *      tranquille » : chaque mot de prudence désamorce la phrase. Le cynisme
 *      a besoin de certitude, et surtout pas de lyrisme sur le froid.
 *
 *   4. ON SE MOQUE DE LA SITUATION, JAMAIS DU JOUEUR. « Votre plan avait une
 *      faille. C'était vous. » passe parce que la rue a raison. « Vous êtes
 *      nul » ne passerait pas : le jeu deviendrait le concurrent du joueur au
 *      lieu d'être son commentateur.
 *
 * ET UNE RÈGLE DE MISE EN ŒUVRE, QUI COMPTE AUTANT : une pique qui tombe à
 * chaque action n'est plus une pique, c'est un tic. Le débit est bridé plus
 * bas, catégorie par catégorie.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type CategoriePique =
  | 'sante-critique'    // à deux doigts d'y passer
  | 'dignite-zero'      // on a fait ce qu'il fallait faire
  | 'vol-rate'          // la main dans le sac
  | 'reveil'            // le bilan du matin
  | 'gain-miserable';   // beaucoup d'efforts, un centime

export interface Pique { fr: string; en: string }

export const PIQUES: Record<CategoriePique, Pique[]> = {
  /* ── ① SANTÉ CRITIQUE ────────────────────────────────────────────────────
   * Le corps lâche. Le rire vient du DÉCALAGE DE REGISTRE : on parle d'un
   * corps qui meurt avec le vocabulaire d'un constat d'huissier ou d'un
   * pigeon poli. Jamais de lyrisme sur le froid — c'est là que la première
   * version se plantait.
   */
  'sante-critique': [
    { fr: 'Un pigeon s\'est écarté de votre chemin. Par respect.',
      en: 'A pigeon stepped out of your way. Out of respect.' },
    { fr: 'Votre estomac ne réclame plus rien. Il a fait son deuil.',
      en: 'Your stomach stopped asking. It\'s in mourning now.' },
    { fr: 'Vous n\'avez même plus la force de vous évanouir.',
      en: 'You don\'t even have the strength to faint.' },
    { fr: 'Vos dents claquent. C\'est le seul bruit que vous produisez encore.',
      en: 'Your teeth are chattering. It\'s the only noise you still make.' },
    { fr: 'Le froid a gagné. Il jouait contre personne.',
      en: 'The cold won. It wasn\'t playing anyone.' },
    { fr: 'Techniquement vivant. Le service des impôts n\'est pas prévenu.',
      en: 'Technically alive. The tax office hasn\'t been told.' },
  ],

  /* ── ② DIGNITÉ À ZÉRO ────────────────────────────────────────────────────
   * Le sujet du jeu, et la catégorie qui doit faire le moins rire. Elles
   * frappent sur un GESTE PRÉCIS — dire merci, baisser les yeux, s'excuser —
   * parce qu'un geste se reconnaît et qu'un concept ne se reconnaît pas.
   */
  'dignite-zero': [
    { fr: 'Vous avez dit merci. C\'est ça qui fait mal.',
      en: 'You said thank you. That\'s the part that hurts.' },
    { fr: 'Il vous restait une limite. Vous venez de la déménager.',
      en: 'You had one line left. You just moved it.' },
    { fr: 'Personne n\'a détourné le regard. Personne ne regardait.',
      en: 'Nobody looked away. Nobody was looking.' },
    { fr: 'Vous marchandez votre fierté. Le cours s\'effondre.',
      en: 'You\'re trading your pride. The price is collapsing.' },
    { fr: 'Vous vous êtes excusé d\'exister. Ils ont accepté.',
      en: 'You apologised for existing. They accepted it.' },
    { fr: 'Mardi, vous auriez refusé. On est vendredi.',
      en: 'On Tuesday you\'d have refused. It\'s Friday.' },
  ],

  /* ── ③ ÉCHEC TOTAL AU VOL ────────────────────────────────────────────────
   * Le seul moment où le jeu a le droit d'être franchement moqueur : le
   * joueur a pris un risque en connaissance de cause. On tape sur
   * l'exécution, jamais sur l'intention — et c'est la catégorie où les
   * phrases d'un seul bloc font le plus de dégâts.
   */
  'vol-rate': [
    { fr: 'Discret pendant six secondes. Record personnel.',
      en: 'Unseen for six whole seconds. Personal best.' },
    { fr: 'Le vigile n\'a même pas eu à courir.',
      en: 'The guard didn\'t even have to run.' },
    { fr: 'Votre plan avait une faille. C\'était vous.',
      en: 'Your plan had one flaw. It was you.' },
    { fr: 'Repéré, rattrapé, ressorti. Dans cet ordre.',
      en: 'Spotted, caught, thrown out. In that order.' },
    { fr: 'Il y avait une caméra. Vous êtes une anecdote de pause déjeuner.',
      en: 'There was a camera. You\'re now a lunch-break anecdote.' },
    { fr: 'Vous avez volé l\'attention de tout le monde. Rien d\'autre.',
      en: 'You stole everyone\'s attention. Nothing else.' },
  ],

  /* ── ④ RÉVEIL DOULOUREUX ─────────────────────────────────────────────────
   * Une fois par nuit, cent fois par partie : ce sont les six qui doivent le
   * mieux vieillir. Aucune ne pousse la blague, toutes tiennent sur un
   * DÉTAIL VÉRIFIABLE — un chiffre, un balayeur, un chien. Un détail exact ne
   * s'use pas ; une vanne, si.
   */
  'reveil': [
    { fr: 'Le carton a pris l\'eau. Vous aussi.',
      en: 'The cardboard took on water. So did you.' },
    { fr: 'Quatre heures de sommeil. En six fois.',
      en: 'Four hours of sleep. In six instalments.' },
    { fr: 'Votre dos a quinze ans de plus que vous.',
      en: 'Your back is fifteen years older than you.' },
    { fr: 'Un chien vous a reniflé cette nuit. Il n\'est pas resté.',
      en: 'A dog sniffed you in the night. It didn\'t stay.' },
    { fr: 'Réveillé par le balayeur. Il ne s\'est pas excusé.',
      en: 'Woken by the street sweeper. He didn\'t apologise.' },
    { fr: 'Vous avez rêvé de draps. Le réveil a réglé ça.',
      en: 'You dreamt of bed sheets. Waking up settled that.' },
  ],

  /* ── ⑤ GAINS MISÉRABLES ──────────────────────────────────────────────────
   * Le pire moment pour le joueur, donc le meilleur pour une vanne : elle
   * transforme une frustration en anecdote. Toutes chiffrent, ou comparent à
   * quelque chose de trop petit — c'est la précision qui fait rire, pas
   * l'idée générale d'être pauvre.
   */
  'gain-miserable': [
    { fr: 'Un centime. Encadrez-le.',
      en: 'One cent. Frame it.' },
    { fr: 'Un centime de l\'heure. Arrondi au supérieur.',
      en: 'One cent an hour. Rounded up.' },
    { fr: 'De quoi acheter un quart de baguette. Sans le quart.',
      en: 'Enough for a quarter of a baguette. Minus the quarter.' },
    { fr: 'Une ficelle. Vous voilà dans le textile.',
      en: 'A piece of string. You\'re in textiles now.' },
    { fr: 'Ce butin tiendrait dans une dent creuse.',
      en: 'This haul would fit in a hollow tooth.' },
    { fr: 'Le marché a parlé. Il a dit non.',
      en: 'The market has spoken. It said no.' },
  ],
};

/*
 * ── LE DÉBIT ─────────────────────────────────────────────────────────────
 *
 * Une pique qui tombe à chaque action n'est plus une pique, c'est un tic — et
 * un tic fait exactement ce que fait une alarme trop fréquente : on cesse de
 * le lire. Deux verrous, et ils font le même métier que ceux des jauges.
 *
 * L'ATTENTE. Trente secondes minimum entre deux piques, toutes catégories
 * confondues. Une mauvaise passe en enchaîne trois sinon — santé, dignité,
 * vol raté — et le jeu se met à ricaner sans s'arrêter au moment précis où le
 * joueur est en train de perdre.
 *
 * LA MÉMOIRE. Jamais deux fois la même phrase d'affilée dans une catégorie.
 * Six phrases tirées au hasard en redonnent une sur six ; l'effet de
 * répétition arrive bien avant qu'on ait fait le tour.
 */
const ECART_MS = 30000;
let dernierePique = 0;
const derniereDeLaCategorie = new Map<CategoriePique, number>();

/**
 * La pique du moment, ou `null` s'il est trop tôt pour en placer une.
 *
 * Rendre `null` plutôt que de se taire à l'affichage est délibéré : l'appelant
 * décide alors de ne rien montrer du tout, au lieu d'afficher un toast vide.
 */
export function piquer(cat: CategoriePique, maintenant = Date.now()): Pique | null {
  if (maintenant - dernierePique < ECART_MS) return null;
  const banque = PIQUES[cat];
  if (!banque?.length) return null;

  const avant = derniereDeLaCategorie.get(cat);
  let i = Math.floor(Math.random() * banque.length);
  if (i === avant) i = (i + 1) % banque.length;
  derniereDeLaCategorie.set(cat, i);
  dernierePique = maintenant;
  return banque[i];
}

/** Nouvelle partie : le défunt n'emporte pas le compteur de piques. */
export function reinitialiserPiques(): void {
  dernierePique = 0;
  derniereDeLaCategorie.clear();
}
