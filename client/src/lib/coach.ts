/*
 * LES CONSEILS CONTEXTUELS.
 *
 * Le tutoriel était une visite guidée de huit écrans, imposée avant la
 * première action. Or la rétention du lendemain se joue presque entièrement
 * pendant la première session, et surtout AVANT la première récompense : le
 * parcours faisait passer par neuf écrans avant la moindre décharge.
 *
 * Le problème n'est pas la longueur, c'est le moment. Une explication donnée
 * avant qu'on en ait besoin n'est pas lue ; la même phrase, donnée à l'instant
 * où elle sert, est retenue du premier coup.
 *
 * Chaque conseil tient donc en UNE phrase, se déclenche sur une condition
 * réelle du jeu, et ne s'affiche qu'une fois. Le joueur joue d'abord.
 */
import type { Character, Stats } from '@/contexts/types';

const KEY = 'roi-du-carton-conseils-vus';

export interface Coach {
  id: string;
  emoji: string;
  fr: string; en: string;
  /** Élément de l'écran principal à désigner, s'il y en a un. */
  targetId?: string;
  /** La situation qui rend ce conseil utile MAINTENANT. */
  when: (ctx: CoachContext) => boolean;
}

export interface CoachContext {
  char: Character;
  actionsLeft: number;
  weather: string;
}

const bas = (s: Stats) => Math.min(s.health, s.mental, s.hunger, s.thirst, s.sleep);

/*
 * L'ordre compte : on affiche le premier conseil éligible et pas encore vu.
 * Les plus urgents d'abord — un joueur dont la santé s'effondre n'a pas besoin
 * qu'on lui parle de la garde-robe.
 */
export const COACHES: Coach[] = [
  {
    id: 'actions', emoji: '🎯', targetId: 'tuto-actions',
    fr: 'Trois actions par jour, pas une de plus. Choisissez.',
    en: 'Three actions a day, no more. Choose.',
    when: ({ char, actionsLeft }) => char.day === 1 && actionsLeft === 3,
  },
  {
    id: 'jauge-basse', emoji: '❤️', targetId: 'tuto-stats',
    fr: 'Une jauge dans le rouge. Si la santé ou le mental tombe à zéro, c\'est fini.',
    en: 'A gauge in the red. If health or mind hits zero, it\'s over.',
    when: ({ char }) => bas(char.stats) <= 30,
  },
  {
    id: 'dignite', emoji: '👑', targetId: 'tuto-stats',
    fr: 'La dignité décide de ce que les autres vous donnent. Tout ce qui rapporte la fait baisser.',
    en: 'Dignity decides what others give you. Everything that pays makes it drop.',
    when: ({ char }) => char.stats.dignity < 50,
  },
  {
    id: 'boutique', emoji: '🛒', targetId: 'tuto-secondary',
    fr: 'Vous avez de quoi acheter. Boutique, voyage et sac ne coûtent aucune action.',
    en: 'You can afford something. Shop, travel and bag cost no action.',
    when: ({ char }) => char.money >= 4,
  },
  {
    id: 'meteo', emoji: '🌦️', targetId: 'tuto-weather',
    fr: 'Le temps tourne mal. La nuit va coûter plus cher — préparez-vous avant.',
    en: 'The weather is turning. The night will cost more — get ready first.',
    when: ({ weather }) => weather === 'storm' || weather === 'snow' || weather === 'heatwave',
  },
  {
    id: 'nuit', emoji: '🌙', targetId: 'tuto-nextday',
    fr: 'Plus d\'action. La nuit consomme vos jauges : mangez et buvez avant de dormir.',
    en: 'No actions left. The night drains your gauges: eat and drink before sleeping.',
    when: ({ actionsLeft }) => actionsLeft <= 0,
  },
  {
    id: 'sac', emoji: '🎒', targetId: 'tuto-secondary',
    fr: 'Votre sac se remplit. On y utilise les objets, et on y revend le reste.',
    en: 'Your bag is filling up. Use items there, and sell the rest.',
    when: ({ char }) => char.inventory.length >= 4,
  },
  {
    id: 'garde-robe', emoji: '🧣', targetId: 'tuto-header',
    fr: 'Touchez votre visage pour ouvrir la garde-robe et porter ce que vous avez gagné.',
    en: 'Tap your face to open the wardrobe and wear what you\'ve earned.',
    when: ({ char }) => char.day >= 3,
  },
];

function seen(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function markCoachSeen(id: string): void {
  try {
    const l = seen();
    if (!l.includes(id)) localStorage.setItem(KEY, JSON.stringify([...l, id]));
  } catch { /* silent */ }
}

/** Le conseil à montrer maintenant, ou `null` s'il n'y a rien à dire. */
export function nextCoach(ctx: CoachContext): Coach | null {
  const vus = seen();
  return COACHES.find(c => !vus.includes(c.id) && c.when(ctx)) ?? null;
}

export function resetCoaches(): void {
  try { localStorage.removeItem(KEY); } catch { /* silent */ }
}

/** Tous les conseils ont-ils été vus ? Sert à ne plus rien calculer ensuite. */
export function allCoachesSeen(): boolean {
  return seen().length >= COACHES.length;
}

/*
 * LA TOUTE PREMIÈRE PARTIE.
 *
 * Les premières minutes décident de presque toute la rétention du lendemain,
 * et un joueur qui meurt au premier jour de sa première partie n'a rien vu du
 * jeu. On lui met donc le vent dans le dos : pas de mort le jour un, et une
 * fouille garantie de rapporter quelque chose. C'est une pratique universelle
 * du secteur, et elle est invisible — le joueur croit simplement avoir eu de
 * la chance, ce qui est le but.
 *
 * Une seule partie est concernée : dès qu'il y a une tombe ou un score, la
 * rue reprend ses droits.
 */
export function isFirstEverRun(scoreCount: number, graveCount: number): boolean {
  return scoreCount === 0 && graveCount === 0;
}
