/*
 * ═══════════════════════════════════════════════════════════════════════════
 * QUAND LA TÊTE LÂCHE, LE TEXTE LÂCHE AUSSI.
 *
 * Le Mental ne faisait que deux choses : descendre, et à zéro tuer. C'était
 * une seconde barre de vie déguisée, et rien ne rendait sa perte
 * INTÉRESSANTE — juste inquiétante.
 *
 * Désormais il tient la lisibilité du monde. Sous 60, les mots des rencontres
 * commencent à se mélanger ; plus bas, ils se remplacent carrément par
 * d'autres. Le joueur ne perd pas des points : il perd le fil de ce qu'on lui
 * raconte, ce qui est autrement plus désagréable et — c'est le sujet du jeu —
 * autrement plus juste.
 *
 * TROIS RÈGLES QUI EMPÊCHENT QUE ÇA PASSE POUR UN BUG :
 *
 *   1. LES LETTRES DU DÉBUT ET DE LA FIN NE BOUGENT PAS. On brouille
 *      l'intérieur des mots longs, qui restent devinables. Le joueur sent
 *      qu'il lit mal ; il ne se retrouve pas devant du bruit.
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
 * menaçant — un pigeon à la place d'un policier fait rire, l'inverse
 * angoisserait. C'est une comédie noire : la tête qui part doit être drôle
 * avant d'être triste.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Au-dessus, on lit parfaitement. */
const SEUIL_LUCIDE = 60;

/**
 * Mots de remplacement. Volontairement bêtes et concrets : ce sont ceux qui
 * traversent la tête de quelqu'un qui n'a pas dormi, pas des hallucinations
 * de film. Le carton et le pigeon sont là parce qu'ils sont partout dans le
 * jeu — l'esprit qui déraille recycle ce qu'il a sous les yeux.
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
 * Un mot qu'on laisse tranquille : trop court, chiffré, nom propre — ou
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

/**
 * Mélange l'intérieur d'un mot, première et dernière lettre en place.
 *
 * ET GARANTIT QUE LE MOT CHANGE. Un mot de cinq lettres n'a que trois lettres
 * intérieures, souvent avec des doublons : « homme » remélangé redonne
 * « homme » une fois sur deux. La moitié du brouillage ne se voyait donc pas,
 * et l'effet paraissait bien plus faible qu'il ne l'était. On force un
 * échange tant que le résultat est identique.
 */
function melanger(mot: string, rng: () => number): string {
  const lettres = mot.split('');
  for (let i = lettres.length - 2; i > 1; i--) {
    const j = 1 + Math.floor(rng() * i);
    [lettres[i], lettres[j]] = [lettres[j], lettres[i]];
  }
  let sortie = lettres.join('');
  for (let essai = 0; sortie === mot && essai < 6; essai++) {
    const a = 1 + Math.floor(rng() * (lettres.length - 2));
    const b = 1 + Math.floor(rng() * (lettres.length - 2));
    if (a === b) continue;
    [lettres[a], lettres[b]] = [lettres[b], lettres[a]];
    sortie = lettres.join('');
  }
  return sortie;
}

/**
 * Ce que la tête fait au texte.
 *
 * `mental` de 0 à 100. Au-dessus de 60 le texte revient intact — même objet,
 * donc aucun redessin inutile.
 */
export function charabia(texte: string, mental: number, en = false): string {
  if (!texte || mental >= SEUIL_LUCIDE) return texte;

  /*
   * Par tranches de dix, et non en continu. Un texte qui se dégrade d'un
   * cheveu à chaque point de mental perdu se réécrirait sous les yeux du
   * joueur pendant qu'il lit — et le tirage doit rester stable tant que la
   * situation ne change pas vraiment.
   */
  const tranche = Math.floor(mental / 10);
  const gravite = (SEUIL_LUCIDE - mental) / SEUIL_LUCIDE; // 0 → 1
  const partMelangee = 0.12 + gravite * 0.45;
  const partRemplacee = Math.max(0, gravite - 0.45) * 0.30;

  const rng = semer(texte, tranche);
  const banque = en ? MOTS_QUI_PASSENT_EN : MOTS_QUI_PASSENT;

  // Classe explicite plutôt que \p{L} : le drapeau Unicode réclame une cible
  // ES6+, plus récente que celle du projet. La plage couvre les accents
  // français et anglais, qui sont tout ce dont on a besoin ici.
  return texte.replace(/[A-Za-zÀ-ÖØ-öø-ÿ’'-]+/g, (mot) => {
    if (intouchable(mot)) return mot;
    const d = rng();
    if (d < partRemplacee) return banque[Math.floor(rng() * banque.length)];
    if (d < partRemplacee + partMelangee) return melanger(mot, rng);
    return mot;
  });
}

/** Le joueur lit-il encore correctement ? Sert à prévenir une seule fois. */
export function teteQuiPart(mental: number): boolean {
  return mental < SEUIL_LUCIDE;
}
