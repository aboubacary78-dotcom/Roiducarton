/*
 * LE CARTON DU MATIN, ET LA SÉRIE.
 *
 * Le jeu n'avait que deux horizons : la partie (huit minutes) et le Registre
 * (sans fin). Un joueur qui vient de mourir n'avait donc rien de proche à
 * viser. On ajoute ici l'étage du JOUR.
 *
 * Trois principes qui gouvernent tout ce fichier :
 *
 * 1. LE CADEAU EST À VALEUR VARIABLE. Le plus souvent une bricole, parfois du
 *    Karma, rarement une vraie trouvaille. Ouvrir l'application devient un
 *    tirage plutôt qu'une formalité.
 *
 * 2. LA SÉRIE A UN FILET. Une série sans rattrapage produit sa propre falaise :
 *    le jour où elle casse, une bonne part des joueurs ne revient pas. Le
 *    sauvetage garde tout le poids de la perte et supprime la falaise, ce
 *    n'est pas une version adoucie, c'est celle qui retient le plus.
 *
 * 3. ON N'AFFICHE JAMAIS UNE SÉRIE À ZÉRO. Un zéro est un rappel d'échec ;
 *    une absence est une page blanche. Après une rupture non rattrapée,
 *    l'indicateur disparaît au lieu d'annoncer la casse.
 */

const CARTON_KEY = 'roi-du-carton-carton-matin';

/** Jour calendaire local, au format AAAA-MM-JJ. */
export function today(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Nombre de jours entre deux dates calendaires. */
export function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T12:00:00`).getTime();
  const b = new Date(`${to}T12:00:00`).getTime();
  return Math.round((b - a) / 86400000);
}

export interface DailyState {
  /** Dernier jour où le carton a été relevé. */
  lastClaim: string | null;
  /** Jours consécutifs, sauvetages compris. */
  streak: number;
  /** Meilleure série atteinte. */
  best: number;
  /** Jetons de sauvetage disponibles (voir grantWeeklySave). */
  saves: number;
  /** Semaine du dernier jeton offert, pour n'en donner qu'un par semaine. */
  lastSaveGrant: string | null;
  /** Série interrompue et non rattrapée : on n'affiche alors plus rien. */
  broken: boolean;
}

const VIDE: DailyState = {
  lastClaim: null, streak: 0, best: 0, saves: 1, lastSaveGrant: null, broken: false,
};

export function loadDaily(): DailyState {
  try {
    const raw = JSON.parse(localStorage.getItem(CARTON_KEY) || 'null');
    return raw ? { ...VIDE, ...raw } as DailyState : { ...VIDE };
  } catch { return { ...VIDE }; }
}

function saveDaily(s: DailyState): void {
  try { localStorage.setItem(CARTON_KEY, JSON.stringify(s)); } catch { /* silent */ }
}

/** Identifiant de semaine ISO approximatif, suffisant pour « un par semaine ». */
function weekKey(day: string): string {
  const d = new Date(`${day}T12:00:00`);
  const jour = (d.getDay() + 6) % 7; // lundi = 0
  d.setDate(d.getDate() - jour);
  return today(d);
}

/**
 * Un jeton de sauvetage offert par semaine. Appelé à chaque ouverture : c'est
 * le filet qui empêche la série de produire sa falaise.
 */
export function grantWeeklySave(now = today()): DailyState {
  const s = loadDaily();
  const semaine = weekKey(now);
  if (s.lastSaveGrant === semaine) return s;
  const next = { ...s, saves: Math.min(2, s.saves + 1), lastSaveGrant: semaine };
  saveDaily(next);
  return next;
}

export type DailyStatus =
  | { kind: 'claimed' }                    // déjà relevé aujourd'hui
  | { kind: 'ready'; nextStreak: number }  // le carton attend
  | { kind: 'rescuable'; missed: number }; // un ou plusieurs jours sautés, rattrapables

/** Que se passe-t-il à l'ouverture, aujourd'hui ? */
export function dailyStatus(now = today()): DailyStatus {
  const s = loadDaily();
  if (s.lastClaim === now) return { kind: 'claimed' };
  if (!s.lastClaim) return { kind: 'ready', nextStreak: 1 };
  const ecart = daysBetween(s.lastClaim, now);
  if (ecart <= 1) return { kind: 'ready', nextStreak: s.streak + 1 };
  // La série est en péril : on propose de la rattraper tant qu'elle valait la
  // peine d'être défendue. En dessous de trois jours, elle ne pèse rien et on
  // repart simplement de un, sans en faire une histoire.
  if (s.streak >= 3 && !s.broken) return { kind: 'rescuable', missed: ecart - 1 };
  return { kind: 'ready', nextStreak: 1 };
}

/** Relève le carton du jour et fait avancer la série. */
export function claimDaily(now = today()): DailyState {
  const s = loadDaily();
  if (s.lastClaim === now) return s;
  const suite = dailyStatus(now);
  const streak = suite.kind === 'ready' ? suite.nextStreak : 1;
  const next: DailyState = {
    ...s,
    lastClaim: now,
    streak,
    best: Math.max(s.best, streak),
    broken: false,
  };
  saveDaily(next);
  return next;
}

/**
 * Rattrape les jours manqués. `withToken` consomme un jeton hebdomadaire ;
 * sinon c'est qu'une vidéo récompensée a été regardée à la place.
 */
export function rescueStreak(withToken: boolean, now = today()): boolean {
  const s = loadDaily();
  if (withToken && s.saves <= 0) return false;
  const next: DailyState = {
    ...s,
    saves: withToken ? s.saves - 1 : s.saves,
    lastClaim: now,
    streak: s.streak + 1,
    best: Math.max(s.best, s.streak + 1),
    broken: false,
  };
  saveDaily(next);
  return true;
}

/** La série a été laissée tomber : on l'oublie, sans l'afficher à zéro. */
export function abandonStreak(): void {
  const s = loadDaily();
  saveDaily({ ...s, streak: 0, broken: true });
}

/*
 * CE QU'IL Y A DANS LE CARTON.
 *
 * Valeur variable, avec un palier rare : c'est le tirage qui fait revenir, pas
 * le contenu moyen. Les probabilités sont explicites ici plutôt que noyées
 * dans une suite de conditions.
 */
export type CartonKind = 'bricole' | 'karma' | 'trouvaille';

export interface CartonGift {
  kind: CartonKind;
  /** Montant pour le Karma, ignoré sinon. */
  karma?: number;
}

export function rollCarton(streak: number): CartonGift {
  const r = Math.random();
  // Une série longue améliore le tirage : c'est ce qu'on défend en revenant.
  const bonus = Math.min(0.18, streak * 0.012);
  if (r < 0.06 + bonus) return { kind: 'trouvaille' };
  if (r < 0.34 + bonus) return { kind: 'karma', karma: 4 + Math.floor(Math.random() * 5) };
  return { kind: 'bricole' };
}

/** Les paliers de série, et ce qu'ils rapportent. */
export const STREAK_MILESTONES: { days: number; karma: number; fr: string; en: string }[] = [
  { days: 3, karma: 10, fr: 'Trois jours de suite', en: 'Three days running' },
  { days: 7, karma: 25, fr: 'Une semaine entière', en: 'A full week' },
  { days: 14, karma: 60, fr: 'Quinze jours', en: 'A fortnight' },
  { days: 30, karma: 150, fr: 'Un mois dans la rue', en: 'A month on the street' },
];

/** Le palier atteint exactement aujourd'hui, s'il y en a un. */
export function milestoneFor(streak: number) {
  return STREAK_MILESTONES.find(m => m.days === streak) ?? null;
}

/*
 * CE QUI ATTEND SUR LE CARTON.
 *
 * Le cadeau tombe même quand aucune partie n'est en cours (au lancement, sur
 * l'écran-titre). Il est alors mis de côté et déposé sur le carton du prochain
 * personnage, ce qui est exactement la fiction. Si une partie est en cours,
 * l'objet rejoint le sac tout de suite.
 */
const PENDING_KEY = 'roi-du-carton-carton-attente';

export function pushPendingGift(itemId: string): void {
  try {
    const l = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]') as string[];
    l.push(itemId);
    localStorage.setItem(PENDING_KEY, JSON.stringify(l.slice(-5)));
  } catch { /* silent */ }
}

export function takePendingGifts(): string[] {
  try {
    const l = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]') as string[];
    if (l.length) localStorage.removeItem(PENDING_KEY);
    return l;
  } catch { return []; }
}
