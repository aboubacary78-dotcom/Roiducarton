// ============ MONDE : MÉTIERS, TRAITS, LIEUX, HÉRITAGE & PERSONNAGES ============
import type { Job, Trait, InventoryItem, HeritageKit, Character, Stats } from '../types';
import { randomFromArray } from './util';
import { loadHeritage } from '@/lib/necrology';

export const NAMES = [
  'Marcel', 'Gérard', 'Lucienne', 'Albert', 'Yvette', 'René', 'Josette', 'Fernand',
  'Ginette', 'Maurice', 'Colette', 'Raymond', 'Simone', 'Jean-Claude', 'Bernadette',
  'Didier', 'Monique', 'Thierry', 'Huguette', 'Patrick'
];

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * QUI EST UNE FEMME, DANS TOUT LE JEU.
 *
 * Cette table ne couvrait que les vingt prénoms du JOUEUR. Les PNJ de la rue
 * en ont trente (voir data/npc), dont six femmes qui n'y figuraient pas —
 * Odette, Paulette, Suzanne, Denise, Micheline, Jacqueline. Toutes étaient
 * donc traitées comme des hommes : le mauvais visage sur l'avatar, et « il »
 * dans chaque phrase.
 *
 * Ça se voyait à peine tant que les PNJ tenaient dans une ligne de texte. Le
 * jour où le prêteur a eu droit à une vraie rencontre avec son portrait, on a
 * lu « Jacqueline vous a regardé compter vos pièces, et IL a attendu ».
 *
 * LES DEUX LISTES SONT DONC EXHAUSTIVES ET VÉRIFIÉES. `prenomsNonClasses()`
 * rend ce qui manque : c'est ce qui empêche qu'ajouter un prénom quelque part
 * recrée silencieusement le même défaut.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const FEMALE_NAMES = new Set([
  'Lucienne', 'Yvette', 'Josette', 'Ginette', 'Colette', 'Simone',
  'Bernadette', 'Monique', 'Huguette',
  'Odette', 'Paulette', 'Suzanne', 'Denise', 'Micheline', 'Jacqueline',
]);

const MALE_NAMES = new Set([
  'Marcel', 'Gérard', 'Albert', 'René', 'Fernand', 'Maurice', 'Raymond',
  'Jean-Claude', 'Didier', 'Thierry', 'Patrick', 'Roger', 'Robert', 'Lucien',
  'André', 'Gaston', 'Henri',
]);

export function genderFromName(name: string): 'm' | 'f' {
  return FEMALE_NAMES.has(name) ? 'f' : 'm';
}

/**
 * Les prénoms qu'aucune des deux listes ne connaît.
 *
 * `genderFromName` répond « homme » par défaut, ce qui est un repli honnête
 * mais silencieux : un prénom oublié ne lève rien et se lit comme un bug de
 * texte des mois plus tard. Cette fonction existe pour que le contrôle soit
 * possible, et elle est appelée par les tests.
 */
export function prenomsNonClasses(noms: string[]): string[] {
  return noms.filter(n => !FEMALE_NAMES.has(n) && !MALE_NAMES.has(n));
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
  'parc': { name: 'Parc Municipal', nameEn: 'City Park', emoji: '🌳', danger: 20, resources: 40, description: 'Des bancs, des pigeons, et de l\'herbe où personne ne vient vous déloger avant midi.', descriptionEn: 'Nature, pigeons, benches. A napper\'s paradise.' },
  'centre-ville': { name: 'Centre-Ville', nameEn: 'Downtown', emoji: '🏙️', danger: 30, resources: 60, description: 'Du monde du matin au soir, des vitrines, et une patrouille qui repasse toutes les heures.', descriptionEn: 'Passers-by, shops, police. A lot of people.' },
  'zone-industrielle': { name: 'Zone Industrielle', nameEn: 'Industrial Zone', emoji: '🏭', danger: 60, resources: 80, description: 'De la rouille, des rats, et ce que les entreprises jettent sans regarder.', descriptionEn: 'Rats, rust and hidden treasure. Bring gloves.' },
  'gare': { name: 'Gare', nameEn: 'Train Station', emoji: '🚂', danger: 40, resources: 50, description: 'Un toit, du chauffage jusqu\'à minuit, et des vigiles qui connaissent les visages.', descriptionEn: 'Travelers, shelter, security. A temporary roof.' },
  'marche': { name: 'Marché', nameEn: 'Market', emoji: '🛒', danger: 25, resources: 70, description: 'De la nourriture partout, des commerçants pressés, et des cagettes pleines à la fermeture.', descriptionEn: 'Food, vendors. Watch out for guards.' },
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

/*
 * LA CONTENANCE DU SAC.
 *
 * Vingt objets, sauf si l'on porte un sac à dos. Le « Sac à dos troué » est
 * vendu 4 € avec la promesse « augmente la capacité de transport » — et
 * jusqu'ici aucune ligne de code ne lisait sa présence : le plafond restait
 * vingt, sac ou pas. On payait une promesse, exactement comme pour le bonus
 * de défense que personne ne lisait non plus.
 *
 * Une seule fonction porte la règle, pour qu'aucun chemin de gain ne puisse
 * de nouveau l'ignorer.
 */
export const CAPACITE_BASE = 20;
export const SACS_A_DOS: Record<string, number> = {
  'sac-dos-troue': 4,   // celui de l'échoppe, 4 €
  'sac-dos': 5,         // celui qu'on trouve à la déchetterie
};

export function bagCapacity(c: { inventory: InventoryItem[] }): number {
  let bonus = 0;
  for (const id of Object.keys(SACS_A_DOS)) {
    if (c.inventory.some(i => i.id === id)) bonus = Math.max(bonus, SACS_A_DOS[id]);
  }
  return CAPACITE_BASE + bonus;
}

/**
 * `evite` retire du tirage des prénoms et des métiers déjà pris.
 *
 * L'exclusion se fait AVANT le tirage, jamais après : un métier décide des
 * jauges de départ et de l'objet en poche, si bien qu'échanger le métier
 * d'un personnage déjà fabriqué lui laisserait les affaires de l'autre.
 *
 * On ne vide jamais complètement une liste : s'il ne reste rien après
 * exclusion, on retire le filtre plutôt que de planter.
 */
export function generateCharacter(evite?: { prenoms?: readonly string[]; metiers?: readonly string[] }): Character {
  const unlockedJobs = loadHeritage().jobs;
  const jobsOuverts = JOBS.filter(j => !j.locked || unlockedJobs.includes(j.id));
  const jobsLibres = jobsOuverts.filter(j => !evite?.metiers?.includes(j.id));
  const job = randomFromArray(jobsLibres.length > 0 ? jobsLibres : jobsOuverts);
  const availableTraits = [...TRAITS];
  const trait1Index = Math.floor(Math.random() * availableTraits.length);
  const trait1 = availableTraits.splice(trait1Index, 1)[0];
  const trait2 = randomFromArray(availableTraits);
  const nomsLibres = NAMES.filter(n => !evite?.prenoms?.includes(n));
  const name = randomFromArray(nomsLibres.length > 0 ? nomsLibres : NAMES);

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
    // Il arrive sans rien : la garde-robe est ouverte, mais il faut l'ouvrir.
    equipped: {},
  };
}

/**
 * Les trois candidats de l'écran de choix.
 *
 * PRÉNOMS DISTINCTS, d'abord : tirés indépendamment, deux Marcel tombaient
 * côte à côte environ une fois sur sept (20 prénoms, 3 tirages) et on ne
 * savait plus lequel on choisissait.
 *
 * MÉTIERS DISTINCTS, ensuite. Mesuré sur 20 000 écrans : deux mêmes métiers
 * s'affichaient côte à côte dans **19,5 %** des cas. Le métier est ce qui
 * distingue le plus deux candidats — il donne les jauges de départ, l'objet en
 * poche et la moitié du gag — donc deux « Ancien Sommelier » sur le même écran
 * font paraître le jeu bien plus pauvre qu'il ne l'est.
 *
 * `evites` porte les prénoms du tirage précédent. Sans lui, une relance
 * rejouait au moins un prénom de l'écran d'avant **quatre fois sur dix** : le
 * hasard était correct, mais il n'en avait pas l'air. C'est la seule chose que
 * le joueur remarque vraiment, et elle ne coûte qu'une liste passée en
 * argument.
 */
export function generateCharacterTrio(evites: readonly string[] = []): Character[] {
  const trio: Character[] = [];
  const prenoms: string[] = [...evites];
  const metiers: string[] = [];
  for (let i = 0; i < 3; i++) {
    const c = generateCharacter({ prenoms, metiers });
    prenoms.push(c.name);
    metiers.push(c.job.id);
    trio.push(c);
  }
  return trio;
}

// Un personnage possède-t-il un trait donné ? (raccourci très fréquent)
/* ═══════════════════════════════════════════════════════════════════════════
 * LE COMPAGNON DE JOURNÉE
 *
 * Partager son repas avec quelqu'un rencontré dans la rue lui fait faire la
 * route avec vous jusqu'au soir, et vous PRÊTE l'un de ses deux traits.
 *
 * Aucun effet nouveau n'a été inventé pour ça : les PNJ tirent déjà leurs
 * traits dans cette table, et ces traits sont déjà branchés partout — la
 * fouille, le combat, la manche, le voyage. Le compagnon ne fait qu'ouvrir au
 * joueur une porte qui existait déjà.
 *
 * DEUX FILTRES, ET ILS COMPTENT.
 *
 * `positive` d'abord. Le Poissard double le score : prêté le jour de la mort,
 * il vaudrait double sans rien coûter. Les Os en Mousse et la Phobie des Rats
 * ne feraient qu'abîmer celui qui vient de donner à manger. Un trait qu'on
 * emprunte doit aider, sinon le partage devient un piège.
 *
 * « Qui fait quelque chose » ensuite. La moitié des traits positifs ne sont
 * qu'un bonus de jauge appliqué à la création du personnage — les prêter ne
 * ferait rigoureusement rien, et le joueur croirait avoir gagné quelque chose.
 * Ne restent que ceux qu'un `hasTrait` va vraiment interroger pendant la
 * journée. `test-compagnon.mjs` relit le code source pour le vérifier : si un
 * trait de cette liste perd son branchement, le test tombe.
 * ═══════════════════════════════════════════════════════════════════════════ */
export const TRAITS_PRETABLES = [
  'bricoleur',        // bricole une arme au combat
  'charismatique',    // les passants donnent plus
  'orientation',      // voyager remonte le moral
  'nez-sensible',     // les projectiles sont annoncés
  'ami-pigeons',      // les oiseaux rapportent des objets
  'resistant-froid',  // la nuit dehors coûte moins cher
  'agile',            // on s'échappe mieux
] as const;

/** Le trait qu'un PNJ peut prêter, ou `null` s'il n'a rien à offrir. */
export function traitPretable(traits: readonly Trait[]): Trait | null {
  return traits.find(t => (TRAITS_PRETABLES as readonly string[]).includes(t.id)) ?? null;
}

/*
 * Le compagnon compte comme un trait de plus, mais seulement aujourd'hui.
 *
 * Le jour est inscrit au moment du partage : la nuit passée, `c.day` avance et
 * la comparaison tombe d'elle-même. Rien à nettoyer, rien à oublier de
 * nettoyer.
 *
 * Ce que le compagnon prête, c'est le COMPORTEMENT du trait, jamais son bonus
 * de jauge : celui-ci n'est appliqué qu'à la création d'un personnage
 * (`generateCharacter`), et le prêt ne passe pas par là.
 */
export function hasTrait(c: Character, id: string): boolean {
  if (c.traits.some(t => t.id === id)) return true;
  return c.compagnon?.traitId === id && c.compagnon.jour === c.day;
}

// Formule de score UNIQUE (écran de fin + meilleurs scores + reducer).
// Le Poissard vit plus mal mais marque double : son trait promet « score ×2 ».
/*
 * LE ×2 DU POISSARD SE MÉRITE.
 *
 * `poissard` est un trait NÉGATIF qui double le score : c'est la prime au
 * courage, on encaisse plus d'ennuis et on marque davantage. Le calcul tenait
 * tant que personne ne choisissait ses traits.
 *
 * Depuis l'Atelier, on peut se composer un poissard + les deux meilleurs
 * bonus, et le classement n'aurait plus voulu dire grand-chose. Le multiplicateur
 * ne s'applique donc qu'à une main SUBIE. Tout le reste de la partie compte
 * normalement : on ne punit pas l'achat, on retire seulement une prime qui
 * récompensait exactement ce qu'on vient de supprimer — le hasard.
 */
export function poissardMerite(c: Character): boolean {
  return hasTrait(c, 'poissard') && !c.traitsChoisis;
}

export function computeScore(day: number, respect: number, money: number, poissard = false): number {
  return (day * 10 + respect * 5 + money * 2) * (poissard ? 2 : 1);
}
