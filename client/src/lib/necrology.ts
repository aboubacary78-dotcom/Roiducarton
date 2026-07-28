/*
 * La méta de la mort, « chaque mort produit trois choses : une trace, un
 * gain, une histoire ».
 *
 *  - Le REGISTRE DES MORTS : catalogue persistant des fins découvertes
 *    (par cause, par circonstance, et par ennemi vainqueur). Les trous du
 *    catalogue sont le moteur de collection : on meurt aussi pour compléter.
 *  - Le KARMA DE RUE : monnaie méta gagnée à la mort (jours + respect +
 *    grosse prime par fin inédite). Dépensée plus tard dans « L'Héritage ».
 *  - Les DERNIÈRES VOLONTÉS : l'objet légué par le défunt, déposé sur son
 *    carton pour le prochain personnage.
 *
 * Tout vit dans le localStorage, comme les scores et le profil.
 */
import type { InventoryItem } from '@/contexts/types';

const BOOK_KEY = 'roi-du-carton-deathbook';
const KARMA_KEY = 'roi-du-carton-karma';
const LEGACY_KEY = 'roi-du-carton-legacy';
const SEEN_KEY = 'roi-du-carton-death-seen';
const GRAVES_KEY = 'roi-du-carton-cimetiere';
const HERITAGE_KEY = 'roi-du-carton-heritage';

// ---- Les fins « nommées » (hors ennemis, qui sont générés depuis leur liste) ----
export interface DeathDef {
  id: string;
  emoji: string;
  title: string; titleEn: string;
  epitaph: string; epitaphEn: string;
}

export const DEATH_DEFS: DeathDef[] = [
  { id: 'mort-despair', emoji: '🌧️', title: 'Le Moral à Zéro', titleEn: 'Spirit at Zero', epitaph: 'L\'esprit a lâché avant le corps. La rue gagne souvent comme ça.', epitaphEn: 'The mind gave out before the body. That\'s how the street usually wins.' },
  { id: 'mort-hunger', emoji: '🍽️', title: 'Le Ventre Vide', titleEn: 'The Empty Stomach', epitaph: 'Mort de faim dans une ville pleine de restaurants. L\'ironie ne nourrit pas.', epitaphEn: 'Starved in a city full of restaurants. Irony isn\'t food.' },
  { id: 'mort-thirst', emoji: '🏜️', title: 'La Grande Soif', titleEn: 'The Great Thirst', epitaph: 'Assoiffé au pays des fontaines publiques. Elles étaient toutes « en travaux ».', epitaphEn: 'Died of thirst in the land of public fountains. All of them "under maintenance".' },
  { id: 'mort-exhaustion', emoji: '😴', title: 'La Dernière Sieste', titleEn: 'The Last Nap', epitaph: 'Il voulait juste dormir un peu. Le corps a pris ça au pied de la lettre.', epitaphEn: 'He just wanted a little sleep. The body took that literally.' },
  { id: 'mort-cold', emoji: '❄️', title: 'La Nuit Glaciale', titleEn: 'The Freezing Night', epitaph: 'La rue est glaciale avec ses rois. Surtout en hiver.', epitaphEn: 'The street is icy to its kings. Especially in winter.' },
  { id: 'mort-injury', emoji: '🩹', title: 'Trop de Coups', titleEn: 'One Blow Too Many', epitaph: 'Trop de coups, pas assez de pansements. L\'arithmétique de la rue.', epitaphEn: 'Too many blows, not enough bandages. Street arithmetic.' },
  { id: 'mort-jour-1', emoji: '⚡', title: 'Le Speedrun', titleEn: 'The Speedrun', epitaph: 'Mort le premier jour. Un record, dans un sens.', epitaphEn: 'Dead on day one. A record, in a way.' },
  { id: 'mort-riche', emoji: '💰', title: 'Riche et Mort Quand Même', titleEn: 'Rich and Dead Anyway', epitaph: 'Parti avec plus de 30€ en poche. L\'argent ne fait pas la survie.', epitaphEn: 'Left with over €30 in pocket. Money doesn\'t buy survival.' },
  { id: 'mort-canicule', emoji: '🥵', title: 'Cuit par la Canicule', titleEn: 'Cooked by the Heatwave', epitaph: 'Le bitume était une plancha. Vous étiez dessus.', epitaphEn: 'The asphalt was a griddle. You were on it.' },
  { id: 'mort-doyen', emoji: '🧓', title: 'Le Doyen', titleEn: 'The Elder', epitaph: 'Tombé après 10 jours de règne. Les légendes aussi finissent en carton.', epitaphEn: 'Fell after a 10-day reign. Even legends end up as cardboard.' },
];

export interface BookEntry { name: string; day: number; at: number }
export type DeathBook = Record<string, BookEntry>;

export function loadDeathBook(): DeathBook {
  try { return JSON.parse(localStorage.getItem(BOOK_KEY) || '{}'); } catch { return {}; }
}

export function loadKarma(): number {
  try { return Number(localStorage.getItem(KARMA_KEY) || 0) || 0; } catch { return 0; }
}

/**
 * Enregistre une mort : marque les fins découvertes, crédite le Karma de Rue.
 * Idempotent pour une même mort (clé seed+jour+ids) : si l'écran de fin se
 * re-monte, on renvoie le MÊME résultat (mémorisé) sans recompter.
 */
export function recordDeath(params: {
  ids: string[];            // fins correspondant à cette mort (catégorie + circonstances + ennemi)
  name: string;
  day: number;
  respect: number;
  seed: string;
  grave?: Omit<Grave, 'at' | 'golden'>; // la tombe à dresser au Cimetière
}): { newIds: string[]; karmaGained: number; karmaTotal: number } {
  const dedupe = `${params.seed}:${params.day}:${params.ids.join(',')}`;
  try {
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) || 'null');
    if (seen && seen.dedupe === dedupe) {
      return { newIds: seen.newIds || [], karmaGained: seen.karmaGained || 0, karmaTotal: loadKarma() };
    }
  } catch { /* silent */ }

  const book = loadDeathBook();
  const newIds = params.ids.filter(id => !book[id]);
  const now = Date.now();
  newIds.forEach(id => { book[id] = { name: params.name, day: params.day, at: now }; });

  const karmaGained = params.day * 2 + Math.max(0, params.respect) + newIds.length * 10;
  const karmaTotal = loadKarma() + karmaGained;
  try {
    localStorage.setItem(BOOK_KEY, JSON.stringify(book));
    localStorage.setItem(KARMA_KEY, String(karmaTotal));
    localStorage.setItem(SEEN_KEY, JSON.stringify({ dedupe, newIds, karmaGained }));
  } catch { /* silent */ }

  // La tombe rejoint le Cimetière des Cartons (dorée si la vanité l'attendait).
  if (params.grave) {
    const h = loadHeritage();
    pushGrave({ ...params.grave, golden: h.goldenEpitaph, at: now });
    if (h.goldenEpitaph) setGoldenEpitaph(false);
  }
  return { newIds, karmaGained, karmaTotal };
}

// ---- Le Cimetière des Cartons : une tombe par personnage tombé ----
export interface Grave {
  name: string;
  seed: string;
  gender: string;
  day: number;
  jobEmoji: string;
  jobName: string;
  cause: string;        // cause courte (FR, langue de la partie au moment de la mort)
  golden?: boolean;     // épitaphe dorée (vanité achetée dans L'Héritage)
  at: number;
  // Tenue portée le jour de sa mort : figée ici, sinon la galerie de l'écran
  // titre habillerait tous les anciens avec les accessoires du jour.
  accessories?: Record<string, string>;
}

export function loadGraves(): Grave[] {
  try { return JSON.parse(localStorage.getItem(GRAVES_KEY) || '[]'); } catch { return []; }
}

function pushGrave(g: Grave): void {
  try {
    const graves = loadGraves();
    graves.unshift(g);
    localStorage.setItem(GRAVES_KEY, JSON.stringify(graves.slice(0, 40))); // les 40 dernières
  } catch { /* silent */ }
}

// ---- L'Héritage : ce que le Karma de Rue achète entre les runs ----
// Débloquages latéraux uniquement (jamais de puissance brute) : métiers en
// plus dans le tirage, kits de départ consommables, vanités.
export interface HeritageState {
  jobs: string[];       // ids de métiers débloqués
  kits: string[];       // kits en attente, consommés au prochain personnage
  goldenEpitaph?: boolean; // la PROCHAINE tombe sera dorée
}

export function loadHeritage(): HeritageState {
  try {
    const h = JSON.parse(localStorage.getItem(HERITAGE_KEY) || '{}');
    return { jobs: h.jobs || [], kits: h.kits || [], goldenEpitaph: !!h.goldenEpitaph };
  } catch { return { jobs: [], kits: [] }; }
}

function saveHeritage(h: HeritageState): void {
  try { localStorage.setItem(HERITAGE_KEY, JSON.stringify(h)); } catch { /* silent */ }
}

export function spendKarma(cost: number): boolean {
  const k = loadKarma();
  if (k < cost) return false;
  try { localStorage.setItem(KARMA_KEY, String(k - cost)); } catch { return false; }
  return true;
}

export function unlockJob(id: string): void {
  const h = loadHeritage();
  if (!h.jobs.includes(id)) { h.jobs.push(id); saveHeritage(h); }
}

export function addKit(id: string): void {
  const h = loadHeritage();
  h.kits.push(id);
  saveHeritage(h);
}

export function takePendingKits(): string[] {
  const h = loadHeritage();
  const kits = h.kits;
  if (kits.length) { h.kits = []; saveHeritage(h); }
  return kits;
}

export function setGoldenEpitaph(v: boolean): void {
  const h = loadHeritage();
  h.goldenEpitaph = v;
  saveHeritage(h);
}

// ---- Dernières volontés : l'objet légué au prochain personnage ----
export interface Legacy { item: InventoryItem; from: string }

export function setLegacy(item: InventoryItem, from: string): void {
  try { localStorage.setItem(LEGACY_KEY, JSON.stringify({ item, from })); } catch { /* silent */ }
}

export function peekLegacy(): Legacy | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const l = JSON.parse(raw) as Legacy;
    return l && l.item ? l : null;
  } catch { return null; }
}

export function clearLegacy(): void {
  try { localStorage.removeItem(LEGACY_KEY); } catch { /* silent */ }
}

// ============ LA COURONNE : LE ROI SE TRANSMET ENTRE PARTIES ============
// Battre le Roi Déchu fait de VOTRE personnage le nouveau Roi du Carton.
// Quand ce personnage-roi meurt, il ne disparaît pas : il devient le boss des
// parties suivantes. Le prochain personnage devra donc affronter votre
// ancien héros pour lui reprendre la couronne.

const CROWN_KEY = 'roi-du-carton-couronne';

export interface CrownHolder {
  name: string;
  seed: string;
  gender: 'm' | 'f';
  jobName: string;   // libellé du métier (« Ancien Musicien »)
  jobEmoji: string;
  days: number;      // jours survécus par ce roi
  crownedAt: number; // horodatage du sacre
  reigns: number;    // nombre de rois qu'il a lui-même détrônés
}

/** Le roi actuel (votre ancien perso), ou null si le trône est au Roi Déchu. */
export function loadCrown(): CrownHolder | null {
  try {
    const raw = localStorage.getItem(CROWN_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as CrownHolder;
    return c && c.name ? c : null;
  } catch { return null; }
}

/** Sacre un personnage : il devient le Roi (et le futur boss). */
export function setCrown(holder: CrownHolder): void {
  try { localStorage.setItem(CROWN_KEY, JSON.stringify(holder)); } catch { /* silent */ }
}

export function clearCrown(): void {
  try { localStorage.removeItem(CROWN_KEY); } catch { /* silent */ }
}
