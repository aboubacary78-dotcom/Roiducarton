// ============================================================================
// LE REPÉRAGE : cibles de vol par quartier, à trois niveaux de difficulté
// ----------------------------------------------------------------------------
// Avant le casse, le joueur CHOISIT sa cible parmi celles du quartier où il
// se trouve. Chaque cible fixe : le nombre de gardiens de départ, la vitesse
// de montée de l'alerte, l'ampleur des renforts quand on se fait repérer,
// le butin (argent + objet éventuel) et QUI vous tombe dessus en cas d'échec :
//   - 'commercant' → bagarre contre le Commerçant Furieux (battable) ;
//   - 'police'     → garde à vue, amende, journée finie ;
//   - 'vigile'     → combat contre le Vigile de Choc (très dur à battre).
// Le « casier » (stealCount) continue de durcir la surveillance par-dessus.
// ============================================================================
import type { InventoryItem } from '../types';

export type HeistDifficulty = 'petit' | 'risque' | 'grand';
export type HeistCatcher = 'commercant' | 'police' | 'vigile';

export interface HeistTarget {
  id: string;
  location: string;          // id de quartier (voir LOCATIONS)
  difficulty: HeistDifficulty;
  emoji: string;
  label: string; labelEn: string;         // « la buvette du parc » (s'insère dans une phrase)
  desc: string; descEn: string;           // une ligne d'ambiance sur l'écran de repérage
  catcher: HeistCatcher;
  moneyMin: number; moneyMax: number;     // butin de base (tier 'ok')
  // Objet du butin : garanti sur un « coup de maître » (jackpot), sinon 50 %.
  // Les petits coups n'en ont pas, les coups risqués un objet modeste, les
  // grands coups un objet rare qui se revend cher (voir getSellPrice).
  item?: InventoryItem;
}

// Réglages du mini-jeu par difficulté. `spawnP2`/`spawnP3` = nombre de
// renforts-chasseurs qui débarquent quand on se fait repérer (palier Alerte)
// puis au Bouclage (en plus du vigile qui campe la sortie). C'est l'escalade
// « plus on est repéré, plus il y a de gardes », amplifiée sur les grands coups.
export const HEIST_TUNING: Record<HeistDifficulty, {
  guards: number;       // gardiens de départ
  alertMult: number;    // multiplicateur de montée d'alerte
  spawnP2: number;      // renforts-chasseurs au palier Alerte
  spawnP3: number;      // renforts-chasseurs SUPPLÉMENTAIRES au Bouclage
  tickBonus: number;    // accélération des rondes (ms retirées)
  stars: string;
  fr: string; en: string;
}> = {
  petit:  { guards: 1, alertMult: 0.75, spawnP2: 1, spawnP3: 0, tickBonus: 0,  stars: '🟢', fr: 'Petit coup',   en: 'Small job' },
  risque: { guards: 2, alertMult: 1.0,  spawnP2: 1, spawnP3: 1, tickBonus: 20, stars: '🟠', fr: 'Coup risqué',  en: 'Risky job' },
  grand:  { guards: 3, alertMult: 1.35, spawnP2: 2, spawnP3: 1, tickBonus: 45, stars: '🔴', fr: 'Grand coup',   en: 'Big score' },
};

export const HEIST_TARGETS: HeistTarget[] = [
  // ---- 🌳 Parc ----
  {
    id: 'heist-panier-picnic', location: 'parc', difficulty: 'petit', emoji: '🧺',
    label: 'le panier de pique-nique', labelEn: 'the picnic basket',
    desc: 'Une famille joue au badminton à trente mètres de son panier. Le badminton, ça absorbe.',
    descEn: 'A family plays badminton thirty meters from their basket. Badminton is absorbing.',
    catcher: 'commercant', moneyMin: 2, moneyMax: 5,
  },
  {
    id: 'heist-glacier-parc', location: 'parc', difficulty: 'risque', emoji: '🍦',
    label: 'la caisse du glacier', labelEn: 'the ice cream man\'s till',
    desc: 'Le glacier tourne le dos à sa caisse à chaque cornet, et il y a la queue.',
    descEn: 'The ice cream man turns his back on the till with every cone. Three seconds per cone.',
    catcher: 'commercant', moneyMin: 6, moneyMax: 12,
    item: { id: 'sorbet-artisanal', name: 'Sorbet artisanal', emoji: '🍦', type: 'food', value: 4, effect: { hunger: 8, mental: 8, thirst: 6 } },
  },
  {
    id: 'heist-buvette-parc', location: 'parc', difficulty: 'grand', emoji: '🍋',
    label: 'la recette de la buvette', labelEn: 'the refreshment stand\'s takings',
    desc: 'La fête locale bat son plein et la caisse déborde. La sécurité de l\'événement aussi.',
    descEn: 'The local fair is in full swing and the till is overflowing. So is event security.',
    catcher: 'vigile', moneyMin: 15, moneyMax: 25,
    item: { id: 'fut-limonade', name: 'Fût de limonade', emoji: '🍋', type: 'special', value: 15, effect: { thirst: 20, mental: 6 } },
  },
  // ---- 🏙️ Centre-ville ----
  {
    id: 'heist-terrasse-centre', location: 'centre-ville', difficulty: 'petit', emoji: '☕',
    label: 'les pourboires de la terrasse', labelEn: 'the terrace tips',
    desc: 'Les soucoupes s\'accumulent, le serveur est seul et le service bat son plein.',
    descEn: 'The saucers pile up, the waiter is alone and service is at its peak.',
    catcher: 'commercant', moneyMin: 2, moneyMax: 5,
  },
  {
    id: 'heist-superette-centre', location: 'centre-ville', difficulty: 'risque', emoji: '🛒',
    label: 'la supérette du coin', labelEn: 'the corner minimart',
    desc: 'Un seul employé, des rayons hauts, une caméra qui pend par son câble depuis mars.',
    descEn: 'One employee, tall shelves, a camera dangling from its cable since March.',
    catcher: 'police', moneyMin: 6, moneyMax: 12,
    item: { id: 'sac-courses', name: 'Sac de courses garni', emoji: '🛒', type: 'food', value: 5, effect: { hunger: 18, thirst: 6 } },
  },
  {
    id: 'heist-boutique-telephones', location: 'centre-ville', difficulty: 'grand', emoji: '📱',
    label: 'la boutique de téléphones', labelEn: 'the phone store',
    desc: 'Des vitrines blindées, des portiques, et des vigiles qui s\'ennuient. S\'ennuyaient.',
    descEn: 'Armored displays, security gates, and bored guards. Formerly bored.',
    catcher: 'vigile', moneyMin: 15, moneyMax: 25,
    item: { id: 'smartphone-blister', name: 'Smartphone sous blister', emoji: '📱', type: 'special', value: 30 },
  },
  // ---- 🛒 Marché ----
  {
    id: 'heist-etal-marche', location: 'marche', difficulty: 'petit', emoji: '🍎',
    label: 'l\'étal du primeur', labelEn: 'the greengrocer\'s stall',
    desc: 'Le primeur hurle ses promos, dos aux cagettes, la voix couverte par sa propre sono.',
    descEn: 'The greengrocer bellows his deals, back to the crates. A classic of the trade.',
    catcher: 'commercant', moneyMin: 2, moneyMax: 5,
  },
  {
    id: 'heist-fromager-marche', location: 'marche', difficulty: 'risque', emoji: '🧀',
    label: 'le stand du fromager', labelEn: 'the cheesemonger\'s stand',
    desc: 'Les tommes trônent à portée de main. Le fromager a des yeux partout et un couteau à pâte dure.',
    descEn: 'The wheels sit within arm\'s reach. The cheesemonger has eyes everywhere and a hard-cheese knife.',
    catcher: 'commercant', moneyMin: 6, moneyMax: 12,
    item: { id: 'tomme-entiere', name: 'Tomme entière', emoji: '🧀', type: 'food', value: 6, effect: { hunger: 22, mental: 4 } },
  },
  {
    id: 'heist-caisse-marche', location: 'marche', difficulty: 'grand', emoji: '💶',
    label: 'la caisse commune du marché', labelEn: 'the market\'s common till',
    desc: 'Le placier collecte les emplacements en liquide. Sa sacoche pèse lourd, son sifflet alerte tout le marché.',
    descEn: 'The market officer collects pitch fees in cash. His satchel is heavy; his whistle alerts the whole market.',
    catcher: 'police', moneyMin: 15, moneyMax: 25,
    item: { id: 'balance-placier', name: 'Balance du placier', emoji: '⚖️', type: 'special', value: 18 },
  },
  // ---- 🚂 Gare ----
  {
    id: 'heist-sacoche-gare', location: 'gare', difficulty: 'petit', emoji: '👜',
    label: 'la sacoche oubliée sur un banc', labelEn: 'the bag left on a bench',
    desc: 'Son propriétaire s\'est endormi deux bancs plus loin, bercé par les annonces de retard.',
    descEn: 'Its owner fell asleep two benches away, lulled by the delay announcements.',
    catcher: 'police', moneyMin: 2, moneyMax: 5,
  },
  {
    id: 'heist-sandwicherie-gare', location: 'gare', difficulty: 'risque', emoji: '🥪',
    label: 'la sandwicherie du quai', labelEn: 'the platform sandwich shop',
    desc: 'Le coup de feu de midi : deux employés débordés, une vitrine ouverte, un flux continu de pressés.',
    descEn: 'The lunch rush: two swamped employees, an open display, a steady stream of people in a hurry.',
    catcher: 'commercant', moneyMin: 6, moneyMax: 12,
    item: { id: 'lot-sandwichs', name: 'Lot de sandwichs', emoji: '🥪', type: 'food', value: 5, effect: { hunger: 24 } },
  },
  {
    id: 'heist-consigne-gare', location: 'gare', difficulty: 'grand', emoji: '🧳',
    label: 'la consigne à bagages', labelEn: 'the left-luggage office',
    desc: 'Des valises pleines de vies entières, derrière un rideau de fer et la sécurité ferroviaire.',
    descEn: 'Suitcases full of entire lives, behind a metal shutter and railway security.',
    catcher: 'vigile', moneyMin: 15, moneyMax: 25,
    item: { id: 'valise-oubliee', name: 'Valise oubliée', emoji: '🧳', type: 'special', value: 22, effect: { dignity: 5 } },
  },
  // ---- 🏭 Zone industrielle ----
  {
    id: 'heist-cuivre-zone', location: 'zone-industrielle', difficulty: 'petit', emoji: '🔌',
    label: 'le cuivre qui traîne', labelEn: 'the copper lying around',
    desc: 'Des chutes de câble près de la benne, et un gardien qui fait sa ronde toutes les heures. Il est l\'heure moins le quart.',
    descEn: 'Cable offcuts by the dumpster, and a watchman doing hourly rounds. It\'s quarter to the hour.',
    catcher: 'police', moneyMin: 2, moneyMax: 5,
  },
  {
    id: 'heist-entrepot-zone', location: 'zone-industrielle', difficulty: 'risque', emoji: '🍺',
    label: 'l\'entrepôt de boissons', labelEn: 'the beverage warehouse',
    desc: 'Des palettes de packs jusqu\'au plafond, un cariste distrait, un quai de chargement béant.',
    descEn: 'Pallets of drink packs to the ceiling, a distracted forklift driver, a gaping loading dock.',
    catcher: 'commercant', moneyMin: 6, moneyMax: 12,
    item: { id: 'pack-biere', name: 'Pack de bière', emoji: '🍺', type: 'food', value: 6, effect: { thirst: 14, mental: 8, health: -2 } },
  },
  {
    id: 'heist-camion-zone', location: 'zone-industrielle', difficulty: 'grand', emoji: '🚚',
    label: 'le camion de livraison', labelEn: 'the delivery truck',
    desc: 'Chargé à ras bord, moteur tournant, chauffeur au téléphone. La société de gardiennage patrouille.',
    descEn: 'Loaded to the brim, engine running, driver on the phone. The security company is on patrol.',
    catcher: 'vigile', moneyMin: 15, moneyMax: 25,
    item: { id: 'carton-marchandises', name: 'Carton de marchandises', emoji: '📦', type: 'special', value: 20 },
  },
];

// Les cibles disponibles dans un quartier (toujours 3 : petit, risqué, grand).
export function heistTargetsFor(location: string): HeistTarget[] {
  const t = HEIST_TARGETS.filter(h => h.location === location);
  return t.length ? t : HEIST_TARGETS.slice(0, 3);
}

export function getHeistTarget(id: string): HeistTarget | undefined {
  return HEIST_TARGETS.find(h => h.id === id);
}
