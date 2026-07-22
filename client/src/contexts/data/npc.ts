// ============ PNJ ERRANTS : LES AUTRES ÂMES DE LA RUE ============
// Dans les lieux « sociaux » (centre-ville, gare, marché), on croise parfois
// une autre âme de la rue. On peut la rencontrer : partager à manger, troquer,
// ou passer son chemin. Chaque PNJ a sa propre « chute » (voir backstory.ts).
//
// Génération DÉTERMINISTE par (jour + lieu + seed du joueur) : le même PNJ est
// présent toute la journée à un lieu donné, et « bouge » d'un jour à l'autre —
// sans rien stocker en sauvegarde.
import type { Character, InventoryItem, Job, Trait } from '../types';
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
  const sit = SITUATIONS[Math.floor(rng() * SITUATIONS.length)];

  // Character minimal pour réutiliser le générateur de chute.
  const asChar = { name, job, traits, seed, gender } as unknown as Character;
  const story = generateOrigin(asChar);

  const npc: StreetNpc = {
    id: seed,
    name, job, traits, gender, seed,
    situationFr: sit.fr.replace('{S}', S.fr),
    situationEn: sit.en.replace('{S}', S.en),
    story,
  };

  // ~40 % du temps, le PNJ propose un troc.
  if (rng() < 0.4) {
    const item = OFFER_ITEMS[Math.floor(rng() * OFFER_ITEMS.length)];
    const price = 2 + Math.floor(rng() * 4); // 2 à 5 €
    npc.offer = { item: { ...item }, price };
  }

  return npc;
}

// Drapeau de résolution : une rencontre par (jour, lieu).
export function encounterFlag(day: number, location: string): string {
  return `rencontre-${day}-${location}`;
}
