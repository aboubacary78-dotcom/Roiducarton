/*
 * LA COMMANDE DU QUARTIER.
 *
 * L'étage de la SEMAINE. Le jeu avait la minute (le geste), les huit minutes
 * (la partie) et l'infini (le Registre) ; il manquait l'horizon intermédiaire,
 * celui qui traverse plusieurs parties et donne une raison de continuer là où
 * la partie précédente s'est arrêtée.
 *
 * Une commande est un objectif cumulatif — ramener du cuivre, encaisser des
 * coups, tenir des jours — qui ne se remet pas à zéro quand le personnage
 * meurt. C'est le seul compteur du jeu que la mort n'efface pas, et c'est
 * précisément ce qui le rend utile : après une fin brutale, il reste quelque
 * chose d'entamé.
 *
 * La récompense est en Karma, nettement au-dessus du reste : une semaine de
 * progrès doit peser plus qu'une bonne partie.
 */

const KEY = 'roi-du-carton-commande';

/** Ce qu'une commande compte. Les événements du jeu appellent `progress`. */
export type CommandeMetric = 'bricoles' | 'euros' | 'jours' | 'coups' | 'fouilles' | 'marchandages';

export interface CommandeDef {
  id: string;
  emoji: string;
  metric: CommandeMetric;
  target: number;
  karma: number;
  fr: string; en: string;
}

export const COMMANDES: CommandeDef[] = [
  {
    id: 'cuivre', emoji: '🔌', metric: 'bricoles', target: 25, karma: 60,
    fr: 'Le brocanteur cherche de la ferraille : rapportez 25 bricoles.',
    en: 'The junk dealer wants scrap: bring back 25 parts.',
  },
  {
    id: 'caisse', emoji: '💶', metric: 'euros', target: 60, karma: 60,
    fr: 'Faire 60 € cette semaine, tous personnages confondus.',
    en: 'Make €60 this week, across all characters.',
  },
  {
    id: 'endurance', emoji: '🗓️', metric: 'jours', target: 20, karma: 70,
    fr: 'Tenir 20 jours au total, quel que soit celui qui tombe.',
    en: 'Survive 20 days in total, whoever falls.',
  },
  {
    id: 'castagne', emoji: '🥊', metric: 'coups', target: 40, karma: 60,
    fr: 'Placer 40 coups au cours de la semaine.',
    en: 'Land 40 blows over the week.',
  },
  {
    id: 'fouineur', emoji: '♻️', metric: 'fouilles', target: 12, karma: 55,
    fr: 'Descendre 12 fois dans un container.',
    en: 'Go down into a bin 12 times.',
  },
  {
    id: 'culot', emoji: '🤝', metric: 'marchandages', target: 10, karma: 55,
    fr: 'Emporter 10 marchandages.',
    en: 'Win 10 haggles.',
  },
];

export interface CommandeState {
  id: string;
  /** Lundi de la semaine en cours (AAAA-MM-JJ) : sert à faire tourner. */
  week: string;
  count: number;
  claimed: boolean;
}

function mondayOf(d = new Date()): string {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  const p = (n: number) => String(n).padStart(2, '0');
  return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`;
}

/*
 * La commande de la semaine est TIRÉE À PARTIR DE LA DATE, pas au hasard :
 * deux appareils la même semaine ont la même, et surtout elle ne change pas
 * si le joueur rouvre l'application.
 */
function pickFor(week: string): CommandeDef {
  let h = 0;
  for (let i = 0; i < week.length; i++) h = (h * 31 + week.charCodeAt(i)) >>> 0;
  return COMMANDES[h % COMMANDES.length];
}

export function loadCommande(now = new Date()): CommandeState {
  const week = mondayOf(now);
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null') as CommandeState | null;
    if (raw && raw.week === week) return raw;
  } catch { /* silent */ }
  const frais: CommandeState = { id: pickFor(week).id, week, count: 0, claimed: false };
  try { localStorage.setItem(KEY, JSON.stringify(frais)); } catch { /* silent */ }
  return frais;
}

export function commandeDef(s: CommandeState): CommandeDef {
  return COMMANDES.find(c => c.id === s.id) ?? COMMANDES[0];
}

/**
 * Fait avancer la commande si la mesure correspond. Appelée depuis le reducer
 * à chaque fois qu'un compteur bouge — jamais depuis un composant, sinon un
 * simple re-rendu compterait double.
 */
export function progress(metric: CommandeMetric, amount = 1, now = new Date()): void {
  if (amount <= 0) return;
  const s = loadCommande(now);
  const def = commandeDef(s);
  if (def.metric !== metric || s.claimed) return;
  const next: CommandeState = { ...s, count: Math.min(def.target, s.count + amount) };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* silent */ }
}

export function markClaimed(now = new Date()): void {
  const s = loadCommande(now);
  try { localStorage.setItem(KEY, JSON.stringify({ ...s, claimed: true })); } catch { /* silent */ }
}

/** Combien de jours avant que la commande ne tourne. */
export function daysLeft(now = new Date()): number {
  return 7 - ((now.getDay() + 6) % 7);
}
