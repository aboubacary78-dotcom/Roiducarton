/*
 * LES RAPPELS.
 *
 * Le jeu n'avait aucun mécanisme de retour : rien ne ramenait un joueur le
 * lendemain. C'était le plus gros trou de rétention du projet, et il était
 * vide plutôt que mal réglé.
 *
 * Deux choses décident de la performance d'un calendrier de rappel, et ce ne
 * sont pas celles qu'on croit :
 *
 * 1. L'HEURE D'ENVOI. Envoyer à l'heure où CE joueur-là joue d'habitude fait
 *    plus de différence que le texte du message. On mémorise donc l'heure des
 *    dernières sessions et on vise ce créneau.
 *
 * 2. LE VOLUME. Au-delà de deux rappels par jour, la désinstallation progresse
 *    plus vite que le retour : on perd le canal entier. Le calendrier ci-dessous
 *    est agressif et reste sous ce plafond, avec extinction à J+21 — un joueur
 *    qui n'est pas revenu en trois semaines ne reviendra pas, et continuer à le
 *    relancer ne produit que des désinstallations.
 *
 * Le meilleur texte disponible est le nom du successeur : « Marcel attend
 * toujours son tour » ouvre une boucle que « Revenez jouer ! » n'ouvre pas.
 */
import { Capacitor } from '@capacitor/core';

const PREF_KEY = 'roi-du-carton-rappels';
const HOURS_KEY = 'roi-du-carton-heures-session';
const SUCCESSOR_KEY = 'roi-du-carton-successeur';

/** Identifiants fixes : reprogrammer écrase au lieu d'empiler. */
const IDS = { h4: 9001, j1: 9002, streak: 9003, j3: 9004, j7: 9005, j21: 9006 } as const;

export function notificationsEnabled(): boolean {
  try { return localStorage.getItem(PREF_KEY) === '1'; } catch { return false; }
}

export function setNotificationsEnabled(v: boolean): void {
  try { localStorage.setItem(PREF_KEY, v ? '1' : '0'); } catch { /* silent */ }
  if (!v) cancelAll();
}

/** Le nom du successeur, retenu pour le rappel de J+3. */
export function rememberSuccessor(name: string): void {
  try { localStorage.setItem(SUCCESSOR_KEY, name); } catch { /* silent */ }
}

function successorName(): string | null {
  try { return localStorage.getItem(SUCCESSOR_KEY); } catch { return null; }
}

/*
 * L'HEURE HABITUELLE.
 *
 * On garde les heures des cinq dernières sessions et on prend la médiane :
 * une seule session nocturne ne doit pas déplacer tout le calendrier. Sans
 * historique, on vise 19 h — la fin de journée, quand on a du temps mort.
 */
export function noteSessionHour(now = new Date()): void {
  try {
    const l = JSON.parse(localStorage.getItem(HOURS_KEY) || '[]') as number[];
    l.push(now.getHours());
    localStorage.setItem(HOURS_KEY, JSON.stringify(l.slice(-5)));
  } catch { /* silent */ }
}

export function usualHour(): number {
  try {
    const l = (JSON.parse(localStorage.getItem(HOURS_KEY) || '[]') as number[]).slice().sort((a, b) => a - b);
    if (l.length === 0) return 19;
    return l[Math.floor(l.length / 2)];
  } catch { return 19; }
}

/** Une date à J+n, à l'heure habituelle. */
function at(days: number, hour = usualHour(), from = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  // Si le créneau du jour est déjà passé, on ne programme pas dans le passé.
  if (d.getTime() <= from.getTime()) d.setDate(d.getDate() + 1);
  return d;
}

interface Planned { id: number; title: string; body: string; at: Date }

/*
 * LE CALENDRIER.
 *
 * Exporté séparément de l'envoi pour être vérifiable sans appareil : c'est la
 * partie qui contient les décisions, la partie native ne fait que poser des
 * alarmes.
 */
export function buildSchedule(opts: {
  fr: boolean;
  streak: number;
  now?: Date;
  successor?: string | null;
}): Planned[] {
  const { fr, streak } = opts;
  const now = opts.now ?? new Date();
  const nom = opts.successor ?? successorName();
  const h = usualHour();
  const out: Planned[] = [];

  // H+4 — encore dans la journée, quand la session est fraîche.
  const h4 = new Date(now.getTime() + 4 * 3600_000);
  if (h4.getHours() >= 8 && h4.getHours() <= 22) {
    out.push({
      id: IDS.h4,
      title: fr ? 'Le Roi du Carton' : 'The Cardboard King',
      body: fr ? 'Quelqu\'un est passé devant votre carton.' : 'Someone walked past your cardboard.',
      at: h4,
    });
  }

  // J+1 à l'heure habituelle — le carton du matin attend.
  out.push({
    id: IDS.j1,
    title: fr ? 'Le carton du matin' : 'The morning cardboard',
    body: fr ? 'On a laissé quelque chose pendant la nuit.' : 'Something was left during the night.',
    at: at(1, h, now),
  });

  // Série en danger, en soirée, et seulement si elle vaut la peine d'être
  // défendue. En dessous de trois jours, la prévenir ne ferait qu'agacer.
  if (streak >= 3) {
    // En soirée, mais jamais à la même minute que le rappel du carton : deux
    // notifications simultanées se lisent comme une seule, et on en perd une.
    const heureSerie = h >= 20 ? 17 : 21;
    out.push({
      id: IDS.streak,
      title: fr ? `${streak} jours de suite` : `${streak} days running`,
      body: fr ? 'Le camion-benne passe à minuit.' : 'The rubbish truck comes at midnight.',
      at: at(1, heureSerie, now),
    });
  }

  // J+3 — le successeur nommé. C'est le meilleur texte dont on dispose.
  out.push({
    id: IDS.j3,
    title: fr ? 'Le Roi du Carton' : 'The Cardboard King',
    body: nom
      ? (fr ? `${nom} attend toujours son tour.` : `${nom} is still waiting their turn.`)
      : (fr ? 'La rue ne vous a pas oublié.' : 'The street hasn\'t forgotten you.'),
    at: at(3, h, now),
  });

  // J+7 — retour avec un cadeau, pas avec un reproche.
  out.push({
    id: IDS.j7,
    title: fr ? 'On vous a gardé quelque chose' : 'Something was kept for you',
    body: fr ? 'Un carton vous attend, et personne n\'y a touché.' : 'A cardboard is waiting, untouched.',
    at: at(7, h, now),
  });

  // J+21 — le dernier. Après, plus rien : relancer au-delà ne produit que des
  // désinstallations.
  out.push({
    id: IDS.j21,
    title: fr ? 'Le Roi du Carton' : 'The Cardboard King',
    body: fr ? 'Votre couronne prend la poussière.' : 'Your crown is gathering dust.',
    at: at(21, h, now),
  });

  return out;
}

/** Jamais plus de deux rappels dans la même journée calendaire. */
export function capPerDay(list: Planned[], max = 2): Planned[] {
  const parJour = new Map<string, number>();
  const out: Planned[] = [];
  for (const p of [...list].sort((a, b) => a.at.getTime() - b.at.getTime())) {
    const k = p.at.toDateString();
    const n = parJour.get(k) ?? 0;
    if (n >= max) continue;
    parJour.set(k, n + 1);
    out.push(p);
  }
  return out;
}

async function plugin() {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const m = await import('@capacitor/local-notifications');
    return m.LocalNotifications;
  } catch { return null; }
}

export async function cancelAll(): Promise<void> {
  const LN = await plugin();
  if (!LN) return;
  try {
    const ids = Object.values(IDS).map(id => ({ id }));
    await LN.cancel({ notifications: ids });
  } catch { /* silent */ }
}

/** Demande l'autorisation. Renvoie `true` si elle est accordée. */
export async function requestPermission(): Promise<boolean> {
  const LN = await plugin();
  if (!LN) return false;
  try {
    const r = await LN.requestPermissions();
    return r.display === 'granted';
  } catch { return false; }
}

/**
 * Reprogramme tout le calendrier. Appelée à chaque fin de session : les
 * rappels partent toujours du dernier moment où le joueur était là.
 */
export async function rescheduleAll(opts: { fr: boolean; streak: number }): Promise<void> {
  if (!notificationsEnabled()) return;
  const LN = await plugin();
  if (!LN) return;
  try {
    await cancelAll();
    const plan = capPerDay(buildSchedule(opts));
    await LN.schedule({
      notifications: plan.map(p => ({
        id: p.id,
        title: p.title,
        body: p.body,
        schedule: { at: p.at, allowWhileIdle: true },
      })),
    });
  } catch { /* silent */ }
}
