/*
 * LA RÉCUP' — fouiller les containers et trier ce qui en sort.
 *
 * Pourquoi cette action existe : le bricolage (voir data/crafting) consomme du
 * « bazar », et jusqu'ici AUCUNE action n'en produisait — on n'en trouvait
 * qu'au hasard des événements. L'atelier était donc une belle mécanique sans
 * matière première. La Récup' est cette source.
 *
 * Le geste : les objets tombent du container, on les envoie d'une chiquenaude
 * vers le bac qui va bien. La consigne fait de l'argent, la ferraille fait du
 * bazar, et le reste, on le laisse tomber — littéralement. Y toucher, c'est
 * remplir sa jauge de dégoût pour rien.
 */
import type { InventoryItem } from '../types';
import { randomFromArray } from './util';

/** Bac de destination, ou rien du tout pour ce qui ne vaut pas le geste. */
export type SalvageBin = 'consigne' | 'bazar';
export type SalvageKind = SalvageBin | 'dechet' | 'piege';

export interface SalvageDef {
  id: string;
  emoji: string;
  name: string;      // en français, traduit à l'affichage par tc()
  kind: SalvageKind;
  value: number;     // centimes pour la consigne, valeur de revente pour le bazar
}

// ---- Ce qui sort d'un container ------------------------------------------
// La consigne rapporte peu et sûrement ; le bazar nourrit l'atelier ; les
// déchets sont là pour qu'on ait quelque chose à ne PAS ramasser (sans quoi
// trier ne serait pas un choix) ; les pièges mordent.

export const SALVAGE_ITEMS: SalvageDef[] = [
  // ♻️ Consigne — bouteilles et canettes, l'argent de poche du trottoir
  // Valeurs en centimes, calibrées pour qu'une bonne fouille rende 2 à 3 €.
  // À la moitié de ça, le bac de gauche ne servait à rien : on ne franchissait
  // jamais l'euro et le joueur n'avait aucune raison de viser la consigne.
  { id: 'canette', emoji: '🥤', name: 'Canette écrasée', kind: 'consigne', value: 26 },
  { id: 'bouteille-verre', emoji: '🍾', name: 'Bouteille de verre', kind: 'consigne', value: 45 },
  { id: 'bouteille-plastique', emoji: '🧴', name: 'Bouteille en plastique', kind: 'consigne', value: 22 },
  { id: 'cageot', emoji: '🧺', name: 'Cageot du marché', kind: 'consigne', value: 52 },
  { id: 'carton-plie', emoji: '📦', name: 'Carton plié', kind: 'consigne', value: 36 },
  { id: 'boite-conserve', emoji: '🥫', name: 'Boîte de conserve', kind: 'consigne', value: 25 },

  // 🔧 Bazar — la matière première de l'atelier
  { id: 'ferraille', emoji: '🔩', name: 'Poignée de ferraille', kind: 'bazar', value: 4 },
  { id: 'cable', emoji: '🔌', name: 'Câble emmêlé', kind: 'bazar', value: 5 },
  { id: 'tissu', emoji: '🧵', name: 'Chute de tissu', kind: 'bazar', value: 3 },
  { id: 'ressort', emoji: '🪛', name: 'Ressort et deux vis', kind: 'bazar', value: 4 },
  { id: 'bache', emoji: '🪟', name: 'Bout de bâche', kind: 'bazar', value: 6 },
  { id: 'roulette', emoji: '🛞', name: 'Roulette de caddie', kind: 'bazar', value: 5 },
  { id: 'reveil', emoji: '⏰', name: 'Réveil sans aiguilles', kind: 'bazar', value: 7 },

  // 🗑️ Déchets — à laisser filer, ils ne valent que du dégoût
  { id: 'couche', emoji: '🩲', name: 'Chose molle et tiède', kind: 'dechet', value: 0 },
  { id: 'poisson', emoji: '🐟', name: 'Poisson d\'avant-hier', kind: 'dechet', value: 0 },
  { id: 'mouchoir', emoji: '🤧', name: 'Mouchoir très utilisé', kind: 'dechet', value: 0 },
  { id: 'yaourt', emoji: '🦠', name: 'Yaourt devenu autonome', kind: 'dechet', value: 0 },
  { id: 'os', emoji: '🦴', name: 'Os douteux', kind: 'dechet', value: 0 },
  { id: 'chaussette', emoji: '🧦', name: 'Chaussette solitaire', kind: 'dechet', value: 0 },

  // ⚠️ Pièges — ça mord ou ça pique
  { id: 'rat', emoji: '🐀', name: 'Un rat. Il était là avant vous.', kind: 'piege', value: 0 },
  { id: 'verre-casse', emoji: '🔪', name: 'Tesson de bouteille', kind: 'piege', value: 0 },
  { id: 'guepes', emoji: '🐝', name: 'Un nid. Occupé.', kind: 'piege', value: 0 },
];

// Ce que le bac à bazar rend, une fois trié : de vrais objets d'inventaire,
// utilisables par l'atelier.
//
// Valeurs volontairement BASSES. Un objet se revend 60 % de sa valeur : à 5,
// une bonne fouille rapportait plus de vingt euros à la revente et écrasait
// la mendicité. Ces bricoles valent par ce qu'on en FAIT, pas par ce qu'on en
// tire au comptoir. Effet de bord heureux : l'établi consommant toujours le
// moins précieux d'abord, elles passent à l'atelier avant les trouvailles.
export const SALVAGE_JUNK: InventoryItem[] = [
  { id: 'ferraille-recup', name: 'Ferraille récupérée', emoji: '🔩', type: 'junk', value: 2 },
  { id: 'cable-recup', name: 'Câble récupéré', emoji: '🔌', type: 'junk', value: 2 },
  { id: 'tissu-recup', name: 'Tissu récupéré', emoji: '🧵', type: 'junk', value: 1 },
  { id: 'bache-recup', name: 'Bâche récupérée', emoji: '🪟', type: 'junk', value: 2 },
  { id: 'piece-recup', name: 'Pièces détachées', emoji: '🪛', type: 'junk', value: 2 },
];

/** Plafond de bricoles rapportées en une fouille : on n'a que deux poches. */
export const SALVAGE_MAX_KEPT = 6;

// ---- Réglage --------------------------------------------------------------
// Une manche courte, dense, qui s'arrête net quand le cœur ne suit plus.

export const SALVAGE_TUNING = {
  roundMs: 22000,      // durée d'une fouille
  // Cadence et chute recalées sur la zone de jeu plein écran : avec l'ancien
  // réglage, prévu pour un carré de 300 px, deux objets seulement flottaient
  // dans une colonne deux fois plus haute. Le container avait l'air vide.
  spawnMs: 640,        // un objet toutes les ~0,6 s
  fallMs: 3000,        // temps de chute d'un objet, du rebord jusqu'aux caisses
  disgustMax: 100,     // au-delà, on rend son déjeuner et on s'arrête
  disgustDechet: 22,   // toucher une saleté
  disgustPiege: 30,    // se faire mordre ou couper
  disgustDrift: 1.1,   // montée lente rien qu'à rester le nez dedans (par seconde)
} as const;

/** Proportions du tirage : il faut assez de déchets pour que trier soit un choix. */
const WEIGHTS: Record<SalvageKind, number> = {
  consigne: 34,
  bazar: 30,
  dechet: 26,
  piege: 10,
};

/**
 * Un objet qui sort du container. `luck` (le trait Poissard, la pluie…) pousse
 * le tirage vers les saletés ; `flair` ne change pas le tirage, il sert à
 * l'affichage (le nez sensible voit venir ce qui pue, côté écran).
 */
export function rollSalvageItem(malus = 0): SalvageDef {
  const w = { ...WEIGHTS };
  w.dechet += malus * 10;
  w.piege += malus * 5;
  const total = w.consigne + w.bazar + w.dechet + w.piege;
  let r = Math.random() * total;
  let kind: SalvageKind = 'consigne';
  for (const k of ['consigne', 'bazar', 'dechet', 'piege'] as SalvageKind[]) {
    if (r < w[k]) { kind = k; break; }
    r -= w[k];
  }
  return randomFromArray(SALVAGE_ITEMS.filter(i => i.kind === kind));
}

/** Le bac attendu pour un objet, ou null s'il vaut mieux le laisser tomber. */
export function expectedBin(def: SalvageDef): SalvageBin | null {
  return def.kind === 'consigne' || def.kind === 'bazar' ? def.kind : null;
}

/**
 * Conversion de fin de manche. La consigne se compte en centimes et s'arrondit
 * à l'euro inférieur : il faut vraiment remplir le sac pour toucher quelque
 * chose, comme au vrai comptoir de la déchetterie.
 */
export function salvagePayout(centimes: number): number {
  return Math.floor(centimes / 100);
}
