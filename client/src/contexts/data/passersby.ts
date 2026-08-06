/*
 * LA MANCHE — la foule, et ce qu'elle vaut.
 *
 * Le mini-jeu ne consiste plus à taper des pièces tombées du ciel mais à
 * TENIR LE REGARD de quelqu'un : on pose le pouce sur un passant et on le
 * suit sans lâcher, le temps qu'il se décide. D'où cette table : chaque
 * archétype a sa vitesse, sa générosité, sa patience, et ce qu'il fait quand
 * on insiste au-delà du raisonnable.
 *
 * Trois règles de conception :
 *   1. On ne peut en suivre qu'un. Choisir, c'est renoncer aux autres.
 *   2. Insister rapporte plus mais coûte de la dignité — au coup par coup.
 *   3. Certains, si on force, ne se contentent pas de râler (voir `fight`).
 *
 * La faune change avec le quartier : la gare a ses touristes, le marché ses
 * cabas, la zone industrielle n'a presque personne et beaucoup d'ennuis.
 */
import type { Character, Enemy } from '../types';
import { ENEMIES } from './enemies';
import { hasTrait } from './world';
import { randomFromArray } from './util';

export interface PasserBy {
  id: string;
  label: string;        // en français, traduit à l'affichage par tc()
  tell: string;         // le détail qu'on lit d'un coup d'œil
  /** Vitesse de traversée, en secondes d'un bord à l'autre. */
  crossS: number;
  /** Temps de regard à tenir pour qu'il s'arrête, en secondes. */
  holdS: number;
  /** Ce qu'il lâche s'il s'arrête (unités de « pièce », comme l'ancien jeu). */
  give: number;
  /** Combien de temps on peut insister au-delà, avant qu'il ne se braque. */
  patienceS: number;
  /** Ce que l'insistance rapporte en plus, par seconde. */
  insistGive: number;
  /** Dignité dépensée par seconde d'insistance. */
  insistCost: number;
  /** Nom de l'ennemi du catalogue si ça tourne mal. Absent = il râle et s'en va. */
  fight?: string;
  /** Probabilité que l'insistance dégénère, une fois la patience épuisée. */
  fightChance?: number;
  /** Le sourire du respect : donne davantage si le personnage est connu ici. */
  respectBonus?: boolean;
}

export const PASSERSBY: PasserBy[] = [
  {
    id: 'cabas', label: 'La dame au cabas', tell: '🛍️',
    crossS: 9, holdS: 1.3, give: 1, patienceS: 2.4, insistGive: 0.5, insistCost: 2,
  },
  {
    id: 'retraite', label: 'Le retraité du banc', tell: '🗞️',
    crossS: 12, holdS: 1.6, give: 2, patienceS: 4, insistGive: 0.7, insistCost: 1,
  },
  {
    id: 'touriste', label: 'Le touriste pressé', tell: '🧳',
    crossS: 5.5, holdS: 1.1, give: 3, patienceS: 1.6, insistGive: 1.2, insistCost: 3,
  },
  {
    id: 'etudiant', label: "L'étudiant au casque", tell: '🎧',
    crossS: 7.5, holdS: 2.4, give: 1, patienceS: 2, insistGive: 0.4, insistCost: 2,
  },
  {
    id: 'famille', label: 'La famille avec poussette', tell: '👶',
    crossS: 10, holdS: 1.5, give: 2, patienceS: 2, insistGive: 0.6, insistCost: 6,
  },
  {
    id: 'habitue', label: "L'habitué du quartier", tell: '☕',
    crossS: 11, holdS: 1.4, give: 2, patienceS: 5, insistGive: 0.8, insistCost: 1,
    respectBonus: true,
  },
  {
    id: 'costume', label: 'Le costume au téléphone', tell: '📱',
    crossS: 6, holdS: 3.2, give: 4, patienceS: 1.2, insistGive: 1.5, insistCost: 5,
    fight: 'Commerçant Furieux', fightChance: 0.45,
  },
  {
    id: 'joggeur', label: 'Le joggeur du dimanche', tell: '🏃',
    crossS: 4.5, holdS: 2.6, give: 1, patienceS: 1.4, insistGive: 0.3, insistCost: 3,
  },
  {
    id: 'ouvrier', label: "L'ouvrier en fin de poste", tell: '🦺',
    crossS: 8, holdS: 1.7, give: 2, patienceS: 3, insistGive: 0.9, insistCost: 2,
  },
  // ---- Les mauvaises rencontres : elles ne donnent rien et elles cognent ----
  // Leur `holdS` est court exprès : l'anneau se remplit vite, ne rapporte
  // RIEN, et enclenche aussitôt le compte à rebours de la patience. Avec un
  // holdS énorme, l'anneau ne se remplissait jamais et l'insistance — donc la
  // bagarre — était tout simplement injoignable.
  {
    id: 'voyou', label: 'Le gars à la casquette', tell: '🧢',
    crossS: 7, holdS: 0.8, give: 0, patienceS: 1.1, insistGive: 0, insistCost: 4,
    fight: 'Voyou du Coin', fightChance: 0.85,
  },
  {
    id: 'concurrent', label: 'Un autre qui fait la manche', tell: '💢',
    crossS: 9, holdS: 1, give: 0, patienceS: 1.4, insistGive: 0, insistCost: 3,
    fight: 'Concurrent Agressif', fightChance: 0.8,
  },
  {
    id: 'ivrogne', label: "L'homme qui parle seul", tell: '🍺',
    crossS: 10, holdS: 2.2, give: 1, patienceS: 1.5, insistGive: 0.4, insistCost: 3,
    fight: 'Ivrogne Agressif', fightChance: 0.6,
  },
  {
    id: 'vigile', label: 'Le vigile en pause', tell: '🔦',
    crossS: 8, holdS: 0.9, give: 0, patienceS: 1.2, insistGive: 0, insistCost: 5,
    fight: 'Vigile Zélé', fightChance: 0.7,
  },
];

/** La faune de chaque quartier : qui passe ici, et combien de fois plus souvent. */
const ROSTER: Record<string, string[]> = {
  'parc': ['retraite', 'famille', 'joggeur', 'joggeur', 'habitue', 'etudiant', 'cabas', 'ivrogne'],
  'centre-ville': ['costume', 'costume', 'etudiant', 'famille', 'cabas', 'touriste', 'habitue', 'voyou'],
  'gare': ['touriste', 'touriste', 'costume', 'etudiant', 'vigile', 'cabas', 'concurrent', 'ivrogne'],
  'marche': ['cabas', 'cabas', 'retraite', 'habitue', 'famille', 'ouvrier', 'concurrent', 'vigile'],
  'zone-industrielle': ['ouvrier', 'ouvrier', 'voyou', 'concurrent', 'ivrogne', 'vigile', 'costume'],
};

export function passersByFor(location: string): PasserBy[] {
  const ids = ROSTER[location] || ROSTER['centre-ville'];
  return ids.map(id => PASSERSBY.find(p => p.id === id)).filter(Boolean) as PasserBy[];
}

/** Le prochain à traverser, tiré dans la faune du quartier. */
export function rollPasserBy(location: string): PasserBy {
  return randomFromArray(passersByFor(location));
}

/** L'adversaire que devient un passant qu'on a poussé à bout. */
export function passerByEnemy(p: PasserBy): Enemy | null {
  return p.fight ? enemyByName(p.fight) : null;
}

/** Retrouve un adversaire du catalogue par son nom (le mini-jeu ne transmet
 *  qu'un nom au reducer, pas l'objet entier). */
export function enemyByName(name: string): Enemy | null {
  return ENEMIES.find(e => e.name === name) || null;
}

// ---- Réglage de la manche -------------------------------------------------

export const BEG_TUNING = {
  roundMs: 24000,     // durée d'une session de mendicité
  spawnMs: 1400,      // un passant toutes les ~1,4 s
  maxOnScreen: 4,     // au-delà, la rue devient illisible au pouce
  copEveryMs: 8000,   // la ronde passe environ toutes les 8 s
  copStayMs: 3200,    // et reste visible ce temps-là
  grabR: 34,          // rayon de préhension, généreux : on joue au pouce
  // Plafond de fierté qu'une seule session peut coûter. Sans lui, un joueur
  // qui insiste sur tout le monde vidait sa jauge de dignité en une action
  // avant même d'avoir compris ce qu'il payait.
  maxDignitySpent: 12,
} as const;

/**
 * Vitesse de remplissage du regard. La dignité fait l'essentiel : bien tenu,
 * on est vu deux fois plus vite que débraillé. Le charisme aide franchement.
 */
export function gazeSpeed(dignity: number, charismatic: boolean): number {
  return (0.62 + (dignity / 100) * 0.75) * (charismatic ? 1.3 : 1);
}

// ---- Ce que le caractère change dans la rue -------------------------------
//
// Même règle que pour la fouille : l'effet doit découler du trait, pas être
// collé dessus. Le charismatique accroche les regards, l'haleine redoutable
// les fait fuir, le paranoïaque voit la ronde arriver avant tout le monde,
// l'agile colle aux basques de sa cible, et les pigeons de l'ami des pigeons
// arrêtent les passants tout seuls.

export interface BegMods {
  /** Vitesse de remplissage du regard. */
  gazeMul: number;
  /** Marge de suivi au doigt, en unités logiques (Agile). */
  extraGrab: number;
  /** Avertissement avant la ronde, en millisecondes (flair). */
  copWarnMs: number;
  /** Décale la foule vers les mauvaises rencontres (Poissard). */
  hostileBias: number;
  /** Chance qu'un habitué du quartier remplace un passant quelconque. */
  habitueBoost: number;
  /** Chance qu'un passant s'arrête de lui-même (Ami des Pigeons). */
  autoStop: number;
  /** Allonge la session quand il fait mauvais (Résistant au Froid). */
  coldProof: boolean;
}

export function begMods(c: Character): BegMods {
  const flair = hasTrait(c, 'nez-sensible') || hasTrait(c, 'paranoiaque');
  return {
    // Le charisme accroche ; l'haleine fait reculer d'un pas.
    gazeMul: (hasTrait(c, 'charismatique') ? 1.3 : 1) * (hasTrait(c, 'haleine') ? 0.75 : 1),
    extraGrab: hasTrait(c, 'agile') ? 16 : 0,
    copWarnMs: flair ? 1400 : 0,
    hostileBias: hasTrait(c, 'poissard') ? 0.22 : 0,
    // Qui connaît le quartier y connaît du monde. Et le monde le lui rend.
    habitueBoost: hasTrait(c, 'orientation') ? 0.25 : 0,
    // Un pigeon posé sur l'épaule, et les gens s'arrêtent d'eux-mêmes.
    autoStop: hasTrait(c, 'ami-pigeons') ? 0.14 : 0,
    // Les autres rentrent se mettre à l'abri. Lui reste, et la rue est à lui.
    coldProof: hasTrait(c, 'resistant-froid'),
  };
}

/** Le prochain passant, en tenant compte du caractère du personnage. */
export function rollPasserByFor(location: string, mods: BegMods): PasserBy {
  const pool = passersByFor(location);
  if (mods.habitueBoost > 0 && Math.random() < mods.habitueBoost) {
    const habitue = PASSERSBY.find(p => p.id === 'habitue');
    if (habitue) return habitue;
  }
  if (mods.hostileBias > 0 && Math.random() < mods.hostileBias) {
    const bad = pool.filter(p => p.fight);
    if (bad.length) return randomFromArray(bad);
  }
  return randomFromArray(pool);
}
