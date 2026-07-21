// ============ BRICOLAGE : L'ÉTABLI DU ROI DU CARTON ============
// À la rue, on ne jette rien. Le « bazar » (objets de type junk) ramassé un
// peu partout ne sert à rien tel quel… sauf entre des mains qui savent
// bricoler. On assemble deux ou trois bricoles pour en tirer quelque chose
// d'utile : un réchaud, un matelas, une arme de fortune, de quoi se soigner.
//
// Choix de conception : les recettes coûtent un NOMBRE d'objets « bazar »
// (pas des ingrédients précis introuvables). L'établi consomme toujours les
// bricoles les moins précieuses d'abord, pour ne jamais gâcher une trouvaille
// de valeur. Le trait « Bricoleur du Dimanche » réduit le coût d'un objet et
// débloque les recettes avancées.
import type { Character, InventoryItem } from '../types';
import { hasTrait } from './world';

export interface CraftRecipe {
  id: string;
  name: string;   // libellé FR (clé du dictionnaire, repli FR pour l'EN)
  emoji: string;
  cost: number;   // nombre d'objets « bazar » à consommer
  advanced?: boolean; // réservé au trait Bricoleur
  hint: string;
  hintEn: string;
  make: () => InventoryItem;
}

// Les recettes. `make()` renvoie une NOUVELLE instance à chaque fabrication
// (id stable partagé, comme les objets de départ : le reducer en retire un
// seul exemplaire à l'usage).
export const RECIPES: CraftRecipe[] = [
  {
    id: 'rechaud', name: 'Réchaud de fortune', emoji: '🔥', cost: 2,
    hint: 'Une boîte de conserve et un peu de carton : de la chaleur, enfin.',
    hintEn: 'A tin can and some cardboard: warmth, at last.',
    make: () => ({ id: 'craft-rechaud', name: 'Réchaud de fortune', emoji: '🔥', type: 'tool', value: 6, effect: { health: 8, hunger: 6 } }),
  },
  {
    id: 'matelas', name: 'Matelas de carton', emoji: '🛏️', cost: 3,
    hint: 'Trois cartons pliés avec soin : le lit d\'un roi.',
    hintEn: 'Three boxes folded with care: a king\'s bed.',
    make: () => ({ id: 'craft-matelas', name: 'Matelas de carton', emoji: '🛏️', type: 'tool', value: 5, effect: { sleep: 30, health: 4 } }),
  },
  {
    id: 'arme-fortune', name: 'Arme de fortune', emoji: '🔩', cost: 2,
    hint: 'Un tuyau, du ruban adhésif, et de quoi cogner.',
    hintEn: 'A pipe, some tape, and something to swing.',
    make: () => ({ id: 'craft-arme', name: 'Arme de fortune', emoji: '🔩', type: 'weapon', value: 7, attackBonus: 4, combatStyle: 'heavy' }),
  },
  {
    id: 'protection', name: 'Protection de fortune', emoji: '🦺', cost: 3,
    hint: 'Cartons et mousse sanglés au torse : ça amortit les coups.',
    hintEn: 'Cardboard and foam strapped on: it softens the blows.',
    make: () => ({ id: 'craft-protection', name: 'Protection de fortune', emoji: '🦺', type: 'armor', value: 7, defenseBonus: 3 }),
  },
  {
    id: 'trousse', name: 'Trousse de secours bricolée', emoji: '🩹', cost: 3, advanced: true,
    hint: 'De quoi recoller les morceaux quand ça saigne pour de vrai.',
    hintEn: 'Enough to patch yourself up when you really bleed.',
    make: () => ({ id: 'craft-trousse', name: 'Trousse de secours bricolée', emoji: '🩹', type: 'tool', value: 9, effect: { health: 26 } }),
  },
  {
    id: 'talisman', name: 'Talisman de carton', emoji: '🧿', cost: 4, advanced: true,
    hint: 'Une babiole porte-bonheur qui redonne foi en soi.',
    hintEn: 'A lucky trinket that gives you back some faith in yourself.',
    make: () => ({ id: 'craft-talisman', name: 'Talisman de carton', emoji: '🧿', type: 'special', value: 6, effect: { mental: 22, dignity: 8 } }),
  },
];

// Coût effectif : le Bricoleur du Dimanche gagne un objet (minimum 1).
export function recipeCost(recipe: CraftRecipe, c: Character): number {
  const discount = hasTrait(c, 'bricoleur') ? 1 : 0;
  return Math.max(1, recipe.cost - discount);
}

// Recettes visibles pour ce personnage (les avancées demandent le Bricoleur).
export function craftableRecipes(c: Character): CraftRecipe[] {
  return RECIPES.filter(r => !r.advanced || hasTrait(c, 'bricoleur'));
}

// Nombre d'objets « bazar » disponibles comme matériaux.
export function materialCount(c: Character): number {
  return c.inventory.reduce((n, i) => n + (i.type === 'junk' ? 1 : 0), 0);
}

// Peut-on fabriquer cette recette maintenant ?
export function canCraft(recipe: CraftRecipe, c: Character): boolean {
  return materialCount(c) >= recipeCost(recipe, c);
}

// Indices des objets « bazar » à consommer, les moins précieux d'abord.
// (Sélection par index pour ne jamais confondre deux références partagées.)
export function pickMaterials(c: Character, count: number): number[] {
  return c.inventory
    .map((it, i) => ({ it, i }))
    .filter(x => x.it.type === 'junk')
    .sort((a, b) => a.it.value - b.it.value)
    .slice(0, count)
    .map(x => x.i);
}
