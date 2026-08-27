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
  | 'gain-miserable'    // beaucoup d'efforts, un centime
  | 'tete-qui-part';    // le mental passe sous le seuil de lisibilité

/**
 * CE QUI VIENT DE SE PASSER.
 *
 * Sans ça, une pique est un fortune cookie : elle tombe, elle est bien
 * tournée, et elle ne parle de rien. Le premier joueur l'a dit sans détour —
 * « aucune cohérence, on dirait que c'est mis pour être mis ». Il avait
 * raison, et le défaut était de conception : les phrases étaient tirées AU
 * HASARD dans un sac de six, quel que soit ce qui venait d'arriver. Une
 * remarque sur le carton mouillé après une nuit sèche ne rate pas de peu, elle
 * ne veut rien dire du tout.
 *
 * Chaque phrase déclare donc à quelle situation elle répond, et on ne tire que
 * parmi celles qui collent. S'il n'y en a aucune, LE JEU SE TAIT — c'est la
 * moitié du travail : une vanne qu'on retient vaut mieux qu'une vanne à côté.
 */
export interface Contexte {
  /**
   * La jauge qui vient de passer dans le rouge.
   *
   * Volontairement une chaîne libre et non une union des cinq jauges du
   * corps : l'appelant les parcourt via une table typée `keyof Stats`, qui
   * inclut la dignité, et TypeScript ne sait pas la restreindre à cet
   * endroit. Une union ici obligerait à une conversion forcée au point
   * d'appel — c'est-à-dire à éteindre le contrôle plutôt qu'à le satisfaire.
   * La dignité a de toute façon sa propre catégorie de piques.
   */
  jauge?: string;
  /** Le temps qu'il a fait cette nuit. */
  meteo?: string;
  /** Ce que la nuit a coûté en sommeil (négatif = mal dormi). */
  sommeil?: number;
  /** Ce que l'effort a rapporté, en centimes ou en pièces. */
  gain?: number;
}

export interface Pique {
  fr: string;
  en: string;
  /** Absent = valable en toute circonstance. Sinon, il faut que ça colle. */
  quand?: (c: Contexte) => boolean;
}

export const PIQUES: Record<CategoriePique, Pique[]> = {
  /* ── ⓪ LA TÊTE QUI PART ───────────────────────────────────────────────────
   * LA SEULE CATÉGORIE QUI DOIT EXPLIQUER QUELQUE CHOSE.
   *
   * Sous 60 de mental, les mots des rencontres se remplacent par des signes
   * illisibles (voir lib/charabia). C'est la mécanique la plus forte du jeu et
   * c'était la plus muette : rien ne reliait le texte troué à la jauge, et le
   * joueur concluait — capture d'écran à l'appui — que le jeu était cassé.
   *
   * Ces phrases-là ont donc un travail que les autres n'ont pas : faire le
   * lien. Chacune nomme LA TÊTE et LA LECTURE dans la même phrase, sans jamais
   * prendre le ton du mode d'emploi. « Les lettres se barrent » dit tout ce
   * qu'un tutoriel dirait, et le dit dans la voix du jeu.
   *
   * Elles ne sonnent qu'au FRANCHISSEMENT du seuil, pas tant qu'on reste
   * dessous : une explication répétée devient un reproche.
   */
  'tete-qui-part': [
    { fr: 'Les lettres se barrent avant vous. Elles ont eu raison.',
      en: 'The letters are leaving before you. They were right to.' },
    { fr: 'Vous relisez trois fois. Ce n\'est pas le panneau, c\'est vous.',
      en: 'You read it three times. It\'s not the sign, it\'s you.' },
    { fr: 'La fatigue a mangé les mots. Elle commence toujours par le milieu.',
      en: 'Exhaustion ate the words. It always starts in the middle.' },
    { fr: 'Dormez, ou apprenez à lire les trous.',
      en: 'Sleep, or learn to read the gaps.' },
    { fr: 'Votre tête a rendu son tablier. Le monde devient illisible.',
      en: 'Your head handed in its notice. The world goes unreadable.' },
    { fr: 'Ce ne sont pas des fautes. C\'est vous qui décrochez.',
      en: 'Those aren\'t typos. You\'re the one slipping.' },
    { fr: 'Le texte tient debout. C\'est votre lecture qui titube.',
      en: 'The text is fine. It\'s your reading that\'s staggering.' },
  ],

  /* ── ① SANTÉ CRITIQUE ────────────────────────────────────────────────────
   * Chaque phrase nomme LA jauge qui lâche. C'est ce qui manquait le plus :
   * mourir de soif et s'entendre parler du froid, c'est le jeu qui ne regarde
   * pas son propre écran. Le rire vient du décalage de registre — un corps qui
   * meurt décrit avec le vocabulaire d'un huissier ou d'un pigeon poli.
   */
  'sante-critique': [
    { quand: c => c.jauge === 'hunger',
      fr: 'Votre estomac ne réclame plus rien. Il a fait son deuil.',
      en: 'Your stomach stopped asking. It\'s in mourning now.' },
    { quand: c => c.jauge === 'hunger',
      fr: 'Un pigeon mange mieux que vous. Il le sait.',
      en: 'A pigeon is eating better than you. It knows.' },
    { quand: c => c.jauge === 'thirst',
      fr: 'Votre langue colle. Économisez vos mots.',
      en: 'Your tongue is sticking. Save your words.' },
    { quand: c => c.jauge === 'thirst',
      fr: 'Trois fontaines dans ce quartier. Toutes en travaux.',
      en: 'Three fountains in this neighbourhood. All under repair.' },
    { quand: c => c.jauge === 'sleep',
      fr: 'Vous avez cligné des yeux pendant huit secondes.',
      en: 'You just blinked for eight seconds.' },
    { quand: c => c.jauge === 'sleep',
      fr: 'Le corps commence à facturer les heures debout.',
      en: 'The body is starting to invoice the hours on your feet.' },
    { quand: c => c.jauge === 'health',
      fr: 'Vous n\'avez même plus la force de vous évanouir.',
      en: 'You don\'t even have the strength to faint.' },
    { quand: c => c.jauge === 'health',
      fr: 'Techniquement vivant. Le service des impôts n\'est pas prévenu.',
      en: 'Technically alive. The tax office hasn\'t been told.' },
    { quand: c => c.jauge === 'mental',
      fr: 'Vous relisez la même ligne pour la quatrième fois.',
      en: 'You\'re re-reading the same line for the fourth time.' },
    { quand: c => c.jauge === 'mental',
      fr: 'Votre tête part en vacances. Sans vous.',
      en: 'Your head is going on holiday. Without you.' },
  ],

  /* ── ② DIGNITÉ À ZÉRO ────────────────────────────────────────────────────
   * Elles se déclenchent au franchissement d'un palier — donc juste après un
   * geste que le joueur vient de faire. Pas de condition : le palier EST la
   * situation, et elles frappent toutes sur un geste précis plutôt que sur
   * l'idée générale d'avoir honte.
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
   * l'exécution, jamais sur l'intention. Pas de condition — se faire prendre
   * est déjà la situation la plus précise du jeu.
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
   * C'est ici que l'incohérence se voyait le plus : la remarque tombait tous
   * les matins, quel qu'ait été la nuit. « Le carton a pris l'eau » après une
   * nuit sèche, et le joueur comprend en une fois que le jeu ne regarde rien.
   *
   * Chacune dépend maintenant de ce que la nuit a VRAIMENT été. Et si la nuit
   * s'est bien passée, aucune ne colle : le matin se passe en silence, ce qui
   * rend les autres matins beaucoup plus mordants.
   */
  'reveil': [
    { quand: c => c.meteo === 'rainy' || c.meteo === 'storm',
      fr: 'Le carton a pris l\'eau. Vous aussi.',
      en: 'The cardboard took on water. So did you.' },
    { quand: c => c.meteo === 'rainy' || c.meteo === 'storm',
      fr: 'Il a plu toute la nuit. Le carton a tenu deux heures.',
      en: 'It rained all night. The cardboard lasted two hours.' },
    { quand: c => c.meteo === 'snow' || c.meteo === 'storm',
      fr: 'Réveillé par le froid. Ponctuel, lui.',
      en: 'Woken by the cold. Always on time, that one.' },
    { quand: c => c.meteo === 'snow',
      fr: 'Il a neigé sur vous. Personne n\'a trouvé ça beau.',
      en: 'It snowed on you. Nobody found it pretty.' },
    { quand: c => c.meteo === 'heatwave',
      fr: 'Trente degrés à six heures du matin. Bonne journée.',
      en: 'Thirty degrees at six in the morning. Enjoy your day.' },
    { quand: c => (c.sommeil ?? 0) < -3,
      fr: 'Quatre heures de sommeil. En six fois.',
      en: 'Four hours of sleep. In six instalments.' },
    { quand: c => (c.sommeil ?? 0) < -3,
      fr: 'Votre dos a un avis sur cette nuit. Il le donne.',
      en: 'Your back has an opinion about last night. It\'s sharing it.' },
    { quand: c => (c.sommeil ?? 0) < -8,
      fr: 'Vous avez dormi. Le mot est généreux.',
      en: 'You slept. Generous word for it.' },
  ],

  /* ── ⑤ GAINS MISÉRABLES ──────────────────────────────────────────────────
   * Déjà causales par nature — elles ne sortent que sur une récolte nulle. On
   * distingue quand même le ZÉRO du PRESQUE RIEN : « encadrez-le » n'a aucun
   * sens quand on est reparti les mains vides, et c'est le genre de décalage
   * d'un cran qui fait passer une vanne pour un tirage au sort.
   */
  'gain-miserable': [
    { quand: c => (c.gain ?? 0) > 0,
      fr: 'Un centime. Encadrez-le.',
      en: 'One cent. Frame it.' },
    { quand: c => (c.gain ?? 0) > 0,
      fr: 'Un centime de l\'heure. Arrondi au supérieur.',
      en: 'One cent an hour. Rounded up.' },
    { quand: c => (c.gain ?? 0) > 0,
      fr: 'De quoi acheter un quart de baguette. Sans le quart.',
      en: 'Enough for a quarter of a baguette. Minus the quarter.' },
    { quand: c => (c.gain ?? 0) <= 0,
      fr: 'Rien. Pas même une ficelle.',
      en: 'Nothing. Not even a piece of string.' },
    { quand: c => (c.gain ?? 0) <= 0,
      fr: 'Zéro. Le marché a parlé, et il a dit non.',
      en: 'Zero. The market has spoken, and it said no.' },
    { quand: c => (c.gain ?? 0) <= 0,
      fr: 'Vous repartez avec vos mains. C\'est déjà ça.',
      en: 'You leave with your hands. That\'s something.' },
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
 * Elle porte sur le TEXTE et non sur un indice de tableau : depuis que les
 * phrases sont filtrées par la situation, l'indice 2 ne désigne plus la même
 * phrase d'un appel à l'autre, et la mémoire empêchait alors une répétition
 * qui n'existait pas tout en en laissant passer de vraies.
 */
const ECART_MS = 30000;
let dernierePique = 0;
const derniereDeLaCategorie = new Map<CategoriePique, string>();

/**
 * La pique du moment, ou `null` s'il est trop tôt pour en placer une.
 *
 * Rendre `null` plutôt que de se taire à l'affichage est délibéré : l'appelant
 * décide alors de ne rien montrer du tout, au lieu d'afficher un toast vide.
 */
export function piquer(
  cat: CategoriePique,
  ctx: Contexte = {},
  maintenant = Date.now(),
): Pique | null {
  if (maintenant - dernierePique < ECART_MS) return null;

  /*
   * ON NE TIRE QUE PARMI CELLES QUI COLLENT.
   *
   * Et s'il n'y en a aucune, on se tait. C'est le point important : la version
   * précédente piochait dans le sac entier et sortait donc une remarque sur le
   * carton mouillé après une nuit sèche. Une vanne à côté ne rate pas de peu,
   * elle démolit toutes les autres avec elle — le joueur comprend en une fois
   * que le jeu ne regarde rien, et il ne les lit plus.
   */
  const banque = (PIQUES[cat] ?? []).filter(p => !p.quand || p.quand(ctx));
  if (!banque.length) return null;

  const avant = derniereDeLaCategorie.get(cat);
  let i = Math.floor(Math.random() * banque.length);
  // Jamais deux fois la même d'affilée — sauf s'il n'en reste qu'une qui
  // colle, auquel cas se répéter vaut mieux que se taire à contretemps.
  if (banque.length > 1 && banque[i].fr === avant) i = (i + 1) % banque.length;
  derniereDeLaCategorie.set(cat, banque[i].fr);
  dernierePique = maintenant;
  return banque[i];
}

/**
 * LA PIQUE COLLÉE AU BOUT DU TEXTE QUE LE JEU ÉCRIT DÉJÀ.
 *
 * C'est le bon endroit, et il existait avant les piques : « Vingt minutes les
 * bras dans les ordures pour rien. Même les rats vous ont regardé avec
 * pitié. » vit dans le TEXTE DU RÉSULTAT de la Récup', sur la grande carte,
 * avec l'image. Elle reste tant qu'on lit, elle fait partie du récit.
 *
 * Mes piques, elles, flottaient en bandeau au-dessus de l'écran et
 * disparaissaient en trois secondes. Même bien écrites, elles se lisaient
 * comme une notification posée par-dessus le jeu — d'où « on dirait que c'est
 * mis pour être mis ». La différence n'est pas dans les phrases, elle est dans
 * l'endroit.
 *
 * Elles rejoignent donc le texte. Le toast ne reste que là où le jeu n'écrit
 * rien — c'est-à-dire quand rien ne vient de se produire, seulement un seuil
 * qu'on a franchi en vivant.
 */
export function avecPique(
  texte: string,
  cat: CategoriePique,
  ctx: Contexte = {},
): string {
  const p = piquer(cat, ctx);
  return p ? `${texte} ${p.fr}` : texte;
}

/** La même, pour un texte déjà bilingue (`L(fr, en)` rend une paire). */
export function avecPiqueBilingue(
  fr: string, en: string,
  cat: CategoriePique,
  ctx: Contexte = {},
): { fr: string; en: string } {
  const p = piquer(cat, ctx);
  return p ? { fr: `${fr} ${p.fr}`, en: `${en} ${p.en}` } : { fr, en };
}

/** Nouvelle partie : le défunt n'emporte pas le compteur de piques. */
export function reinitialiserPiques(): void {
  dernierePique = 0;
  derniereDeLaCategorie.clear();
}
