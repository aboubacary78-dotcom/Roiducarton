/*
 * ═══════════════════════════════════════════════════════════════════════════
 * QUAND LA TÊTE LÂCHE, LE TEXTE LÂCHE AUSSI.
 *
 * Le Mental ne faisait que deux choses : descendre, et à zéro tuer. C'était
 * une seconde barre de vie déguisée, et rien ne rendait sa perte
 * INTÉRESSANTE : juste inquiétante.
 *
 * Désormais il tient la lisibilité du monde. Sous 20 (et pas avant) les mots
 * des rencontres commencent à s'effacer ; plus bas, certains se remplacent
 * carrément par d'autres. Le joueur ne perd pas des points : il perd le fil de ce qu'on lui
 * raconte, ce qui est autrement plus désagréable et, c'est le sujet du jeu,
 * autrement plus juste.
 *
 * TROIS RÈGLES QUI EMPÊCHENT QUE ÇA PASSE POUR UN BUG :
 *
 *   1. UN MOT QUI LÂCHE DEVIENT DES SIGNES, PAS UN MOT MAL ÉCRIT. Mélanger
 *      les lettres (« accepte » → « acpetce ») produisait exactement
 *      l'aspect d'une faute de frappe, et se faisait signaler comme telle.
 *      Des formes géométriques à la place du mot ne se confondent avec rien :
 *      c'est un trou dans la lecture, pas une coquille.
 *
 *   2. LE MÊME TEXTE DONNE TOUJOURS LE MÊME CHARABIA. Le tirage est semé sur
 *      le texte et sur la tranche de mental, jamais sur l'horloge : sinon les
 *      mots danseraient à chaque redessin de React, et là ce serait un bug.
 *
 *   3. LES NOMBRES, LES PRIX ET LES NOMS PROPRES SONT ÉPARGNÉS. On brouille
 *      le récit, jamais l'information dont dépend une décision. Un joueur qui
 *      ne peut plus lire « 15 € » ne joue plus, il subit.
 *
 * Et le remplacement de mots reste rare et TOUJOURS ABSURDE plutôt que
 * menaçant, un pigeon à la place d'un policier fait rire, l'inverse
 * angoisserait. C'est une comédie noire : la tête qui part doit être drôle
 * avant d'être triste.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Au-dessus, on lit parfaitement.
 *
 * VINGT, ET PAS SOIXANTE. Le seuil était à 60, c'est-à-dire que le texte
 * commençait à s'effacer alors que la jauge était encore aux DEUX TIERS
 * pleine. Le joueur voyait le monde devenir illisible en se sentant parfaitement
 * bien, et la remarque qui l'en prévient tombait elle aussi hors de toute zone
 * critique : « on n'est même pas à 20 % ». Un symptôme qui arrive avant la
 * maladie ne se rattache à rien.
 *
 * Vingt est le territoire où les autres jauges commencent à faire mal, le
 * corps crie sous 10, la tête décroche sous 20. La lecture qui se troue devient
 * alors ce qu'elle doit être : le signe qu'on va mal, pas un effet de style.
 *
 * EXPORTÉ, et pas seulement utilisé ici : la pique qui prévient le joueur doit
 * tomber exactement quand l'écriture commence à lâcher. Recopier le nombre
 * dans la barre de jauges aurait marché le premier jour et dérivé au premier
 * réglage, la remarque arrivant trop tôt ou trop tard, sans que rien ne le
 * signale.
 */
export const SEUIL_LISIBLE = 20;
const SEUIL_LUCIDE = SEUIL_LISIBLE;

/**
 * Mots de remplacement. Volontairement bêtes et concrets : ce sont ceux qui
 * traversent la tête de quelqu'un qui n'a pas dormi, pas des hallucinations
 * de film. Le carton et le pigeon sont là parce qu'ils sont partout dans le
 * jeu, l'esprit qui déraille recycle ce qu'il a sous les yeux.
 */
const MOTS_QUI_PASSENT = [
  'pigeon', 'carton', 'soupe', 'chaussure', 'lundi', 'dimanche', 'fromage',
  'parapluie', 'moustache', 'ascenseur', 'confiture', 'trombone', 'radiateur',
  'canard', 'oreiller', 'brouette', 'accordéon', 'saucisse', 'placard',
];

const MOTS_QUI_PASSENT_EN = [
  'pigeon', 'cardboard', 'soup', 'shoe', 'Monday', 'Sunday', 'cheese',
  'umbrella', 'moustache', 'elevator', 'jam', 'paperclip', 'radiator',
  'duck', 'pillow', 'wheelbarrow', 'accordion', 'sausage', 'cupboard',
];

/** Générateur déterministe : même entrée, même sortie, toujours. */
function semer(texte: string, tranche: number): () => number {
  let h = 2166136261 ^ tranche;
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const tirer = () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
  // Quelques tours à vide : sans ça, deux graines voisines donnent des
  // premiers tirages voisins, et le même mot de remplacement sortait trois
  // fois de suite dans la même phrase.
  for (let i = 0; i < 8; i++) tirer();
  return tirer;
}

/**
 * Un mot qu'on laisse tranquille : trop court, chiffré, nom propre, ou
 * PORTEUR D'UNE APOSTROPHE OU D'UN TRAIT D'UNION.
 *
 * Cette dernière règle est une correction, et elle vient d'une mesure. Le
 * brouillage traitait « l'histoire » comme un seul mot et déplaçait
 * l'apostrophe avec les lettres. Sur les 1 303 phrases du jeu, un mot brouillé
 * sur dix ressortait ainsi :
 *
 *     quelqu'un  → qq'uuueln
 *     grand-mère → gdr-nrmaèe
 *     l'intérieur → lu'etinréir
 *
 * Ce ne sont pas des lectures difficiles, ce sont des caractères déplacés : ça
 * ne se lit pas comme un symptôme, ça se lit comme une faute de frappe. Et
 * c'est ce qui a fait signaler la mécanique entière comme « des phrases
 * parasites ».
 *
 * On pourrait ne brouiller que les segments de lettres et laisser la
 * ponctuation en place. On préfère épargner ces mots : ils sont une petite
 * minorité, et « quelqu » brouillé seul reste une bouillie. Le brouillage doit
 * produire des mots mal lus, jamais des restes.
 */
function intouchable(mot: string): boolean {
  if (mot.length < 6) return true;
  if (/\d/.test(mot)) return true;
  if (/^[A-ZÉÈÀÇ]/.test(mot)) return true;
  if (/['’-]/.test(mot)) return true;
  return false;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * UN MOT QUI LÂCHE DEVIENT DES SIGNES, PAS UN MOT MAL ÉCRIT
 *
 * Pendant longtemps, un mot touché voyait ses lettres intérieures mélangées :
 * « accepte » → « acpetce ». L'idée était bonne, le mot reste devinable, on
 * SENT qu'on lit mal, mais elle a un défaut fatal, et il a fallu une capture
 * d'écran pour le voir : un mot aux lettres mélangées, c'est exactement à quoi
 * ressemble une faute de frappe. Le joueur ne lit pas « ma tête part », il lit
 * « le développeur a mal écrit ». Toute la mécanique se faisait signaler comme
 * « des phrases parasites ».
 *
 * Le mot touché devient donc ILLISIBLE : une suite de signes géométriques, de
 * la même longueur, à la place des lettres. On ne peut pas confondre ça avec
 * une coquille, c'est visiblement un trou dans la lecture, et c'est
 * exactement ce que le Mental est censé produire.
 *
 * POURQUOI DES SIGNES UNICODE ET PAS WINGDINGS. Wingdings est une police
 * Microsoft : elle n'existe ni sur Android ni sur iOS, et un texte qui la
 * demande retombe silencieusement sur la police du système, c'est-à-dire sur
 * les lettres d'origine, parfaitement lisibles. Le bloc « Formes
 * géométriques » (U+25xx) est, lui, servi par les polices système partout, et
 * ne demande aucun téléchargement dans l'APK.
 *
 * On garde les signes SOBRES et non colorés : les étoiles et les cœurs
 * partent en emoji sur Android, ce qui ferait un mot en couleur au milieu
 * d'une phrase, et une décoration là où il faut un manque.
 * ═══════════════════════════════════════════════════════════════════════════ */

const SIGNES = ['■', '□', '▲', '△', '▼', '▽', '◆', '◇', '●', '○', '◈', '◉', '◊', '◐', '◑'];

/**
 * Remplace un mot par des signes de MÊME LONGUEUR.
 *
 * La longueur compte : un mot remplacé par trois symboles ferait sauter la
 * mise en page et se lirait comme une troncature. Là, le texte garde sa
 * forme, on voit qu'il manque un mot précis, à sa place exacte.
 */
function illisible(mot: string, rng: () => number): string {
  let sortie = '';
  for (let i = 0; i < mot.length; i++) sortie += SIGNES[Math.floor(rng() * SIGNES.length)];
  return sortie;
}

/**
 * Ce que la tête fait au texte.
 *
 * `mental` de 0 à 100. Au-dessus de 60 le texte revient intact, même objet,
 * donc aucun redessin inutile.
 */
export function charabia(texte: string, mental: number, en = false): string {
  if (!texte || mental >= SEUIL_LUCIDE) return texte;

  /*
   * Par tranches de dix, et non en continu. Un texte qui se dégrade d'un
   * cheveu à chaque point de mental perdu se réécrirait sous les yeux du
   * joueur pendant qu'il lit, et le tirage doit rester stable tant que la
   * situation ne change pas vraiment.
   */
  const tranche = Math.floor(mental / 10);
  const gravite = (SEUIL_LUCIDE - mental) / SEUIL_LUCIDE; // 0 → 1

  /*
   * L'ENTRÉE EST PROGRESSIVE, ET ELLE NE L'ÉTAIT PAS.
   *
   * La part effacée partait d'un socle de 0,12 : au premier point sous le
   * seuil, un mot éligible sur huit disparaissait déjà. Le brouillage
   * s'allumait donc d'un coup, comme un interrupteur, ce qui se lit comme une
   * panne plutôt que comme une dégradation.
   *
   * Sans socle, la courbe part de zéro : à un point sous le seuil on ne voit
   * presque rien, et à l'agonie plus d'un mot sur deux s'efface. Le joueur
   * sent la tête partir au lieu de la trouver soudain partie.
   */
  const partMelangee = gravite * 0.55;
  const partRemplacee = Math.max(0, gravite - 0.5) * 0.30;

  const rng = semer(texte, tranche);
  const banque = en ? MOTS_QUI_PASSENT_EN : MOTS_QUI_PASSENT;

  // Classe explicite plutôt que \p{L} : le drapeau Unicode réclame une cible
  // ES6+, plus récente que celle du projet. La plage couvre les accents
  // français et anglais, qui sont tout ce dont on a besoin ici.
  return texte.replace(/[A-Za-zÀ-ÖØ-öø-ÿ’'-]+/g, (mot) => {
    if (intouchable(mot)) return mot;
    const d = rng();
    if (d < partRemplacee) return banque[Math.floor(rng() * banque.length)];
    if (d < partRemplacee + partMelangee) return illisible(mot, rng);
    return mot;
  });
}

/** Le joueur lit-il encore correctement ? Sert à prévenir une seule fois. */
export function teteQuiPart(mental: number): boolean {
  return mental < SEUIL_LUCIDE;
}
