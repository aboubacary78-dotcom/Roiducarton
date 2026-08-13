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
  /*
   * L'AMORCE d'une fin pas encore trouvée.
   *
   * Une case vide ne retient rien : la mémoire ne maintient en tension qu'une
   * tâche dont elle a déjà une représentation. Tant que la fin est verrouillée,
   * on ne montre donc pas « ??? » mais la CONDITION, sans la chute — le joueur
   * doit savoir quoi tenter, pas ce qu'il va lire.
   */
  hint: string; hintEn: string;
  /*
   * À QUELLE DISTANCE cette fin est-elle tentable ?
   *   0 — dès la partie en cours, il suffit de s'y prendre pour ;
   *   1 — il faut que les circonstances s'y prêtent (météo, argent en poche) ;
   *   2 — il faut d'abord tenir longtemps.
   * Sert à mettre en tête du Registre ce que le joueur peut viser ce soir : une
   * liste ordonnée par proximité tire, une liste ordonnée par déclaration non.
   */
  reach: 0 | 1 | 2;
}

export const DEATH_DEFS: DeathDef[] = [
  { id: 'mort-despair', emoji: '🌧️', title: 'Le Moral à Zéro', titleEn: 'Spirit at Zero', epitaph: 'L\'esprit a lâché avant le corps. La rue gagne souvent comme ça.', epitaphEn: 'The mind gave out before the body. That\'s how the street usually wins.', hint: 'Une fin qui vient de la tête, jamais du corps.', hintEn: 'An ending that comes from the mind, never the body.', reach: 0 },
  { id: 'mort-hunger', emoji: '🍽️', title: 'Le Ventre Vide', titleEn: 'The Empty Stomach', epitaph: 'Mort de faim dans une ville pleine de restaurants. L\'ironie ne nourrit pas.', epitaphEn: 'Starved in a city full of restaurants. Irony isn\'t food.', hint: 'Une fin pour qui oublie trop longtemps de manger.', hintEn: 'An ending for those who forget to eat for too long.', reach: 0 },
  { id: 'mort-thirst', emoji: '🏜️', title: 'La Grande Soif', titleEn: 'The Great Thirst', epitaph: 'Assoiffé au pays des fontaines publiques. Elles étaient toutes « en travaux ».', epitaphEn: 'Died of thirst in the land of public fountains. All of them "under maintenance".', hint: 'Une fin pour qui oublie trop longtemps de boire.', hintEn: 'An ending for those who forget to drink for too long.', reach: 0 },
  { id: 'mort-exhaustion', emoji: '😴', title: 'La Dernière Sieste', titleEn: 'The Last Nap', epitaph: 'Il voulait juste dormir un peu. Le corps a pris ça au pied de la lettre.', epitaphEn: 'He just wanted a little sleep. The body took that literally.', hint: 'Une fin qui attend ceux qui ne dorment jamais.', hintEn: 'An ending that waits for those who never sleep.', reach: 0 },
  { id: 'mort-cold', emoji: '❄️', title: 'La Nuit Glaciale', titleEn: 'The Freezing Night', epitaph: 'La rue est glaciale avec ses rois. Surtout en hiver.', epitaphEn: 'The street is icy to its kings. Especially in winter.', hint: 'Une fin qui ne peut arriver que par très mauvais temps.', hintEn: 'An ending that can only happen in foul weather.', reach: 1 },
  { id: 'mort-injury', emoji: '🩹', title: 'Trop de Coups', titleEn: 'One Blow Too Many', epitaph: 'Trop de coups, pas assez de pansements. L\'arithmétique de la rue.', epitaphEn: 'Too many blows, not enough bandages. Street arithmetic.', hint: 'Une fin pour qui encaisse un coup de trop.', hintEn: 'An ending for those who take one blow too many.', reach: 0 },
  { id: 'mort-jour-1', emoji: '⚡', title: 'Le Speedrun', titleEn: 'The Speedrun', epitaph: 'Mort le premier jour. Un record, dans un sens.', epitaphEn: 'Dead on day one. A record, in a way.', hint: 'Une fin qui ne peut arriver que le premier jour.', hintEn: 'An ending that can only happen on day one.', reach: 0 },
  { id: 'mort-riche', emoji: '💰', title: 'Riche et Mort Quand Même', titleEn: 'Rich and Dead Anyway', epitaph: 'Parti avec plus de 30€ en poche. L\'argent ne fait pas la survie.', epitaphEn: 'Left with over €30 in pocket. Money doesn\'t buy survival.', hint: 'Une fin qui demande d\'avoir au moins 30 € en poche.', hintEn: 'An ending that requires at least \u20ac30 in your pocket.', reach: 1 },
  { id: 'mort-canicule', emoji: '🥵', title: 'Cuit par la Canicule', titleEn: 'Cooked by the Heatwave', epitaph: 'Le bitume était une plancha. Vous étiez dessus.', epitaphEn: 'The asphalt was a griddle. You were on it.', hint: 'Une fin qui ne s\'ouvre qu\'un jour de canicule.', hintEn: 'An ending that only opens on a heatwave day.', reach: 1 },
  { id: 'mort-doyen', emoji: '🧓', title: 'Le Doyen', titleEn: 'The Elder', epitaph: 'Tombé après 10 jours de règne. Les légendes aussi finissent en carton.', epitaphEn: 'Fell after a 10-day reign. Even legends end up as cardboard.', hint: 'Une fin qui demande de tenir au moins dix jours.', hintEn: 'An ending that requires surviving at least ten days.', reach: 2 },
];

export interface BookEntry { name: string; day: number; at: number }
export type DeathBook = Record<string, BookEntry>;

export function loadDeathBook(): DeathBook {
  try { return JSON.parse(localStorage.getItem(BOOK_KEY) || '{}'); } catch { return {}; }
}

export function loadKarma(): number {
  try { return Number(localStorage.getItem(KARMA_KEY) || 0) || 0; } catch { return 0; }
}

// Mémoire de la dernière mort traitée. Sert à deux choses : ignorer un simple
// re-montage de l'écran de fin, et surtout gérer la SECONDE CHANCE (pub) —
// le personnage meurt, revit, puis remeurt quelques jours plus tard. C'est la
// même vie : une seule tombe, un seul lot de karma (complété du delta).
interface SeenDeath {
  seed: string;
  day: number;
  respect: number;
  ids: string[];
  newIds: string[];
  karmaGained: number;
  /** Détail du Karma, poche par poche (voir KarmaPocket). */
  pockets?: Record<string, number>;
}

/*
 * LA FOUILLE DES POCHES.
 *
 * Le Karma était annoncé d'un bloc : un nombre calculé, donc prévisible, donc
 * ignoré dès qu'on comprend la formule. Un résultat prévisible n'active rien.
 *
 * La quantité ne change pas. C'est la RÉVÉLATION qui devient variable : on
 * fouille les poches du défunt une par une, chacune est une petite décharge
 * séparée, et une fois sur dix il en sort une poche oubliée dont personne
 * n'avait parlé. Les fins inédites viennent en dernier — le meilleur se garde
 * pour la fin, jamais l'inverse.
 */
export interface KarmaPocket {
  id: string;
  emoji: string;
  fr: string; en: string;
  amount: number;
}

/** Une fois sur dix, une poche que personne n'avait vue. */
const CHANCE_POCHE_OUBLIEE = 0.1;

function readSeen(): SeenDeath | null {
  try {
    const s = JSON.parse(localStorage.getItem(SEEN_KEY) || 'null');
    return s && s.seed ? s as SeenDeath : null;
  } catch { return null; }
}

/**
 * Enregistre une mort : marque les fins découvertes, crédite le Karma de Rue,
 * dresse la tombe. Un personnage (une graine) ne produit JAMAIS qu'une seule
 * tombe et qu'un seul lot de karma, même s'il meurt, revit par une pub, puis
 * meurt à nouveau : la deuxième mort met la tombe à jour et ne crédite que la
 * différence (jours en plus, respect en plus, fins inédites en plus).
 */
export function recordDeath(params: {
  ids: string[];            // fins correspondant à cette mort (catégorie + circonstances + ennemi)
  name: string;
  day: number;
  respect: number;
  seed: string;
  grave?: Omit<Grave, 'at' | 'golden'>; // la tombe à dresser au Cimetière
}): { newIds: string[]; karmaGained: number; karmaTotal: number; pockets: KarmaPocket[] } {
  const seen = readSeen();
  const sameLife = !!seen && seen.seed === params.seed;

  // Simple re-montage de l'écran de fin : on renvoie le résultat mémorisé.
  if (sameLife && seen!.day === params.day && seen!.ids.join(',') === params.ids.join(',')) {
    return {
      newIds: seen!.newIds, karmaGained: seen!.karmaGained, karmaTotal: loadKarma(),
      pockets: buildPockets(seen!.pockets ?? {}),
    };
  }

  const book = loadDeathBook();
  const newIds = params.ids.filter(id => !book[id]);
  const now = Date.now();
  newIds.forEach(id => { book[id] = { name: params.name, day: params.day, at: now }; });

  // Après une seconde chance, on ne recompte que ce que la rallonge a apporté.
  const days = sameLife ? Math.max(0, params.day - seen!.day) : params.day;
  const respect = sameLife ? Math.max(0, params.respect - seen!.respect) : Math.max(0, params.respect);
  // La poche oubliée : rare, jamais annoncée, toujours spectaculaire quand
  // elle tombe. Son montant suit la durée de vie pour rester proportionné.
  const bonus = Math.random() < CHANCE_POCHE_OUBLIEE ? 5 + Math.floor(Math.random() * 3) * 5 + days : 0;

  const karmaGained = days * 2 + respect + newIds.length * 10 + bonus;
  const karmaTotal = loadKarma() + karmaGained;

  // Ce que l'écran de fin affiche : le bilan de TOUTE la vie du personnage.
  const runNewIds = sameLife ? [...seen!.newIds, ...newIds] : newIds;
  const runKarma = sameLife ? seen!.karmaGained + karmaGained : karmaGained;

  // Le détail, cumulé sur toute la vie (une seconde chance rallonge les mêmes
  // poches, elle n'en ouvre pas de nouvelles).
  const avant = (sameLife && seen!.pockets) || {};
  const parts: Record<string, number> = {
    jours: (avant.jours ?? 0) + days * 2,
    respect: (avant.respect ?? 0) + respect,
    bonus: (avant.bonus ?? 0) + bonus,
    fins: runNewIds.length * 10,
  };

  try {
    localStorage.setItem(BOOK_KEY, JSON.stringify(book));
    localStorage.setItem(KARMA_KEY, String(karmaTotal));
    localStorage.setItem(SEEN_KEY, JSON.stringify({
      seed: params.seed, day: params.day, respect: params.respect,
      ids: params.ids, newIds: runNewIds, karmaGained: runKarma, pockets: parts,
    } satisfies SeenDeath));
  } catch { /* silent */ }

  // La tombe rejoint le Cimetière des Cartons (dorée si la vanité l'attendait).
  // Une seule par personnage : une seconde mort remplace la première.
  if (params.grave) {
    const h = loadHeritage();
    const golden = sameLife
      ? (loadGraves().find(g => g.seed === params.seed)?.golden || h.goldenEpitaph)
      : h.goldenEpitaph;
    upsertGrave({ ...params.grave, golden, at: now });
    if (h.goldenEpitaph && !sameLife) setGoldenEpitaph(false);
  }
  return { newIds: runNewIds, karmaGained: runKarma, karmaTotal, pockets: buildPockets(parts) };
}

/** Met les poches en forme, dans l'ordre où elles s'ouvrent. */
export function buildPockets(parts: Record<string, number>): KarmaPocket[] {
  const out: KarmaPocket[] = [
    { id: 'jours', emoji: '🗓️', fr: 'Les jours tenus', en: 'Days survived', amount: parts.jours ?? 0 },
    { id: 'respect', emoji: '⭐', fr: 'Ce que la rue lui devait', en: 'What the street owed', amount: parts.respect ?? 0 },
    { id: 'bonus', emoji: '🧥', fr: 'Une poche oubliée', en: 'A forgotten pocket', amount: parts.bonus ?? 0 },
    // En dernier : c'est le meilleur, et on ne montre jamais le meilleur en premier.
    { id: 'fins', emoji: '📕', fr: 'Ce qu\'il a emporté avec lui', en: 'What it took along', amount: parts.fins ?? 0 },
  ];
  return out.filter(p => p.amount > 0);
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

/**
 * Les tombes, la plus récente d'abord. UNE SEULE par personnage : les
 * sauvegardes d'avant ce correctif pouvaient contenir deux fois le même
 * défunt (mort → seconde chance par pub → nouvelle mort), on ne garde donc
 * que la plus avancée de chaque graine.
 */
export function loadGraves(): Grave[] {
  try {
    const raw = JSON.parse(localStorage.getItem(GRAVES_KEY) || '[]') as Grave[];
    if (!Array.isArray(raw)) return [];
    const bySeed = new Map<string, Grave>();
    for (const g of raw) {
      if (!g || !g.seed) continue;
      const prev = bySeed.get(g.seed);
      // On garde la mort la plus tardive : le vrai bout de la vie du perso.
      if (!prev || (g.day ?? 0) > (prev.day ?? 0)) bySeed.set(g.seed, prev ? { ...g, golden: g.golden || prev.golden } : g);
      else if (g.golden && !prev.golden) bySeed.set(g.seed, { ...prev, golden: true });
    }
    // L'ordre d'origine (le plus récent d'abord) est conservé.
    const seen = new Set<string>();
    const out: Grave[] = [];
    for (const g of raw) {
      if (!g || !g.seed || seen.has(g.seed)) continue;
      seen.add(g.seed);
      out.push(bySeed.get(g.seed)!);
    }
    return out;
  } catch { return []; }
}

/** Dresse la tombe d'un personnage, ou met à jour la sienne s'il en a déjà une. */
function upsertGrave(g: Grave): void {
  try {
    const graves = loadGraves().filter(x => x.seed !== g.seed);
    graves.unshift(g);
    localStorage.setItem(GRAVES_KEY, JSON.stringify(graves.slice(0, 40))); // les 40 derniers
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

/** Crédite du Karma hors mort : carton du matin, paliers de série, partage. */
export function addKarma(n: number): number {
  const total = loadKarma() + Math.max(0, Math.round(n));
  try { localStorage.setItem(KARMA_KEY, String(total)); } catch { /* silent */ }
  return total;
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
