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
  /** Toute première partie : c'est elle qui porte la narration du jour un. */
  premierRun: boolean;
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
  /*
   * LA RÉVÉLATION — deuxième temps du premier jour.
   *
   * Elle tombe au retour de la première action, à l'instant où Bagarre et Vol
   * apparaissent dans la grille (voir `arsenalVisible`). Ce n'est pas un
   * déblocage de niveau : c'est le personnage qui cesse de subir le quartier
   * et commence à y voir des prises.
   */
  {
    id: 'arsenal', emoji: '👁️', targetId: 'tuto-actions',
    fr: 'Fin du tour d\'observation. Vous voyez les poches qui dépassent, et les mâchoires qui cherchent un poing.',
    en: 'Observation over. You see the pockets that stick out, and the jaws asking for a fist.',
    when: ({ char, actionsLeft, premierRun }) => premierRun && char.day === 1 && actionsLeft < 3,
  },
  {
    id: 'jauge-basse', emoji: '❤️', targetId: 'tuto-stats',
    fr: 'Une jauge dans le rouge. Si la santé ou le mental tombe à zéro, c\'est fini.',
    en: 'A gauge in the red. If health or mind hits zero, it\'s over.',
    when: ({ char }) => bas(char.stats) <= 30,
  },
  /*
   * LE RÉVEIL — quatrième et dernier temps.
   *
   * La nuit vient de prendre quinze points de sommeil sans rien demander. On
   * ne l'explique qu'APRÈS coup, une fois la perte au compteur : dire la
   * veille « pensez à dormir » n'apprend rien à personne.
   */
  {
    id: 'sommeil', emoji: '😴', targetId: 'tuto-actions',
    fr: 'Le carton ondulé n\'est pas un matelas, quelle surprise. Dormir ne répare rien, ça permet juste de tenir debout.',
    en: 'Corrugated cardboard is not a mattress, what a shock. Sleeping mends nothing — it just keeps you upright.',
    when: ({ char }) => char.day >= 2 && char.stats.sleep <= 70,
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
  /*
   * Ce conseil se tait le premier soir : le crépuscule du jour un a déjà sa
   * phrase, posée au-dessus du bouton (voir `CREPUSCULE`). Deux textes qui
   * disent la même chose au même moment, c'est un texte de trop — et la
   * première nuit ne peut de toute façon pas tuer (voir `withFirstDayNet`),
   * donc le conseil ne perd rien à attendre le lendemain, où il servira.
   */
  {
    id: 'nuit', emoji: '🌙', targetId: 'tuto-nextday',
    fr: 'Plus d\'action. La nuit consomme vos jauges : mangez et buvez avant de dormir.',
    en: 'No actions left. The night drains your gauges: eat and drink before sleeping.',
    when: ({ actionsLeft, char, premierRun }) => actionsLeft <= 0 && !(premierRun && char.day === 1),
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

/* ═══════════════════════════════════════════════════════════════════════════
 * LA NARRATION DU PREMIER JOUR
 *
 * Neuf actions d'un coup au premier écran, dont deux qu'un débutant ne peut
 * pas évaluer et qui sont précisément celles qui le tuent. On en retire donc
 * deux — Bagarre et Vol — le temps d'une action.
 *
 * Mais une option qui manque sans raison est un bug, pas une intention. Les
 * quatre textes ci-dessous sont là pour ça : ils donnent au masquage une cause
 * qui appartient au personnage, pas au tutoriel. Il ne « débloque » rien, il
 * se met à voir.
 *
 * Deux règles d'écriture, tenues sur les quatre :
 *   · on vouvoie, comme partout ailleurs dans le jeu ;
 *   · aucun texte ne nomme le lieu. Le quartier de départ est tiré au sort —
 *     gare, marché, parc, centre-ville — et une phrase qui parle de la gare
 *     est fausse trois fois sur quatre.
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Bagarre et Vol sont-ils à l'écran ?
 *
 * Uniquement masqués à la toute première partie, uniquement le premier jour,
 * et uniquement tant qu'aucune action n'a été faite. Trois conditions : c'est
 * le seul moment où le joueur n'a encore rien vu du jeu.
 */
export function arsenalVisible(
  { premierRun, jour, actionsFaites }: { premierRun: boolean; jour: number; actionsFaites: number },
): boolean {
  return !premierRun || jour > 1 || actionsFaites > 0;
}

/** Premier temps : sous la scène, avant la première action. */
export const ARRIVEE = {
  fr: 'Personne ne vous attend nulle part, et ça laisse la journée entière. Regardez comment le quartier tourne avant de faire un faux pas.',
  en: 'Nobody is expecting you anywhere, which frees up the whole day. Watch how the neighbourhood turns before you put a foot wrong.',
};

/** Troisième temps : au-dessus de « Jour Suivant », le premier soir. */
export const CREPUSCULE = {
  fr: 'Le béton refroidit plus vite que vous. Il n\'y a plus rien à faire aujourd\'hui qu\'attendre demain.',
  en: 'The concrete cools faster than you do. There is nothing left to do today but wait for tomorrow.',
};
