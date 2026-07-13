// ============ ENNEMIS, PROJECTILES & DUEL DE SIGNES ============
import type { Enemy, ProjectilePattern, SignId, Character } from '../types';

export const ENEMIES: Enemy[] = [
  { name: 'Commerçant Furieux', emoji: '😡', health: 32, attack: 11, description: 'Il vous a pris la main dans le sac. Et il a de la poigne.', loot: { respect: 2, item: { id: 'sandwich-confisque', name: 'Sandwich de l\'étal', emoji: '🥪', type: 'food', value: 5, effect: { hunger: 15 } } } },
  { name: 'Rat Géant', emoji: '🐀', health: 20, attack: 8, description: "Un rat de la taille d'un chihuahua. Il n'a pas peur.", loot: { money: 2, respect: 1 } },
  { name: 'Mouette Furibonde', emoji: '🦅', health: 15, attack: 6, description: 'Elle veut votre sandwich. Elle aura votre sandwich.', loot: { respect: 2 } },
  { name: 'Chien Errant', emoji: '🐕', health: 30, attack: 12, description: 'Un molosse sans collier. Ses crocs brillent au clair de lune.', loot: { money: 3, respect: 3 } },
  { name: 'Pigeon Alpha', emoji: '🐦', health: 10, attack: 4, description: 'Le chef du gang de pigeons. Il roucoule avec menace.', loot: { money: 1, respect: 1 } },
  { name: 'Voyou du Coin', emoji: '🧔', health: 40, attack: 15, description: 'Un type louche qui veut votre spot. Négociation impossible.', loot: { money: 8, respect: 5, item: { id: 'couteau-cran', name: 'Couteau à cran usé', emoji: '🔪', type: 'weapon', value: 9, attackBonus: 4, combatStyle: 'precise' } } },
  { name: 'Agent de Sécurité', emoji: '👮', health: 35, attack: 10, description: 'Il fait du zèle. Beaucoup de zèle.', loot: { respect: 4 } },
  { name: 'Chat de Gouttière', emoji: '🐱', health: 12, attack: 7, description: 'Petit mais vicieux. Ses griffes sont des rasoirs.', loot: { money: 1 } },
  { name: 'Raton Laveur', emoji: '🦝', health: 25, attack: 9, description: "Il fouille VOTRE poubelle. L'affront.", loot: { money: 3, respect: 2 } },
  { name: 'Corbeau Géant', emoji: '🐦‍⬛', health: 18, attack: 7, description: 'Noir comme la nuit, méchant comme le jour.', image: '/assets/combat-corbeau-fjv5mmnWmHHKd72RfGopfD.webp', loot: { money: 2, respect: 2, item: { id: 'bague-brillante', name: 'Bague brillante (volée ?)', emoji: '💍', type: 'junk', value: 9 } } },
  { name: 'Ivrogne Agressif', emoji: '🍺', health: 35, attack: 11, description: 'Il titube mais frappe fort. Très fort.', image: '/assets/combat-ivrogne-fnqUTa9w2g29Z7Y8UCPEJQ.webp', loot: { money: 5, respect: 3, item: { id: 'bouteille-ivrogne', name: 'Bouteille (presque) vide', emoji: '🍾', type: 'weapon', value: 4, attackBonus: 3, combatStyle: 'heavy' } } },
  { name: 'Vigile Zélé', emoji: '🔦', health: 38, attack: 12, description: 'Badge, lampe torche, ego surdimensionné.', image: '/assets/combat-vigile-8AYmxD2oRKZLSGj3y3tgdy.webp', loot: { money: 4, respect: 4, item: { id: 'lampe-torche', name: 'Lampe torche du vigile', emoji: '🔦', type: 'tool', value: 7 } } },
  { name: 'Cygne Furieux', emoji: '🦢', health: 22, attack: 9, description: 'Élégant mais mortel. Ne jamais sous-estimer un cygne.', image: '/assets/combat-cygne-Do53kfaKnGAeMKwxEmgUi4.webp', loot: { respect: 3 } },
  { name: 'Clown Sinistre', emoji: '🤡', health: 28, attack: 10, description: 'Son rire résonne dans la nuit. Personne ne rit avec lui.', image: '/assets/combat-clown-Lauu92h5boZ4Z4nRnyDEaT.webp', loot: { money: 6, respect: 4 } },
  { name: 'Écureuil Enragé', emoji: '🐿️', health: 8, attack: 5, description: 'Petit, rapide, et il veut vos noisettes. Vous avez pas de noisettes.', image: '/assets/combat-ecureuil-AN8vTTKVptLec9zLjTGRNw.webp', loot: { money: 1 } },
  { name: 'Oie Territoriale', emoji: '🪿', health: 16, attack: 8, description: 'HONK. Elle défend son territoire avec une rage ancestrale.', image: '/assets/combat-oie-LUVjnB536FgK83afqjVs7X.webp', loot: { respect: 2 } },
  { name: 'Canard Psychopathe', emoji: '🦆', health: 14, attack: 6, description: 'Coin coin... COIN COIN ! Il charge !', image: '/assets/combat-canard-gMZvQxLn7Yofnd5dnr3dZM.webp', loot: { money: 1, respect: 1 } },
  { name: 'Coq de Combat', emoji: '🐓', health: 20, attack: 10, description: 'Réveillé à 4h du matin. Et il est furieux.', image: '/assets/combat-coq-URw8wuYwXEgZPMq4wFjJu2.webp', loot: { money: 3, respect: 2 } },
  { name: 'Chat Territorial', emoji: '😾', health: 15, attack: 8, description: 'Ce coin est à LUI. Et il va vous le prouver.', image: '/assets/combat-chat-territorial-2N2qDLSJ5PEDpR4bibLqqR.webp', loot: { money: 2, respect: 1 } },
  { name: 'Mouette Géante', emoji: '🦅', health: 24, attack: 11, description: 'La mère de toutes les mouettes. Envergure impressionnante.', image: '/assets/combat-mouette-geante-msASE7NG2HZ8VNUAwFqgA3.webp', loot: { money: 4, respect: 3 } },
  { name: 'Raton Laveur Alpha', emoji: '🦝', health: 30, attack: 10, description: 'Le boss des ratons. Il porte un masque naturel de bandit.', image: '/assets/combat-raton-laveur-DV28WgnY4Dw7WEQpakPMzH.webp', loot: { money: 5, respect: 3, item: { id: 'montre-cassee', name: 'Montre cassée (butin du raton)', emoji: '⌚', type: 'junk', value: 6 } } },
  { name: 'Chat Sauvage', emoji: '🐈', health: 18, attack: 9, description: 'Pas de collier, pas de maître, pas de pitié.', image: '/assets/combat-chat-sauvage-fFoiY6tVx6eNamsMbyGbNq.webp', loot: { money: 2, respect: 2 } },
];

// Images (dioramas) des ennemis effectivement affrontés via « Bagarre » mais
// qui n'en avaient pas encore. Nom d'ennemi → fichier à venir dans /assets.
// Repli automatique sur la scène dessinée tant que le fichier est absent.
export const COMBAT_IMAGES: Record<string, string> = {
  'Commerçant Furieux': '/assets/combat-commercant.webp',
  'Rat Géant': '/assets/combat-rat-geant.webp',
  'Mouette Furibonde': '/assets/combat-mouette-furibonde.webp',
  'Chien Errant': '/assets/combat-chien-errant.webp',
  'Pigeon Alpha': '/assets/combat-pigeon-alpha.webp',
  'Voyou du Coin': '/assets/combat-voyou.webp',
  'Agent de Sécurité': '/assets/combat-agent-securite.webp',
  'Chat de Gouttière': '/assets/combat-chat-gouttiere.webp',
  'Raton Laveur': '/assets/combat-raton.webp',
  'Concurrent Agressif': '/assets/combat-concurrent.webp',
  'Pickpocket': '/assets/combat-pickpocket.webp',
  'Squatteur Territorial': '/assets/combat-squatteur.webp',
};

// ============ MOTIFS DE PROJECTILES (phase d'esquive) ============
// Chaque ennemi tire selon un « motif » : type de projectile, cadence,
// trajectoire, vitesse. Le composant DodgeArena lit ce descripteur pour
// générer les vagues. On classe les ennemis par archétype d'après leur
// silhouette (emoji) et leur agressivité.
export const PROJECTILE_PATTERNS: Record<string, ProjectilePattern> = {
  bird:  { id: 'bird',  label: 'Volée furieuse', labelEn: 'Furious flock', kind: 'feather', motion: 'spread', spawnMs: 520, speed: 150, size: 12 },
  brute: { id: 'brute', label: 'Cognée lourde', labelEn: 'Heavy swings', kind: 'fist', motion: 'straight', spawnMs: 700, speed: 130, size: 20 },
  small: { id: 'small', label: 'Assaut vif', labelEn: 'Quick assault', kind: 'claw', motion: 'homing', spawnMs: 460, speed: 175, size: 11 },
  drunk: { id: 'drunk', label: 'Bouteilles en cloche', labelEn: 'Lobbed bottles', kind: 'bottle', motion: 'lob', spawnMs: 640, speed: 120, size: 16 },
  beast: { id: 'beast', label: 'Charge bestiale', labelEn: 'Bestial charge', kind: 'dash', motion: 'homing', spawnMs: 560, speed: 165, size: 15 },
};

// Tous les ennemis « connus » du jeu (fiches canoniques + adversaires de la
// Bagarre) : c'est la liste des fins « Tombé au combat » du Registre des Morts.
export function knownEnemyNames(): string[] {
  const names = new Set<string>(ENEMIES.map(e => e.name));
  Object.keys(COMBAT_IMAGES).forEach(n => names.add(n));
  return Array.from(names);
}

// Choisit le motif d'après l'ennemi (silhouette + stats).
export function getPattern(enemy: { name: string; emoji: string; attack: number; health: number }): string {
  const birds = ['🐦', '🦅', '🦢', '🪿', '🦆', '🐓', '🐦‍⬛'];
  const cats = ['🐱', '😾', '🐈'];
  const small = ['🐀', '🐿️', '🐦'];
  if (birds.includes(enemy.emoji)) return 'bird';
  if (enemy.emoji === '🍺' || /ivrogne/i.test(enemy.name)) return 'drunk';
  if (cats.includes(enemy.emoji) || small.includes(enemy.emoji) || enemy.health <= 16) return 'small';
  if (['🦝', '🐕', '🐀'].includes(enemy.emoji)) return 'beast';
  if (enemy.attack >= 11 || ['🧔', '👮', '🔦', '🤡'].includes(enemy.emoji)) return 'brute';
  return 'beast';
}

// ---- Duel de signes : tendances & indices ----
// Chaque ennemi a ses habitudes au duel, déduites de sa silhouette : les
// vigiles se couvrent, les brutes cognent, les oiseaux feintent… C'est ce qui
// transforme le hasard en lecture : on apprend les ennemis, puis on anticipe.
function signTendency(enemy: { name: string; emoji: string; attack: number; health: number }): Record<SignId, number> {
  if (/vigile|agent|s[ée]curit|commer[çc]ant|polic|concierge/i.test(enemy.name)) {
    return { strike: 0.3, feint: 0.15, guard: 0.55 };
  }
  switch (getPattern(enemy)) {
    case 'bird': return { strike: 0.2, feint: 0.55, guard: 0.25 };
    case 'small': return { strike: 0.3, feint: 0.5, guard: 0.2 };
    case 'drunk': return { strike: 0.5, feint: 0.3, guard: 0.2 };
    case 'beast': return { strike: 0.45, feint: 0.35, guard: 0.2 };
    default: return { strike: 0.55, feint: 0.25, guard: 0.2 }; // brute
  }
}

// Tire le signe de l'ennemi pour la manche et l'indice affiché. L'indice sort
// une fois sur deux (75 % avec un bon flair), dit vrai à 70 %, et devient
// certain quand l'ennemi est sonné (ou après un Pas de Côté).
export function rollSignRound(
  enemy: { name: string; emoji: string; attack: number; health: number },
  character: Character,
  guaranteed: boolean,
): { enemySign: SignId; tellSign: SignId | null; tellSure: boolean } {
  const tendency = signTendency(enemy);
  const all: SignId[] = ['strike', 'feint', 'guard'];
  let r = Math.random();
  let enemySign: SignId = 'strike';
  for (const id of all) { r -= tendency[id]; if (r <= 0) { enemySign = id; break; } }
  const sharp = character.traits.some(t => t.id === 'paranoiaque' || t.id === 'nez-sensible');
  const tellChance = guaranteed ? 1 : 0.5 + (sharp ? 0.25 : 0);
  if (Math.random() >= tellChance) return { enemySign, tellSign: null, tellSure: false };
  const truthful = guaranteed || Math.random() < 0.7;
  const others = all.filter(s => s !== enemySign);
  const tellSign = truthful ? enemySign : others[Math.floor(Math.random() * others.length)];
  return { enemySign, tellSign, tellSure: guaranteed };
}
