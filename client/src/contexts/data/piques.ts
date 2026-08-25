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
 *   2. LA CHUTE EN DEUXIÈME PHRASE. Un constat plat, un point, puis le coup.
 *      « Un centime. Encadrez-le. » L'arythmie fait tout le travail : la
 *      première phrase installe, la seconde retire la chaise.
 *
 *   3. ON SE MOQUE DE LA SITUATION, JAMAIS DU JOUEUR. « Vous courez mal »
 *      passe parce que c'est la rue qui parle et qu'elle a raison. « Vous êtes
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
   * Le corps lâche. Le registre est celui du constat administratif appliqué à
   * une catastrophe intime : c'est le décalage qui fait rire, pas la douleur.
   */
  'sante-critique': [
    { fr: 'Votre corps a déposé le bilan. Reste la liquidation.',
      en: 'Your body has filed for bankruptcy. Liquidation pending.' },
    { fr: 'L\'estomac a arrêté de crier. Il a renoncé.',
      en: 'Your stomach stopped complaining. It gave up.' },
    { fr: 'Vous tremblez. Personne ne mettra ça sur le compte de l\'émotion.',
      en: 'You\'re shaking. Nobody will blame that on emotion.' },
    { fr: 'Debout, oui. Vivant, c\'est plus discutable.',
      en: 'Upright, yes. Alive is more debatable.' },
    { fr: 'Le froid ne vous cherchait pas. Il vous a trouvé.',
      en: 'The cold wasn\'t looking for you. It found you.' },
    { fr: 'Vos jambes négocient avec le sol. Elles perdent.',
      en: 'Your legs are negotiating with the ground. They\'re losing.' },
  ],

  /* ── ② DIGNITÉ À ZÉRO ────────────────────────────────────────────────────
   * Le sujet du jeu. Ces six-là sont les plus dures et les moins drôles, et
   * c'est voulu : le rire s'arrête pile là où le jeu veut qu'on réfléchisse.
   */
  'dignite-zero': [
    { fr: 'Vous vous êtes baissé. Vous ne vous relevez pas tout à fait.',
      en: 'You stooped. You don\'t quite straighten back up.' },
    { fr: 'Il restait un fond de fierté. Vous l\'avez raclé.',
      en: 'There was a bit of pride left. You scraped it out.' },
    { fr: 'Personne ne vous juge. Personne ne vous regarde non plus.',
      en: 'Nobody\'s judging you. Nobody\'s looking either.' },
    { fr: 'Vous auriez refusé ça mardi. On est vendredi.',
      en: 'You\'d have refused that on Tuesday. It\'s Friday.' },
    { fr: 'La honte, ça s\'use. Vous êtes presque tranquille.',
      en: 'Shame wears out. You\'re almost comfortable.' },
    { fr: 'Vous avez fait pire. C\'est exactement ça, le problème.',
      en: 'You\'ve done worse. That\'s exactly the problem.' },
  ],

  /* ── ③ ÉCHEC TOTAL AU VOL ────────────────────────────────────────────────
   * Le seul moment où le jeu a le droit d'être franchement moqueur : le
   * joueur a pris un risque en connaissance de cause, et il a raté. On tape
   * sur l'exécution, jamais sur l'intention.
   */
  'vol-rate': [
    { fr: 'La main dans le sac. Le sac n\'était pas le vôtre.',
      en: 'Caught red-handed. The hand wasn\'t even quick.' },
    { fr: 'Repéré en trois secondes. Un record, dans un sens.',
      en: 'Spotted in three seconds. A record, in a way.' },
    { fr: 'Vous n\'êtes pas discret. Vous êtes juste lent.',
      en: 'You\'re not subtle. You\'re just slow.' },
    { fr: 'Le vigile s\'ennuyait. Vous lui avez fait sa journée.',
      en: 'The guard was bored. You made his day.' },
    { fr: 'Tout le monde a vu. Personne n\'a filmé. Ça console.',
      en: 'Everyone saw. Nobody filmed it. Small mercies.' },
    { fr: 'Vous courez mal. On ne vous l\'avait jamais dit ?',
      en: 'You run badly. Has nobody ever told you?' },
  ],

  /* ── ④ RÉVEIL DOULOUREUX ─────────────────────────────────────────────────
   * Le matin, tous les jours, cent fois par partie. Ce sont donc les six qui
   * doivent le mieux vieillir : aucune ne pousse la blague, toutes se
   * contentent d'un détail exact.
   */
  'reveil': [
    { fr: 'Vous avez dormi. Le mot est généreux.',
      en: 'You slept. Generous word for it.' },
    { fr: 'Le carton a pris l\'humidité. Vous aussi.',
      en: 'The cardboard took on damp. So did you.' },
    { fr: 'Une nuit de plus. Personne ne compte, sauf vous.',
      en: 'One more night. Nobody\'s counting, except you.' },
    { fr: 'Votre dos a un avis. Il le donne.',
      en: 'Your back has an opinion. It\'s sharing it.' },
    { fr: 'Réveillé par le froid. Ponctuel, lui.',
      en: 'Woken by the cold. Always on time, that one.' },
    { fr: 'Vous avez rêvé d\'un lit. Le réveil a été rapide.',
      en: 'You dreamt of a bed. Waking up was quick.' },
  ],

  /* ── ⑤ GAINS MISÉRABLES ──────────────────────────────────────────────────
   * Le pire moment pour le joueur, et donc le meilleur pour une blague : elle
   * transforme une frustration en anecdote. C'est la catégorie qui fait le
   * plus de travail dans tout ce fichier.
   */
  'gain-miserable': [
    { fr: 'Un centime. Encadrez-le.',
      en: 'One cent. Frame it.' },
    { fr: 'Deux heures de travail. Voilà le salaire.',
      en: 'Two hours of work. There\'s the wage.' },
    { fr: 'Ça ne paie pas le pain. Ça paie l\'idée du pain.',
      en: 'It won\'t buy bread. It buys the idea of bread.' },
    { fr: 'Vous êtes riche. À l\'échelle du trottoir.',
      en: 'You\'re rich. By pavement standards.' },
    { fr: 'Un bout de ficelle. La rue a de l\'humour.',
      en: 'A bit of string. The street has jokes.' },
    { fr: 'Le marché du travail a répondu. Sèchement.',
      en: 'The job market has answered. Curtly.' },
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
