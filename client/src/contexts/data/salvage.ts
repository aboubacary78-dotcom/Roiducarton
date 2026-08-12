/*
 * LA RÉCUP' — le fond du container.
 *
 * Pourquoi cette action existe : le bricolage (voir data/crafting) consomme du
 * « bazar », et aucune autre action n'en produit. La Récup' est cette source.
 *
 * POURQUOI CETTE VERSION. La première mouture faisait trier des objets qui
 * tombaient : prendre ce qui vaut, laisser le reste. Ignorer un déchet ne
 * coûtait rien, donc il n'y avait pas d'arbitrage — juste une bonne réponse
 * évidente et une exécution au doigt. Un test de réflexes déguisé en jeu.
 *
 * Ici, la seule vraie décision est de RENONCER. On déblaie une couche du
 * doigt, on ramasse ce qu'elle cache, puis on choisit : remonter avec le
 * butin, ou descendre d'une couche. Plus bas, ça vaut plus cher — et le tas
 * s'agite. S'il se réveille avant qu'on soit ressorti, on perd TOUT ce qu'on
 * n'a pas mis à l'abri. Le joueur se fait son propre malheur, et c'est ce qui
 * donne envie de recommencer.
 */
import type { Character, InventoryItem } from '../types';
import { randomFromArray } from './util';
import { hasTrait } from './world';

export type FindKind = 'consigne' | 'bazar' | 'trouvaille' | 'piege';

export interface SalvageFind {
  id: string;
  emoji: string;
  name: string;      // en français, traduit à l'affichage par tc()
  kind: FindKind;
  value: number;     // centimes pour la consigne ; sans objet ailleurs
}

// ---- Ce qu'on peut sortir d'un container ---------------------------------

export const CONSIGNE_FINDS: SalvageFind[] = [
  { id: 'canette', emoji: '🥤', name: 'Canette écrasée', kind: 'consigne', value: 26 },
  { id: 'bouteille-verre', emoji: '🍾', name: 'Bouteille de verre', kind: 'consigne', value: 45 },
  { id: 'bouteille-plastique', emoji: '🧴', name: 'Bouteille en plastique', kind: 'consigne', value: 22 },
  { id: 'cageot', emoji: '🧺', name: 'Cageot du marché', kind: 'consigne', value: 52 },
  { id: 'carton-plie', emoji: '📦', name: 'Carton plié', kind: 'consigne', value: 36 },
  { id: 'boite-conserve', emoji: '🥫', name: 'Boîte de conserve', kind: 'consigne', value: 25 },
];

export const BAZAR_FINDS: SalvageFind[] = [
  { id: 'ferraille', emoji: '🔩', name: 'Poignée de ferraille', kind: 'bazar', value: 0 },
  { id: 'cable', emoji: '🔌', name: 'Câble emmêlé', kind: 'bazar', value: 0 },
  { id: 'tissu', emoji: '🧵', name: 'Chute de tissu', kind: 'bazar', value: 0 },
  { id: 'ressort', emoji: '🪛', name: 'Ressort et deux vis', kind: 'bazar', value: 0 },
  { id: 'bache', emoji: '🪟', name: 'Bout de bâche', kind: 'bazar', value: 0 },
  { id: 'roulette', emoji: '🛞', name: 'Roulette de caddie', kind: 'bazar', value: 0 },
];

/** Ce qui mord, pique ou pue : révélé, ça agite le tas d'un coup. */
export const PIEGE_FINDS: SalvageFind[] = [
  { id: 'rat', emoji: '🐀', name: 'Un rat. Il était là avant vous.', kind: 'piege', value: 0 },
  { id: 'verre-casse', emoji: '🔪', name: 'Tesson de bouteille', kind: 'piege', value: 0 },
  { id: 'guepes', emoji: '🐝', name: 'Un nid. Occupé.', kind: 'piege', value: 0 },
  { id: 'poisson', emoji: '🐟', name: 'Poisson d\'avant-hier', kind: 'piege', value: 0 },
  { id: 'couche', emoji: '🩲', name: 'Chose molle et tiède', kind: 'piege', value: 0 },
  { id: 'yaourt', emoji: '🦠', name: 'Yaourt devenu autonome', kind: 'piege', value: 0 },
];

/** Les vraies trouvailles du fond : ce pour quoi on prend le risque. */
export const TROUVAILLES: InventoryItem[] = [
  { id: 'recup-manteau', name: 'Manteau militaire (presque propre)', emoji: '🧥', type: 'armor', value: 14, defenseBonus: 4 },
  { id: 'recup-barre', name: 'Barre de fer', emoji: '🔧', type: 'weapon', value: 12, attackBonus: 5, combatStyle: 'heavy' },
  { id: 'recup-duvet', name: 'Duvet oublié', emoji: '🛌', type: 'tool', value: 11, effect: { sleep: 26, health: 5 } },
  { id: 'recup-conserves', name: 'Carton de conserves (périmées de peu)', emoji: '🥫', type: 'food', value: 10, effect: { hunger: 30 } },
  { id: 'recup-radio', name: 'Radio qui grésille', emoji: '📻', type: 'special', value: 9, effect: { mental: 16 } },
  { id: 'recup-chaussures', name: 'Chaussures à votre taille', emoji: '👟', type: 'tool', value: 13, effect: { health: 10, dignity: 8 } },
];

/**
 * Ce que seule une Main Verte remarque au fond d'un container : un truc qui
 * pousse encore. Pour tout le monde, c'est un déchet ; pour elle, c'est vivant.
 */
export const TROUVAILLE_VERTE: InventoryItem = {
  id: 'recup-basilic', name: 'Pot de basilic (vivant, contre toute attente)', emoji: '🪴', type: 'food', value: 8, effect: { hunger: 12, mental: 14 },
};

/** Les bricoles rapportées, côté inventaire. Voir la note de valeur plus bas. */
export const SALVAGE_JUNK: InventoryItem[] = [
  { id: 'ferraille-recup', name: 'Ferraille récupérée', emoji: '🔩', type: 'junk', value: 2 },
  { id: 'cable-recup', name: 'Câble récupéré', emoji: '🔌', type: 'junk', value: 2 },
  { id: 'tissu-recup', name: 'Tissu récupéré', emoji: '🧵', type: 'junk', value: 1 },
  { id: 'bache-recup', name: 'Bâche récupérée', emoji: '🪟', type: 'junk', value: 2 },
  { id: 'piece-recup', name: 'Pièces détachées', emoji: '🪛', type: 'junk', value: 2 },
];
// Valeurs volontairement basses : un objet se revend 60 % de sa valeur, et à
// 5 une bonne fouille rapportait plus de vingt euros, ce qui écrasait la
// mendicité. Ces bricoles valent par ce qu'on en FAIT. Effet heureux :
// l'établi consommant le moins précieux d'abord, elles partent avant les
// trouvailles.

// ---- Les couches ----------------------------------------------------------

export interface SalvageLayer {
  name: string;        // en français, traduit par tc()
  nameEn: string;
  /** Nombre d'objets cachés sous la couche. */
  finds: number;
  /** Part de ces objets qui est de la consigne, puis du bazar. Le reste pique. */
  consigne: number;
  bazar: number;
  /** Chance qu'une trouvaille se cache dans cette couche. */
  trouvaille: number;
  /** Agitation gagnée d'un coup en descendant jusqu'ici. */
  entryRisk: number;
  /** Agitation gagnée par seconde passée à fouiller cette couche. */
  riskPerS: number;
}

// Réglage cherché par simulation (20 000 fouilles par stratégie), pas au
// jugé. La forme visée : l'espérance de gain culmine à la couche 4, et le
// fond reste un PARI — on n'y descend pas pour l'argent mais pour la
// trouvaille, en acceptant une fouille sur deux perdue.
//
// Trois réglages testés et écartés. Un coût d'entrée fort (12/18/24/30) :
// le fond devenait impossible, 98 % d'échec, personne n'y serait jamais allé.
// Un temps de fouille coûteux : ça punissait le joueur méthodique, exactement
// à l'envers de ce qu'on veut. Et un coût d'entrée cumulé trop lourd mangeait
// le budget de risque AVANT d'arriver en bas, ce qui revenait au premier cas.
//
// L'essentiel du danger vient donc de ce qu'on RÉVEILLE, pas d'une taxe de
// passage : c'est le tas qui décide, et il décide pendant qu'on fouille.
export const LAYERS: SalvageLayer[] = [
  { name: 'La surface', nameEn: 'The surface', finds: 4, consigne: 0.75, bazar: 0.20, trouvaille: 0, entryRisk: 0, riskPerS: 0.5 },
  { name: 'Sous les sacs', nameEn: 'Under the bags', finds: 4, consigne: 0.45, bazar: 0.42, trouvaille: 0.05, entryRisk: 5, riskPerS: 0.9 },
  { name: 'Le milieu du tas', nameEn: 'Mid-pile', finds: 5, consigne: 0.25, bazar: 0.55, trouvaille: 0.18, entryRisk: 8, riskPerS: 1.4 },
  { name: 'Là où ça colle', nameEn: 'Where it sticks', finds: 5, consigne: 0.12, bazar: 0.62, trouvaille: 0.35, entryRisk: 10, riskPerS: 1.9 },
  { name: 'Le fond', nameEn: 'The bottom', finds: 6, consigne: 0.05, bazar: 0.63, trouvaille: 0.7, entryRisk: 12, riskPerS: 2.5 },
];

export const SALVAGE_TUNING = {
  riskMax: 100,        // au-delà, le tas se réveille et on repart les mains vides
  piegeRisk: 10,       // agitation gagnée en réveillant une saleté
  // Grille volontairement petite : à 7x9 les cases étaient minuscules et la
  // fouille interminable. Moins de cases, plus grandes, on voit ce qu'on fait.
  gridW: 6,            // colonnes de détritus à déblayer
  gridH: 7,            // lignes
  /** Part de la couche à déblayer avant de pouvoir descendre. */
  clearToDig: 0.55,
  maxKept: 6,          // on n'a que deux poches, et l'établi n'en demande pas plus
} as const;

/** Comment le tas se réveille, quand il se réveille. */
export const BUST_REASONS: { fr: string; en: string; emoji: string }[] = [
  { emoji: '🐀', fr: 'Le tas se met à bouger tout seul. Puis à couiner. Vous partez sans discuter, et sans rien.', en: 'The pile starts moving on its own. Then squeaking. You leave without arguing, and without anything.' },
  { emoji: '🔦', fr: 'Une torche vous cueille les bras dans le container. « Ça, c\'est la propriété de la commune. » Tout y reste.', en: 'A torch catches you elbow-deep in the bin. "That is municipal property." All of it stays.' },
  { emoji: '🧱', fr: 'Tout s\'effondre d\'un coup. Vous ressortez en toussant, les poches retournées.', en: 'The whole thing collapses at once. You come out coughing, pockets turned out.' },
  { emoji: '🚛', fr: 'Le camion-benne arrive avec vingt minutes d\'avance. Votre récolte part au traitement.', en: 'The rubbish truck shows up twenty minutes early. Your haul goes off for processing.' },
];

/** Ce que cache une couche : objets utiles, saletés, et parfois le gros lot. */
export function rollLayerFinds(depth: number, malus = 0, greenThumb = false): SalvageFind[] {
  const layer = LAYERS[Math.min(depth, LAYERS.length - 1)];
  const out: SalvageFind[] = [];
  for (let i = 0; i < layer.finds; i++) {
    // Le Poissard sort plus de saletés du même container. C'est sa vie.
    const r = Math.random() + malus * 0.18;
    if (r < layer.consigne) out.push(randomFromArray(CONSIGNE_FINDS));
    else if (r < layer.consigne + layer.bazar) out.push(randomFromArray(BAZAR_FINDS));
    else out.push(randomFromArray(PIEGE_FINDS));
  }
  if (Math.random() < layer.trouvaille) {
    const t = randomFromArray(TROUVAILLES);
    out.push({ id: t.id, emoji: t.emoji, name: t.name, kind: 'trouvaille', value: 0 });
  }
  // La Main Verte voit ce que les autres jettent : quelque chose qui pousse
  // encore, sous les épluchures. Personne d'autre ne le remarquerait.
  if (greenThumb && depth >= 1 && Math.random() < 0.22) {
    const t = TROUVAILLE_VERTE;
    out.push({ id: t.id, emoji: t.emoji, name: t.name, kind: 'trouvaille', value: 0 });
  }
  return out.sort(() => Math.random() - 0.5);
}

export function trouvailleById(id: string): InventoryItem | null {
  if (id === TROUVAILLE_VERTE.id) return TROUVAILLE_VERTE;
  return TROUVAILLES.find(t => t.id === id) || null;
}

/**
 * Le risque annoncé AVANT de descendre : ce qu'on prend d'un coup, et ce que
 * la couche coûtera par seconde. Affiché tel quel — un pari qui cache ses
 * chances n'est pas un pari, c'est une loterie.
 */
export function nextLayerRisk(depth: number): { entry: number; perS: number } | null {
  const next = LAYERS[depth + 1];
  return next ? { entry: next.entryRisk, perS: next.riskPerS } : null;
}

/** Conversion finale : la consigne se compte en centimes, l'euro est entier. */
export function salvagePayout(centimes: number): number {
  return Math.floor(centimes / 100);
}

// ---- Ce que le caractère change dans un container -------------------------
//
// Un trait qui ne se voit nulle part n'existe pas. Chacun de ceux qui suivent
// a un effet DÉDUIT de sa fiction, pas plaqué dessus : le phobique des rats
// panique quand il en réveille un, l'haleine redoutable les fait fuir,
// l'agile sauve les meubles quand tout s'écroule, le ventre sur pattes mange
// ce qu'il déterre. Les mauvais traits mordent autant que les bons aident.

export interface SalvageMods {
  /** Décale le tirage vers les saletés (Poissard). */
  malus: number;
  /** Multiplie l'agitation gagnée en fouillant (Bricoleur, discret). */
  riskMul: number;
  /** Multiplie l'agitation d'entrée dans une couche (Insomniaque, nocturne). */
  entryMul: number;
  /** Bricoles gardées en plus (Collectionneur, Bricoleur). */
  extraKept: number;
  /** Cases dégagées d'office à chaque nouvelle couche (Ami des Pigeons, Orientation). */
  freeReveals: number;
  /** Voit les saletés avant de les toucher (Nez Sensible, Paranoïaque). */
  flair: boolean;
  /** Part du butin sauvée si le tas se réveille (Agile). */
  saveOnBust: number;
  /** Seuil d'agitation à partir duquel on prévient le joueur (Paranoïaque). */
  warnAt: number;
  /** Déniche ce qui pousse encore sous les épluchures (Main Verte). */
  greenThumb: boolean;
}

/** Les saletés « molles » : ce qui pue plutôt que ce qui mord. */
const SOFT_PIEGES = ['poisson', 'couche', 'yaourt'];

/** Ce qu'une saleté coûte à CE personnage, en agitation. */
export function piegeCostFor(c: Character, findId: string): number {
  let n: number = SALVAGE_TUNING.piegeRisk;
  // Il en a vu d'autres : le pourri ne l'impressionne plus.
  if (SOFT_PIEGES.includes(findId) && hasTrait(c, 'estomac-acier')) n *= 0.5;
  // Son haleine part devant : les rats déguerpissent sans faire d'histoire.
  if (findId === 'rat' && hasTrait(c, 'haleine')) n = 0;
  // Sauf si les rats sont justement ce qu'il redoute le plus au monde.
  else if (findId === 'rat' && hasTrait(c, 'phobie-rats')) n *= 2.2;
  return Math.round(n);
}

/** Ce qu'une saleté coûte au CORPS, en plus de l'agitation. */
export function piegeHurts(c: Character, findId: string): { health: number; hunger: number } {
  const out = { health: 0, hunger: 0 };
  // Des os en mousse dans un container plein de tessons : mauvaise idée.
  if (hasTrait(c, 'os-mousse') && (findId === 'verre-casse' || findId === 'rat' || findId === 'guepes')) out.health -= 2;
  // Il ne va quand même pas laisser perdre ça.
  if (hasTrait(c, 'ventre-pattes') && SOFT_PIEGES.includes(findId)) out.hunger += 5;
  return out;
}

/*
 * L'IMAGE DE FIN DE FOUILLE.
 *
 * La fouille se termine de trois façons — on remonte les poches pleines, on
 * remonte les mains vides, ou le tas se réveille et tout reste au fond — et
 * chacune a son diorama. Tant que les trois images propres au mini-jeu ne sont
 * pas livrées, on retombe sur un diorama de déchetterie déjà en place plutôt
 * que sur la scène dessinée en repli : l'écran de fin d'un mini-jeu ne doit
 * jamais être le seul endroit du jeu où l'illustration est un tracé vectoriel.
 */
export function salvageResultImage(busted: boolean, empty: boolean): { image: string; fallbackImage: string } {
  if (busted) return { image: '/assets/result-recup-bust.webp', fallbackImage: '/assets/result-exp-poubelle-bureau-bad.webp' };
  if (empty) return { image: '/assets/result-recup-vide.webp', fallbackImage: '/assets/result-exp-dechetterie-bad.webp' };
  return { image: '/assets/result-recup-good.webp', fallbackImage: '/assets/result-exp-dechetterie-good.webp' };
}

export function salvageMods(c: Character): SalvageMods {
  return {
    malus: hasTrait(c, 'poissard') ? 1 : 0,
    // Le Bricoleur sait fouiller sans faire trembler tout le tas.
    riskMul: hasTrait(c, 'bricoleur') ? 0.8 : 1,
    // L'Insomniaque fouille à des heures où personne ne surveille rien.
    entryMul: hasTrait(c, 'insomniaque') ? 0.75 : 1,
    extraKept: (hasTrait(c, 'collectionneur') ? 2 : 0) + (hasTrait(c, 'bricoleur') ? 1 : 0),
    // Les pigeons grattent avec lui ; celui qui a le sens de l'orientation
    // sait d'instinct de quel côté du tas regarder.
    freeReveals: (hasTrait(c, 'ami-pigeons') ? 2 : 0) + (hasTrait(c, 'orientation') ? 1 : 0),
    flair: hasTrait(c, 'nez-sensible') || hasTrait(c, 'paranoiaque'),
    // Quand tout s'écroule, l'Agile ressort avec ce qu'il avait dans les mains.
    saveOnBust: hasTrait(c, 'agile') ? 0.5 : 0,
    // Le Paranoïaque sent le moment où il faudrait arrêter. Les autres non.
    warnAt: hasTrait(c, 'paranoiaque') ? 55 : 80,
    greenThumb: hasTrait(c, 'main-verte'),
  };
}
