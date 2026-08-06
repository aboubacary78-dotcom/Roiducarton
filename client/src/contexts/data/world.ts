// ============ MONDE : MÉTIERS, TRAITS, LIEUX, HÉRITAGE & PERSONNAGES ============
import type { Job, Trait, InventoryItem, HeritageKit, Character, Stats } from '../types';
import { randomFromArray } from './util';
import { loadHeritage } from '@/lib/necrology';

const NAMES = [
  'Marcel', 'Gérard', 'Lucienne', 'Albert', 'Yvette', 'René', 'Josette', 'Fernand',
  'Ginette', 'Maurice', 'Colette', 'Raymond', 'Simone', 'Jean-Claude', 'Bernadette',
  'Didier', 'Monique', 'Thierry', 'Huguette', 'Patrick'
];

// Prénoms féminins (pour que le visage corresponde au prénom).
const FEMALE_NAMES = new Set([
  'Lucienne', 'Yvette', 'Josette', 'Ginette', 'Colette', 'Simone',
  'Bernadette', 'Monique', 'Huguette',
]);

export function genderFromName(name: string): 'm' | 'f' {
  return FEMALE_NAMES.has(name) ? 'f' : 'm';
}

export const JOBS: Job[] = [
  { id: 'comptable', name: 'Ancien Comptable', description: 'Les chiffres, ça le connaît. Les poubelles, un peu moins.', bonusStats: { dignity: 10 }, startingItems: ['calculatrice'], emoji: '🧮' },
  { id: 'ouvrier', name: 'Ancien Ouvrier', description: 'Des mains en or et un dos en compote.', bonusStats: { health: 10 }, startingItems: ['cle-molette'], emoji: '🔧' },
  { id: 'professeur', name: 'Ancien Professeur', description: 'Il corrige encore les fautes sur les panneaux.', bonusStats: { mental: 15 }, startingItems: ['livre'], emoji: '📚' },
  { id: 'sommelier', name: 'Ancien Sommelier', description: "Peut distinguer un Bordeaux d'un jus de poubelle. Parfois.", bonusStats: { hunger: 10 }, startingItems: ['tire-bouchon'], emoji: '🍷' },
  { id: 'cascadeur', name: 'Ancien Cascadeur', description: 'Tombe de haut. Littéralement et figurativement.', bonusStats: { health: 5 }, startingItems: ['genouillere'], emoji: '🤸' },
  { id: 'informaticien', name: 'Ancien Informaticien', description: 'Cherche encore le WiFi gratuit.', bonusStats: { mental: 10 }, startingItems: ['cable-usb'], emoji: '💻' },
  { id: 'cuisinier', name: 'Ancien Cuisinier', description: 'Transforme un rat en ratatouille.', bonusStats: { hunger: 15 }, startingItems: ['couteau-suisse'], emoji: '👨‍🍳' },
  { id: 'infirmier', name: 'Ancien Infirmier', description: 'Se soigne avec des feuilles de journal.', bonusStats: { health: 15 }, startingItems: ['bandage'], emoji: '🏥' },
  { id: 'artiste', name: 'Ancien Artiste', description: "Son art n'a jamais été compris. Même par lui.", bonusStats: { dignity: 15 }, startingItems: ['crayon'], emoji: '🎨' },
  { id: 'militaire', name: 'Ancien Militaire', description: "Dort debout et mange n'importe quoi.", bonusStats: { health: 10 }, startingItems: ['couverture-survie'], emoji: '🎖️' },
  { id: 'bibliothecaire', name: 'Ancien Bibliothécaire', description: 'Connaît tous les recoins de la ville.', bonusStats: { mental: 10 }, startingItems: ['carte-ville'], emoji: '📖' },
  { id: 'vendeur', name: 'Ancien Vendeur de Voitures', description: 'Peut vendre un carton mouillé comme un loft.', bonusStats: { dignity: 5 }, startingItems: ['cravate'], emoji: '🚗' },
  { id: 'jardinier', name: 'Ancien Jardinier', description: 'Fait pousser des tomates dans une chaussure.', bonusStats: { hunger: 10 }, startingItems: ['graines'], emoji: '🌱' },
  { id: 'avocat', name: 'Ancien Avocat', description: 'Connaît ses droits. Et ceux des pigeons.', bonusStats: { dignity: 10, mental: 5 }, startingItems: ['code-civil'], emoji: '⚖️' },
  { id: 'musicien', name: 'Ancien Musicien', description: 'Son harmonica a connu des jours meilleurs.', bonusStats: { mental: 10, dignity: 5 }, startingItems: ['harmonica-casse'], emoji: '🎵' },
  { id: 'boxeur', name: 'Ancien Boxeur', description: 'Les poings se souviennent. Le reste a un peu oublié.', bonusStats: { health: 10 }, startingItems: ['gants-boxe'], emoji: '🥊', locked: true },
  { id: 'poete', name: 'Ancien Poète', description: 'Des vers plein la tête, des trous plein les poches.', bonusStats: { mental: 15 }, startingItems: ['carnet-poemes'], emoji: '🖋️', locked: true },
];

export const TRAITS: Trait[] = [
  { id: 'estomac-acier', name: "Estomac d'Acier", description: 'Digère tout : la faim vient plus lentement', positive: true, effects: { hunger: 5 }, emoji: '🦾' },
  { id: 'optimiste', name: 'Optimiste Né', description: 'La santé mentale remonte plus vite', positive: true, effects: { mental: 10 }, emoji: '😊' },
  { id: 'poissard', name: 'Poissard', description: "Plus d'événements négatifs, score x2", positive: false, effects: { mental: -5 }, emoji: '🍀' },
  { id: 'ami-pigeons', name: 'Ami des Pigeons', description: 'Les oiseaux apportent des objets', positive: true, effects: {}, emoji: '🐦' },
  { id: 'sommeil-plomb', name: 'Sommeil de Plomb', description: 'Récupère plus vite en dormant', positive: true, effects: { sleep: 10 }, emoji: '😴' },
  { id: 'nez-sensible', name: 'Nez Sensible', description: 'Flaire les coups : projectiles annoncés au combat', positive: true, effects: { dignity: -5 }, emoji: '👃' },
  { id: 'insomniaque', name: 'Insomniaque', description: 'Moins de sommeil requis, mental fragile', positive: false, effects: { sleep: 10, mental: -10 }, emoji: '🌙' },
  { id: 'paranoiaque', name: 'Paranoïaque', description: 'Toujours sur ses gardes : anticipe les coups, mais stressé', positive: false, effects: { mental: -10 }, emoji: '👀' },
  { id: 'main-verte', name: 'Main Verte', description: 'Fait pousser des choses dans des pots', positive: true, effects: { hunger: 5 }, emoji: '🌿' },
  { id: 'charismatique', name: 'Charismatique', description: 'Les passants donnent plus facilement', positive: true, effects: { dignity: 5 }, emoji: '✨' },
  { id: 'os-mousse', name: 'Os en Mousse', description: 'Subit plus de dégâts physiques', positive: false, effects: { health: -10 }, emoji: '🦴' },
  { id: 'metabolisme', name: 'Métabolisme Rapide', description: 'Guérit vite, mais toujours faim', positive: false, effects: { health: 5, hunger: -10 }, emoji: '⚡' },
  { id: 'collectionneur', name: 'Collectionneur', description: 'Bonus moral si inventaire plein', positive: true, effects: { mental: 5 }, emoji: '📦' },
  { id: 'phobie-rats', name: 'Phobie des Rats', description: 'Panique en zone industrielle', positive: false, effects: { mental: -5 }, emoji: '🐀' },
  { id: 'haleine', name: 'Haleine Redoutable', description: 'Bonus combat, malus social', positive: false, effects: { dignity: -10 }, emoji: '💨' },
  { id: 'agile', name: 'Agile', description: 'Excellente capacité de fuite', positive: true, effects: {}, emoji: '🏃' },
  { id: 'resistant-froid', name: 'Résistant au Froid', description: 'Dort dehors sans couverture', positive: true, effects: { health: 5 }, emoji: '❄️' },
  { id: 'bricoleur', name: 'Bricoleur du Dimanche', description: 'Bricole une arme de fortune au combat', positive: true, effects: {}, emoji: '🔨' },
  { id: 'orientation', name: "Sens de l'Orientation", description: 'Connaît les raccourcis : voyager remonte le moral', positive: true, effects: {}, emoji: '🧭' },
  { id: 'ventre-pattes', name: 'Ventre sur Pattes', description: "Mange n'importe quoi, en grande quantité", positive: false, effects: { hunger: -15 }, emoji: '🍔' },
];

export const LOCATIONS: Record<string, { name: string; nameEn: string; emoji: string; danger: number; resources: number; description: string; descriptionEn: string }> = {
  'parc': { name: 'Parc Municipal', nameEn: 'City Park', emoji: '🌳', danger: 20, resources: 40, description: 'Nature, pigeons, bancs. Le paradis des siestes.', descriptionEn: 'Nature, pigeons, benches. A napper\'s paradise.' },
  'centre-ville': { name: 'Centre-Ville', nameEn: 'Downtown', emoji: '🏙️', danger: 30, resources: 60, description: 'Passants, commerces, police. Beaucoup de monde.', descriptionEn: 'Passers-by, shops, police. A lot of people.' },
  'zone-industrielle': { name: 'Zone Industrielle', nameEn: 'Industrial Zone', emoji: '🏭', danger: 60, resources: 80, description: 'Rats, rouille et trésors cachés. Apportez vos gants.', descriptionEn: 'Rats, rust and hidden treasure. Bring gloves.' },
  'gare': { name: 'Gare', nameEn: 'Train Station', emoji: '🚂', danger: 40, resources: 50, description: 'Voyageurs, abri, sécurité. Un toit temporaire.', descriptionEn: 'Travelers, shelter, security. A temporary roof.' },
  'marche': { name: 'Marché', nameEn: 'Market', emoji: '🛒', danger: 25, resources: 70, description: 'Nourriture, commerçants. Attention aux vigiles.', descriptionEn: 'Food, vendors. Watch out for guards.' },
};

// Kits de départ de L'Héritage : achetés au Cimetière avec le Karma de Rue,
// consommés au prochain personnage. Petits coups de pouce, jamais décisifs.
export const HERITAGE_KITS: HeritageKit[] = [
  {
    id: 'kit-casse-croute', name: 'le Casse-croûte du Souvenir', nameEn: 'the Memorial Snack', emoji: '🥖', cost: 10, money: 0,
    desc: 'Un sandwich et une gourde pleine pour bien commencer.', descEn: 'A sandwich and a full flask for a decent start.',
    items: [
      { id: 'kit-sandwich', name: 'Sandwich emballé', emoji: '🥪', type: 'food', value: 4, effect: { hunger: 15 } },
      { id: 'kit-gourde', name: 'Gourde pleine', emoji: '🥤', type: 'food', value: 3, effect: { thirst: 14 } },
    ],
  },
  {
    id: 'kit-pecule', name: 'le Pécule du Défunt', nameEn: 'the Departed\'s Nest Egg', emoji: '💶', cost: 12, money: 8,
    desc: '8€ de départ, économisés pièce par pièce par vos prédécesseurs.', descEn: '€8 to start, saved coin by coin by your predecessors.',
    items: [],
  },
  {
    id: 'kit-bricoleur', name: 'la Trousse du Bricoleur', nameEn: 'the Tinkerer\'s Pouch', emoji: '🧰', cost: 15, money: 0,
    desc: 'Une clé à molette et de quoi bricoler une arme de fortune.', descEn: 'A wrench and something to rig a makeshift weapon from.',
    items: [
      { id: 'kit-cle', name: 'Clé à molette rouillée', emoji: '🔧', type: 'weapon', value: 8, attackBonus: 3, combatStyle: 'heavy' },
      { id: 'kit-ficelle', name: 'Pelote de ficelle', emoji: '🧵', type: 'junk', value: 2 },
    ],
  },
];

export const STARTING_ITEMS: Record<string, InventoryItem> = {
  'calculatrice': { id: 'calculatrice', name: 'Calculatrice solaire', emoji: '🧮', type: 'tool', value: 5, effect: { mental: 8 } },
  'gants-boxe': { id: 'gants-boxe', name: 'Gants de boxe fatigués', emoji: '🥊', type: 'weapon', value: 8, attackBonus: 3, combatStyle: 'heavy' },
  'carnet-poemes': { id: 'carnet-poemes', name: 'Carnet de poèmes', emoji: '📓', type: 'tool', value: 4, effect: { mental: 10 } },
  'cle-molette': { id: 'cle-molette', name: 'Clé à molette rouillée', emoji: '🔧', type: 'weapon', value: 8, attackBonus: 3, combatStyle: 'heavy' },
  'livre': { id: 'livre', name: 'Livre de philo', emoji: '📚', type: 'tool', value: 3, effect: { mental: 5 } },
  'tire-bouchon': { id: 'tire-bouchon', name: 'Tire-bouchon de sommelier', emoji: '🍷', type: 'tool', value: 6, effect: { thirst: 10, mental: 5 } },
  'genouillere': { id: 'genouillere', name: 'Genouillère usée', emoji: '🦵', type: 'armor', value: 4, defenseBonus: 2 },
  'cable-usb': { id: 'cable-usb', name: 'Câble USB mystérieux', emoji: '🔌', type: 'junk', value: 2, effect: { mental: 4 } },
  'couteau-suisse': { id: 'couteau-suisse', name: 'Couteau suisse', emoji: '🔪', type: 'weapon', value: 12, attackBonus: 4, combatStyle: 'precise' },
  'bandage': { id: 'bandage', name: 'Bandage propre', emoji: '🩹', type: 'tool', value: 5, effect: { health: 15 } },
  'crayon': { id: 'crayon', name: 'Crayon à papier', emoji: '✏️', type: 'tool', value: 1, effect: { mental: 6 } },
  'couverture-survie': { id: 'couverture-survie', name: 'Couverture de survie', emoji: '🛡️', type: 'armor', value: 10, defenseBonus: 3 },
  'carte-ville': { id: 'carte-ville', name: 'Carte de la ville', emoji: '🗺️', type: 'tool', value: 4, effect: { mental: 6 } },
  'cravate': { id: 'cravate', name: 'Cravate en soie', emoji: '👔', type: 'junk', value: 8, effect: { dignity: 10 } },
  'graines': { id: 'graines', name: 'Sachet de graines', emoji: '🌱', type: 'tool', value: 3, effect: { hunger: 12, mental: 4 } },
  'code-civil': { id: 'code-civil', name: 'Code Civil (édition 1987)', emoji: '📕', type: 'weapon', value: 6, attackBonus: 2, combatStyle: 'heavy' },
  'harmonica-casse': { id: 'harmonica-casse', name: 'Harmonica cassé', emoji: '🎵', type: 'special', value: 5, effect: { mental: 12 } },
};

export function generateCharacter(): Character {
  const unlockedJobs = loadHeritage().jobs;
  const job = randomFromArray(JOBS.filter(j => !j.locked || unlockedJobs.includes(j.id)));
  const availableTraits = [...TRAITS];
  const trait1Index = Math.floor(Math.random() * availableTraits.length);
  const trait1 = availableTraits.splice(trait1Index, 1)[0];
  const trait2 = randomFromArray(availableTraits);
  const name = randomFromArray(NAMES);

  const baseStats: Stats = { health: 70, mental: 60, hunger: 50, thirst: 50, sleep: 60, dignity: 40 };

  Object.entries(job.bonusStats).forEach(([key, val]) => {
    if (val) baseStats[key as keyof Stats] = Math.min(100, baseStats[key as keyof Stats] + val);
  });

  [trait1, trait2].forEach(trait => {
    Object.entries(trait.effects).forEach(([key, val]) => {
      if (val) baseStats[key as keyof Stats] = Math.max(0, Math.min(100, baseStats[key as keyof Stats] + val));
    });
  });

  const startingItems = job.startingItems.map(id => STARTING_ITEMS[id]).filter(Boolean);
  const startingMoney = job.id === 'comptable' ? 25 : job.id === 'vendeur' ? 10 : 2;

  return {
    name,
    job,
    traits: [trait1, trait2],
    stats: baseStats,
    money: startingMoney,
    respect: 0,
    inventory: startingItems,
    day: 1,
    // Point de départ aléatoire : chaque partie commence dans un quartier
    // différent (parc, centre-ville, gare, marché, zone industrielle).
    location: randomFromArray(Object.keys(LOCATIONS)),
    alive: true,
    activeFlags: [],
    stealCount: 0,
    seed: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
    gender: genderFromName(name),
  };
}

/**
 * Les trois candidats de l'écran de choix, avec des PRÉNOMS DISTINCTS.
 * Tirés indépendamment, deux Marcel tombaient côte à côte environ une fois
 * sur sept (20 prénoms, 3 tirages) : on ne savait plus lequel on choisissait.
 */
export function generateCharacterTrio(): Character[] {
  const trio: Character[] = [];
  const used = new Set<string>();
  for (let i = 0; i < 3; i++) {
    let c = generateCharacter();
    for (let attempt = 0; attempt < 30 && used.has(c.name); attempt++) c = generateCharacter();
    // Si le hasard s'entête, on prend d'autorité un prénom encore libre (et le
    // genre qui va avec, sinon le visage ne correspondrait plus au prénom).
    if (used.has(c.name)) {
      const free = NAMES.filter(n => !used.has(n));
      if (free.length > 0) {
        const name = randomFromArray(free);
        c = { ...c, name, gender: genderFromName(name) };
      }
    }
    used.add(c.name);
    trio.push(c);
  }
  return trio;
}

// Un personnage possède-t-il un trait donné ? (raccourci très fréquent)
export function hasTrait(c: Character, id: string): boolean {
  return c.traits.some(t => t.id === id);
}

// Formule de score UNIQUE (écran de fin + meilleurs scores + reducer).
// Le Poissard vit plus mal mais marque double : son trait promet « score ×2 ».
export function computeScore(day: number, respect: number, money: number, poissard = false): number {
  return (day * 10 + respect * 5 + money * 2) * (poissard ? 2 : 1);
}
