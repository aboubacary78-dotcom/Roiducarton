// ============ BRICOLAGE : L'ÉTABLI DU ROI DU CARTON ============
// À la rue, on ne jette rien. Le « bazar » (objets de type junk) ramassé un
// peu partout ne sert à rien tel quel… sauf entre des mains qui savent
// bricoler.
//
// CE QUE L'ARGENT N'ACHÈTE PAS. L'établi a longtemps fabriqué des versions
// médiocres d'objets d'échoppe : une arme un peu moins bonne que le couteau
// rouillé, un soin un peu moins efficace que le sirop. À coût égal, il valait
// mieux revendre son bazar et acheter le vrai. L'établi n'avait donc aucune
// raison d'exister.
//
// Il en a une maintenant : l'échoppe vend des CONSOMMABLES qui remplissent
// des jauges, l'établi fabrique du MATÉRIEL qui change les règles de la nuit.
// Aucun commerçant ne vend une nuit sans perte de sommeil ni un hiver sans
// perte de santé. Ces objets-là ne s'utilisent pas : ils se portent, ils
// agissent tout seuls, et ils finissent par céder, ce qui redonne du travail
// à l'établi plutôt que de clore le sujet.
//
// Choix de conception : les recettes coûtent un NOMBRE d'objets « bazar »
// (pas des ingrédients précis introuvables). L'établi consomme toujours les
// bricoles les moins précieuses d'abord, pour ne jamais gâcher une trouvaille
// de valeur. Le trait « Bricoleur du Dimanche » ne verrouille plus rien : il
// retire un objet au coût et double la durée de vie de ce qu'on fabrique.
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
    hint: 'Une boîte de conserve percée, trois clous, du carton pour l\'allumage. Le froid s\'arrête à un mètre.',
    hintEn: 'A punched tin can, three nails, cardboard for kindling. The cold stops one meter out.',
    make: () => ({
      id: 'craft-rechaud', name: 'Réchaud de fortune', emoji: '🔥', type: 'tool', value: 6,
      passive: 'Les nuits froides ne vous coûtent plus de santé.',
      passiveEn: 'Cold nights no longer cost you health.',
    }),
  },
  {
    id: 'matelas', name: 'Matelas de carton', emoji: '🛏️', cost: 3,
    hint: 'Trois épaisseurs pliées à la main, calées contre le mur. Le sol arrête de vous voler vos nuits.',
    hintEn: 'Three layers folded by hand, wedged against the wall. The ground stops stealing your nights.',
    make: () => ({
      id: 'craft-matelas', name: 'Matelas de carton', emoji: '🛏️', type: 'tool', value: 5,
      passive: 'Vous ne perdez plus de sommeil pendant la nuit.',
      passiveEn: 'You no longer lose sleep during the night.',
    }),
  },
  {
    id: 'arme-fortune', name: 'Arme de fortune', emoji: '🔩', cost: 2,
    hint: 'Un tuyau, du ruban adhésif, et de quoi cogner. Personne ne voit venir un tuyau.',
    hintEn: 'A pipe, some tape, and something to swing. Nobody sees a pipe coming.',
    make: () => ({
      id: 'craft-arme', name: 'Arme de fortune', emoji: '🔩', type: 'weapon', value: 7, attackBonus: 5, combatStyle: 'heavy',
      passive: 'L\'adversaire ne l\'attend pas : votre premier coup du combat frappe plus fort.',
      passiveEn: 'Your opponent doesn\'t expect it: your first blow of the fight hits harder.',
    }),
  },
  {
    id: 'protection', name: 'Protection de fortune', emoji: '🦺', cost: 3,
    hint: 'Cartons et mousse sanglés au torse. Ridicule, et parfaitement efficace.',
    hintEn: 'Cardboard and foam strapped to your chest. Ridiculous, and perfectly effective.',
    make: () => ({ id: 'craft-protection', name: 'Protection de fortune', emoji: '🦺', type: 'armor', value: 7, defenseBonus: 4 }),
  },
  {
    id: 'trousse', name: 'Trousse de secours bricolée', emoji: '🩹', cost: 3,
    hint: 'De quoi recoller les morceaux quand ça saigne pour de vrai.',
    hintEn: 'Enough to patch yourself up when you really bleed.',
    make: () => ({ id: 'craft-trousse', name: 'Trousse de secours bricolée', emoji: '🩹', type: 'tool', value: 9, effect: { health: 26 } }),
  },
  {
    id: 'talisman', name: 'Talisman de carton', emoji: '🧿', cost: 4,
    hint: 'Une babiole porte-bonheur découpée dans un rabat. On y croit ou on meurt, souvent les deux.',
    hintEn: 'A lucky charm cut from a box flap. You believe in it or you die, often both.',
    make: () => ({ id: 'craft-talisman', name: 'Talisman de carton', emoji: '🧿', type: 'special', value: 6, effect: { mental: 22, dignity: 8 } }),
  },
];

/*
 * L'USURE. Le matériel de carton ne dure pas : chaque nuit où un objet passif
 * a servi, il peut céder. Sans ça, deux fabrications suffisaient à régler la
 * question du sommeil et du froid pour toute la partie, et l'établi
 * redevenait un écran qu'on ne rouvre plus. Le Bricoleur du Dimanche construit
 * plus solide : une chance sur huit au lieu d'une sur quatre.
 */
export const USURE_BASE = 0.25;
export function usureNuit(c: Character): number {
  return hasTrait(c, 'bricoleur') ? USURE_BASE / 2 : USURE_BASE;
}

/** Les objets passifs de l'établi, reconnus par leur identifiant. */
export const PASSIFS_ETABLI = ['craft-rechaud', 'craft-matelas'] as const;

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
