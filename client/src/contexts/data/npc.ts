// ============ PNJ ERRANTS : LES AUTRES ÂMES DE LA RUE ============
// Dans les lieux « sociaux » (centre-ville, gare, marché), on croise parfois
// une autre âme de la rue. On peut la rencontrer : partager à manger, troquer,
// ou passer son chemin. Chaque PNJ a sa propre « chute » (voir backstory.ts).
//
// Génération DÉTERMINISTE par (jour + lieu + seed du joueur) : le même PNJ est
// présent toute la journée à un lieu donné, et « bouge » d'un jour à l'autre —
// sans rien stocker en sauvegarde.
import type { Character, Enemy, InventoryItem, Job, Trait } from '../types';
import { JOBS, TRAITS, genderFromName } from './world';
import { generateOrigin, type OriginStory } from './backstory';

// Les lieux où l'on croise du monde.
export const SOCIAL_LOCATIONS = ['centre-ville', 'gare', 'marche'];

export function isSocialLocation(location: string): boolean {
  return SOCIAL_LOCATIONS.includes(location);
}

// Un large éventail de prénoms (mixte) pour la variété des rencontres.
const NPC_NAMES = [
  'Marcel', 'Gérard', 'Lucienne', 'Albert', 'Yvette', 'René', 'Josette', 'Fernand',
  'Ginette', 'Maurice', 'Colette', 'Raymond', 'Simone', 'Bernadette', 'Roger',
  'Monique', 'Thierry', 'Huguette', 'Patrick', 'Odette', 'Robert', 'Paulette',
  'Lucien', 'Suzanne', 'André', 'Denise', 'Gaston', 'Micheline', 'Henri', 'Jacqueline',
];

// Ce que le PNJ est en train de faire ({S} = Il/Elle selon le genre).
const SITUATIONS: { fr: string; en: string }[] = [
  { fr: '{S} grelotte sous une fine couverture.', en: '{S} shivers under a thin blanket.' },
  { fr: '{S} fixe le vide, un gobelet vide à la main.', en: '{S} stares into space, an empty cup in hand.' },
  { fr: '{S} fredonne une vieille chanson, fausse mais sincère.', en: '{S} hums an old song, off-key but heartfelt.' },
  { fr: '{S} compte ses pièces pour la dixième fois.', en: '{S} counts their coins for the tenth time.' },
  { fr: '{S} offre un sourire à qui veut bien s\'arrêter.', en: '{S} offers a smile to anyone who\'ll stop.' },
  { fr: '{S} a l\'air d\'attendre quelqu\'un qui ne viendra pas.', en: '{S} seems to wait for someone who won\'t come.' },
  { fr: '{S} partage son bout de pain avec un pigeon.', en: '{S} shares a crust of bread with a pigeon.' },
  { fr: '{S} lit un journal d\'il y a trois semaines.', en: '{S} reads a three-week-old newspaper.' },
];

/*
 * CEUX QUI REGARDENT VOS POCHES.
 *
 * Un compagnon sur quatre s'en va au petit matin avec ce qu'il a pu prendre.
 * Ce n'est pas un piège tant qu'on peut le voir venir : ces huit phrases sont
 * l'indice, et le seul. Elles ne disent jamais « attention », elles décrivent
 * un geste — un regard qui tombe sur le sac, une main qui traîne, une amitié
 * trop rapide. Le joueur apprend à les reconnaître, ce qui est exactement ce
 * qu'on apprend dans la rue.
 *
 * Elles sont assez proches des autres pour qu'on s'y laisse prendre une fois,
 * et assez marquées pour qu'on ne s'y laisse plus prendre deux.
 */
const SITUATIONS_LOUCHES: { fr: string; en: string }[] = [
  { fr: '{S} regarde votre sac plus souvent que votre visage.', en: '{S} looks at your bag more often than your face.' },
  { fr: '{S} vous appelle « mon ami » avant même de savoir votre nom.', en: '{S} calls you "my friend" before knowing your name.' },
  { fr: '{S} range quelque chose sous sa veste en vous voyant arriver.', en: '{S} tucks something under their coat as you walk up.' },
  { fr: '{S} demande où vous dormez, l\'air de rien.', en: '{S} asks where you sleep, casually.' },
  { fr: '{S} a trois montres au poignet et l\'heure d\'aucune.', en: '{S} wears three watches and knows the time on none.' },
  { fr: '{S} rit un peu trop fort à ce que vous n\'avez pas dit.', en: '{S} laughs a bit too loudly at what you didn\'t say.' },
  { fr: '{S} se tient toujours du côté de votre poche.', en: '{S} keeps standing on the side your pocket is on.' },
  { fr: '{S} jure qu\'{S2} ne boit plus, en rangeant une bouteille.', en: '{S} swears they\'ve quit drinking, while pocketing a bottle.' },
];

// Objets que le PNJ peut proposer au troc (contre quelques euros).
const OFFER_ITEMS: InventoryItem[] = [
  { id: 'troc-conserve', name: 'Conserve cabossée', emoji: '🥫', type: 'food', value: 3, effect: { hunger: 18 } },
  { id: 'troc-couverture', name: 'Bout de couverture', emoji: '🧣', type: 'armor', value: 4, defenseBonus: 1 },
  { id: 'troc-lampe', name: 'Lampe de poche', emoji: '🔦', type: 'tool', value: 5, effect: { mental: 5 } },
  { id: 'troc-radio', name: 'Petite radio', emoji: '📻', type: 'special', value: 6, effect: { mental: 10 } },
  { id: 'troc-gants', name: 'Gants dépareillés', emoji: '🧤', type: 'armor', value: 3, defenseBonus: 1 },
];

export interface StreetNpc {
  id: string;
  name: string;
  job: Job;
  traits: [Trait, Trait];
  gender: 'm' | 'f';
  seed: string;
  situationFr: string;
  situationEn: string;
  story: OriginStory;
  // Proposition de troc éventuelle (le PNJ a besoin d'un peu d'argent).
  offer?: { item: InventoryItem; price: number };
  /*
   * Celui-là s'en ira au petit matin avec ce qu'il aura pu prendre. Son
   * `situation` est le seul indice, et il est toujours donné (voir
   * SITUATIONS_LOUCHES). Tiré par la même graine que le reste : même jour,
   * même quartier, même joueur donnent toujours la même personne.
   */
  louche?: boolean;
}

// PRNG déterministe (LCG) à partir d'une graine numérique.
function makeRng(seed: number): () => number {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h = (h ^ s.charCodeAt(i)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

// Le PNJ présent à un lieu, un jour donné (ou null : personne aujourd'hui).
export function npcAt(day: number, location: string, playerSeed: string): StreetNpc | null {
  if (!isSocialLocation(location)) return null;
  const rng = makeRng(hashStr(`${day}|${location}|${playerSeed}`));
  // Environ une visite sur deux, il y a quelqu'un.
  if (rng() > 0.55) return null;

  const name = NPC_NAMES[Math.floor(rng() * NPC_NAMES.length)];
  const gender = genderFromName(name);
  const job = JOBS[Math.floor(rng() * JOBS.length)];
  const i1 = Math.floor(rng() * TRAITS.length);
  let i2 = Math.floor(rng() * TRAITS.length);
  if (i2 === i1) i2 = (i2 + 1) % TRAITS.length;
  const traits: [Trait, Trait] = [TRAITS[i1], TRAITS[i2]];
  const seed = `npc-${day}-${location}-${name}-${job.id}`;
  const S = { fr: gender === 'f' ? 'Elle' : 'Il', en: gender === 'f' ? 'She' : 'He' };
  // Un sur quatre regarde vos poches, et sa phrase le dit à qui sait lire.
  const louche = rng() < 0.25;
  const banque = louche ? SITUATIONS_LOUCHES : SITUATIONS;
  const sit = banque[Math.floor(rng() * banque.length)];

  // Character minimal pour réutiliser le générateur de chute.
  const asChar = { name, job, traits, seed, gender } as unknown as Character;
  const story = generateOrigin(asChar);

  const npc: StreetNpc = {
    id: seed,
    name, job, traits, gender, seed,
    situationFr: sit.fr.replace(/\{S\}/g, S.fr).replace('{S2}', gender === 'f' ? 'elle' : 'il'),
    situationEn: sit.en.replace(/\{S\}/g, S.en),
    story,
    louche,
  };

  // ~40 % du temps, le PNJ propose un troc.
  if (rng() < 0.4) {
    const item = OFFER_ITEMS[Math.floor(rng() * OFFER_ITEMS.length)];
    const price = 2 + Math.floor(rng() * 4); // 2 à 5 €
    npc.offer = { item: { ...item }, price };
  }

  return npc;
}

/*
 * RETROUVER CELUI QUI VOUS A PRIS QUELQUE CHOSE.
 *
 * Il traîne dans le quartier où vous l'avez nourri, et pas ailleurs. Deux
 * jours, pas plus : au-delà il a revendu et disparu, comme tout le monde ici.
 * Une perte doit pouvoir se rattraper, sinon elle n'enseigne rien ; mais si
 * elle se rattrape toujours, elle ne coûte rien.
 */
export const JOURS_POUR_RETROUVER = 2;

export function voleurTrouvable(
  c: { location: string; day: number; vole?: { quartier: string; jour: number } },
): boolean {
  if (!c.vole) return false;
  return c.vole.quartier === c.location && c.day - c.vole.jour < JOURS_POUR_RETROUVER;
}

/*
 * L'ADVERSAIRE QU'IL DEVIENT.
 *
 * Ni un rat ni un vigile : quelqu'un qui dort dehors comme vous. Mais il a
 * mangé votre repas et dormi avec vos affaires — c'est, très précisément, la
 * personne la mieux nourrie que vous croiserez dans la rue. Ses chiffres le
 * disent.
 *
 * QUARANTE-DEUX POINTS DE VIE, QUATORZE D'ATTAQUE. La première version en
 * donnait 34 et 11, et elle était molle : mesurée sur 400 combats simulés par
 * jour de partie, elle se gagnait à 75 % au jour 2, soit moins dur que le
 * Commerçant Furieux qu'on croise en appuyant sur « Bagarre » sans raison. Or
 * ce combat-ci se choisit, il a un motif et il rend quelque chose.
 *
 * Le catalogue contenait même déjà un « Concurrent Agressif » à 38/13 : le
 * voleur était plus faible que l'ennemi générique qui porte son nom.
 *
 * Il se place désormais juste au-dessus de ce Concurrent et sous le Voyou du
 * Coin — le plus dur des humains ordinaires, la brute du quartier exceptée.
 * `test-compagnon.mjs` tient cette fourchette, pas les chiffres eux-mêmes :
 * rééquilibrer le catalogue ne doit pas casser le test, seulement le déplacer.
 *
 * Son butin est exactement ce qu'il avait pris. Le code de victoire du combat
 * rend le butin ; il n'y a donc rien de spécial à écrire pour récupérer son
 * bien.
 */
export const VOLEUR_PV = 42;
export const VOLEUR_ATTAQUE = 14;

export function ennemiVoleur(vole: {
  nom: string; gender: 'm' | 'f'; objet?: InventoryItem; argent?: number;
}) {
  return {
    name: vole.nom,
    emoji: '💢',
    health: VOLEUR_PV,
    attack: VOLEUR_ATTAQUE,
    description: vole.gender === 'f'
      ? 'Elle a mangé à vos frais et dormi avec vos affaires. Ça se voit : elle tient debout mieux que vous.'
      : 'Il a mangé à vos frais et dormi avec vos affaires. Ça se voit : il tient debout mieux que vous.',
    loot: {
      respect: 4,
      money: vole.argent,
      item: vole.objet ? { ...vole.objet } : undefined,
    },
  };
}

// Drapeau de résolution : une rencontre par (jour, lieu).
export function encounterFlag(day: number, location: string): string {
  return `rencontre-${day}-${location}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LA DETTE — LE PRÊTEUR ET SON ÉCHÉANCE
 *
 * Le jeu n'avait aucune raison de faire revenir le joueur un jour PRÉCIS. Les
 * suites d'événements arrivent ; elles ne s'attendent pas. Une échéance
 * inscrite dans l'en-tête change la nature de la partie : on ne ferme pas une
 * application à un jour d'un remboursement.
 *
 * Et surtout, ce n'est pas un bonus qu'on risque de rater — c'est une menace
 * qu'on doit désamorcer. Ça tient deux fois mieux.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Ce qu'il prête, ce qu'il réclame, et sous combien de jours. */
export const DETTE_PRET = 10;
export const DETTE_DU = 15;
export const DETTE_DELAI = 3;
/** Ce qu'il ajoute à chaque jour de retard. */
export const DETTE_RELANCE = 4;

/** En dessous de quoi on est assez fauché pour qu'il vienne vous trouver. */
const DETTE_SEUIL_MISERE = 3;

/**
 * Le prêteur se présente-t-il aujourd'hui ?
 *
 * Il ne rôde pas au hasard : **il arrive au moment de la faiblesse**. Fauché,
 * passé le premier jour, sans dette en cours et sans avoir déjà essuyé un
 * refus le jour même. Un prêteur qui insiste le jour où l'on a dit non serait
 * un vendeur, pas un prêteur.
 */
export function preteurPresent(c: {
  day: number; money: number; location: string;
  dette?: unknown; detteRefuseeJour?: number;
}): boolean {
  if (c.dette) return false;
  if (c.day < 2) return false;
  if (c.money >= DETTE_SEUIL_MISERE) return false;
  if (c.detteRefuseeJour === c.day) return false;
  return isSocialLocation(c.location);
}

/** Qui il est — stable pour un jour et un quartier donnés, comme les autres PNJ. */
export function preteurDuJour(day: number, location: string, playerSeed: string) {
  const rng = makeRng(hashStr(`preteur|${day}|${location}|${playerSeed}`));
  const nom = NPC_NAMES[Math.floor(rng() * NPC_NAMES.length)];
  return {
    nom,
    seed: `preteur-${nom}-${day}`,
    gender: genderFromName(nom),
    quartier: location,
  };
}

/** L'échéance est-elle tombée ? Il vous trouve partout — c'est le principe. */
export function detteExigible(c: { day: number; dette?: { echeance: number } }): boolean {
  return !!c.dette && c.day >= c.dette.echeance;
}

/**
 * L'adversaire qu'il devient quand on ne peut pas payer.
 *
 * Plus dur que le voleur du compagnon : celui-là n'a pas volé un repas, il a
 * avancé de l'argent et il est venu le chercher. Mais il reste un homme de la
 * rue, pas une brute : il encaisse mieux qu'il ne frappe.
 */
export const PRETEUR_PV = 46;
export const PRETEUR_ATTAQUE = 13;

export function ennemiPreteur(dette: { nom: string; gender: 'm' | 'f'; montant: number }): Enemy {
  return {
    name: dette.nom,
    emoji: '💸',
    health: PRETEUR_PV,
    attack: PRETEUR_ATTAQUE,
    description: dette.gender === 'f'
      ? 'Elle vous a avancé de quoi manger. Elle vient le chercher, et elle a compté les jours.'
      : 'Il vous a avancé de quoi manger. Il vient le chercher, et il a compté les jours.',
    loot: { respect: 5, money: 0 },
  };
}
