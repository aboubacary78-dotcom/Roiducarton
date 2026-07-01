import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';

// ============ TYPES ============
export interface Job {
  id: string;
  name: string;
  description: string;
  bonusStats: Partial<Stats>;
  bonusSkills: string[];
  startingItems: string[];
  emoji: string;
}

export interface Trait {
  id: string;
  name: string;
  description: string;
  positive: boolean;
  effects: Partial<Stats>;
  emoji: string;
}

export interface Stats {
  health: number;
  mental: number;
  hunger: number;
  thirst: number;
  sleep: number;
  dignity: number;
}

export interface Character {
  name: string;
  job: Job;
  traits: [Trait, Trait];
  stats: Stats;
  money: number;
  respect: number;
  inventory: InventoryItem[];
  skills: Record<string, number>;
  day: number;
  location: string;
  alive: boolean;
  activeFlags: string[];
  // Graine unique servant à générer le visage du personnage (voir CardboardAvatar).
  seed: string;
  // Genre déduit du prénom, pour que le visage corresponde (pas de barbe sur une femme, etc.).
  gender: 'm' | 'f';
}

export interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  type: 'food' | 'weapon' | 'armor' | 'tool' | 'junk' | 'special';
  value: number;
  effect?: Partial<Stats>;
  attackBonus?: number;
  defenseBonus?: number;
  // Style de combat de l'arme (influence le ciblage des points faibles) :
  // 'precise' = lames (critiques renforcés, ratés coûteux),
  // 'heavy'   = armes contondantes (même un raté fait mal, critiques moindres).
  // Absent = équilibré (mains nues / arme passe-partout).
  combatStyle?: 'precise' | 'heavy';
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
  type: 'narrative' | 'combat' | 'discovery' | 'social';
  location?: string;
  image?: string;
  requiresFlag?: string;
  isFollowUp?: boolean;
}

export interface EventChoice {
  text: string;
  risk: 'safe' | 'normal' | 'risky';
  emoji: string;
  requirements?: { skill?: string; item?: string; stat?: keyof Stats; minValue?: number };
  outcomes: EventOutcome[];
}

export interface EventOutcome {
  probability: number;
  text: string;
  statChanges?: Partial<Stats>;
  moneyChange?: number;
  respectChange?: number;
  itemGain?: InventoryItem;
  itemLoss?: string;
  addFlag?: string;
  removeFlag?: string;
  followUpEventId?: string;
}

export interface CombatZone {
  id: string;
  label: string;
  emoji: string;
}

export interface CombatState {
  enemyName: string;
  enemyEmoji: string;
  enemyHealth: number;
  enemyMaxHealth: number;
  enemyAttack: number;
  description: string;
  playerWeapon?: InventoryItem;
  zones: CombatZone[];
  weakPointId: string;
  weakPointHint: string;
}

export type GameScreen = 'title' | 'character-select' | 'main' | 'event' | 'combat' | 'travel' | 'inventory' | 'craft' | 'game-over' | 'day-summary' | 'shop' | 'settings';

// ============ MÉTÉO ============
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'storm' | 'heatwave' | 'fog' | 'snow';

export interface Weather {
  type: WeatherType;
  label: string;
  emoji: string;
  description: string;
  // Décay supplémentaire par jour
  dailyPenalty: Partial<Stats>;
  // Modificateur sur les actions (ex: mendier rapporte moins sous la pluie)
  actionModifier: number; // 0.5 = moitié moins de gains, 1.5 = 50% de plus
  // Couleur du filtre visuel
  filter: string;
  // Opacité du filtre
  filterOpacity: number;
}

export const WEATHER_TYPES: Record<WeatherType, Weather> = {
  sunny: {
    type: 'sunny',
    label: 'Ensoleillé',
    emoji: '☀️',
    description: 'Une belle journée. Profitez-en, ça ne dure pas.',
    dailyPenalty: { thirst: -5 },
    actionModifier: 1.2,
    filter: 'rgba(255, 200, 50, 0)',
    filterOpacity: 0,
  },
  cloudy: {
    type: 'cloudy',
    label: 'Nuageux',
    emoji: '☁️',
    description: 'Gris et morne. Comme votre humeur.',
    dailyPenalty: { mental: -3 },
    actionModifier: 1.0,
    filter: 'rgba(150, 150, 170, 0.12)',
    filterOpacity: 0.12,
  },
  rainy: {
    type: 'rainy',
    label: 'Pluie',
    emoji: '🌧️',
    description: 'La pluie s\'infiltre partout. Vos affaires sont trempées.',
    dailyPenalty: { sleep: -10, health: -5, dignity: -8 },
    actionModifier: 0.7,
    filter: 'rgba(60, 100, 180, 0.18)',
    filterOpacity: 0.18,
  },
  storm: {
    type: 'storm',
    label: 'Orage',
    emoji: '⛈️',
    description: 'Tonnerre et éclairs. Impossible de rester dehors.',
    dailyPenalty: { sleep: -18, health: -10, mental: -12, dignity: -10 },
    actionModifier: 0.4,
    filter: 'rgba(30, 50, 120, 0.28)',
    filterOpacity: 0.28,
  },
  heatwave: {
    type: 'heatwave',
    label: 'Canicule',
    emoji: '🌡️',
    description: 'La chaleur est écrasante. La soif vous dévore.',
    dailyPenalty: { thirst: -20, health: -8, mental: -5 },
    actionModifier: 0.8,
    filter: 'rgba(220, 80, 20, 0.15)',
    filterOpacity: 0.15,
  },
  fog: {
    type: 'fog',
    label: 'Brouillard',
    emoji: '🌫️',
    description: 'On ne voit pas à deux mètres. Dangereux.',
    dailyPenalty: { mental: -6, sleep: -5 },
    actionModifier: 0.85,
    filter: 'rgba(200, 200, 210, 0.22)',
    filterOpacity: 0.22,
  },
  snow: {
    type: 'snow',
    label: 'Neige',
    emoji: '❄️',
    description: 'Le froid est mortel pour les sans-abri. Survivez.',
    dailyPenalty: { health: -15, sleep: -20, hunger: -10, dignity: -5 },
    actionModifier: 0.5,
    filter: 'rgba(180, 210, 240, 0.25)',
    filterOpacity: 0.25,
  },
};

// Transitions météo logiques : quelles météos peuvent suivre quelle météo
const WEATHER_TRANSITIONS: Record<WeatherType, { type: WeatherType; weight: number }[]> = {
  sunny:    [{ type: 'sunny', weight: 30 }, { type: 'cloudy', weight: 35 }, { type: 'heatwave', weight: 15 }, { type: 'fog', weight: 10 }, { type: 'rainy', weight: 10 }],
  cloudy:   [{ type: 'cloudy', weight: 20 }, { type: 'sunny', weight: 25 }, { type: 'rainy', weight: 30 }, { type: 'fog', weight: 15 }, { type: 'storm', weight: 10 }],
  rainy:    [{ type: 'rainy', weight: 25 }, { type: 'storm', weight: 20 }, { type: 'cloudy', weight: 35 }, { type: 'fog', weight: 15 }, { type: 'sunny', weight: 5 }],
  storm:    [{ type: 'rainy', weight: 40 }, { type: 'cloudy', weight: 35 }, { type: 'storm', weight: 15 }, { type: 'fog', weight: 10 }],
  heatwave: [{ type: 'heatwave', weight: 35 }, { type: 'sunny', weight: 30 }, { type: 'storm', weight: 20 }, { type: 'cloudy', weight: 15 }],
  fog:      [{ type: 'fog', weight: 20 }, { type: 'cloudy', weight: 35 }, { type: 'rainy', weight: 25 }, { type: 'sunny', weight: 20 }],
  snow:     [{ type: 'snow', weight: 30 }, { type: 'fog', weight: 25 }, { type: 'cloudy', weight: 30 }, { type: 'rainy', weight: 15 }],
};

export function getNextWeather(current: WeatherType): WeatherType {
  const transitions = WEATHER_TRANSITIONS[current];
  const totalWeight = transitions.reduce((sum, t) => sum + t.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const t of transitions) {
    rand -= t.weight;
    if (rand <= 0) return t.type;
  }
  return 'cloudy';
}

export function getInitialWeather(): WeatherType {
  const types: WeatherType[] = ['sunny', 'sunny', 'cloudy', 'cloudy', 'rainy', 'fog'];
  return types[Math.floor(Math.random() * types.length)];
}

// ============ RESPECT & MARCHANDAGE ============
export function getDiscount(respect: number): number {
  if (respect >= 80) return 0.30;
  if (respect >= 50) return 0.25;
  if (respect >= 30) return 0.15;
  if (respect >= 20) return 0.10;
  if (respect >= 10) return 0.05;
  return 0;
}

export function getDiscountedPrice(basePrice: number, respect: number): number {
  if (basePrice === 0) return 0;
  const discount = getDiscount(respect);
  return Math.max(1, Math.round(basePrice * (1 - discount)));
}

export function getDiscountLabel(respect: number): string | null {
  const d = getDiscount(respect);
  if (d === 0) return null;
  return `-${Math.round(d * 100)}%`;
}

// ============ SHOP EVENTS ============
export interface ShopEvent {
  id: string;
  shopId: string;
  text: string;
  probability: number;
  outcomes: {
    text: string;
    statChanges?: Partial<Stats>;
    moneyChange?: number;
    respectChange?: number;
    itemGain?: InventoryItem;
  }[];
}

export const SHOP_EVENTS: ShopEvent[] = [
  {
    id: 'kebab-job', shopId: 'kebab', text: 'Le kebabier vous regarde et dit : "Tu reviens souvent. Tu veux bosser un peu ?"',
    probability: 0.12,
    outcomes: [
      { text: 'Vous aidez \u00e0 la plonge pendant une heure. Le kebabier vous paye et vous offre un repas.', moneyChange: 5, statChanges: { hunger: 30, dignity: 5 }, respectChange: 3 },
    ],
  },
  {
    id: 'brocanteur-objet-rare', shopId: 'brocanteur', text: 'Le brocanteur fouille sous son comptoir : "J\'ai un truc sp\u00e9cial pour toi..."',
    probability: 0.10,
    outcomes: [
      { text: 'Il vous montre un m\u00e9daillon ancien. "Prends-le, \u00e7a te portera chance."', respectChange: 2, itemGain: { id: 'medaillon-ancien', name: 'M\u00e9daillon ancien', emoji: '\ud83e\uddff', type: 'special', value: 15 } },
    ],
  },
  {
    id: 'boulangerie-invendu', shopId: 'boulangerie', text: 'La boulang\u00e8re vous fait signe discr\u00e8tement.',
    probability: 0.15,
    outcomes: [
      { text: '"Tiens, les invendus du jour. Faut pas gaspiller." Elle vous donne un sac de viennoiseries.', statChanges: { hunger: 25, mental: 10 }, respectChange: 1 },
    ],
  },
  {
    id: 'pharmacie-conseil', shopId: 'pharmacie', text: 'Le pharmacien vous examine d\'un \u0153il bienveillant.',
    probability: 0.12,
    outcomes: [
      { text: '"Attendez, je vais vous donner des \u00e9chantillons gratuits." Il vous tend des vitamines et du d\u00e9sinfectant.', statChanges: { health: 15, mental: 5 } },
    ],
  },
  {
    id: 'marche-puces-trouvaille', shopId: 'marche-aux-puces', text: 'En fouillant les \u00e9tals, vous rep\u00e9rez quelque chose de brillant.',
    probability: 0.10,
    outcomes: [
      { text: 'Une montre qui fonctionne encore ! Le vendeur ne l\'avait pas remarqu\u00e9e.', itemGain: { id: 'montre-trouvee', name: 'Montre trouv\u00e9e', emoji: '\u231a', type: 'special', value: 12 }, statChanges: { dignity: 5 } },
    ],
  },
  {
    id: 'epicerie-tombola', shopId: 'epicerie', text: 'L\'\u00e9picier sort un carton : "Tombola gratuite pour les clients r\u00e9guliers !"',
    probability: 0.10,
    outcomes: [
      { text: 'Vous grattez le ticket et... gagn\u00e9 ! Un bon d\'achat de 3\u20ac.', moneyChange: 3, statChanges: { mental: 8 } },
    ],
  },
  {
    id: 'herboriste-secret', shopId: 'herboriste', text: 'L\'herboriste vous observe longuement, puis sourit.',
    probability: 0.12,
    outcomes: [
      { text: '"Je vois que tu as besoin d\'un remontant sp\u00e9cial." Elle vous pr\u00e9pare une potion myst\u00e9rieuse.', statChanges: { health: 10, mental: 15, sleep: 10 }, respectChange: 1 },
    ],
  },
  {
    id: 'laverie-rencontre', shopId: 'laverie', text: 'Un autre habitu\u00e9 de la laverie engage la conversation.',
    probability: 0.15,
    outcomes: [
      { text: '"Moi aussi j\'ai connu la rue. Tiens, prends \u00e7a." Il vous donne quelques pi\u00e8ces.', moneyChange: 2, respectChange: 2, statChanges: { mental: 10 } },
    ],
  },
  {
    id: 'distributeur-bug', shopId: 'distributeur', text: 'Le distributeur fait un bruit bizarre...',
    probability: 0.08,
    outcomes: [
      { text: 'Il crache deux articles au lieu d\'un ! Jackpot !', statChanges: { hunger: 15, thirst: 15, mental: 5 } },
    ],
  },
  {
    id: 'fontaine-piece', shopId: 'fontaine', text: 'Vous apercevez quelque chose briller au fond de la fontaine.',
    probability: 0.15,
    outcomes: [
      { text: 'Des pi\u00e8ces jet\u00e9es par des touristes ! Vous en r\u00e9cup\u00e9rez quelques-unes.', moneyChange: 3, statChanges: { dignity: -3 } },
    ],
  },
];

export function getShopEvent(shopId: string): ShopEvent | null {
  const events = SHOP_EVENTS.filter(e => e.shopId === shopId);
  for (const event of events) {
    if (Math.random() < event.probability) return event;
  }
  return null;
}

// ============ SHOP DATA ============
export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  description: string;
  category: 'food' | 'drink' | 'medicine' | 'weapon' | 'tool' | 'clothing' | 'special';
  effect?: Partial<Stats>;
  giveItem?: InventoryItem;
  oneTimePurchase?: boolean;
}

export interface Shop {
  id: string;
  name: string;
  emoji: string;
  description: string;
  locations: string[];
  items: ShopItem[];
}

export const SHOPS: Shop[] = [
  {
    id: 'boulangerie', name: 'Boulangerie du Coin', emoji: '🥖',
    description: 'Le pain de la veille, mais à prix cassé.',
    locations: ['centre-ville', 'marche', 'gare'],
    items: [
      { id: 'pain-rassis', name: 'Pain rassis', emoji: '🥖', price: 1, description: 'Dur comme la vie, mais nourrissant.', category: 'food', effect: { hunger: 15 } },
      { id: 'croissant', name: 'Croissant du matin', emoji: '🥐', price: 2, description: 'Encore tiède. Un luxe.', category: 'food', effect: { hunger: 20, mental: 5 } },
      { id: 'sandwich-jambon', name: 'Sandwich jambon-beurre', emoji: '🥪', price: 3, description: 'Le classique indémodable.', category: 'food', effect: { hunger: 30, mental: 3 } },
      { id: 'gateau-sec', name: 'Gâteau sec', emoji: '🍪', price: 1, description: 'Croquant et réconfortant.', category: 'food', effect: { hunger: 10, mental: 5 } },
    ],
  },
  {
    id: 'epicerie', name: 'Épicerie de Nuit', emoji: '🏪',
    description: 'Ouverte 24h/24. Prix majorés, mais pratique.',
    locations: ['centre-ville', 'gare'],
    items: [
      { id: 'bouteille-eau', name: "Bouteille d'eau", emoji: '💧', price: 1, description: "De l'eau. Juste de l'eau. C'est déjà bien.", category: 'drink', effect: { thirst: 25 } },
      { id: 'canette-soda', name: 'Canette de soda', emoji: '🥤', price: 2, description: 'Sucré, pétillant, et plein de bulles.', category: 'drink', effect: { thirst: 20, hunger: 5, mental: 3 } },
      { id: 'conserve-ravioli', name: 'Conserve de raviolis', emoji: '🥫', price: 3, description: 'Le repas du roi (du carton).', category: 'food', effect: { hunger: 35 } },
      { id: 'biere', name: 'Bière pas chère', emoji: '🍺', price: 2, description: 'Réchauffe le corps, embrume l\'esprit.', category: 'drink', effect: { thirst: 15, mental: 8, health: -3 } },
      { id: 'briquet', name: 'Briquet', emoji: '🔥', price: 2, description: 'Indispensable pour les nuits froides.', category: 'tool', giveItem: { id: 'briquet', name: 'Briquet', emoji: '🔥', type: 'tool', value: 4 } },
      { id: 'parapluie-casse', name: 'Parapluie cassé', emoji: '☂️', price: 1, description: 'Ne protège que la moitié. Mais quelle moitié !', category: 'tool', giveItem: { id: 'parapluie-casse', name: 'Parapluie cassé', emoji: '☂️', type: 'tool', value: 2 } },
    ],
  },
  {
    id: 'pharmacie', name: 'Pharmacie Populaire', emoji: '💊',
    description: 'Soins basiques à prix réduit.',
    locations: ['centre-ville'],
    items: [
      { id: 'pansement', name: 'Boîte de pansements', emoji: '🩹', price: 3, description: 'Pour les petits bobos du quotidien.', category: 'medicine', effect: { health: 15 } },
      { id: 'aspirine', name: 'Aspirine', emoji: '💊', price: 2, description: 'Contre les maux de tête et les coups.', category: 'medicine', effect: { health: 10, mental: 5 } },
      { id: 'sirop-toux', name: 'Sirop pour la toux', emoji: '🍯', price: 4, description: 'Goût horrible, efficacité prouvée.', category: 'medicine', effect: { health: 20 } },
      { id: 'creme-solaire', name: 'Crème solaire périmée', emoji: '🧴', price: 1, description: 'Périmée depuis 2019, mais ça protège un peu.', category: 'medicine', effect: { health: 5, dignity: 3 } },
    ],
  },
  {
    id: 'marche-aux-puces', name: 'Marché aux Puces', emoji: '🧥',
    description: 'Vêtements et objets de seconde main.',
    locations: ['marche', 'zone-industrielle'],
    items: [
      { id: 'manteau-occasion', name: "Manteau d'occasion", emoji: '🧥', price: 5, description: 'Chaud et presque propre.', category: 'clothing', effect: { health: 5, dignity: 10, sleep: 5 }, giveItem: { id: 'manteau-occasion', name: "Manteau d'occasion", emoji: '🧥', type: 'armor', value: 8, defenseBonus: 2 } },
      { id: 'chaussures-usees', name: 'Chaussures usées', emoji: '👟', price: 3, description: 'Trouées mais fonctionnelles.', category: 'clothing', effect: { dignity: 5, health: 3 } },
      { id: 'bonnet-laine', name: 'Bonnet en laine', emoji: '🧢', price: 2, description: 'Tricoté main. Couleur douteuse.', category: 'clothing', effect: { dignity: 3, mental: 3, sleep: 3 } },
      { id: 'sac-dos-troue', name: 'Sac à dos troué', emoji: '🎒', price: 4, description: 'Augmente la capacité de transport. Enfin, un peu.', category: 'tool', giveItem: { id: 'sac-dos-troue', name: 'Sac à dos troué', emoji: '🎒', type: 'tool', value: 6 } },
    ],
  },
  {
    id: 'brocanteur', name: 'Le Brocanteur Louche', emoji: '🗡️',
    description: 'Il vend de tout. Surtout du n\'importe quoi.',
    locations: ['zone-industrielle', 'gare'],
    items: [
      { id: 'batte-baseball', name: 'Batte de baseball fissurée', emoji: '🏏', price: 6, description: 'Arme lourde : même un coup mal ajusté fait mal. Elle a connu des crânes.', category: 'weapon', giveItem: { id: 'batte-baseball', name: 'Batte de baseball fissurée', emoji: '🏏', type: 'weapon', value: 10, attackBonus: 6, combatStyle: 'heavy' } },
      { id: 'couteau-rouille', name: 'Couteau rouillé', emoji: '🔪', price: 4, description: 'Arme précise : critiques dévastateurs, mais il faut viser juste. Tétanos en bonus.', category: 'weapon', giveItem: { id: 'couteau-rouille', name: 'Couteau rouillé', emoji: '🔪', type: 'weapon', value: 7, attackBonus: 5, combatStyle: 'precise' } },
      { id: 'gilet-protection', name: 'Gilet de protection', emoji: '🦺', price: 8, description: 'Ancien gilet de chantier. Absorbe les coups.', category: 'clothing', giveItem: { id: 'gilet-protection', name: 'Gilet de protection', emoji: '🦺', type: 'armor', value: 12, defenseBonus: 5 } },
      { id: 'lampe-torche', name: 'Lampe torche', emoji: '🔦', price: 3, description: 'Les piles sont presque mortes.', category: 'tool', giveItem: { id: 'lampe-torche', name: 'Lampe torche', emoji: '🔦', type: 'tool', value: 5 } },
    ],
  },
  {
    id: 'fontaine', name: 'Fontaine Publique', emoji: '⛲',
    description: 'Gratuite. Enfin presque.',
    locations: ['parc'],
    items: [
      { id: 'eau-fontaine', name: 'Eau de la fontaine', emoji: '💦', price: 0, description: "Gratuite et fraîche. Un miracle urbain.", category: 'drink', effect: { thirst: 15 } },
    ],
  },
  {
    id: 'distributeur', name: 'Distributeur Automatique', emoji: '🤖',
    description: 'Accepte les pièces. Parfois.',
    locations: ['gare', 'centre-ville'],
    items: [
      { id: 'cafe-machine', name: 'Café de la machine', emoji: '☕', price: 1, description: 'Imbuvable mais ça réveille.', category: 'drink', effect: { thirst: 10, sleep: -10, mental: 5 } },
      { id: 'barre-chocolat', name: 'Barre chocolatée', emoji: '🍫', price: 2, description: 'Calories et réconfort en barre.', category: 'food', effect: { hunger: 15, mental: 8 } },
      { id: 'chips', name: 'Paquet de chips', emoji: '🥔', price: 1, description: 'Salé, croustillant, addictif.', category: 'food', effect: { hunger: 10, thirst: -5 } },
    ],
  },
  {
    id: 'kebab', name: 'Kebab du Quartier', emoji: '🥙',
    description: 'Le meilleur rapport qualité-prix de la ville.',
    locations: ['centre-ville', 'gare', 'zone-industrielle'],
    items: [
      { id: 'kebab-frites', name: 'Kebab-frites', emoji: '🥙', price: 5, description: 'Le festin des rois. Du carton.', category: 'food', effect: { hunger: 45, mental: 10, dignity: 3 } },
      { id: 'frites-seules', name: 'Cornet de frites', emoji: '🍟', price: 2, description: 'Grasses à souhait. Délicieuses.', category: 'food', effect: { hunger: 20, mental: 5 } },
      { id: 'boisson-kebab', name: 'Boisson fraîche', emoji: '🥤', price: 1, description: 'Pour faire passer le kebab.', category: 'drink', effect: { thirst: 25 } },
    ],
  },
  {
    id: 'laverie', name: 'Laverie Automatique', emoji: '🧺',
    description: 'Lavez vos vêtements. Retrouvez votre dignité.',
    locations: ['centre-ville', 'gare'],
    items: [
      { id: 'lavage-vetements', name: 'Lavage de vêtements', emoji: '👕', price: 3, description: 'Propre pendant au moins 2 jours.', category: 'special', effect: { dignity: 20, mental: 5 } },
    ],
  },
  {
    id: 'herboriste', name: 'Herboriste du Parc', emoji: '🌿',
    description: 'Remèdes naturels et tisanes.',
    locations: ['parc', 'marche'],
    items: [
      { id: 'tisane-calmante', name: 'Tisane calmante', emoji: '🍵', price: 2, description: 'Apaise les nerfs et réchauffe le cœur.', category: 'drink', effect: { mental: 15, thirst: 10, sleep: 5 } },
      { id: 'onguent-plantes', name: 'Onguent de plantes', emoji: '🌱', price: 3, description: 'Ça pique, ça gratte, mais ça soigne.', category: 'medicine', effect: { health: 12 } },
      { id: 'bouquet-fleurs', name: 'Bouquet de fleurs sauvages', emoji: '💐', price: 1, description: 'Pour le moral. Ou pour revendre.', category: 'special', effect: { mental: 10, dignity: 5 } },
    ],
  },
];

export function getShopsForLocation(location: string): Shop[] {
  return SHOPS.filter(shop => shop.locations.includes(location));
}

export interface GameState {
  screen: GameScreen;
  character: Character | null;
  characterChoices: Character[];
  currentEvent: GameEvent | null;
  currentCombat: CombatState | null;
  eventResult: { text: string; statChanges?: Partial<Stats>; moneyChange?: number; respectChange?: number; doubled?: boolean } | null;
  combatLog: string[];
  dayActions: number;
  maxDayActions: number;
  highScores: { name: string; days: number; score: number }[];
  pendingFollowUp: string | null;
  weather: WeatherType;
}

// ============ DATA ============
const NAMES = [
  'Marcel', 'Gérard', 'Lucienne', 'Albert', 'Yvette', 'René', 'Josette', 'Fernand',
  'Ginette', 'Maurice', 'Colette', 'Raymond', 'Simone', 'Jean-Claude', 'Bernadette',
  'Didier', 'Monique', 'Thierry', 'Huguette', 'Patrick'
];

// Prénoms féminins (pour que le visage corresponde au prénom).
const FEMALE_NAMES = new Set([
  'Lucienne', 'Yvette', 'Josette', 'Ginette', 'Colette', 'Simone',
  'Bernadette', 'Monique', 'Huguette',
]);

export function genderFromName(name: string): 'm' | 'f' {
  return FEMALE_NAMES.has(name) ? 'f' : 'm';
}

export const JOBS: Job[] = [
  { id: 'comptable', name: 'Ancien Comptable', description: 'Les chiffres, ça le connaît. Les poubelles, un peu moins.', bonusStats: { dignity: 10 }, bonusSkills: ['negociation'], startingItems: ['calculatrice'], emoji: '🧮' },
  { id: 'ouvrier', name: 'Ancien Ouvrier', description: 'Des mains en or et un dos en compote.', bonusStats: { health: 10 }, bonusSkills: ['artisanat'], startingItems: ['cle-molette'], emoji: '🔧' },
  { id: 'professeur', name: 'Ancien Professeur', description: 'Il corrige encore les fautes sur les panneaux.', bonusStats: { mental: 15 }, bonusSkills: ['persuasion'], startingItems: ['livre'], emoji: '📚' },
  { id: 'sommelier', name: 'Ancien Sommelier', description: "Peut distinguer un Bordeaux d'un jus de poubelle. Parfois.", bonusStats: { hunger: 10 }, bonusSkills: ['detection'], startingItems: ['tire-bouchon'], emoji: '🍷' },
  { id: 'cascadeur', name: 'Ancien Cascadeur', description: 'Tombe de haut. Littéralement et figurativement.', bonusStats: { health: 5 }, bonusSkills: ['agilite'], startingItems: ['genouillere'], emoji: '🤸' },
  { id: 'informaticien', name: 'Ancien Informaticien', description: 'Cherche encore le WiFi gratuit.', bonusStats: { mental: 10 }, bonusSkills: ['piratage'], startingItems: ['cable-usb'], emoji: '💻' },
  { id: 'cuisinier', name: 'Ancien Cuisinier', description: 'Transforme un rat en ratatouille.', bonusStats: { hunger: 15 }, bonusSkills: ['cuisine'], startingItems: ['couteau-suisse'], emoji: '👨‍🍳' },
  { id: 'infirmier', name: 'Ancien Infirmier', description: 'Se soigne avec des feuilles de journal.', bonusStats: { health: 15 }, bonusSkills: ['soin'], startingItems: ['bandage'], emoji: '🏥' },
  { id: 'artiste', name: 'Ancien Artiste', description: "Son art n'a jamais été compris. Même par lui.", bonusStats: { dignity: 15 }, bonusSkills: ['performance'], startingItems: ['crayon'], emoji: '🎨' },
  { id: 'militaire', name: 'Ancien Militaire', description: "Dort debout et mange n'importe quoi.", bonusStats: { health: 10 }, bonusSkills: ['combat'], startingItems: ['couverture-survie'], emoji: '🎖️' },
  { id: 'bibliothecaire', name: 'Ancien Bibliothécaire', description: 'Connaît tous les recoins de la ville.', bonusStats: { mental: 10 }, bonusSkills: ['exploration'], startingItems: ['carte-ville'], emoji: '📖' },
  { id: 'vendeur', name: 'Ancien Vendeur de Voitures', description: 'Peut vendre un carton mouillé comme un loft.', bonusStats: { dignity: 5 }, bonusSkills: ['negociation', 'arnaque'], startingItems: ['cravate'], emoji: '🚗' },
  { id: 'jardinier', name: 'Ancien Jardinier', description: 'Fait pousser des tomates dans une chaussure.', bonusStats: { hunger: 10 }, bonusSkills: ['botanique'], startingItems: ['graines'], emoji: '🌱' },
  { id: 'avocat', name: 'Ancien Avocat', description: 'Connaît ses droits. Et ceux des pigeons.', bonusStats: { dignity: 10, mental: 5 }, bonusSkills: ['intimidation'], startingItems: ['code-civil'], emoji: '⚖️' },
  { id: 'musicien', name: 'Ancien Musicien', description: 'Son harmonica a connu des jours meilleurs.', bonusStats: { mental: 10, dignity: 5 }, bonusSkills: ['performance'], startingItems: ['harmonica-casse'], emoji: '🎵' },
];

export const TRAITS: Trait[] = [
  { id: 'estomac-acier', name: "Estomac d'Acier", description: 'Immunisé à la nourriture périmée', positive: true, effects: { hunger: 5 }, emoji: '🦾' },
  { id: 'optimiste', name: 'Optimiste Né', description: 'La santé mentale remonte plus vite', positive: true, effects: { mental: 10 }, emoji: '😊' },
  { id: 'poissard', name: 'Poissard', description: "Plus d'événements négatifs, score x2", positive: false, effects: { mental: -5 }, emoji: '🍀' },
  { id: 'ami-pigeons', name: 'Ami des Pigeons', description: 'Les oiseaux apportent des objets', positive: true, effects: {}, emoji: '🐦' },
  { id: 'sommeil-plomb', name: 'Sommeil de Plomb', description: 'Récupère plus vite en dormant', positive: true, effects: { sleep: 10 }, emoji: '😴' },
  { id: 'nez-sensible', name: 'Nez Sensible', description: 'Détecte les dangers, malus dignité si sale', positive: true, effects: { dignity: -5 }, emoji: '👃' },
  { id: 'insomniaque', name: 'Insomniaque', description: 'Moins de sommeil requis, mental fragile', positive: false, effects: { sleep: 10, mental: -10 }, emoji: '🌙' },
  { id: 'paranoiaque', name: 'Paranoïaque', description: 'Pas de vol en dormant, stress élevé', positive: false, effects: { mental: -10 }, emoji: '👀' },
  { id: 'main-verte', name: 'Main Verte', description: 'Fait pousser des choses dans des pots', positive: true, effects: { hunger: 5 }, emoji: '🌿' },
  { id: 'charismatique', name: 'Charismatique', description: 'Les passants donnent plus facilement', positive: true, effects: { dignity: 5 }, emoji: '✨' },
  { id: 'os-mousse', name: 'Os en Mousse', description: 'Subit plus de dégâts physiques', positive: false, effects: { health: -10 }, emoji: '🦴' },
  { id: 'metabolisme', name: 'Métabolisme Rapide', description: 'Guérit vite, mais toujours faim', positive: false, effects: { health: 5, hunger: -10 }, emoji: '⚡' },
  { id: 'collectionneur', name: 'Collectionneur', description: 'Bonus moral si inventaire plein', positive: true, effects: { mental: 5 }, emoji: '📦' },
  { id: 'phobie-rats', name: 'Phobie des Rats', description: 'Panique en zone industrielle', positive: false, effects: { mental: -5 }, emoji: '🐀' },
  { id: 'haleine', name: 'Haleine Redoutable', description: 'Bonus combat, malus social', positive: false, effects: { dignity: -10 }, emoji: '💨' },
  { id: 'agile', name: 'Agile', description: 'Excellente capacité de fuite', positive: true, effects: {}, emoji: '🏃' },
  { id: 'resistant-froid', name: 'Résistant au Froid', description: 'Dort dehors sans couverture', positive: true, effects: { health: 5 }, emoji: '❄️' },
  { id: 'bricoleur', name: 'Bricoleur du Dimanche', description: 'Artisanat moins coûteux', positive: true, effects: {}, emoji: '🔨' },
  { id: 'orientation', name: "Sens de l'Orientation", description: 'Ne se perd jamais', positive: true, effects: {}, emoji: '🧭' },
  { id: 'ventre-pattes', name: 'Ventre sur Pattes', description: "Mange n'importe quoi, en grande quantité", positive: false, effects: { hunger: -15 }, emoji: '🍔' },
];

export const LOCATIONS: Record<string, { name: string; emoji: string; danger: number; resources: number; description: string }> = {
  'parc': { name: 'Parc Municipal', emoji: '🌳', danger: 20, resources: 40, description: 'Nature, pigeons, bancs. Le paradis des siestes.' },
  'centre-ville': { name: 'Centre-Ville', emoji: '🏙️', danger: 30, resources: 60, description: 'Passants, commerces, police. Beaucoup de monde.' },
  'zone-industrielle': { name: 'Zone Industrielle', emoji: '🏭', danger: 60, resources: 80, description: 'Rats, rouille et trésors cachés. Apportez vos gants.' },
  'gare': { name: 'Gare', emoji: '🚂', danger: 40, resources: 50, description: 'Voyageurs, abri, sécurité. Un toit temporaire.' },
  'marche': { name: 'Marché', emoji: '🛒', danger: 25, resources: 70, description: 'Nourriture, commerçants. Attention aux vigiles.' },
};

const STARTING_ITEMS: Record<string, InventoryItem> = {
  'calculatrice': { id: 'calculatrice', name: 'Calculatrice solaire', emoji: '🧮', type: 'tool', value: 5, effect: { mental: 8 } },
  'cle-molette': { id: 'cle-molette', name: 'Clé à molette rouillée', emoji: '🔧', type: 'weapon', value: 8, attackBonus: 3, combatStyle: 'heavy' },
  'livre': { id: 'livre', name: 'Livre de philo', emoji: '📚', type: 'tool', value: 3, effect: { mental: 5 } },
  'tire-bouchon': { id: 'tire-bouchon', name: 'Tire-bouchon de sommelier', emoji: '🍷', type: 'tool', value: 6, effect: { thirst: 10, mental: 5 } },
  'genouillere': { id: 'genouillere', name: 'Genouillère usée', emoji: '🦵', type: 'armor', value: 4, defenseBonus: 2 },
  'cable-usb': { id: 'cable-usb', name: 'Câble USB mystérieux', emoji: '🔌', type: 'junk', value: 2, effect: { mental: 4 } },
  'couteau-suisse': { id: 'couteau-suisse', name: 'Couteau suisse', emoji: '🔪', type: 'weapon', value: 12, attackBonus: 4, combatStyle: 'precise' },
  'bandage': { id: 'bandage', name: 'Bandage propre', emoji: '🩹', type: 'tool', value: 5, effect: { health: 15 } },
  'crayon': { id: 'crayon', name: 'Crayon à papier', emoji: '✏️', type: 'tool', value: 1, effect: { mental: 6 } },
  'couverture-survie': { id: 'couverture-survie', name: 'Couverture de survie', emoji: '🛡️', type: 'armor', value: 10, defenseBonus: 3 },
  'carte-ville': { id: 'carte-ville', name: 'Carte de la ville', emoji: '🗺️', type: 'tool', value: 4, effect: { mental: 6 } },
  'cravate': { id: 'cravate', name: 'Cravate en soie', emoji: '👔', type: 'junk', value: 8, effect: { dignity: 10 } },
  'graines': { id: 'graines', name: 'Sachet de graines', emoji: '🌱', type: 'tool', value: 3, effect: { hunger: 12, mental: 4 } },
  'code-civil': { id: 'code-civil', name: 'Code Civil (édition 1987)', emoji: '📕', type: 'weapon', value: 6, attackBonus: 2, combatStyle: 'heavy' },
  'harmonica-casse': { id: 'harmonica-casse', name: 'Harmonica cassé', emoji: '🎵', type: 'special', value: 5, effect: { mental: 12 } },
};

// ============ ENEMIES ============
interface Enemy {
  name: string;
  emoji: string;
  health: number;
  attack: number;
  description: string;
  image?: string;
  loot?: { money?: number; respect?: number; item?: InventoryItem };
}

const ENEMIES: Enemy[] = [
  { name: 'Rat Géant', emoji: '🐀', health: 20, attack: 8, description: "Un rat de la taille d'un chihuahua. Il n'a pas peur.", loot: { money: 2, respect: 1 } },
  { name: 'Mouette Furibonde', emoji: '🦅', health: 15, attack: 6, description: 'Elle veut votre sandwich. Elle aura votre sandwich.', loot: { respect: 2 } },
  { name: 'Chien Errant', emoji: '🐕', health: 30, attack: 12, description: 'Un molosse sans collier. Ses crocs brillent au clair de lune.', loot: { money: 3, respect: 3 } },
  { name: 'Pigeon Alpha', emoji: '🐦', health: 10, attack: 4, description: 'Le chef du gang de pigeons. Il roucoule avec menace.', loot: { money: 1, respect: 1 } },
  { name: 'Voyou du Coin', emoji: '🧔', health: 40, attack: 15, description: 'Un type louche qui veut votre spot. Négociation impossible.', loot: { money: 8, respect: 5 } },
  { name: 'Agent de Sécurité', emoji: '👮', health: 35, attack: 10, description: 'Il fait du zèle. Beaucoup de zèle.', loot: { respect: 4 } },
  { name: 'Chat de Gouttière', emoji: '🐱', health: 12, attack: 7, description: 'Petit mais vicieux. Ses griffes sont des rasoirs.', loot: { money: 1 } },
  { name: 'Raton Laveur', emoji: '🦝', health: 25, attack: 9, description: "Il fouille VOTRE poubelle. L'affront.", loot: { money: 3, respect: 2 } },
  { name: 'Corbeau Géant', emoji: '🐦‍⬛', health: 18, attack: 7, description: 'Noir comme la nuit, méchant comme le jour.', image: '/assets/combat-corbeau-fjv5mmnWmHHKd72RfGopfD.webp', loot: { money: 2, respect: 2 } },
  { name: 'Ivrogne Agressif', emoji: '🍺', health: 35, attack: 11, description: 'Il titube mais frappe fort. Très fort.', image: '/assets/combat-ivrogne-fnqUTa9w2g29Z7Y8UCPEJQ.webp', loot: { money: 5, respect: 3 } },
  { name: 'Vigile Zélé', emoji: '🔦', health: 38, attack: 12, description: 'Badge, lampe torche, ego surdimensionné.', image: '/assets/combat-vigile-8AYmxD2oRKZLSGj3y3tgdy.webp', loot: { money: 4, respect: 4 } },
  { name: 'Cygne Furieux', emoji: '🦢', health: 22, attack: 9, description: 'Élégant mais mortel. Ne jamais sous-estimer un cygne.', image: '/assets/combat-cygne-Do53kfaKnGAeMKwxEmgUi4.webp', loot: { respect: 3 } },
  { name: 'Clown Sinistre', emoji: '🤡', health: 28, attack: 10, description: 'Son rire résonne dans la nuit. Personne ne rit avec lui.', image: '/assets/combat-clown-Lauu92h5boZ4Z4nRnyDEaT.webp', loot: { money: 6, respect: 4 } },
  { name: 'Écureuil Enragé', emoji: '🐿️', health: 8, attack: 5, description: 'Petit, rapide, et il veut vos noisettes. Vous avez pas de noisettes.', image: '/assets/combat-ecureuil-AN8vTTKVptLec9zLjTGRNw.webp', loot: { money: 1 } },
  { name: 'Oie Territoriale', emoji: '🪿', health: 16, attack: 8, description: 'HONK. Elle défend son territoire avec une rage ancestrale.', image: '/assets/combat-oie-LUVjnB536FgK83afqjVs7X.webp', loot: { respect: 2 } },
  { name: 'Canard Psychopathe', emoji: '🦆', health: 14, attack: 6, description: 'Coin coin... COIN COIN ! Il charge !', image: '/assets/combat-canard-gMZvQxLn7Yofnd5dnr3dZM.webp', loot: { money: 1, respect: 1 } },
  { name: 'Coq de Combat', emoji: '🐓', health: 20, attack: 10, description: 'Réveillé à 4h du matin. Et il est furieux.', image: '/assets/combat-coq-URw8wuYwXEgZPMq4wFjJu2.webp', loot: { money: 3, respect: 2 } },
  { name: 'Chat Territorial', emoji: '😾', health: 15, attack: 8, description: 'Ce coin est à LUI. Et il va vous le prouver.', image: '/assets/combat-chat-territorial-2N2qDLSJ5PEDpR4bibLqqR.webp', loot: { money: 2, respect: 1 } },
  { name: 'Mouette Géante', emoji: '🦅', health: 24, attack: 11, description: 'La mère de toutes les mouettes. Envergure impressionnante.', image: '/assets/combat-mouette-geante-msASE7NG2HZ8VNUAwFqgA3.webp', loot: { money: 4, respect: 3 } },
  { name: 'Raton Laveur Alpha', emoji: '🦝', health: 30, attack: 10, description: 'Le boss des ratons. Il porte un masque naturel de bandit.', image: '/assets/combat-raton-laveur-DV28WgnY4Dw7WEQpakPMzH.webp', loot: { money: 5, respect: 3 } },
  { name: 'Chat Sauvage', emoji: '🐈', health: 18, attack: 9, description: 'Pas de collier, pas de maître, pas de pitié.', image: '/assets/combat-chat-sauvage-fFoiY6tVx6eNamsMbyGbNq.webp', loot: { money: 2, respect: 2 } },
];

// ============ POINTS FAIBLES (ciblage en combat) ============
// Pour chaque ennemi : 3 zones à viser, l'id de la zone "point faible",
// et un indice pour aider le joueur à le deviner.
interface Targeting { zones: CombatZone[]; weak: string; hint: string; }

const Z = {
  tete: { id: 'tete', label: 'Tête', emoji: '🤕' },
  torse: { id: 'torse', label: 'Torse', emoji: '🎽' },
  jambes: { id: 'jambes', label: 'Jambes', emoji: '🦵' },
  ailes: { id: 'ailes', label: 'Ailes', emoji: '🪽' },
  pattes: { id: 'pattes', label: 'Pattes', emoji: '🐾' },
  queue: { id: 'queue', label: 'Queue', emoji: '🌀' },
  bec: { id: 'bec', label: 'Bec', emoji: '🔻' },
  museau: { id: 'museau', label: 'Museau', emoji: '👃' },
  ventre: { id: 'ventre', label: 'Ventre', emoji: '🎈' },
  mains: { id: 'mains', label: 'Mains', emoji: '✋' },
} as const;

const WEAK_POINTS: Record<string, Targeting> = {
  'Pigeon Alpha':        { zones: [Z.bec, Z.ailes, Z.pattes], weak: 'ailes', hint: 'Coupez-lui les ailes, il ne pourra plus voltiger.' },
  'Mouette Furibonde':   { zones: [Z.bec, Z.ailes, Z.ventre], weak: 'ailes', hint: 'Tout est dans le vol : visez les ailes.' },
  'Mouette Géante':      { zones: [Z.bec, Z.ailes, Z.ventre], weak: 'ailes', hint: 'Une si grande envergure... visez les ailes.' },
  'Chat de Gouttière':   { zones: [Z.tete, Z.pattes, Z.queue], weak: 'queue', hint: 'Attrapez la queue, il déteste ça.' },
  'Chat Sauvage':        { zones: [Z.tete, Z.pattes, Z.queue], weak: 'queue', hint: 'Sa queue est son point sensible.' },
  'Voyou du Coin':       { zones: [Z.tete, Z.torse, Z.jambes], weak: 'tete', hint: 'Un bon crochet au menton et il tombe.' },
  'Squatteur Territorial':{ zones: [Z.tete, Z.torse, Z.jambes], weak: 'tete', hint: 'Visez la tête, il ne s\'y attend pas.' },
  'Concurrent Agressif': { zones: [Z.tete, Z.torse, Z.jambes], weak: 'torse', hint: 'Coupez-lui le souffle : droit au plexus.' },
  'Agent de Sécurité':   { zones: [Z.tete, Z.ventre, Z.jambes], weak: 'ventre', hint: 'Sous le gilet, le ventre est à nu.' },
  'Ivrogne Agressif':    { zones: [Z.tete, Z.torse, Z.jambes], weak: 'jambes', hint: 'Il tient à peine debout : fauchez ses jambes.' },
  'Pickpocket':          { zones: [Z.tete, Z.mains, Z.jambes], weak: 'jambes', hint: 'Il mise tout sur sa vitesse : brisez son élan.' },
  'Rat Géant':           { zones: [Z.tete, Z.pattes, Z.queue], weak: 'queue', hint: 'Marchez sur sa queue pour le clouer sur place.' },
  'Chien Errant':        { zones: [Z.museau, Z.pattes, Z.torse], weak: 'museau', hint: 'Le museau est ultra-sensible : frappez là.' },
  'Raton Laveur':        { zones: [Z.tete, Z.pattes, Z.queue], weak: 'tete', hint: 'Visez entre les yeux, sous le masque.' },
};

const DEFAULT_TARGETING: Targeting = { zones: [Z.tete, Z.torse, Z.jambes], weak: 'tete', hint: 'Cherchez l\'ouverture... la tête semble vulnérable.' };

function getTargeting(enemyName: string): Targeting {
  return WEAK_POINTS[enemyName] || DEFAULT_TARGETING;
}

// Profil de combat selon le style de l'arme — c'est ce qui fait que
// "viser" se joue différemment avec un couteau ou une batte.
export interface WeaponProfile {
  style: 'precise' | 'heavy' | 'balanced';
  label: string;
  note: string;
  critMin: number; critRange: number;   // multiplicateur critique = critMin + alea*critRange
  stunChance: number;                    // chance d'étourdir sur un critique
  missMin: number; missRange: number;    // multiplicateur de dégâts sur mauvaise zone
  riposteMin: number; riposteRange: number; // riposte ennemie sur mauvaise zone
}

// Prix de revente d'un objet : 60% de sa valeur (empêche tout aller-retour
// achat→revente rentable, tout en donnant une utilité à chaque objet).
export function getSellPrice(item: InventoryItem): number {
  return Math.max(1, Math.round((item.value || 1) * 0.6));
}

export function getWeaponProfile(weapon?: InventoryItem): WeaponProfile {
  switch (weapon?.combatStyle) {
    case 'precise':
      return { style: 'precise', label: '🔪 Arme précise', note: 'Critiques marqués — mais un raté ne fait presque rien et vous expose.',
        critMin: 1.6, critRange: 0.5, stunChance: 0.45, missMin: 0.15, missRange: 0.2, riposteMin: 1.0, riposteRange: 0.6 };
    case 'heavy':
      return { style: 'heavy', label: '🏏 Arme lourde', note: 'Même un coup mal ajusté fait mal et tient l\'ennemi à distance. Critiques plus modestes.',
        critMin: 1.3, critRange: 0.3, stunChance: 0.25, missMin: 0.6, missRange: 0.4, riposteMin: 0.4, riposteRange: 0.4 };
    default:
      return { style: 'balanced', label: '✊ Coup équilibré', note: 'Sans arme spécialisée : visée standard.',
        critMin: 1.4, critRange: 0.4, stunChance: 0.35, missMin: 0.3, missRange: 0.3, riposteMin: 1.0, riposteRange: 0.6 };
  }
}

// ============ EXPLORE EVENTS (30) ============
const EXPLORE_EVENTS: GameEvent[] = [
  {
    id: 'exp-jardinier', title: 'Le Jardinier Clandestin', type: 'social',
    image: '/assets/exp-jardinier-CR6HfMPJyNzdVNNx5SD2YN.webp',
    description: 'Un vieil homme cultive des légumes en cachette dans un coin du parc. Il vous repère.',
    choices: [
      { text: 'Proposer votre aide', risk: 'safe', emoji: '🌱', outcomes: [
        { probability: 0.7, text: 'Il accepte ! Vous passez une heure à jardiner. Il vous donne une tomate. "Reviens demain, petit."', statChanges: { hunger: 10, mental: 8, dignity: 5 }, addFlag: 'ami-jardinier', followUpEventId: 'exp-jardin-communautaire-suite' },
        { probability: 0.3, text: 'Il vous regarde avec méfiance. "Dégage, c\'est mon coin." Ambiance.', statChanges: { mental: -3 } },
      ]},
      { text: 'Voler quelques légumes discrètement', risk: 'risky', emoji: '🥕', outcomes: [
        { probability: 0.4, text: 'Vous chopez 3 carottes et une courgette. Festin !', statChanges: { hunger: 20, dignity: -10 } },
        { probability: 0.6, text: 'Il vous attrape la main. "Voleur !" Il alerte tout le parc.', statChanges: { dignity: -20, mental: -5 }, respectChange: -3 },
      ]},
      { text: 'Observer de loin et noter l\'emplacement', risk: 'safe', emoji: '👀', outcomes: [
        { probability: 1, text: 'Vous mémorisez l\'endroit. Ça pourrait servir plus tard.', statChanges: { mental: 3 } },
      ]},
    ],
  },
  {
    id: 'exp-enfant-perdu', title: 'L\'Enfant Perdu', type: 'social',
    image: '/assets/exp-enfant-perdu-A9tLX2MXC6uiVEZLziz2AV.webp',
    description: 'Un gamin de 6 ans pleure sur un banc. Il a perdu sa maman dans le parc.',
    choices: [
      { text: 'L\'aider à retrouver sa mère', risk: 'safe', emoji: '👩‍👦', outcomes: [
        { probability: 0.7, text: 'Vous retrouvez la mère en 10 minutes. Elle vous remercie avec 5€ et un sandwich. "Merci infiniment !"', moneyChange: 5, statChanges: { hunger: 15, dignity: 10, mental: 10 }, respectChange: 3, addFlag: 'hero-enfant', followUpEventId: 'exp-vieille-dame-suite' },
        { probability: 0.3, text: 'La mère arrive en courant. Elle vous regarde avec suspicion et emmène l\'enfant sans un mot.', statChanges: { dignity: -5, mental: -5 } },
      ]},
      { text: 'Appeler la police', risk: 'safe', emoji: '📞', outcomes: [
        { probability: 0.8, text: 'La police arrive et retrouve la mère. Un agent vous remercie discrètement.', statChanges: { dignity: 5, mental: 5 }, respectChange: 1 },
        { probability: 0.2, text: 'La police vous interroge longuement. Vous êtes suspect numéro 1.', statChanges: { dignity: -10, mental: -8 } },
      ]},
      { text: 'Passer votre chemin', risk: 'safe', emoji: '🚶', outcomes: [
        { probability: 1, text: 'Vous partez. Le gamin pleure de plus belle. Votre conscience aussi.', statChanges: { mental: -8 } },
      ]},
    ],
  },
  {
    id: 'exp-skateur', title: 'Le Skateur Cascadeur', type: 'narrative',
    image: '/assets/exp-skateur-BRXHRUvw2hTywwb7KYwfjU.webp',
    description: 'Un ado fait des figures de skate devant vous. Il rate un trick et son skate roule vers vous.',
    choices: [
      { text: 'Lui renvoyer le skate avec style', risk: 'normal', emoji: '🛹', outcomes: [
        { probability: 0.5, text: 'Vous renvoyez le skate d\'un coup de pied parfait. "Trop stylé le vieux !" Il vous file 3€.', moneyChange: 3, statChanges: { dignity: 8, mental: 5 } },
        { probability: 0.5, text: 'Le skate vous échappe et finit dans une flaque. L\'ado vous fusille du regard.', statChanges: { dignity: -5 } },
      ]},
      { text: 'Garder le skate', risk: 'risky', emoji: '😏', outcomes: [
        { probability: 0.3, text: 'L\'ado part en pleurant. Vous avez un skate. Et des remords.', statChanges: { dignity: -15, mental: -5 }, itemGain: { id: 'skate', name: 'Skateboard volé', emoji: '🛹', type: 'tool', value: 15 } },
        { probability: 0.7, text: 'Ses potes arrivent. Vous rendez le skate très vite.', statChanges: { dignity: -10, health: -5 } },
      ]},
    ],
  },
  {
    id: 'exp-mariage', title: 'Le Mariage en Plein Air', type: 'social',
    image: '/assets/exp-mariage-YCDbQUMdsv52wEtgeLS3bm.webp',
    description: 'Un mariage se déroule dans le parc. Buffet, musique, gens bien habillés. Vous bavez.',
    choices: [
      { text: 'Se faufiler discrètement au buffet', risk: 'risky', emoji: '🍰', outcomes: [
        { probability: 0.4, text: 'Personne ne vous remarque ! Vous mangez comme un roi. Saumon, fromage, petits fours...', statChanges: { hunger: 30, thirst: 15, mental: 10 } },
        { probability: 0.6, text: 'Le photographe vous repère. "C\'est qui celui-là ?" Expulsé manu militari.', statChanges: { dignity: -15, mental: -5 } },
      ]},
      { text: 'Applaudir de loin les mariés', risk: 'safe', emoji: '👏', outcomes: [
        { probability: 0.8, text: 'Les mariés vous voient et vous envoient une part de gâteau ! L\'amour rend généreux.', statChanges: { hunger: 15, mental: 8, dignity: 5 } },
        { probability: 0.2, text: 'Personne ne vous remarque. Vous regardez les gens heureux. Nostalgie.', statChanges: { mental: -5 } },
      ]},
    ],
  },
  {
    id: 'exp-artiste-rue', title: 'L\'Artiste de Rue', type: 'social',
    image: '/assets/exp-artiste-rue-8igrUxzSFhRMd2FECQMv7h.webp',
    description: 'Un artiste peint votre portrait à la craie sur le trottoir sans vous demander.',
    choices: [
      { text: 'Poser fièrement', risk: 'safe', emoji: '🎨', outcomes: [
        { probability: 0.8, text: 'Le portrait est magnifique ! Les passants s\'arrêtent. Vous récoltez 4€ en pourboires.', moneyChange: 4, statChanges: { dignity: 10, mental: 8 }, respectChange: 2 },
        { probability: 0.2, text: 'Le portrait est... abstrait. Très abstrait. Vous ne vous reconnaissez pas.', statChanges: { mental: -3, dignity: -2 } },
      ]},
      { text: 'Demander une commission', risk: 'normal', emoji: '💰', outcomes: [
        { probability: 0.5, text: 'L\'artiste partage : 3€ pour vous. Collaboration fructueuse !', moneyChange: 3, statChanges: { dignity: 5 } },
        { probability: 0.5, text: '"C\'est de l\'art, pas du commerce !" Il efface votre portrait, vexé.', statChanges: { mental: -5 } },
      ]},
    ],
  },
  {
    id: 'exp-chantier', title: 'Le Chantier Abandonné', type: 'discovery',
    image: '/assets/exp-chantier-6FzS2TzBL94xF7YBmdTXUz.webp',
    description: 'Un chantier abandonné. Des matériaux traînent partout. Mais des bruits suspects viennent du fond.',
    choices: [
      { text: 'Explorer prudemment', risk: 'normal', emoji: '🔦', outcomes: [
        { probability: 0.5, text: 'Vous trouvez une bâche imperméable et des planches. Matériaux de construction !', statChanges: { mental: 5 }, itemGain: { id: 'bache', name: 'Bâche imperméable', emoji: '🏗️', type: 'tool', value: 8 } },
        { probability: 0.3, text: 'Un chien errant surgit ! Il grogne...', statChanges: { mental: -5 } },
        { probability: 0.2, text: 'Vous marchez sur un clou rouillé. Aïe !', statChanges: { health: -10, mental: -3 } },
      ]},
      { text: 'Récupérer du métal à revendre', risk: 'risky', emoji: '🔩', outcomes: [
        { probability: 0.4, text: 'Du cuivre ! Le ferrailleur vous en donne 8€.', moneyChange: 8, statChanges: { dignity: -5 } },
        { probability: 0.6, text: 'Le gardien de nuit vous surprend. Course-poursuite !', statChanges: { health: -5, dignity: -10, sleep: -5 } },
      ]},
    ],
  },
  {
    id: 'exp-marche-puces', title: 'Le Marché aux Puces', type: 'discovery',
    image: '/assets/exp-marche-puces-HsE9Jibo2Ryfm6oCMCsSB6.webp',
    description: 'Le marché aux puces du dimanche. Des trésors cachés parmi les déchets.',
    choices: [
      { text: 'Fouiller les invendus en fin de marché', risk: 'safe', emoji: '🔍', outcomes: [
        { probability: 0.6, text: 'Un vendeur vous donne un manteau usé mais chaud. "Tiens, il me sert plus."', statChanges: { dignity: 5, health: 3 }, itemGain: { id: 'manteau', name: 'Manteau usé', emoji: '🧥', type: 'armor', value: 10, defenseBonus: 2 } },
        { probability: 0.4, text: 'Rien d\'intéressant aujourd\'hui. Que des vieilles chaussettes dépareillées.', statChanges: { mental: -2 } },
      ]},
      { text: 'Proposer vos services de porteur', risk: 'normal', emoji: '💪', outcomes: [
        { probability: 0.6, text: 'Un antiquaire vous embauche pour 2h. 6€ et un sandwich.', moneyChange: 6, statChanges: { hunger: 15, sleep: -5, dignity: 5 } },
        { probability: 0.4, text: '"On n\'a pas besoin de toi." Refus général. Dur.', statChanges: { dignity: -5, mental: -5 } },
      ]},
    ],
  },
  {
    id: 'exp-graffiti', title: 'Le Mur de Graffitis', type: 'narrative',
    image: '/assets/exp-graffiti-cRcu5Bo3BmUZPkaiCwvrUp.webp',
    description: 'Un mur couvert de graffitis colorés. Un tagueur est en pleine action.',
    choices: [
      { text: 'Faire le guet pour lui', risk: 'normal', emoji: '👁️', outcomes: [
        { probability: 0.6, text: 'Mission accomplie ! Il vous file 4€ et une bombe de peinture. "T\'es réglo."', moneyChange: 4, statChanges: { mental: 5 }, respectChange: 2 },
        { probability: 0.4, text: 'La police arrive ! Vous courez ensemble. Adrénaline pure.', statChanges: { sleep: -5, mental: 3, dignity: -5 } },
      ]},
      { text: 'Demander à essayer', risk: 'safe', emoji: '🎨', outcomes: [
        { probability: 0.7, text: 'Vous dessinez un chat. C\'est moche mais cathartique. "Pas mal pour un débutant !"', statChanges: { mental: 10, dignity: 3 } },
        { probability: 0.3, text: 'La bombe vous explose au visage. Vous êtes bleu pendant 3 jours.', statChanges: { dignity: -8, health: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-bibliotheque', title: 'La Bibliothèque Municipale', type: 'narrative',
    image: '/assets/exp-bibliotheque-2De3rMKZBHpbKjGy3dHVbf.webp',
    description: 'La bibliothèque est ouverte. Chaleur, silence, et des toilettes gratuites.',
    choices: [
      { text: 'Lire tranquillement au chaud', risk: 'safe', emoji: '📖', outcomes: [
        { probability: 0.8, text: 'Deux heures de lecture et de chaleur. Vous vous sentez presque normal.', statChanges: { mental: 15, sleep: 5, dignity: 3 } },
        { probability: 0.2, text: 'Vous vous endormez et ronflez. Le bibliothécaire vous réveille. Gênant.', statChanges: { sleep: 10, dignity: -5 } },
      ]},
      { text: 'Utiliser les toilettes et se laver', risk: 'safe', emoji: '🚿', outcomes: [
        { probability: 1, text: 'Toilette rapide au lavabo. Vous vous sentez humain à nouveau.', statChanges: { dignity: 10, mental: 5, thirst: 5 } },
      ]},
      { text: 'Chercher des livres à revendre', risk: 'risky', emoji: '📚', outcomes: [
        { probability: 0.3, text: 'Vous trouvez un livre rare oublié. Le bouquiniste vous en donne 5€.', moneyChange: 5 },
        { probability: 0.7, text: 'La bibliothécaire vous surveille. Impossible de rien prendre.', statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-concert', title: 'Le Concert Improvisé', type: 'social',
    image: '/assets/exp-concert-ju77ceA9zWrNxQaKrRPUVF.webp',
    description: 'Des musiciens de rue jouent du jazz. La foule s\'amasse. L\'ambiance est magique.',
    choices: [
      { text: 'Danser comme si personne ne regardait', risk: 'normal', emoji: '💃', outcomes: [
        { probability: 0.6, text: 'Votre danse attire les rires et les applaudissements ! On vous jette 3€.', moneyChange: 3, statChanges: { mental: 12, dignity: 5 }, respectChange: 2 },
        { probability: 0.4, text: 'Vous trébuchez. Les gens rient, mais pas avec vous.', statChanges: { dignity: -8, mental: -3 } },
      ]},
      { text: 'Écouter tranquillement', risk: 'safe', emoji: '🎵', outcomes: [
        { probability: 1, text: 'La musique vous transporte. Pendant 20 minutes, vous oubliez tout.', statChanges: { mental: 10 } },
      ]},
    ],
  },
  {
    id: 'exp-metro', title: 'La Station de Métro', type: 'discovery',
    image: '/assets/exp-metro-oXzk6PRiafCRXLVLnLSSVq.webp',
    description: 'Vous descendez dans la station de métro. Il fait chaud, mais c\'est le territoire d\'autres SDF.',
    choices: [
      { text: 'Explorer les couloirs', risk: 'normal', emoji: '🚇', outcomes: [
        { probability: 0.4, text: 'Vous trouvez un billet de 10€ par terre ! Jour de chance !', moneyChange: 10, statChanges: { mental: 8 } },
        { probability: 0.3, text: 'Un autre SDF vous interpelle. "C\'est mon couloir !" Tension.', statChanges: { mental: -5, dignity: -3 } },
        { probability: 0.3, text: 'Un rat géant vous barre le passage...', statChanges: { mental: -8 } },
      ]},
      { text: 'Rester près des tourniquets et mendier', risk: 'safe', emoji: '🎩', outcomes: [
        { probability: 0.6, text: 'Les voyageurs pressés lâchent quelques pièces. 2€ en 30 minutes.', moneyChange: 2, statChanges: { dignity: -3 } },
        { probability: 0.4, text: 'Un agent vous demande de partir. Pas de mendicité ici.', statChanges: { dignity: -5 } },
      ]},
    ],
  },
  {
    id: 'exp-eglise', title: 'L\'Église du Quartier', type: 'narrative',
    image: '/assets/exp-eglise-2mK4FcdNW7pYwWeFopWXmF.webp',
    description: 'L\'église est ouverte. Un prêtre balaie l\'entrée.',
    choices: [
      { text: 'Entrer et s\'asseoir au calme', risk: 'safe', emoji: '⛪', outcomes: [
        { probability: 0.7, text: 'Le prêtre vous offre un café et un croissant. "La maison de Dieu est ouverte à tous."', statChanges: { hunger: 10, thirst: 10, mental: 10, dignity: 5 } },
        { probability: 0.3, text: 'Moment de paix intérieure. Le silence fait du bien.', statChanges: { mental: 8, sleep: 5 } },
      ]},
      { text: 'Demander de l\'aide au prêtre', risk: 'safe', emoji: '🙏', outcomes: [
        { probability: 0.6, text: 'Il vous donne l\'adresse d\'un foyer et un bon repas. Humanité.', statChanges: { hunger: 15, mental: 10, dignity: 8 }, addFlag: 'aide-eglise' },
        { probability: 0.4, text: '"Je n\'ai pas grand-chose, mais prenez ça." 2€ et une bénédiction.', moneyChange: 2, statChanges: { mental: 5 } },
      ]},
    ],
  },
  {
    id: 'exp-bagarre-chats', title: 'La Bagarre de Chats', type: 'narrative',
    image: '/assets/exp-bagarre-chats-Dgd3ncPRiSTGHjXXHy6SUT.webp',
    description: 'Deux chats se battent férocement dans une ruelle. Les miaulements sont terrifiants.',
    choices: [
      { text: 'Les séparer bravement', risk: 'risky', emoji: '🐱', outcomes: [
        { probability: 0.3, text: 'Vous les séparez ! Un des chats vous adopte. Compagnon de route !', statChanges: { mental: 10, health: -3 }, respectChange: 1, addFlag: 'chat-compagnon' },
        { probability: 0.7, text: 'Les deux chats se retournent contre vous. Griffures partout !', statChanges: { health: -8, dignity: -5 } },
      ]},
      { text: 'Parier sur le vainqueur', risk: 'safe', emoji: '🎰', outcomes: [
        { probability: 0.5, text: 'Le chat tigré gagne ! Vous n\'avez rien parié mais vous êtes content.', statChanges: { mental: 3 } },
        { probability: 0.5, text: 'Match nul. Les deux partent en boitant. Spectacle décevant.', statChanges: { mental: -1 } },
      ]},
    ],
  },
  {
    id: 'exp-fontaine-parc', title: 'La Fontaine aux Pièces', type: 'discovery',
    image: '/assets/exp-fontaine-parc-BiqrfcY6htgsTAbKRTaDWN.webp',
    description: 'La fontaine du parc brille de pièces jetées par les touristes. Des voeux et de l\'argent.',
    choices: [
      { text: 'Plonger la main pour récupérer des pièces', risk: 'risky', emoji: '💰', outcomes: [
        { probability: 0.4, text: 'Vous récupérez 4€ en petite monnaie. Jackpot aquatique !', moneyChange: 4, statChanges: { dignity: -10, thirst: 5 } },
        { probability: 0.3, text: 'Un gardien vous attrape. "C\'est interdit !" Amende morale.', statChanges: { dignity: -15, mental: -5 } },
        { probability: 0.3, text: 'Vous glissez et tombez dans la fontaine. Trempé mais riche de 2€.', moneyChange: 2, statChanges: { health: -5, dignity: -12, thirst: 10 } },
      ]},
      { text: 'Faire un voeu avec votre dernière pièce', risk: 'safe', emoji: '⭐', outcomes: [
        { probability: 0.5, text: 'Vous jetez 1 centime. Vous vous sentez étrangement optimiste.', moneyChange: 0, statChanges: { mental: 8 } },
        { probability: 0.5, text: 'La pièce rebondit et touche un pigeon. Mauvais karma.', statChanges: { mental: -2 } },
      ]},
      { text: 'Se laver le visage dans l\'eau', risk: 'safe', emoji: '💧', outcomes: [
        { probability: 1, text: 'L\'eau est fraîche. Vous vous sentez revigoré.', statChanges: { dignity: 5, thirst: 8, mental: 3 } },
      ]},
    ],
  },
  {
    id: 'exp-velo-casse', title: 'Le Vélo Abandonné', type: 'discovery',
    image: '/assets/exp-velo-casse-bdxwNqE2XebzwjmU9nEovY.webp',
    description: 'Un vélo cassé est attaché à un poteau. La roue avant est voilée, mais le reste semble OK.',
    choices: [
      { text: 'Tenter de le réparer', risk: 'normal', emoji: '🔧', outcomes: [
        { probability: 0.4, text: 'Avec du fil de fer et de la patience, ça roule ! Moyen de transport acquis.', statChanges: { mental: 8, dignity: 3 }, addFlag: 'a-velo', itemGain: { id: 'velo-repare', name: 'Vélo rafistolé', emoji: '🚲', type: 'tool', value: 20 } },
        { probability: 0.6, text: 'Impossible sans outils. Vous récupérez la sonnette au moins.', statChanges: { mental: -2 }, itemGain: { id: 'sonnette', name: 'Sonnette de vélo', emoji: '🔔', type: 'junk', value: 1 } },
      ]},
      { text: 'Récupérer les pièces détachées', risk: 'safe', emoji: '⚙️', outcomes: [
        { probability: 0.7, text: 'Vous démontez la chaîne et les pédales. Le ferrailleur en donnera 3€.', moneyChange: 3, statChanges: { dignity: -3 } },
        { probability: 0.3, text: 'Le propriétaire revient ! "Hé, c\'est mon vélo !" Vous filez.', statChanges: { dignity: -8, mental: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-pharmacie', title: 'La Pharmacie de Garde', type: 'social',
    image: '/assets/exp-pharmacie-SW5iVopihwHZPnwrHk4DRV.webp',
    description: 'La pharmacie est ouverte. La pharmacienne vous regarde avec un mélange de pitié et de méfiance.',
    choices: [
      { text: 'Demander poliment des pansements', risk: 'safe', emoji: '🩹', outcomes: [
        { probability: 0.7, text: 'Elle vous donne un kit de premiers soins périmé. "C\'est encore bon, hein."', statChanges: { health: 10, dignity: 3 }, itemGain: { id: 'kit-soin', name: 'Kit premiers soins', emoji: '🏥', type: 'tool', value: 8, effect: { health: 20 } } },
        { probability: 0.3, text: '"Désolée, je ne peux pas." Elle baisse les yeux. Vous aussi.', statChanges: { mental: -5 } },
      ]},
      { text: 'Proposer de balayer devant la boutique', risk: 'safe', emoji: '🧹', outcomes: [
        { probability: 0.8, text: 'Elle accepte ! 3€ et un tube de crème solaire. Honnête travail.', moneyChange: 3, statChanges: { dignity: 8, mental: 5 } },
        { probability: 0.2, text: '"Non merci, j\'ai un employé." Refus poli.', statChanges: { mental: -2 } },
      ]},
    ],
  },
  {
    id: 'exp-terrain-vague', title: 'Le Terrain Vague', type: 'discovery',
    image: '/assets/exp-terrain-vague-cuw8m9fnHsQZS3zjSQE96n.webp',
    description: 'Un terrain vague entre deux immeubles. Des herbes folles, des déchets, et... des bruits.',
    choices: [
      { text: 'Explorer les décombres', risk: 'risky', emoji: '🏚️', outcomes: [
        { probability: 0.3, text: 'Vous trouvez une vieille radio qui marche encore ! Compagnie nocturne.', statChanges: { mental: 8 }, itemGain: { id: 'radio', name: 'Radio portable', emoji: '📻', type: 'tool', value: 5 } },
        { probability: 0.4, text: 'Un raton laveur surgit des buissons ! Il est pas content.', statChanges: { mental: -5, health: -3 } },
        { probability: 0.3, text: 'Vous marchez sur du verre brisé. Vos chaussures ne protègent plus grand-chose.', statChanges: { health: -8 } },
      ]},
      { text: 'Chercher des matériaux utiles', risk: 'normal', emoji: '🔩', outcomes: [
        { probability: 0.5, text: 'Du carton sec, une couverture oubliée. De quoi améliorer votre abri.', statChanges: { mental: 5 }, itemGain: { id: 'couverture', name: 'Couverture trouvée', emoji: '🛏️', type: 'armor', value: 6, defenseBonus: 1 } },
        { probability: 0.5, text: 'Rien d\'utile. Juste des canettes vides et de la tristesse.', statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-animalerie', title: 'L\'Animalerie du Coin', type: 'social',
    image: '/assets/exp-animalerie-f88YtDyyP69PRN9fqoBdd2.webp',
    description: 'L\'animalerie a mis des chiots en vitrine. Vous vous arrêtez, hypnotisé.',
    choices: [
      { text: 'Regarder les chiots et sourire', risk: 'safe', emoji: '🐶', outcomes: [
        { probability: 0.8, text: 'Un chiot vous lèche la vitre. Moment de bonheur pur. Des passants sourient aussi.', statChanges: { mental: 12, dignity: 3 } },
        { probability: 0.2, text: 'Le vendeur sort et vous chasse. "Tu fais fuir les clients !"', statChanges: { dignity: -8, mental: -5 } },
      ]},
      { text: 'Proposer de promener les chiens', risk: 'normal', emoji: '🦮', outcomes: [
        { probability: 0.5, text: 'Le gérant accepte ! 2h de balade avec un labrador. 5€ et du bonheur.', moneyChange: 5, statChanges: { mental: 15, dignity: 5, sleep: -3 } },
        { probability: 0.5, text: '"On n\'a pas besoin d\'aide." Refus. Les chiots vous regardent tristement.', statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-cimetiere', title: 'Le Cimetière Paisible', type: 'narrative',
    image: '/assets/exp-cimetiere-VKuW5e5DjqSmF5TNCdnKkA.webp',
    description: 'Le cimetière est calme. Des fleurs fraîches sur certaines tombes. Un robinet coule.',
    choices: [
      { text: 'Se recueillir et réfléchir', risk: 'safe', emoji: '🕯️', outcomes: [
        { probability: 1, text: 'Moment de méditation. La perspective de la mort remet les choses en place.', statChanges: { mental: 8, dignity: 5 } },
      ]},
      { text: 'Boire au robinet et se laver', risk: 'safe', emoji: '🚰', outcomes: [
        { probability: 1, text: 'Eau potable gratuite ! Vous buvez et vous débarbouiller. Luxe.', statChanges: { thirst: 20, dignity: 8 } },
      ]},
      { text: 'Récupérer les fleurs fanées pour les revendre', risk: 'risky', emoji: '💐', outcomes: [
        { probability: 0.3, text: 'Vous recomposez des bouquets. Un fleuriste vous en donne 4€.', moneyChange: 4, statChanges: { dignity: -8 } },
        { probability: 0.7, text: 'Une vieille dame vous surprend. "Vous n\'avez pas honte ?!" Regard glacial.', statChanges: { dignity: -15, mental: -8 } },
      ]},
    ],
  },
  {
    id: 'exp-aire-jeux', title: 'L\'Aire de Jeux Déserte', type: 'narrative',
    image: '/assets/exp-aire-jeux-Q8McpHycnXNkdRnaXA3fDZ.webp',
    description: 'L\'aire de jeux est vide. Les balançoires grincent dans le vent. Nostalgie.',
    choices: [
      { text: 'Faire de la balançoire', risk: 'safe', emoji: '🎠', outcomes: [
        { probability: 0.8, text: 'Le vent dans les cheveux, les pieds en l\'air. Vous redevenez enfant 5 minutes.', statChanges: { mental: 12, dignity: -2 } },
        { probability: 0.2, text: 'La chaîne casse. Vous atterrissez dans le sable. Aïe.', statChanges: { health: -5, mental: -3 } },
      ]},
      { text: 'Dormir dans le toboggan', risk: 'normal', emoji: '😴', outcomes: [
        { probability: 0.6, text: 'Le toboggan est étonnamment confortable. Sieste express.', statChanges: { sleep: 12 } },
        { probability: 0.4, text: 'Des enfants arrivent avec leurs parents. Regard accusateur. Vous partez.', statChanges: { dignity: -10, mental: -5 } },
      ]},
    ],
  },
  {
    id: 'exp-brocante', title: 'La Brocante du Quartier', type: 'discovery',
    image: '/assets/exp-brocante-m4p7AaRkiCTHLZmNAAEVB6.webp',
    description: 'Une brocante de quartier. Des objets hétéroclites s\'entassent sur les tables.',
    choices: [
      { text: 'Négocier un objet utile', risk: 'normal', emoji: '🤝', outcomes: [
        { probability: 0.5, text: 'Vous troquez votre charme contre un thermos. Le vendeur est amusé.', statChanges: { dignity: 3 }, itemGain: { id: 'thermos', name: 'Thermos cabossé', emoji: '☕', type: 'tool', value: 5 } },
        { probability: 0.5, text: '"T\'as pas d\'argent, t\'as pas d\'objet." Logique implacable.', statChanges: { mental: -3 } },
      ]},
      { text: 'Aider à ranger en fin de journée', risk: 'safe', emoji: '📦', outcomes: [
        { probability: 0.7, text: 'Le brocanteur vous paie 4€ et vous laisse garder un vieux chapeau.', moneyChange: 4, statChanges: { dignity: 5, mental: 5 }, itemGain: { id: 'chapeau', name: 'Chapeau de brocante', emoji: '🎩', type: 'junk', value: 3 }, addFlag: 'ami-brocanteur' },
        { probability: 0.3, text: 'Il vous remercie mais n\'a rien à donner. "La prochaine fois !"', statChanges: { mental: 3, dignity: 3 } },
      ]},
    ],
  },
  {
    id: 'exp-toit-vue', title: 'Le Toit avec Vue', type: 'discovery',
    image: '/assets/exp-toit-vue-TJnJZcBsariLEwBL2R7huu.webp',
    description: 'Vous trouvez l\'accès à un toit d\'immeuble. La vue sur la ville est époustouflante.',
    choices: [
      { text: 'Contempler la vue et méditer', risk: 'safe', emoji: '🌅', outcomes: [
        { probability: 1, text: 'La ville s\'étend sous vos pieds. Vous êtes le roi du monde. Du carton, certes, mais du monde.', statChanges: { mental: 15, dignity: 5 } },
      ]},
      { text: 'Installer un campement sur le toit', risk: 'normal', emoji: '⛺', outcomes: [
        { probability: 0.5, text: 'Spot parfait ! À l\'abri du vent, vue panoramique. Votre palace.', statChanges: { sleep: 15, mental: 10 }, addFlag: 'camp-toit' },
        { probability: 0.5, text: 'Le concierge vous repère. "Descendez immédiatement !" Fin du rêve.', statChanges: { dignity: -8, mental: -5 } },
      ]},
    ],
  },
  {
    id: 'exp-salon-coiffure', title: 'Le Salon de Coiffure', type: 'social',
    image: '/assets/exp-salon-coiffure-hsCZe2EwRcYAdN4ZmNo9Bf.webp',
    description: 'Un salon de coiffure cherche un modèle pour ses apprentis. Gratuit.',
    choices: [
      { text: 'Se porter volontaire', risk: 'normal', emoji: '💇', outcomes: [
        { probability: 0.6, text: 'Coupe gratuite ! Vous êtes méconnaissable. En bien. Les passants vous regardent différemment.', statChanges: { dignity: 20, mental: 10 } },
        { probability: 0.4, text: 'L\'apprenti est nerveux. Résultat... créatif. Mais c\'est propre au moins.', statChanges: { dignity: 5, mental: 3 } },
      ]},
      { text: 'Demander juste à utiliser les toilettes', risk: 'safe', emoji: '🚻', outcomes: [
        { probability: 0.7, text: 'Ils acceptent. Toilette rapide, eau chaude. Le luxe.', statChanges: { dignity: 8, thirst: 5 } },
        { probability: 0.3, text: '"Réservé aux clients." Porte fermée.', statChanges: { dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-fete-foraine', title: 'La Fête Foraine', type: 'narrative',
    image: '/assets/exp-fete-foraine-oFFfjEfH7yPSChUUtdKfFj.webp',
    description: 'La fête foraine est installée ! Lumières, odeurs de barbe à papa, musique criarde.',
    choices: [
      { text: 'Chercher des pièces tombées par terre', risk: 'safe', emoji: '🔍', outcomes: [
        { probability: 0.6, text: 'Bingo ! 3€ en monnaie trouvés sous les manèges.', moneyChange: 3, statChanges: { mental: 5 } },
        { probability: 0.4, text: 'Juste des tickets usagés et un chewing-gum collé.', statChanges: { mental: -2 } },
      ]},
      { text: 'Proposer vos services aux forains', risk: 'normal', emoji: '🎪', outcomes: [
        { probability: 0.5, text: 'Un forain vous embauche pour la soirée ! 8€, une barbe à papa, et des souvenirs.', moneyChange: 8, statChanges: { hunger: 10, mental: 10, sleep: -8, dignity: 5 } },
        { probability: 0.5, text: '"On est complet." Mais il vous offre une pomme d\'amour par pitié.', statChanges: { hunger: 8, mental: 3 } },
      ]},
    ],
  },
  {
    id: 'exp-pecheur-canal', title: 'Le Pêcheur du Canal', type: 'social',
    image: '/assets/exp-pecheur-canal-Fq76sjmm34RTZJ7qBYMRq5.webp',
    description: 'Un vieux pêcheur est assis au bord du canal. Il a l\'air de s\'ennuyer ferme.',
    choices: [
      { text: 'Lui tenir compagnie', risk: 'safe', emoji: '🎣', outcomes: [
        { probability: 0.7, text: 'Il vous raconte sa vie. Vous aussi. Il partage son sandwich et sa bière. Belle rencontre.', statChanges: { hunger: 12, thirst: 10, mental: 10 }, respectChange: 2, addFlag: 'ami-pecheur' },
        { probability: 0.3, text: '"Chut ! Tu fais fuir les poissons !" Silence radio.', statChanges: { mental: -2 } },
      ]},
      { text: 'Demander s\'il a attrapé quelque chose', risk: 'safe', emoji: '🐟', outcomes: [
        { probability: 0.5, text: '"Rien du tout ! Mais tiens, prends ça." Il vous donne un poisson séché.', statChanges: { hunger: 10 }, itemGain: { id: 'poisson', name: 'Poisson séché', emoji: '🐟', type: 'food', value: 3, effect: { hunger: 15 } } },
        { probability: 0.5, text: '"Rien. Comme d\'habitude." Vous partagez un moment de déception commune.', statChanges: { mental: 3 } },
      ]},
    ],
  },
  {
    id: 'exp-cave-vin', title: 'La Cave à Vin Oubliée', type: 'discovery',
    image: '/assets/exp-cave-vin-k2iibzQsEoFfpyRmaG7X9t.webp',
    description: 'Une porte de cave entrouverte dans une ruelle. Des bouteilles poussiéreuses à l\'intérieur.',
    choices: [
      { text: 'Explorer la cave', risk: 'risky', emoji: '🍷', outcomes: [
        { probability: 0.3, text: 'Jackpot ! Une bouteille de vin oubliée. Le sommelier en vous pleure de joie.', statChanges: { thirst: 15, mental: 10 }, itemGain: { id: 'vin', name: 'Bouteille de vin', emoji: '🍷', type: 'food', value: 15, effect: { mental: 10, thirst: 15 } } },
        { probability: 0.4, text: 'La cave est vide. Juste des toiles d\'araignée et de la déception.', statChanges: { mental: -3 } },
        { probability: 0.3, text: 'Le propriétaire vous surprend ! "Voleur !" Vous filez.', statChanges: { dignity: -10, mental: -5 } },
      ]},
      { text: 'Refermer la porte et partir', risk: 'safe', emoji: '🚪', outcomes: [
        { probability: 1, text: 'La sagesse l\'emporte. Vous repartez la conscience tranquille.', statChanges: { mental: 3, dignity: 2 } },
      ]},
    ],
  },
  {
    id: 'exp-magasin-ferme', title: 'Le Magasin Fermé', type: 'discovery',
    image: '/assets/exp-magasin-ferme-6eecqa7F4eaw5q482jWUCU.webp',
    description: 'Un magasin a fermé définitivement. La vitrine est encore pleine de marchandises.',
    choices: [
      { text: 'Regarder à travers la vitrine', risk: 'safe', emoji: '👀', outcomes: [
        { probability: 0.6, text: 'Vous repérez une porte arrière entrouverte. Intéressant pour plus tard...', statChanges: { mental: 3 }, addFlag: 'magasin-repere' },
        { probability: 0.4, text: 'Juste des mannequins poussiéreux qui vous fixent. Flippant.', statChanges: { mental: -3 } },
      ]},
      { text: 'Dormir sous l\'auvent', risk: 'safe', emoji: '🏠', outcomes: [
        { probability: 0.7, text: 'L\'auvent protège de la pluie. Pas mal comme spot.', statChanges: { sleep: 10 } },
        { probability: 0.3, text: 'Le vent s\'engouffre. Nuit froide.', statChanges: { sleep: 5, health: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-hopital', title: 'Les Urgences de l\'Hôpital', type: 'social',
    image: '/assets/exp-hopital-h7QXk7kd9iu8CG5kPG7P6Y.webp',
    description: 'L\'hôpital est bondé. La salle d\'attente des urgences est chaude et il y a un distributeur d\'eau.',
    choices: [
      { text: 'S\'installer discrètement en salle d\'attente', risk: 'normal', emoji: '🏥', outcomes: [
        { probability: 0.6, text: 'Personne ne vous remarque. 2h au chaud, eau gratuite, toilettes. Le paradis.', statChanges: { thirst: 15, sleep: 8, dignity: 3 } },
        { probability: 0.4, text: 'Un vigile vous repère. "Vous avez un problème médical ?" Vous improvisez.', statChanges: { mental: -5 } },
      ]},
      { text: 'Demander à voir un médecin (gratuit)', risk: 'safe', emoji: '👨‍⚕️', outcomes: [
        { probability: 0.5, text: 'Après 3h d\'attente, un médecin vous examine. Pansements et vitamines. Merci la sécu.', statChanges: { health: 15, mental: 5, sleep: -5 } },
        { probability: 0.5, text: '"Les urgences sont pour les urgences." On vous renvoie. Au moins vous avez bu de l\'eau.', statChanges: { thirst: 10, mental: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-dechetterie', title: 'La Déchetterie Municipale', type: 'discovery',
    image: '/assets/exp-dechetterie-ik2udBVSfScmWvCMJtUpZE.webp',
    description: 'La déchetterie est ouverte. Les gens jettent des choses incroyables.',
    choices: [
      { text: 'Fouiller les bennes', risk: 'normal', emoji: '🗑️', outcomes: [
        { probability: 0.5, text: 'Un micro-ondes qui marche, un sac de couchage, des livres ! Les gens sont fous de jeter ça.', statChanges: { mental: 8 }, itemGain: { id: 'sac-couchage', name: 'Sac de couchage', emoji: '🛏️', type: 'armor', value: 15, defenseBonus: 3 }, addFlag: 'roi-dechetterie' },
        { probability: 0.3, text: 'Rien de bon aujourd\'hui. Que des gravats et du plâtre.', statChanges: { mental: -2 } },
        { probability: 0.2, text: 'Vous vous coupez sur un morceau de verre. Aïe.', statChanges: { health: -8 } },
      ]},
      { text: 'Discuter avec le gardien', risk: 'safe', emoji: '💬', outcomes: [
        { probability: 0.6, text: 'Le gardien est sympa. "Reviens mardi, y\'a toujours du bon matos." Info précieuse.', statChanges: { mental: 5 }, respectChange: 1, addFlag: 'ami-gardien-dechetterie' },
        { probability: 0.4, text: '"C\'est interdit de fouiller !" Il vous chasse.', statChanges: { dignity: -5 } },
      ]},
    ],
  },
  {
    id: 'exp-camion-pizza', title: 'Le Camion Pizza', type: 'narrative',
    image: '/assets/exp-camion-pizza-gRv6sJgQcz26Svyj68t2oD.webp',
    description: 'Un camion pizza est garé. L\'odeur est divine. Le pizzaiolo ferme pour la nuit.',
    choices: [
      { text: 'Demander les invendus', risk: 'safe', emoji: '🍕', outcomes: [
        { probability: 0.6, text: '"Tiens, prends ça." Deux parts de margherita ! Festin !', statChanges: { hunger: 25, mental: 10, thirst: 5 } },
        { probability: 0.4, text: '"Désolé, j\'ai tout vendu." Votre estomac gronde de déception.', statChanges: { mental: -3, hunger: -5 } },
      ]},
      { text: 'Fouiller les poubelles du camion', risk: 'normal', emoji: '🗑️', outcomes: [
        { probability: 0.5, text: 'Des croûtes de pizza et un fond de sauce. C\'est pas du gastronomique mais ça nourrit.', statChanges: { hunger: 12, dignity: -5 } },
        { probability: 0.3, text: 'Le pizzaiolo vous voit. "Hé ! Dégage de mes poubelles !"', statChanges: { dignity: -10, mental: -3 } },
        { probability: 0.2, text: 'Un chat sauvage défend les poubelles ! Il griffe !', statChanges: { health: -5, hunger: -3 } },
      ]},
    ],
  },
];

// ============ BEG EVENTS (30) ============
const BEG_EVENTS: GameEvent[] = [
  {
    id: 'beg-couple-riche', title: 'Le Couple de Riches', type: 'social',
    image: '/assets/beg-couple-riche-fGABmQHzGdaNfYfNeimiRm.webp',
    description: 'Un couple en manteau de fourrure passe devant vous. Ils sentent le parfum cher.',
    choices: [
      { text: 'Tendre la main poliment', risk: 'safe', emoji: '🙏', outcomes: [
        { probability: 0.5, text: 'La femme vous donne 5€. "Prenez soin de vous." Sincère.', statChanges: { dignity: 3, mental: 5 }, moneyChange: 5 },
        { probability: 0.3, text: 'Ils passent sans vous regarder. Vous êtes invisible.', statChanges: { dignity: -5, mental: -5 } },
        { probability: 0.2, text: 'L\'homme vous donne 10€ ! "J\'ai connu des temps durs aussi."', statChanges: { dignity: 5, mental: 10 }, moneyChange: 10 },
      ]},
      { text: 'Raconter une histoire triste', risk: 'normal', emoji: '😢', outcomes: [
        { probability: 0.4, text: 'Votre histoire les émeut. 8€ et un numéro d\'association.', statChanges: { mental: 5, dignity: -3 }, moneyChange: 8 },
        { probability: 0.6, text: '"On connaît le truc." Ils accélèrent le pas.', statChanges: { dignity: -8, mental: -5 } },
      ]},
    ],
  },
  {
    id: 'beg-boulangerie', title: 'La Boulangerie', type: 'social',
    image: '/assets/beg-boulangerie-UTiJnojsDppWgqBkgPD7iy.webp',
    description: 'La boulangerie ferme dans 10 minutes. L\'odeur du pain chaud vous torture.',
    choices: [
      { text: 'Demander le pain invendu', risk: 'safe', emoji: '🥖', outcomes: [
        { probability: 0.7, text: 'La boulangère vous donne deux baguettes et un pain au chocolat ! "Ça partira à la poubelle sinon."', statChanges: { hunger: 25, mental: 8, dignity: 3 } },
        { probability: 0.3, text: '"Désolée, on a tout vendu aujourd\'hui." Votre estomac pleure.', statChanges: { mental: -3, hunger: -3 } },
      ]},
      { text: 'Proposer de balayer en échange', risk: 'safe', emoji: '🧹', outcomes: [
        { probability: 0.8, text: 'Marché conclu ! Vous balayez 15 minutes et repartez avec un sac de viennoiseries.', statChanges: { hunger: 20, dignity: 8, mental: 5 } },
        { probability: 0.2, text: '"Mon mari s\'en occupe." Refus poli mais elle vous donne un croissant quand même.', statChanges: { hunger: 8, mental: 3 } },
      ]},
    ],
  },
  {
    id: 'beg-terrasse-cafe', title: 'La Terrasse de Café', type: 'social',
    image: '/assets/beg-terrasse-cafe-4C6DR278ZzSCErovRVBHdM.webp',
    description: 'Un café avec terrasse. Des gens sirotent leur expresso à 4€. Vous avez soif.',
    choices: [
      { text: 'S\'asseoir et attendre les restes', risk: 'safe', emoji: '☕', outcomes: [
        { probability: 0.5, text: 'Un client laisse un demi-café et un croissant entamé. Petit déjeuner !', statChanges: { hunger: 8, thirst: 10, dignity: -5 } },
        { probability: 0.5, text: 'Le serveur vous chasse. "C\'est réservé aux clients."', statChanges: { dignity: -8, mental: -5 } },
      ]},
      { text: 'Demander un verre d\'eau', risk: 'safe', emoji: '💧', outcomes: [
        { probability: 0.8, text: 'Le serveur vous apporte un verre d\'eau. Petit geste, grande humanité.', statChanges: { thirst: 15, dignity: 3, mental: 5 } },
        { probability: 0.2, text: '"L\'eau c\'est pour les clients." Froid.', statChanges: { mental: -5, dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'beg-ecole-sortie', title: 'La Sortie d\'École', type: 'social',
    image: '/assets/beg-ecole-sortie-MRgU7z3Vkq86je5Q4bCAvb.webp',
    description: 'C\'est l\'heure de la sortie. Parents et enfants affluent.',
    choices: [
      { text: 'Mendier discrètement', risk: 'safe', emoji: '🎒', outcomes: [
        { probability: 0.5, text: 'Une maman vous donne 2€ et un goûter. "Tenez, pour vous."', statChanges: { hunger: 8, mental: 5 }, moneyChange: 2 },
        { probability: 0.3, text: 'Les parents vous évitent. Certains changent de trottoir.', statChanges: { dignity: -8, mental: -5 } },
        { probability: 0.2, text: 'Un enfant vous donne son goûter en cachette de sa mère. Adorable.', statChanges: { hunger: 10, mental: 10 } },
      ]},
      { text: 'Proposer d\'aider à traverser', risk: 'normal', emoji: '🚸', outcomes: [
        { probability: 0.4, text: 'Vous aidez les enfants à traverser pendant 30 min. Les parents apprécient. 5€ collectés.', statChanges: { dignity: 10, mental: 8 }, moneyChange: 5, respectChange: 2 },
        { probability: 0.6, text: 'Les parents sont méfiants. Un père vous demande de partir.', statChanges: { dignity: -10, mental: -8 } },
      ]},
    ],
  },
  {
    id: 'beg-supermarche', title: 'Le Supermarché', type: 'social',
    image: '/assets/beg-supermarche-4TENQwAV5hiGXPKER2Gy6s.webp',
    description: 'Devant le supermarché, les clients entrent et sortent avec leurs courses.',
    choices: [
      { text: 'S\'installer à l\'entrée avec un gobelet', risk: 'safe', emoji: '🥤', outcomes: [
        { probability: 0.4, text: 'En 1h, vous récoltez 6€. Pas mal !', statChanges: { dignity: -5, mental: 3 }, moneyChange: 6 },
        { probability: 0.3, text: 'Le vigile vous demande de partir. "Pas de mendicité ici."', statChanges: { dignity: -8 } },
        { probability: 0.3, text: 'Une dame vous achète un sandwich et une bouteille d\'eau. Merci.', statChanges: { hunger: 15, thirst: 15, mental: 5 } },
      ]},
      { text: 'Aider les clients à porter leurs courses', risk: 'normal', emoji: '🛒', outcomes: [
        { probability: 0.5, text: 'Plusieurs clients acceptent ! 4€ en pourboires et un pack de yaourts.', statChanges: { hunger: 10, dignity: 5, sleep: -3 }, moneyChange: 4 },
        { probability: 0.5, text: 'Personne ne veut de votre aide. Invisible.', statChanges: { dignity: -5, mental: -5 } },
      ]},
    ],
  },
  {
    id: 'beg-musicien-metro', title: 'Le Musicien du Métro', type: 'social',
    image: '/assets/beg-musicien-metro-HSvL64qd5MQEG4Qnsz4oiV.webp',
    description: 'Un musicien joue de l\'accordéon dans le métro. Il gagne bien sa vie.',
    choices: [
      { text: 'Lui demander des conseils', risk: 'safe', emoji: '🎵', outcomes: [
        { probability: 0.6, text: '"Le secret c\'est le répertoire ! Tiens, chante avec moi." Duo improvisé, 3€ partagés.', statChanges: { mental: 10, dignity: 5 }, moneyChange: 3, respectChange: 1, addFlag: 'ami-musicien' },
        { probability: 0.4, text: '"Dégage de mon spot." Territorial, le musicien.', statChanges: { mental: -5, dignity: -3 } },
      ]},
      { text: 'Chanter à côté de lui', risk: 'risky', emoji: '🎤', outcomes: [
        { probability: 0.3, text: 'Votre voix est... unique. Les gens donnent par pitié. 4€.', statChanges: { dignity: -5, mental: 5 }, moneyChange: 4 },
        { probability: 0.7, text: '"Tu me fais perdre des clients !" Il vous chasse à coups d\'accordéon.', statChanges: { dignity: -10, mental: -5, health: -3 } },
      ]},
    ],
  },
  {
    id: 'beg-touriste-asiatique', title: 'Le Groupe de Touristes', type: 'social',
    image: '/assets/beg-touriste-asiatique-mKRWQ8vLKuJpHegK2ZAxpm.webp',
    description: 'Un groupe de touristes asiatiques prend des photos de tout. Absolument tout.',
    choices: [
      { text: 'Proposer de prendre leur photo', risk: 'safe', emoji: '📸', outcomes: [
        { probability: 0.7, text: 'Ils sont ravis ! Selfies, photos de groupe. 5€ de pourboire et des bonbons japonais.', statChanges: { hunger: 5, mental: 8, dignity: 5 }, moneyChange: 5 },
        { probability: 0.3, text: 'Ils vous prennent en photo VOUS. "Very authentic!" Gênant mais 2€.', statChanges: { dignity: -5, mental: 3 }, moneyChange: 2 },
      ]},
      { text: 'Leur vendre un "guide local"', risk: 'normal', emoji: '🗺️', outcomes: [
        { probability: 0.5, text: 'Vous improvisez un tour du quartier. 10€ et des fous rires.', statChanges: { mental: 10, dignity: 5, sleep: -5 }, moneyChange: 10, respectChange: 3 },
        { probability: 0.5, text: 'Ils ont déjà un guide. Votre offre est déclinée poliment.', statChanges: { mental: -2 } },
      ]},
    ],
  },
  {
    id: 'beg-mariage-sortie', title: 'La Sortie de Mariage', type: 'social',
    image: '/assets/beg-mariage-sortie-63dqzL4mxrcYYsqMVAza6U.webp',
    description: 'Un mariage se termine. Les invités sortent, éméchés et généreux.',
    choices: [
      { text: 'Féliciter les mariés', risk: 'safe', emoji: '💒', outcomes: [
        { probability: 0.7, text: 'Les mariés vous invitent à prendre une part de gâteau ! Champagne inclus.', statChanges: { hunger: 20, thirst: 15, mental: 12, dignity: 5 } },
        { probability: 0.3, text: 'Le père de la mariée vous éloigne. "C\'est privé."', statChanges: { dignity: -5, mental: -3 } },
      ]},
      { text: 'Ramasser le riz et les confettis (pour manger le riz)', risk: 'risky', emoji: '🍚', outcomes: [
        { probability: 0.4, text: 'Vous récupérez assez de riz pour un repas. Débrouillardise !', statChanges: { hunger: 10, dignity: -8 } },
        { probability: 0.6, text: 'C\'est du riz décoratif, pas comestible. Votre estomac proteste.', statChanges: { hunger: -3, mental: -5 } },
      ]},
    ],
  },
  {
    id: 'beg-jogger-parc', title: 'Le Jogger du Parc', type: 'social',
    image: '/assets/beg-jogger-parc-ek7sxZH6KdbP9SnStbrn8P.webp',
    description: 'Un jogger fait sa pause stretching près de vous. Il a l\'air sympathique.',
    choices: [
      { text: 'Engager la conversation', risk: 'safe', emoji: '🏃', outcomes: [
        { probability: 0.6, text: 'Il est coach sportif. "Tu veux que je te montre des exercices ?" Séance gratuite et 3€.', statChanges: { health: 5, mental: 8, dignity: 5 }, moneyChange: 3 },
        { probability: 0.4, text: 'Il remet ses écouteurs et repart. Message reçu.', statChanges: { mental: -3 } },
      ]},
      { text: 'Lui demander de l\'eau', risk: 'safe', emoji: '💧', outcomes: [
        { probability: 0.8, text: 'Il vous passe sa gourde. "Tiens, garde-la." Gourde acquise !', statChanges: { thirst: 15, mental: 5 } },
        { probability: 0.2, text: '"Désolé, j\'ai plus d\'eau." Il est sincère.', statChanges: { mental: -1 } },
      ]},
    ],
  },
  {
    id: 'beg-restaurant-poubelle', title: 'Les Poubelles du Restaurant', type: 'discovery',
    image: '/assets/beg-restaurant-poubelle-HSuTGsFVRJkb2zg2xouMyC.webp',
    description: 'Le restaurant gastronomique vient de sortir ses poubelles. Ça sent le gourmet.',
    choices: [
      { text: 'Fouiller les poubelles', risk: 'normal', emoji: '🗑️', outcomes: [
        { probability: 0.6, text: 'Des restes de foie gras, du pain frais, un fond de sauce. Festin 5 étoiles !', statChanges: { hunger: 25, mental: 5, dignity: -8 } },
        { probability: 0.4, text: 'Le chef sort fumer. "Hé ! Dégage de mes poubelles !" Vous filez.', statChanges: { dignity: -10, mental: -5 } },
      ]},
      { text: 'Attendre que le chef rentre et fouiller après', risk: 'safe', emoji: '⏰', outcomes: [
        { probability: 0.7, text: 'Patience récompensée ! Vous mangez comme un roi. En cachette.', statChanges: { hunger: 20, dignity: -5 } },
        { probability: 0.3, text: 'Les poubelles sont vides. Quelqu\'un est passé avant vous.', statChanges: { mental: -5 } },
      ]},
    ],
  },
  {
    id: 'beg-cinema', title: 'Le Cinéma', type: 'social',
    image: '/assets/beg-cinema-5SKZPaM25U4pgFRPzwkrku.webp',
    description: 'Le cinéma vient de projeter un film. Les spectateurs sortent.',
    choices: [
      { text: 'Mendier à la sortie', risk: 'safe', emoji: '🎬', outcomes: [
        { probability: 0.5, text: 'Les gens sont de bonne humeur après le film. 4€ récoltés.', statChanges: { dignity: -3, mental: 3 }, moneyChange: 4 },
        { probability: 0.5, text: 'Tout le monde est sur son téléphone. Personne ne vous voit.', statChanges: { dignity: -5, mental: -3 } },
      ]},
      { text: 'Récupérer les pop-corn restants dans la salle', risk: 'risky', emoji: '🍿', outcomes: [
        { probability: 0.4, text: 'Vous vous faufilez ! Pop-corn, nachos, un fond de soda. Ciné-repas !', statChanges: { hunger: 15, thirst: 8, mental: 5 } },
        { probability: 0.6, text: 'L\'ouvreuse vous attrape. "Dehors !" Expulsé.', statChanges: { dignity: -10, mental: -3 } },
      ]},
    ],
  },
  {
    id: 'beg-eglise-dimanche', title: 'La Messe du Dimanche', type: 'social',
    image: '/assets/beg-eglise-dimanche-MT7XJz2j3QPsWbbzddy6W2.webp',
    description: 'C\'est dimanche. Les fidèles sortent de la messe, l\'âme charitable.',
    choices: [
      { text: 'Demander l\'aumône', risk: 'safe', emoji: '⛪', outcomes: [
        { probability: 0.7, text: 'La charité chrétienne fonctionne ! 6€ et un sandwich.', statChanges: { hunger: 12, mental: 5, dignity: 3 }, moneyChange: 6 },
        { probability: 0.3, text: '"Dieu vous aide, mon fils." Pas d\'argent mais une bénédiction.', statChanges: { mental: 3 } },
      ]},
      { text: 'Entrer pour le repas paroissial', risk: 'normal', emoji: '🍽️', outcomes: [
        { probability: 0.5, text: 'Repas complet ! Soupe, pain, fromage, café. Et de la compagnie.', statChanges: { hunger: 30, thirst: 15, mental: 10, dignity: 5 } },
        { probability: 0.5, text: '"Le repas est réservé aux inscrits." Mais on vous donne du pain.', statChanges: { hunger: 10, mental: 3 } },
      ]},
    ],
  },
  {
    id: 'beg-mairie', title: 'La Mairie', type: 'social',
    image: '/assets/beg-mairie-eey6rmfrqRvxmw634LjgzZ.webp',
    description: 'La mairie est ouverte. Des gens font la queue pour des papiers.',
    choices: [
      { text: 'Demander des informations sur les aides sociales', risk: 'safe', emoji: '🏛️', outcomes: [
        { probability: 0.6, text: 'L\'agent d\'accueil est compréhensif. Il vous donne une liste de foyers et d\'aides. Précieux.', statChanges: { mental: 10, dignity: 5 }, addFlag: 'aide-mairie' },
        { probability: 0.4, text: '"Prenez un numéro." Après 2h d\'attente, le guichet ferme.', statChanges: { mental: -5, sleep: -5 } },
      ]},
      { text: 'Utiliser les toilettes et l\'eau chaude', risk: 'safe', emoji: '🚻', outcomes: [
        { probability: 0.8, text: 'Toilettes publiques gratuites ! Vous en profitez pour vous laver.', statChanges: { dignity: 10, thirst: 10 } },
        { probability: 0.2, text: '"Les toilettes sont en panne." Pas de chance.', statChanges: { mental: -2 } },
      ]},
    ],
  },
  {
    id: 'beg-gare-tgv', title: 'La Gare TGV', type: 'social',
    image: '/assets/beg-gare-tgv-GVKJko8WAfiNoRKBN7oVPn.webp',
    description: 'La gare TGV est bondée. Voyageurs pressés, valises à roulettes, stress ambiant.',
    choices: [
      { text: 'Proposer de porter les valises', risk: 'normal', emoji: '🧳', outcomes: [
        { probability: 0.5, text: 'Une dame âgée accepte ! 5€ et un merci sincère.', statChanges: { dignity: 5, mental: 5, sleep: -3 }, moneyChange: 5 },
        { probability: 0.3, text: '"Non merci." Refus poli mais ferme.', statChanges: { mental: -2 } },
        { probability: 0.2, text: 'Un voyageur vous accuse de vol ! Malentendu. Stressant.', statChanges: { dignity: -10, mental: -8 } },
      ]},
      { text: 'Mendier près du distributeur de billets', risk: 'safe', emoji: '🎫', outcomes: [
        { probability: 0.5, text: 'Les voyageurs lâchent leur monnaie. 3€ en 30 minutes.', statChanges: { dignity: -5 }, moneyChange: 3 },
        { probability: 0.5, text: 'La police ferroviaire vous demande de circuler.', statChanges: { dignity: -5, mental: -3 } },
      ]},
    ],
  },
  {
    id: 'beg-distributeur-billets', title: 'Le Distributeur de Billets', type: 'narrative',
    image: '/assets/beg-distributeur-billets-G85Evn8NyawUD4iF3YYLdL.webp',
    description: 'Un distributeur automatique de billets. Des gens retirent de l\'argent.',
    choices: [
      { text: 'Attendre près du distributeur', risk: 'safe', emoji: '🏧', outcomes: [
        { probability: 0.4, text: 'Quelqu\'un oublie sa monnaie ! 3€ dans le bac.', statChanges: { mental: 5 }, moneyChange: 3 },
        { probability: 0.3, text: 'Rien ne se passe. Vous avez l\'air suspect.', statChanges: { dignity: -5 } },
        { probability: 0.3, text: 'Un homme vous donne 2€. "Tiens, achète-toi un café."', statChanges: { mental: 5, dignity: 3 }, moneyChange: 2 },
      ]},
      { text: 'Demander poliment aux gens qui retirent', risk: 'normal', emoji: '🙏', outcomes: [
        { probability: 0.4, text: '"Tenez." 5€ d\'un coup ! Généreux.', statChanges: { mental: 8, dignity: -3 }, moneyChange: 5 },
        { probability: 0.6, text: 'Les gens accélèrent le pas. Vous êtes un épouvantail.', statChanges: { dignity: -8, mental: -5 } },
      ]},
    ],
  },
  {
    id: 'beg-fleuriste', title: 'Le Fleuriste', type: 'social',
    image: '/assets/beg-fleuriste-bxNwHDonMVDteRKwkBfphr.webp',
    description: 'Le fleuriste jette ses fleurs fanées. Elles sont encore belles.',
    choices: [
      { text: 'Demander les fleurs invendues', risk: 'safe', emoji: '💐', outcomes: [
        { probability: 0.7, text: '"Prenez, elles vont à la poubelle." Vous avez un bouquet ! Revendable.', statChanges: { mental: 8, dignity: 5 } },
        { probability: 0.3, text: '"Non, elles sont pour le compost." Écolo strict.', statChanges: { mental: -2 } },
      ]},
      { text: 'Revendre les fleurs aux passants', risk: 'normal', emoji: '🌹', outcomes: [
        { probability: 0.5, text: '"Des fleurs pour madame ?" Vous vendez 3 roses. 6€ !', statChanges: { dignity: 5, mental: 8 }, moneyChange: 6, respectChange: 2 },
        { probability: 0.5, text: 'Personne n\'achète des fleurs à un SDF. Logique, en fait.', statChanges: { dignity: -5, mental: -3 } },
      ]},
    ],
  },
  {
    id: 'beg-station-metro', title: 'La Station de Métro', type: 'social',
    image: '/assets/beg-station-metro-7k2mmvWMW6cQbjMKeQ3nba.webp',
    description: 'L\'entrée du métro. Flux constant de passagers pressés.',
    choices: [
      { text: 'Faire la manche avec un panneau', risk: 'safe', emoji: '📝', outcomes: [
        { probability: 0.5, text: 'Votre panneau "J\'ai faim" touche les coeurs. 5€ en 1h.', statChanges: { dignity: -5, mental: 3 }, moneyChange: 5 },
        { probability: 0.3, text: 'Un passant vous donne un sandwich. Mieux que de l\'argent.', statChanges: { hunger: 15, mental: 5 } },
        { probability: 0.2, text: 'La RATP vous demande de partir. Spot interdit.', statChanges: { dignity: -5, mental: -3 } },
      ]},
      { text: 'Ouvrir les portes aux gens chargés', risk: 'safe', emoji: '🚪', outcomes: [
        { probability: 0.7, text: 'Service apprécié ! Quelques pièces en remerciement. 2€.', statChanges: { dignity: 5, mental: 5 }, moneyChange: 2 },
        { probability: 0.3, text: 'Les gens passent sans un regard. Automates humains.', statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'beg-parc-chien', title: 'Le Parc à Chiens', type: 'social',
    image: '/assets/beg-parc-chien-hP9gE8EtKnSHykQy4QSKpy.webp',
    description: 'Le parc à chiens est animé. Des propriétaires discutent pendant que leurs chiens jouent.',
    choices: [
      { text: 'Proposer de garder les chiens', risk: 'normal', emoji: '🐕', outcomes: [
        { probability: 0.5, text: 'Une dame vous confie son caniche 30 min. 4€ et des léchouilles.', statChanges: { mental: 10, dignity: 5 }, moneyChange: 4 },
        { probability: 0.5, text: '"Mon chien ne va pas avec les inconnus." Refus.', statChanges: { mental: -2 } },
      ]},
      { text: 'Jouer avec les chiens', risk: 'safe', emoji: '🎾', outcomes: [
        { probability: 0.8, text: 'Les chiens vous adorent ! Moment de bonheur pur. Un propriétaire vous offre un café.', statChanges: { mental: 12, thirst: 8, dignity: 3 } },
        { probability: 0.2, text: 'Un chien vous mord la main. Pas méchamment, mais quand même.', statChanges: { health: -3, mental: -2 } },
      ]},
    ],
  },
  {
    id: 'beg-lavage-voiture', title: 'La Station de Lavage', type: 'social',
    image: '/assets/beg-lavage-voiture-jio2DxY23xqhxu63ZuyVTv.webp',
    description: 'Une station de lavage automatique. Des gens attendent que leur voiture soit propre.',
    choices: [
      { text: 'Proposer un lavage à la main', risk: 'normal', emoji: '🧽', outcomes: [
        { probability: 0.5, text: 'Un homme accepte ! 1h de travail, 8€. Honnête.', statChanges: { dignity: 5, mental: 5, sleep: -5 }, moneyChange: 8 },
        { probability: 0.5, text: '"J\'ai la machine pour ça." Logique.', statChanges: { mental: -2 } },
      ]},
      { text: 'Récupérer la monnaie oubliée dans les machines', risk: 'safe', emoji: '🪙', outcomes: [
        { probability: 0.4, text: '2€ oubliés dans une machine ! Petit bonus.', statChanges: { mental: 3 }, moneyChange: 2 },
        { probability: 0.6, text: 'Rien. Les machines sont vides.', statChanges: { mental: -1 } },
      ]},
    ],
  },
  {
    id: 'beg-taxi-arret', title: 'L\'Arrêt de Taxi', type: 'social',
    image: '/assets/beg-taxi-arret-fGsAqfVEcKEJAiddtE6GrC.webp',
    description: 'Une file de taxis attend des clients. Les chauffeurs discutent entre eux.',
    choices: [
      { text: 'Demander un petit quelque chose aux chauffeurs', risk: 'safe', emoji: '🚕', outcomes: [
        { probability: 0.5, text: 'Un chauffeur vous offre son sandwich. "J\'ai plus faim, prends."', statChanges: { hunger: 12, mental: 5 } },
        { probability: 0.3, text: '"Dégage, tu fais fuir les clients."', statChanges: { dignity: -8, mental: -3 } },
        { probability: 0.2, text: 'Un chauffeur vous propose un trajet gratuit jusqu\'au foyer.', statChanges: { mental: 10, dignity: 5 } },
      ]},
      { text: 'Ouvrir les portes des taxis aux clients', risk: 'normal', emoji: '🚪', outcomes: [
        { probability: 0.4, text: 'Les clients apprécient ! 3€ en pourboires.', statChanges: { dignity: 3, mental: 5 }, moneyChange: 3 },
        { probability: 0.6, text: 'Les chauffeurs n\'aiment pas ça. "C\'est notre boulot !"', statChanges: { dignity: -5 } },
      ]},
    ],
  },
  {
    id: 'beg-concert-sortie', title: 'La Sortie de Concert', type: 'social',
    image: '/assets/beg-concert-sortie-VPCD4nBdsydTGMi5TPfd8i.webp',
    description: 'Un concert vient de se terminer. Les spectateurs sortent, euphoriques.',
    choices: [
      { text: 'Mendier dans l\'euphorie générale', risk: 'safe', emoji: '🎸', outcomes: [
        { probability: 0.6, text: 'Les gens sont de bonne humeur ! 7€ récoltés facilement.', statChanges: { dignity: -3, mental: 5 }, moneyChange: 7 },
        { probability: 0.4, text: 'Tout le monde est sur son téléphone à poster des stories.', statChanges: { dignity: -3, mental: -2 } },
      ]},
      { text: 'Chanter les chansons du concert', risk: 'normal', emoji: '🎤', outcomes: [
        { probability: 0.5, text: 'Votre reprise est applaudie ! 5€ et des rires.', statChanges: { mental: 10, dignity: 5 }, moneyChange: 5, respectChange: 2 },
        { probability: 0.5, text: 'Faux comme une casserole. Les gens fuient.', statChanges: { dignity: -8, mental: -3 } },
      ]},
    ],
  },
  {
    id: 'beg-match-foot', title: 'La Sortie du Match', type: 'social',
    image: '/assets/beg-match-foot-PvcoeSj4wSQHaeZetgnJEk.webp',
    description: 'Le match de foot est fini. Les supporters envahissent les rues.',
    choices: [
      { text: 'Mendier auprès des supporters', risk: 'normal', emoji: '⚽', outcomes: [
        { probability: 0.4, text: 'L\'équipe locale a gagné ! Les supporters sont généreux. 8€ !', statChanges: { mental: 5 }, moneyChange: 8 },
        { probability: 0.3, text: 'L\'équipe a perdu. Les supporters sont furieux. Mauvais timing.', statChanges: { mental: -5, dignity: -5 } },
        { probability: 0.3, text: 'Un supporter vous offre une bière. Pas nutritif mais convivial.', statChanges: { thirst: 10, mental: 8, dignity: -3 } },
      ]},
      { text: 'Vendre des écharpes trouvées', risk: 'risky', emoji: '🧣', outcomes: [
        { probability: 0.3, text: 'Vous vendez 2 écharpes à 3€ chacune. Business !', statChanges: { dignity: -3, mental: 5 }, moneyChange: 6 },
        { probability: 0.7, text: 'Un supporter reconnaît SON écharpe. Tension.', statChanges: { dignity: -10, mental: -8, health: -3 } },
      ]},
    ],
  },
];

// ============ STEAL EVENTS — action "Voler" (haut risque / haute récompense) ============
const STEAL_EVENTS: GameEvent[] = [
  {
    id: 'steal-etal-marche', title: 'L\'Étal du Marché', type: 'discovery',
    description: 'Un primeur a le dos tourné. Ses fruits sont à portée de main. Personne ne regarde... ou presque.',
    choices: [
      { text: 'Chiper deux pommes vite fait', risk: 'normal', emoji: '🍎', outcomes: [
        { probability: 0.6, text: 'Mission accomplie ! Deux belles pommes dans la poche. Discret comme un chat.', statChanges: { hunger: 18, dignity: -6 } },
        { probability: 0.4, text: '"HÉ ! Le voleur !" Le primeur vous attrape par le col et vous secoue.', statChanges: { health: -8, dignity: -14, mental: -6 }, respectChange: -2 },
      ]},
      { text: 'Rafler toute la caisse de fruits', risk: 'risky', emoji: '🧺', outcomes: [
        { probability: 0.3, text: 'Jackpot ! Vous filez avec une caisse entière. Festin pour des jours.', statChanges: { hunger: 35, mental: 8, dignity: -10 }, itemGain: { id: 'caisse-fruits', name: 'Caisse de fruits', emoji: '🧺', type: 'food', value: 12, effect: { hunger: 20 } } },
        { probability: 0.7, text: 'Trop gourmand. Le marché entier vous tombe dessus. On vous reprend tout et un peu plus.', statChanges: { health: -15, dignity: -18, mental: -10 }, moneyChange: -3, respectChange: -3 },
      ]},
    ],
  },
  {
    id: 'steal-poche-costard', title: 'La Poche du Costard', type: 'discovery',
    description: 'Un homme d\'affaires dort dans le train, portefeuille qui dépasse. La tentation est énorme.',
    choices: [
      { text: 'Faire les poches en douceur', risk: 'risky', emoji: '🤏', outcomes: [
        { probability: 0.45, text: 'Vos doigts de fée font merveille. 15€ et il ronfle toujours.', moneyChange: 15, statChanges: { dignity: -8, mental: 4 }, respectChange: 1 },
        { probability: 0.55, text: 'Il se réveille en sursaut ! "Au voleur !" Vous courez, le cœur battant.', statChanges: { health: -6, mental: -10, dignity: -12 }, respectChange: -2 },
      ]},
      { text: 'Renoncer, c\'est trop risqué', risk: 'safe', emoji: '🙅', outcomes: [
        { probability: 1, text: 'Vous vous éloignez. Votre estomac grogne, mais votre conscience est tranquille.', statChanges: { mental: 3, dignity: 2 } },
      ]},
    ],
  },
  {
    id: 'steal-supermarche', title: 'Le Supermarché', type: 'discovery',
    description: 'Rayons remplis, vigile à moitié endormi. Une boîte de conserve glisserait si bien sous la veste.',
    choices: [
      { text: 'Glisser de la nourriture sous la veste', risk: 'normal', emoji: '🥫', outcomes: [
        { probability: 0.55, text: 'Vous passez les portiques l\'air de rien. Conserves et chocolat : repas assuré.', statChanges: { hunger: 25, thirst: 8, dignity: -8 }, itemGain: { id: 'conserve-volee', name: 'Conserve volée', emoji: '🥫', type: 'food', value: 5, effect: { hunger: 30 } } },
        { probability: 0.45, text: 'Le portique sonne. Le vigile se réveille enfin. Fouille humiliante devant tout le monde.', statChanges: { dignity: -18, mental: -10, health: -4 }, respectChange: -2 },
      ]},
      { text: 'Voler une bouteille d\'alcool à revendre', risk: 'risky', emoji: '🍾', outcomes: [
        { probability: 0.35, text: 'Bouteille de vin sous le bras, vous filez. Revendue au coin de la rue : 8€.', moneyChange: 8, statChanges: { dignity: -10, mental: 3 } },
        { probability: 0.65, text: 'Le vigile était bien réveillé. Il vous plaque au sol et appelle la police.', statChanges: { health: -18, dignity: -20, mental: -12 }, moneyChange: -5, respectChange: -4 },
      ]},
    ],
  },
  {
    id: 'steal-velo', title: 'Le Vélo Mal Attaché', type: 'discovery',
    description: 'Un vélo électrique, antivol bon marché à peine fermé. Il vaut une petite fortune à la revente.',
    choices: [
      { text: 'Forcer l\'antivol et filer', risk: 'risky', emoji: '🚲', outcomes: [
        { probability: 0.4, text: 'Clic ! L\'antivol cède. Revendu à un receleur : 20€. Belle prise.', moneyChange: 20, statChanges: { dignity: -12, mental: 5 }, respectChange: 2 },
        { probability: 0.6, text: 'Le propriétaire surgit du café d\'à côté. La poursuite tourne mal pour vous.', statChanges: { health: -20, dignity: -15, mental: -8 }, respectChange: -3 },
      ]},
      { text: 'Voler juste la sacoche', risk: 'normal', emoji: '👜', outcomes: [
        { probability: 0.55, text: 'La sacoche contient un casse-croûte et 4€ de monnaie. Pas mal.', moneyChange: 4, statChanges: { hunger: 12, dignity: -6 } },
        { probability: 0.45, text: 'Un passant crie pour alerter. Vous lâchez tout et détalez.', statChanges: { mental: -6, dignity: -10 }, respectChange: -1 },
      ]},
    ],
  },
  {
    id: 'steal-tronc-eglise', title: 'Le Tronc de l\'Église', type: 'discovery',
    description: 'L\'église est vide. Le tronc des offrandes déborde de pièces. Dieu regarde, paraît-il.',
    choices: [
      { text: 'Se servir dans le tronc', risk: 'risky', emoji: '⛪', outcomes: [
        { probability: 0.5, text: 'Vous récupérez 12€ en pièces. Personne, sauf peut-être le Tout-Puissant.', moneyChange: 12, statChanges: { dignity: -15, mental: -5 } },
        { probability: 0.5, text: 'Le curé sort de la sacristie. "Mon fils, que fais-tu ?" La honte vous écrase.', statChanges: { dignity: -20, mental: -12 }, respectChange: -2 },
      ]},
      { text: 'Demander l\'aumône au curé à la place', risk: 'safe', emoji: '🙏', outcomes: [
        { probability: 0.7, text: 'Le curé vous offre un repas chaud et 5€ du tronc, de bon cœur. "Reviens quand tu veux."', moneyChange: 5, statChanges: { hunger: 20, mental: 12, dignity: 8 }, respectChange: 2 },
        { probability: 0.3, text: 'Il est absent. Mais une bénévole vous donne une soupe.', statChanges: { hunger: 12, mental: 5 } },
      ]},
    ],
  },
  {
    id: 'steal-etendage', title: 'Le Linge qui Sèche', type: 'discovery',
    description: 'Au rez-de-chaussée, du linge sèche à une fenêtre ouverte. Un manteau chaud vous ferait du bien.',
    choices: [
      { text: 'Décrocher le manteau', risk: 'normal', emoji: '🧥', outcomes: [
        { probability: 0.55, text: 'Un bon manteau de laine, encore tiède du soleil. Vos nuits seront moins rudes.', statChanges: { dignity: 4, sleep: 6, health: 4 }, itemGain: { id: 'manteau-vole', name: 'Manteau volé', emoji: '🧥', type: 'armor', value: 7, defenseBonus: 2 } },
        { probability: 0.45, text: 'Une grand-mère hurle à la fenêtre : "Au secours, on me vole !" Tout le quartier se réveille.', statChanges: { mental: -8, dignity: -14 }, respectChange: -2 },
      ]},
      { text: 'Prendre les chaussettes et les sous-vêtements', risk: 'safe', emoji: '🧦', outcomes: [
        { probability: 0.8, text: 'Pas glorieux, mais des chaussettes sèches changent une vie dans la rue.', statChanges: { dignity: -4, mental: 4, health: 3 } },
        { probability: 0.2, text: 'Un chien de garde aboie. Vous filez avec une seule chaussette. Mieux que rien.', statChanges: { dignity: -6, mental: -2 } },
      ]},
    ],
  },
];

// ============ REST EVENTS (30) ============
const REST_EVENTS: GameEvent[] = [
  {
    id: 'rest-pont-riviere', title: 'Le Pont sur la Rivière', type: 'narrative',
    image: '/assets/rest-pont-riviere-ZkfvuMX445ho8WdARa8BGq.webp',
    description: 'Sous le pont, c\'est sec et abrité. Le bruit de l\'eau est apaisant.',
    choices: [
      { text: 'S\'installer pour la nuit', risk: 'safe', emoji: '🌉', outcomes: [
        { probability: 0.7, text: 'Nuit paisible bercée par le clapotis. Vous dormez comme un bébé.', statChanges: { sleep: 20, mental: 5 } },
        { probability: 0.3, text: 'L\'eau monte pendant la nuit. Réveil les pieds mouillés.', statChanges: { sleep: 8, health: -3 } },
      ]},
      { text: 'Explorer sous le pont', risk: 'normal', emoji: '🔦', outcomes: [
        { probability: 0.5, text: 'Vous trouvez une couverture oubliée par un autre SDF. Aubaine !', statChanges: { sleep: 15, mental: 3 } },
        { probability: 0.5, text: 'Des rats. Beaucoup de rats. Vous changez de spot.', statChanges: { mental: -5, sleep: 5 } },
      ]},
    ],
  },
  {
    id: 'rest-lavomatic', title: 'Le Lavomatic 24h', type: 'narrative',
    image: '/assets/rest-lavomatic-koaRprcJ9mvGN9vvKFySBu.webp',
    description: 'Le lavomatic est ouvert toute la nuit. Chaud, éclairé, avec des chaises.',
    choices: [
      { text: 'Dormir sur les chaises', risk: 'safe', emoji: '🧺', outcomes: [
        { probability: 0.6, text: 'Le ronronnement des machines vous berce. Nuit correcte.', statChanges: { sleep: 18, mental: 3 } },
        { probability: 0.4, text: 'Le gérant passe à 3h. "C\'est pas un hôtel !" Dehors.', statChanges: { sleep: 8, dignity: -5 } },
      ]},
      { text: 'Laver vos vêtements (si vous avez de l\'argent)', risk: 'safe', emoji: '👕', outcomes: [
        { probability: 0.7, text: 'Vêtements propres ! Vous vous sentez comme neuf. Dignité restaurée.', statChanges: { dignity: 15, mental: 8, sleep: 5 } },
        { probability: 0.3, text: 'La machine avale votre pièce sans démarrer. Arnaque mécanique.', statChanges: { mental: -5 } },
      ]},
    ],
  },
  {
    id: 'rest-parking-souterrain', title: 'Le Parking Souterrain', type: 'narrative',
    image: '/assets/rest-parking-souterrain-Rgkuiwyd7ZtiJ3qQzx2dHW.webp',
    description: 'Le parking souterrain est presque vide la nuit. Sec, à l\'abri du vent.',
    choices: [
      { text: 'Se cacher entre les voitures', risk: 'normal', emoji: '🅿️', outcomes: [
        { probability: 0.5, text: 'Nuit tranquille. Le béton n\'est pas confortable mais c\'est sec.', statChanges: { sleep: 15 } },
        { probability: 0.3, text: 'Un vigile fait sa ronde. Vous devez bouger toutes les heures.', statChanges: { sleep: 8, mental: -3 } },
        { probability: 0.2, text: 'Une alarme de voiture se déclenche ! Panique et fuite.', statChanges: { sleep: -5, mental: -8 } },
      ]},
      { text: 'Dormir dans la cage d\'escalier', risk: 'safe', emoji: '🚪', outcomes: [
        { probability: 0.7, text: 'Spot discret. Vous dormez sans être dérangé.', statChanges: { sleep: 18 } },
        { probability: 0.3, text: 'Un résident vous découvre au matin. Gênant.', statChanges: { sleep: 12, dignity: -5 } },
      ]},
    ],
  },
  {
    id: 'rest-cabane-carton', title: 'Le Château de Carton', type: 'narrative',
    image: '/assets/rest-cabane-carton-Q65zGixABM5SKqrjKEaS4x.webp',
    description: 'Vous avez assez de cartons pour construire un véritable palace.',
    choices: [
      { text: 'Construire un abri élaboré', risk: 'normal', emoji: '🏗️', outcomes: [
        { probability: 0.6, text: 'Chef-d\'oeuvre architectural ! Chaud, sec, presque confortable.', statChanges: { sleep: 25, dignity: 5, mental: 5 } },
        { probability: 0.4, text: 'Le vent emporte votre construction. Retour à la case départ.', statChanges: { sleep: 5, mental: -5 } },
      ]},
      { text: 'Juste s\'enrouler dans un carton', risk: 'safe', emoji: '📦', outcomes: [
        { probability: 0.7, text: 'Pas le grand luxe, mais ça fait le job.', statChanges: { sleep: 15 } },
        { probability: 0.3, text: 'Le carton est mouillé. Nuit froide et humide.', statChanges: { sleep: 5, health: -5 } },
      ]},
    ],
  },
  {
    id: 'rest-banc-eglise', title: 'Le Banc de l\'Église', type: 'narrative',
    image: '/assets/rest-banc-eglise-ZdyDwJEYtPgNBbSofzbiyw.webp',
    description: 'Le banc devant l\'église est large et abrité par un auvent.',
    choices: [
      { text: 'S\'allonger sur le banc', risk: 'safe', emoji: '⛪', outcomes: [
        { probability: 0.7, text: 'Le prêtre sort et vous couvre d\'une couverture. Humanité.', statChanges: { sleep: 20, mental: 10, dignity: 5 } },
        { probability: 0.3, text: 'Le banc est dur comme la pierre. Dos en compote au réveil.', statChanges: { sleep: 10, health: -3 } },
      ]},
      { text: 'Entrer dans l\'église si elle est ouverte', risk: 'safe', emoji: '🕯️', outcomes: [
        { probability: 0.5, text: 'L\'église est ouverte ! Vous dormez sur un banc intérieur. Chaleur divine.', statChanges: { sleep: 25, mental: 8 } },
        { probability: 0.5, text: 'Fermée à clé. Le banc extérieur fera l\'affaire.', statChanges: { sleep: 12 } },
      ]},
    ],
  },
  {
    id: 'rest-toit-immeuble', title: 'Le Toit de l\'Immeuble', type: 'narrative',
    image: '/assets/rest-toit-immeuble-6ryUDQFMVD6QoZDFqJj4s7.webp',
    description: 'Vous avez trouvé l\'accès au toit. Vue sur les étoiles.',
    choices: [
      { text: 'Dormir à la belle étoile', risk: 'normal', emoji: '⭐', outcomes: [
        { probability: 0.5, text: 'Nuit magique sous les étoiles. Le vent est doux.', statChanges: { sleep: 20, mental: 10 } },
        { probability: 0.3, text: 'Il se met à pleuvoir. Pas d\'abri sur un toit.', statChanges: { sleep: 5, health: -5, mental: -3 } },
        { probability: 0.2, text: 'Vous roulez dans votre sommeil. Réveil brutal au bord du vide !', statChanges: { sleep: 8, mental: -10 } },
      ]},
      { text: 'Installer un campement', risk: 'safe', emoji: '🏕️', outcomes: [
        { probability: 0.7, text: 'Avec des bâches et du carton, vous créez un nid douillet.', statChanges: { sleep: 22, mental: 5 } },
        { probability: 0.3, text: 'Le vent emporte tout. Nuit à la dure.', statChanges: { sleep: 10 } },
      ]},
    ],
  },
  {
    id: 'rest-abribus', title: 'L\'Abribus', type: 'narrative',
    image: '/assets/rest-abribus-T6i3s6bQ4qyZfBauUNWeu6.webp',
    description: 'L\'abribus est vide. Le plexiglas protège du vent. Presque confortable.',
    choices: [
      { text: 'Dormir assis sur le banc', risk: 'safe', emoji: '🚌', outcomes: [
        { probability: 0.6, text: 'Nuit correcte. Le premier bus vous réveille à 5h30.', statChanges: { sleep: 15 } },
        { probability: 0.4, text: 'Un ivrogne s\'installe à côté. Il ronfle. Fort.', statChanges: { sleep: 8, mental: -3 } },
      ]},
      { text: 'S\'allonger par terre dans l\'abribus', risk: 'normal', emoji: '😴', outcomes: [
        { probability: 0.5, text: 'Plus confortable qu\'on ne croit. Nuit passable.', statChanges: { sleep: 18, dignity: -5 } },
        { probability: 0.5, text: 'La police passe. "Circulez." Pas de repos.', statChanges: { sleep: 3, dignity: -8 } },
      ]},
    ],
  },
  {
    id: 'rest-cave-abandonnee', title: 'La Cave Abandonnée', type: 'narrative',
    image: '/assets/rest-cave-abandonnee-PoPAKkfwWsspJhMjvZym9q.webp',
    description: 'Une cave d\'immeuble dont la porte ne ferme plus. Sombre mais sec.',
    choices: [
      { text: 'S\'installer dans la cave', risk: 'normal', emoji: '🏚️', outcomes: [
        { probability: 0.5, text: 'Nuit au sec et au chaud. Les murs épais isolent bien.', statChanges: { sleep: 22, health: 3 } },
        { probability: 0.3, text: 'Des bruits suspects. Vous ne dormez que d\'un oeil.', statChanges: { sleep: 10, mental: -5 } },
        { probability: 0.2, text: 'Un autre SDF est déjà là. Cohabitation tendue.', statChanges: { sleep: 8, mental: -3 } },
      ]},
      { text: 'Explorer la cave d\'abord', risk: 'normal', emoji: '🔦', outcomes: [
        { probability: 0.4, text: 'Vous trouvez des conserves oubliées ! Et un matelas.', statChanges: { sleep: 20, hunger: 10 } },
        { probability: 0.6, text: 'Juste des toiles d\'araignée et de l\'humidité.', statChanges: { sleep: 12 } },
      ]},
    ],
  },
  {
    id: 'rest-hamac-parc', title: 'Le Hamac Improvisé', type: 'narrative',
    image: '/assets/rest-hamac-parc-JKRnP6QzCq5LRVcbHvvA62.webp',
    description: 'Deux arbres parfaitement espacés. Avec une couverture, vous pouvez faire un hamac.',
    choices: [
      { text: 'Installer le hamac', risk: 'normal', emoji: '🌴', outcomes: [
        { probability: 0.5, text: 'Le hamac tient ! Nuit bercée par le vent. Paradis.', statChanges: { sleep: 25, mental: 8 } },
        { probability: 0.5, text: 'Le noeud lâche à 3h du matin. Chute. Aïe.', statChanges: { sleep: 8, health: -5, mental: -3 } },
      ]},
      { text: 'Dormir au pied des arbres', risk: 'safe', emoji: '🌳', outcomes: [
        { probability: 0.7, text: 'Les racines font un matelas naturel. Pas si mal.', statChanges: { sleep: 15, mental: 3 } },
        { probability: 0.3, text: 'Les fourmis. Partout. PARTOUT.', statChanges: { sleep: 5, mental: -5, health: -2 } },
      ]},
    ],
  },
  {
    id: 'rest-combat-reveil', title: 'Le Réveil Brutal', type: 'combat',
    image: '/assets/rest-combat-reveil-nz6rPGatE5MccSSp5M9iMT.webp',
    description: 'Vous dormez paisiblement quand un bruit vous réveille. Quelqu\'un fouille vos affaires !',
    choices: [
      { text: 'Confronter le voleur', risk: 'risky', emoji: '😤', outcomes: [
        { probability: 0.4, text: 'Vous l\'effrayez ! Il fuit. Vos affaires sont intactes.', statChanges: { sleep: 5, mental: 5 } },
        { probability: 0.6, text: 'C\'est un type costaud. Il vous pousse et prend votre sac.', statChanges: { health: -8, mental: -10, dignity: -5 } },
      ]},
      { text: 'Faire semblant de dormir', risk: 'safe', emoji: '😴', outcomes: [
        { probability: 0.5, text: 'Il prend quelques pièces et part. Vous perdez 3€ mais gardez votre santé.', statChanges: { mental: -5 } },
        { probability: 0.5, text: 'Il ne trouve rien d\'intéressant et part. Ouf.', statChanges: { mental: -3, sleep: -5 } },
      ]},
    ],
  },
  {
    id: 'rest-jardin-secret', title: 'Le Jardin Secret', type: 'discovery',
    image: '/assets/rest-jardin-secret-D3emeTRZCkD6yK6fmxucMr.webp',
    description: 'Derrière un mur, un jardin abandonné. Herbes folles, banc en pierre, fontaine tarie.',
    choices: [
      { text: 'S\'installer dans le jardin', risk: 'safe', emoji: '🌿', outcomes: [
        { probability: 0.8, text: 'Paradis caché ! Calme absolu, herbe douce, abri du vent.', statChanges: { sleep: 25, mental: 12, dignity: 3 } },
        { probability: 0.2, text: 'Le propriétaire revient ! "C\'est privé !" Vous partez.', statChanges: { sleep: 5, dignity: -5 } },
      ]},
      { text: 'Explorer le jardin', risk: 'safe', emoji: '🔍', outcomes: [
        { probability: 0.6, text: 'Vous trouvez des herbes aromatiques et un robinet qui marche !', statChanges: { thirst: 15, mental: 8 } },
        { probability: 0.4, text: 'Juste des orties et des ronces. Aïe.', statChanges: { health: -3 } },
      ]},
    ],
  },
  {
    id: 'rest-grenier', title: 'Le Grenier Oublié', type: 'discovery',
    image: '/assets/rest-grenier-m7geqfLCEDsNwCuwNMJhXK.webp',
    description: 'Un escalier mène à un grenier dont la porte est entrouverte.',
    choices: [
      { text: 'Monter explorer', risk: 'normal', emoji: '🪜', outcomes: [
        { probability: 0.5, text: 'Un grenier plein de vieux meubles ! Un matelas, des couvertures. Palace !', statChanges: { sleep: 28, mental: 10 } },
        { probability: 0.3, text: 'Le plancher craque dangereusement. Vous redescendez vite.', statChanges: { mental: -5, sleep: 5 } },
        { probability: 0.2, text: 'Le propriétaire vous entend ! "Qui est là ?!" Fuite.', statChanges: { mental: -8, dignity: -5 } },
      ]},
      { text: 'Dormir dans l\'escalier', risk: 'safe', emoji: '🪜', outcomes: [
        { probability: 0.7, text: 'L\'escalier est abrité. Nuit correcte.', statChanges: { sleep: 15 } },
        { probability: 0.3, text: 'Un voisin vous enjambe à 6h. Gênant.', statChanges: { sleep: 10, dignity: -5 } },
      ]},
    ],
  },
  {
    id: 'rest-fourgon-abandonne', title: 'Le Fourgon Abandonné', type: 'discovery',
    image: '/assets/rest-fourgon-abandonne-XoJDy85GdkXUPTQXiCseeQ.webp',
    description: 'Un vieux fourgon de livraison rouillé. La porte arrière est ouverte.',
    choices: [
      { text: 'Dormir dans le fourgon', risk: 'normal', emoji: '🚐', outcomes: [
        { probability: 0.6, text: 'Sec, à l\'abri du vent. Le métal garde un peu de chaleur.', statChanges: { sleep: 20, mental: 3 } },
        { probability: 0.4, text: 'Le fourgon est glacial. Nuit difficile.', statChanges: { sleep: 10, health: -3 } },
      ]},
      { text: 'Aménager le fourgon', risk: 'normal', emoji: '🏠', outcomes: [
        { probability: 0.5, text: 'Avec du carton et des couvertures, c\'est presque un studio !', statChanges: { sleep: 25, mental: 8, dignity: 3 } },
        { probability: 0.5, text: 'Le propriétaire revient chercher le fourgon. Surprise !', statChanges: { sleep: 5, dignity: -8, mental: -5 } },
      ]},
    ],
  },
  {
    id: 'rest-wagon-train', title: 'Le Wagon de Train', type: 'discovery',
    image: '/assets/rest-wagon-train-Nh3WT9QiYunMe4t55bsuDu.webp',
    description: 'Un wagon de marchandises est ouvert sur une voie de garage.',
    choices: [
      { text: 'Dormir dans le wagon', risk: 'normal', emoji: '🚃', outcomes: [
        { probability: 0.5, text: 'Le wagon est rempli de paille ! Nuit de luxe.', statChanges: { sleep: 25, mental: 5 } },
        { probability: 0.3, text: 'Le train se met en marche ! Réveil en sursaut.', statChanges: { sleep: 5, mental: -10 } },
        { probability: 0.2, text: 'Un contrôleur vous trouve. Amende de 5€.', statChanges: { sleep: 8, dignity: -10 } },
      ]},
      { text: 'Rester sur le quai', risk: 'safe', emoji: '🚉', outcomes: [
        { probability: 0.7, text: 'Le quai est abrité. Nuit passable.', statChanges: { sleep: 12 } },
        { probability: 0.3, text: 'Le vent s\'engouffre. Nuit froide.', statChanges: { sleep: 8, health: -3 } },
      ]},
    ],
  },
  {
    id: 'rest-tente-fortune', title: 'La Tente de Fortune', type: 'narrative',
    image: '/assets/rest-tente-fortune-3Wjo7we5oS4ENU5hbyn6xd.webp',
    description: 'Avec des sacs poubelle et des bâtons, vous pouvez construire une tente.',
    choices: [
      { text: 'Construire la tente', risk: 'normal', emoji: '⛺', outcomes: [
        { probability: 0.6, text: 'Votre tente tient ! Nuit au sec, presque confortable.', statChanges: { sleep: 22, mental: 5, dignity: 3 } },
        { probability: 0.4, text: 'La tente s\'effondre à 2h du matin. Retour à la case départ.', statChanges: { sleep: 8, mental: -5 } },
      ]},
      { text: 'Dormir sans tente', risk: 'safe', emoji: '🌙', outcomes: [
        { probability: 0.5, text: 'La nuit est douce. Pas besoin de tente finalement.', statChanges: { sleep: 15 } },
        { probability: 0.5, text: 'Il pleut. Vous regrettez de ne pas avoir construit la tente.', statChanges: { sleep: 5, health: -5 } },
      ]},
    ],
  },
  {
    id: 'rest-musee-nuit', title: 'Le Musée la Nuit', type: 'narrative',
    image: '/assets/rest-musee-nuit-TRWpZcKL5eRM9F6cUsu5qv.webp',
    description: 'Le musée ferme ses portes. Mais vous connaissez une entrée de service...',
    choices: [
      { text: 'Se cacher dans le musée', risk: 'risky', emoji: '🏛️', outcomes: [
        { probability: 0.3, text: 'Nuit au musée ! Vous dormez devant un Monet. Classe.', statChanges: { sleep: 25, mental: 15, dignity: 10 } },
        { probability: 0.4, text: 'L\'alarme se déclenche ! Course-poursuite avec le gardien.', statChanges: { sleep: -5, mental: -8, dignity: -5 } },
        { probability: 0.3, text: 'Vous trouvez le vestiaire du personnel. Canapé et café !', statChanges: { sleep: 22, thirst: 10, mental: 8 } },
      ]},
      { text: 'Dormir devant le musée', risk: 'safe', emoji: '🏛️', outcomes: [
        { probability: 0.7, text: 'L\'auvent du musée protège de la pluie. Nuit correcte.', statChanges: { sleep: 15 } },
        { probability: 0.3, text: 'Le gardien vous chasse. "Pas de SDF devant le musée !"', statChanges: { sleep: 5, dignity: -8 } },
      ]},
    ],
  },
  {
    id: 'rest-bibliotheque-nuit', title: 'La Bibliothèque la Nuit', type: 'narrative',
    image: '/assets/rest-bibliotheque-nuit-e4GzMrQe5jEJDeQou4BxEF.webp',
    description: 'La bibliothèque ferme. Mais la porte de derrière ne ferme pas bien...',
    choices: [
      { text: 'Se cacher dans la bibliothèque', risk: 'risky', emoji: '📚', outcomes: [
        { probability: 0.4, text: 'Nuit parmi les livres ! Vous lisez jusqu\'à vous endormir. Intellectuel.', statChanges: { sleep: 22, mental: 15 } },
        { probability: 0.6, text: 'Le système d\'alarme vous trahit. Le gardien arrive.', statChanges: { sleep: 5, dignity: -10, mental: -5 } },
      ]},
      { text: 'Dormir dans le jardin de la bibliothèque', risk: 'safe', emoji: '🌳', outcomes: [
        { probability: 0.7, text: 'Le jardin est calme et abrité. Bonne nuit.', statChanges: { sleep: 18, mental: 5 } },
        { probability: 0.3, text: 'Les arroseurs automatiques se déclenchent à 4h. Douche froide.', statChanges: { sleep: 10, health: -3, dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'rest-container', title: 'Le Container Maritime', type: 'discovery',
    image: '/assets/rest-container-BMckVJDeMBxYKECCiDfLup.webp',
    description: 'Un container de chantier est ouvert. Sec, solide, à l\'abri de tout.',
    choices: [
      { text: 'Dormir dans le container', risk: 'normal', emoji: '📦', outcomes: [
        { probability: 0.6, text: 'Le container est parfait ! Insonorisé, sec, spacieux.', statChanges: { sleep: 25, mental: 5 } },
        { probability: 0.2, text: 'Quelqu\'un ferme le container pendant la nuit ! Panique au réveil.', statChanges: { sleep: 15, mental: -15 } },
        { probability: 0.2, text: 'Le container sent le poisson. Nuit nauséabonde.', statChanges: { sleep: 12, mental: -5 } },
      ]},
      { text: 'Utiliser le container comme abri de jour', risk: 'safe', emoji: '☀️', outcomes: [
        { probability: 0.8, text: 'Parfait pour stocker vos affaires et vous reposer.', statChanges: { sleep: 15, mental: 5 } },
        { probability: 0.2, text: 'Le chantier reprend. Ouvriers surpris. Vous partez.', statChanges: { dignity: -5 } },
      ]},
    ],
  },
  {
    id: 'rest-cabine-telephone', title: 'La Cabine Téléphonique', type: 'narrative',
    image: '/assets/rest-cabine-telephone-oCcEKE3RxAKWGf5xrjeMLz.webp',
    description: 'Une vieille cabine téléphonique. Étroite mais à l\'abri du vent et de la pluie.',
    choices: [
      { text: 'Dormir debout dans la cabine', risk: 'safe', emoji: '📞', outcomes: [
        { probability: 0.5, text: 'Vous dormez debout comme un cheval. Étonnamment reposant.', statChanges: { sleep: 12, mental: -2 } },
        { probability: 0.5, text: 'Impossible de dormir debout. Nuit blanche.', statChanges: { sleep: 3, mental: -5 } },
      ]},
      { text: 'S\'asseoir par terre dans la cabine', risk: 'safe', emoji: '🪑', outcomes: [
        { probability: 0.7, text: 'Recroquevillé mais au sec. Nuit passable.', statChanges: { sleep: 15 } },
        { probability: 0.3, text: 'Un ivrogne essaie d\'utiliser le téléphone. Réveil brutal.', statChanges: { sleep: 8, mental: -3 } },
      ]},
    ],
  },
];

// ============ TRAVEL EVENTS (30) ============
const TRAVEL_EVENTS: GameEvent[] = [
  {
    id: 'travel-ruelle-sombre', title: 'La Ruelle Sombre', type: 'narrative',
    image: '/assets/travel-ruelle-sombre-kkju3xeeLBCHpbj63J2v27.webp',
    description: 'Un raccourci par une ruelle sombre. Ça sent le danger... et les poubelles.',
    choices: [
      { text: 'Prendre la ruelle', risk: 'risky', emoji: '🌑', outcomes: [
        { probability: 0.4, text: 'Raccourci efficace ! Vous trouvez même 3€ par terre.', statChanges: { mental: 3 }, moneyChange: 3 },
        { probability: 0.3, text: 'Cul-de-sac. Demi-tour obligatoire.', statChanges: { sleep: -3, mental: -3 } },
        { probability: 0.3, text: 'Un type louche vous barre le passage. "La bourse ou la vie !"', statChanges: { health: -5, dignity: -5, mental: -5 }, moneyChange: -5 },
      ]},
      { text: 'Contourner par la rue principale', risk: 'safe', emoji: '🛤️', outcomes: [
        { probability: 1.0, text: 'Plus long mais plus sûr. Vous profitez des vitrines.', statChanges: { mental: 2 } },
      ]},
    ],
  },
  {
    id: 'travel-tunnel-metro', title: 'Le Tunnel de Métro', type: 'narrative',
    image: '/assets/travel-tunnel-metro-8zaoahxSXU8Wrt9wxJGRRX.webp',
    description: 'Un tunnel de métro désaffecté. Sombre, humide, mais c\'est un raccourci.',
    choices: [
      { text: 'Traverser le tunnel', risk: 'risky', emoji: '🚇', outcomes: [
        { probability: 0.3, text: 'Vous traversez sans encombre. Frissons mais efficace.', statChanges: { mental: -2 } },
        { probability: 0.4, text: 'Des rats ! Des centaines de rats ! Vous courez.', statChanges: { health: -3, mental: -8, sleep: -3 } },
        { probability: 0.3, text: 'Vous trouvez un ancien campement avec des conserves.', statChanges: { hunger: 10, mental: 3 } },
      ]},
      { text: 'Prendre le métro normalement (si vous avez l\'argent)', risk: 'normal', emoji: '🎫', outcomes: [
        { probability: 0.6, text: 'Trajet confortable. Presque comme un citoyen normal.', statChanges: { mental: 5, dignity: 3 } },
        { probability: 0.4, text: 'Contrôle ! Pas de ticket. Amende de 5€.', statChanges: { dignity: -10, mental: -5 }, moneyChange: -5 },
      ]},
    ],
  },
  {
    id: 'travel-parc-nuit', title: 'Le Parc la Nuit', type: 'narrative',
    image: '/assets/travel-parc-nuit-HKdnTyPJxjUGL9aq8yv6ym.webp',
    description: 'Traverser le parc de nuit. Les lampadaires sont en panne.',
    choices: [
      { text: 'Traverser dans le noir', risk: 'normal', emoji: '🌙', outcomes: [
        { probability: 0.5, text: 'Traversée sans encombre. Les étoiles guident vos pas.', statChanges: { mental: 5 } },
        { probability: 0.3, text: 'Vous trébuchez sur une racine. Genou en sang.', statChanges: { health: -5, mental: -3 } },
        { probability: 0.2, text: 'Un hibou hulule. Vous sursautez et tombez dans un buisson.', statChanges: { health: -2, dignity: -3 } },
      ]},
      { text: 'Faire le tour par les rues éclairées', risk: 'safe', emoji: '💡', outcomes: [
        { probability: 1.0, text: 'Plus long mais vous arrivez entier.', statChanges: { sleep: -3 } },
      ]},
    ],
  },
  {
    id: 'travel-pont-autoroute', title: 'Le Pont de l\'Autoroute', type: 'narrative',
    image: '/assets/travel-pont-autoroute-Kp7ZJJXx5GyopiPDDNjVhC.webp',
    description: 'Le pont au-dessus de l\'autoroute. Bruyant, venteux, mais c\'est le chemin le plus court.',
    choices: [
      { text: 'Traverser le pont', risk: 'safe', emoji: '🌉', outcomes: [
        { probability: 0.7, text: 'Le vent est violent mais vous tenez bon. Vue impressionnante.', statChanges: { mental: 3 } },
        { probability: 0.3, text: 'Le vent emporte votre chapeau (si vous en avez un). Adieu.', statChanges: { mental: -3, dignity: -2 } },
      ]},
      { text: 'Passer sous le pont', risk: 'normal', emoji: '🏗️', outcomes: [
        { probability: 0.5, text: 'Sous le pont, d\'autres SDF ont un feu. Ils partagent leur soupe.', statChanges: { hunger: 10, mental: 8, thirst: 5 } },
        { probability: 0.5, text: '"C\'est notre territoire." Pas les bienvenus.', statChanges: { mental: -5, dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'travel-marche-matin', title: 'Le Marché du Matin', type: 'discovery',
    image: '/assets/travel-marche-matin-UBjudamtA3vaA6pmwtFA3V.webp',
    description: 'Le marché s\'installe. Les commerçants déchargent leurs camions.',
    choices: [
      { text: 'Aider à décharger', risk: 'normal', emoji: '💪', outcomes: [
        { probability: 0.6, text: 'Un maraîcher vous paie 4€ et vous donne des fruits abîmés.', statChanges: { hunger: 15, dignity: 5, sleep: -3 }, moneyChange: 4 },
        { probability: 0.4, text: '"On n\'a pas besoin d\'aide." Mais vous chapardez une pomme.', statChanges: { hunger: 5, dignity: -3 } },
      ]},
      { text: 'Récupérer les fruits tombés', risk: 'safe', emoji: '🍎', outcomes: [
        { probability: 0.7, text: 'Pommes, oranges, une banane. Petit déjeuner gratuit !', statChanges: { hunger: 12, mental: 5 } },
        { probability: 0.3, text: 'Un commerçant vous crie dessus. "Touche pas à ma marchandise !"', statChanges: { dignity: -5, mental: -3 } },
      ]},
    ],
  },
  {
    id: 'travel-gare-routiere', title: 'La Gare Routière', type: 'narrative',
    image: '/assets/travel-gare-routiere-DaYuWGLLqaQsSrZHHQEV8Z.webp',
    description: 'La gare routière est animée. Des bus partent vers d\'autres villes.',
    choices: [
      { text: 'Monter dans un bus sans payer', risk: 'risky', emoji: '🚌', outcomes: [
        { probability: 0.3, text: 'Vous vous faufilez ! Trajet gratuit et chauffé.', statChanges: { mental: 5, sleep: 5 } },
        { probability: 0.7, text: 'Le chauffeur vous repère. "Descends ou j\'appelle les flics."', statChanges: { dignity: -10, mental: -5 } },
      ]},
      { text: 'Attendre dans la salle d\'attente chauffée', risk: 'safe', emoji: '🏠', outcomes: [
        { probability: 0.8, text: '2h au chaud. Toilettes gratuites. Pas mal.', statChanges: { sleep: 8, thirst: 5, dignity: 3 } },
        { probability: 0.2, text: 'Un agent vous demande votre billet. Pas de billet, pas de salle.', statChanges: { dignity: -5 } },
      ]},
    ],
  },
  {
    id: 'travel-velo-trouve', title: 'Le Vélo Trouvé', type: 'discovery',
    image: '/assets/travel-velo-trouve-Rp3Mv8FMSxvhqiT2kp8SeL.webp',
    description: 'Un vélo sans antivol est posé contre un mur. Tentant...',
    choices: [
      { text: 'Emprunter le vélo', risk: 'risky', emoji: '🚲', outcomes: [
        { probability: 0.4, text: 'Vous pédalez à toute vitesse ! Trajet rapide et grisant.', statChanges: { mental: 8, sleep: -2 } },
        { probability: 0.6, text: 'Le propriétaire vous court après. "Mon vélo !" Vous le rendez, essoufflé.', statChanges: { dignity: -10, mental: -5, sleep: -5 } },
      ]},
      { text: 'Le laisser et marcher', risk: 'safe', emoji: '🚶', outcomes: [
        { probability: 1.0, text: 'L\'honnêteté, c\'est tout ce qui vous reste. Vous marchez la tête haute.', statChanges: { dignity: 3, mental: 3 } },
      ]},
    ],
  },
  {
    id: 'travel-chantier-nuit', title: 'Le Chantier de Nuit', type: 'narrative',
    image: '/assets/travel-chantier-nuit-gB3qPEuPg6F49zbknTKjeU.webp',
    description: 'Un chantier de construction. La nuit, personne ne surveille.',
    choices: [
      { text: 'Traverser le chantier', risk: 'normal', emoji: '🏗️', outcomes: [
        { probability: 0.5, text: 'Raccourci efficace. Vous trouvez un casque de chantier.', statChanges: { mental: 3 } },
        { probability: 0.3, text: 'Vous vous prenez les pieds dans un câble. Chute.', statChanges: { health: -5, mental: -3 } },
        { probability: 0.2, text: 'Le gardien de nuit ! "Hé ! Qu\'est-ce que vous faites là ?!"', statChanges: { dignity: -5, mental: -5 } },
      ]},
      { text: 'Contourner le chantier', risk: 'safe', emoji: '🔄', outcomes: [
        { probability: 1.0, text: 'Le détour ajoute 15 minutes mais vous êtes en sécurité.', statChanges: { sleep: -2 } },
      ]},
    ],
  },
  {
    id: 'travel-riviere', title: 'La Rivière', type: 'narrative',
    image: '/assets/travel-riviere-73CPTDVdUhEB8JSCGFD5xk.webp',
    description: 'La rivière coupe votre chemin. Le pont est à 500m, mais vous pourriez traverser à gué.',
    choices: [
      { text: 'Traverser à gué', risk: 'risky', emoji: '🌊', outcomes: [
        { probability: 0.3, text: 'L\'eau est peu profonde ! Vous traversez les pieds mouillés mais rapidement.', statChanges: { health: -2, mental: 3 } },
        { probability: 0.4, text: 'Plus profond que prévu ! Vous êtes trempé jusqu\'à la taille.', statChanges: { health: -5, dignity: -5 } },
        { probability: 0.3, text: 'Le courant est fort ! Vous manquez de tomber. Effrayant.', statChanges: { health: -8, mental: -8 } },
      ]},
      { text: 'Prendre le pont', risk: 'safe', emoji: '🌉', outcomes: [
        { probability: 1.0, text: 'Le pont est sûr. Vous regardez l\'eau couler en dessous. Méditatif.', statChanges: { mental: 3 } },
      ]},
    ],
  },
  {
    id: 'travel-tramway', title: 'Le Tramway', type: 'narrative',
    image: '/assets/travel-tramway-RwMPRjHnfokerBZDaByMA9.webp',
    description: 'Le tramway passe. Vous pourriez monter sans payer...',
    choices: [
      { text: 'Monter sans ticket', risk: 'risky', emoji: '🚊', outcomes: [
        { probability: 0.5, text: 'Trajet tranquille. Personne ne contrôle.', statChanges: { mental: 5, sleep: 3 } },
        { probability: 0.5, text: 'Contrôle ! "Votre titre de transport ?" Amende de 5€.', statChanges: { dignity: -8, mental: -5 }, moneyChange: -5 },
      ]},
      { text: 'Marcher le long des rails', risk: 'safe', emoji: '🚶', outcomes: [
        { probability: 0.8, text: 'Balade agréable le long des rails. Vous arrivez à destination.', statChanges: { mental: 3 } },
        { probability: 0.2, text: 'Vous vous perdez. Le tramway ne va pas où vous pensiez.', statChanges: { mental: -3, sleep: -3 } },
      ]},
    ],
  },
  {
    id: 'travel-skateboard', title: 'Le Skateboard Trouvé', type: 'discovery',
    image: '/assets/travel-skateboard-jb8FwsquDYya2TAppoZNmo.webp',
    description: 'Un skateboard abandonné sur le trottoir. Les roues tournent encore.',
    choices: [
      { text: 'Utiliser le skateboard', risk: 'normal', emoji: '🛹', outcomes: [
        { probability: 0.5, text: 'Vous roulez ! C\'est plus rapide que marcher. Et plutôt fun.', statChanges: { mental: 8, dignity: 3 } },
        { probability: 0.5, text: 'Vous tombez après 50 mètres. Vos genoux s\'en souviennent.', statChanges: { health: -5, dignity: -5 } },
      ]},
      { text: 'Le vendre', risk: 'safe', emoji: '💰', outcomes: [
        { probability: 0.6, text: 'Un ado vous l\'achète 5€. Business.', statChanges: { mental: 3 }, moneyChange: 5 },
        { probability: 0.4, text: 'Personne n\'en veut. Vous le laissez.', statChanges: { mental: -1 } },
      ]},
    ],
  },
  {
    id: 'travel-egout', title: 'Les Égouts', type: 'narrative',
    image: '/assets/travel-egout-EaEg5VZENML2osawgbXA7E.webp',
    description: 'Une bouche d\'égout ouverte. Le raccourci ultime... si vous supportez l\'odeur.',
    choices: [
      { text: 'Descendre dans les égouts', risk: 'risky', emoji: '🕳️', outcomes: [
        { probability: 0.3, text: 'Vous traversez rapidement. L\'odeur est atroce mais c\'est efficace.', statChanges: { dignity: -10, mental: -3 } },
        { probability: 0.4, text: 'Vous vous perdez dans le labyrinthe souterrain. 2h de marche.', statChanges: { sleep: -8, mental: -8, dignity: -5 } },
        { probability: 0.3, text: 'Vous trouvez un passage secret vers une cave de restaurant !', statChanges: { hunger: 15, mental: 5 } },
      ]},
      { text: 'Rester en surface', risk: 'safe', emoji: '☀️', outcomes: [
        { probability: 1.0, text: 'Vous gardez votre dignité et vos narines intactes.', statChanges: { mental: 2, dignity: 2 } },
      ]},
    ],
  },
  {
    id: 'travel-bus-nuit', title: 'Le Bus de Nuit', type: 'narrative',
    image: '/assets/travel-bus-nuit-QnRsg4teZWjpTKm79GJXx3.webp',
    description: 'Le bus de nuit passe. Dernier service. Presque vide.',
    choices: [
      { text: 'Monter et faire semblant de dormir', risk: 'normal', emoji: '🚌', outcomes: [
        { probability: 0.6, text: 'Le chauffeur ne dit rien. Vous faites l\'aller-retour au chaud.', statChanges: { sleep: 10, mental: 5 } },
        { probability: 0.4, text: '"Terminus ! Tout le monde descend !" Trajet trop court.', statChanges: { sleep: 5 } },
      ]},
      { text: 'Demander au chauffeur de vous déposer', risk: 'safe', emoji: '🙏', outcomes: [
        { probability: 0.5, text: '"Allez, monte." Chauffeur sympa. Trajet gratuit.', statChanges: { mental: 8, dignity: 3 } },
        { probability: 0.5, text: '"Pas de ticket, pas de bus." Strict mais juste.', statChanges: { mental: -3 } },
      ]},
    ],
  },
];

// ============ FOLLOW-UP EVENTS (Chaînes Narratives) ============
const FOLLOW_UP_EVENTS: Record<string, GameEvent> = {
  'exp-jardin-communautaire-suite': {
    id: 'exp-jardin-communautaire-suite', title: 'Le Retour au Jardin', type: 'social',
    image: '/assets/exp-jardin-communautaire-3JrXyisaVTMS5u7ATazzZ7.webp',
    isFollowUp: true, requiresFlag: 'ami-jardinier',
    description: 'Le vieux jardinier vous attendait ! "Ah, te revoilà ! J\'ai quelque chose pour toi."',
    choices: [
      { text: 'Accepter son cadeau', risk: 'safe', emoji: '🎁', outcomes: [
        { probability: 0.8, text: 'Il vous donne un panier de légumes et vous apprend à faire pousser des tomates. "Reviens quand tu veux, petit."', statChanges: { hunger: 25, mental: 15, dignity: 8 }, respectChange: 3, addFlag: 'jardinier-mentor' },
        { probability: 0.2, text: 'Il vous donne des graines. "Plante ça quelque part. Ça te donnera un but."', statChanges: { mental: 10 }, itemGain: { id: 'graines-tomate', name: 'Graines de tomate', emoji: '🍅', type: 'tool', value: 5 } },
      ]},
      { text: 'Proposer de travailler régulièrement', risk: 'safe', emoji: '💪', outcomes: [
        { probability: 1, text: 'Il accepte ! Vous avez un "emploi" de jardinier bénévole. Repas inclus.', statChanges: { hunger: 20, mental: 12, dignity: 10 }, respectChange: 5, addFlag: 'emploi-jardin' },
      ]},
    ],
  },
  'exp-vieille-dame-suite': {
    id: 'exp-vieille-dame-suite', title: 'La Grand-Mère Reconnaissante', type: 'social',
    image: '/assets/exp-salon-coiffure-hsCZe2EwRcYAdN4ZmNo9Bf.webp',
    isFollowUp: true, requiresFlag: 'hero-enfant',
    description: 'Une vieille dame vous interpelle. "C\'est vous qui avez aidé mon petit-fils ! Je vous ai cherché partout !"',
    choices: [
      { text: 'Accepter sa gratitude', risk: 'safe', emoji: '🤗', outcomes: [
        { probability: 0.7, text: 'Elle vous invite chez elle pour un repas chaud. Soupe, pain, fromage, et un lit pour la nuit. Vous pleurez de gratitude.', statChanges: { hunger: 30, thirst: 20, sleep: 25, mental: 20, dignity: 10 }, moneyChange: 10, respectChange: 5 },
        { probability: 0.3, text: 'Elle vous donne 20€ et l\'adresse d\'un foyer. "Prenez soin de vous."', moneyChange: 20, statChanges: { mental: 15, dignity: 8 }, respectChange: 3 },
      ]},
    ],
  },
  'exp-pecheur-suite': {
    id: 'exp-pecheur-suite', title: 'La Partie de Pêche', type: 'social',
    image: '/assets/exp-pecheur-canal-Fq76sjmm34RTZJ7qBYMRq5.webp',
    isFollowUp: true, requiresFlag: 'ami-pecheur',
    description: 'Le pêcheur du canal vous fait signe. "Hé ! J\'ai apporté une canne pour toi !"',
    choices: [
      { text: 'Pêcher ensemble', risk: 'safe', emoji: '🎣', outcomes: [
        { probability: 0.6, text: 'Vous attrapez 3 poissons ! Le pêcheur vous apprend à les cuisiner sur un feu de camp. Festin !', statChanges: { hunger: 25, mental: 15, dignity: 5 }, respectChange: 3 },
        { probability: 0.4, text: 'Bredouille, mais le pêcheur partage sa prise. "La prochaine fois, tu auras plus de chance."', statChanges: { hunger: 15, mental: 10 }, respectChange: 2 },
      ]},
    ],
  },
  'exp-brocante-suite': {
    id: 'exp-brocante-suite', title: 'Le Trésor du Brocanteur', type: 'discovery',
    image: '/assets/exp-brocante-m4p7AaRkiCTHLZmNAAEVB6.webp',
    isFollowUp: true, requiresFlag: 'ami-brocanteur',
    description: 'Le brocanteur vous appelle. "J\'ai trouvé un truc qui pourrait t\'intéresser !"',
    choices: [
      { text: 'Voir ce qu\'il a trouvé', risk: 'safe', emoji: '🔍', outcomes: [
        { probability: 0.5, text: 'Un vieux smartphone qui marche encore ! "Cadeau. T\'as été réglo avec moi."', statChanges: { mental: 15, dignity: 8 }, itemGain: { id: 'smartphone', name: 'Vieux smartphone', emoji: '📱', type: 'special', value: 25 }, respectChange: 3 },
        { probability: 0.5, text: 'Un manteau d\'hiver en bon état. "Ça va te tenir chaud."', statChanges: { health: 5, mental: 10, dignity: 8 }, itemGain: { id: 'manteau-hiver', name: 'Manteau d\'hiver', emoji: '🧥', type: 'armor', value: 20, defenseBonus: 3 } },
      ]},
    ],
  },
  'exp-musicien-suite': {
    id: 'exp-musicien-suite', title: 'Le Duo Musical', type: 'social',
    image: '/assets/beg-musicien-metro-HSvL64qd5MQEG4Qnsz4oiV.webp',
    isFollowUp: true, requiresFlag: 'ami-musicien',
    description: 'Le musicien du métro vous reconnaît ! "Hé ! On refait un duo ? J\'ai gagné le double la dernière fois !"',
    choices: [
      { text: 'Former un duo régulier', risk: 'safe', emoji: '🎵', outcomes: [
        { probability: 0.7, text: 'Votre duo fait sensation ! Les passagers adorent. 12€ partagés et une standing ovation.', moneyChange: 12, statChanges: { mental: 15, dignity: 10 }, respectChange: 5 },
        { probability: 0.3, text: 'Journée calme, peu de monde. 4€ quand même. "On se refait ça demain ?"', moneyChange: 4, statChanges: { mental: 8, dignity: 5 }, respectChange: 2 },
      ]},
    ],
  },
  'exp-dechetterie-suite': {
    id: 'exp-dechetterie-suite', title: 'Le Roi de la Récup', type: 'discovery',
    image: '/assets/exp-dechetterie-ik2udBVSfScmWvCMJtUpZE.webp',
    isFollowUp: true, requiresFlag: 'roi-dechetterie',
    description: 'Vous retournez à la déchetterie. Le gardien vous fait signe. "J\'ai mis des trucs de côté pour toi !"',
    choices: [
      { text: 'Voir la sélection', risk: 'safe', emoji: '🎁', outcomes: [
        { probability: 0.6, text: 'Un vélo réparable, des vêtements propres, et un réchaud de camping ! Jackpot !', statChanges: { mental: 15, dignity: 10 }, itemGain: { id: 'rechaud', name: 'Réchaud de camping', emoji: '🔥', type: 'tool', value: 15 }, respectChange: 3 },
        { probability: 0.4, text: 'Des livres, une lampe torche, et un sac à dos. Équipement de survie !', statChanges: { mental: 10, dignity: 5 }, itemGain: { id: 'sac-dos', name: 'Sac à dos', emoji: '🎒', type: 'tool', value: 12 }, respectChange: 2 },
      ]},
    ],
  },
  'exp-chat-revient': {
    id: 'exp-chat-revient', title: 'Le Retour du Chat', type: 'social',
    image: '/assets/exp-bagarre-chats-Dgd3ncPRiSTGHjXXHy6SUT.webp',
    isFollowUp: true, requiresFlag: 'chat-compagnon',
    description: 'Le chat que vous avez sauvé revient ! Il porte quelque chose dans sa gueule...',
    choices: [
      { text: 'Voir ce qu\'il apporte', risk: 'safe', emoji: '🐱', outcomes: [
        { probability: 0.5, text: 'Un billet de 5€ ! Le chat l\'a trouvé quelque part. Meilleur investissement de votre vie.', moneyChange: 5, statChanges: { mental: 12 } },
        { probability: 0.3, text: 'Un oiseau mort. C\'est... un cadeau ? Le chat ronronne fièrement.', statChanges: { mental: 5, dignity: -3 } },
        { probability: 0.2, text: 'Une souris vivante ! Le chat la lâche sur vos genoux. AAAH !', statChanges: { mental: -3, health: -1 } },
      ]},
    ],
  },
  'exp-foyer-accueil': {
    id: 'exp-foyer-accueil', title: 'Le Foyer d\'Accueil', type: 'social',
    image: '/assets/beg-mairie-eey6rmfrqRvxmw634LjgzZ.webp',
    isFollowUp: true, requiresFlag: 'aide-mairie',
    description: 'Grâce aux informations de la mairie, vous trouvez un foyer d\'accueil. La porte est ouverte.',
    choices: [
      { text: 'Entrer et demander de l\'aide', risk: 'safe', emoji: '🏠', outcomes: [
        { probability: 0.8, text: 'Douche chaude, repas complet, lit propre. Vous dormez 10h d\'affilée. Renaissance.', statChanges: { health: 15, hunger: 30, thirst: 25, sleep: 30, mental: 20, dignity: 15 }, respectChange: 3 },
        { probability: 0.2, text: 'Le foyer est complet. Mais ils vous donnent un sandwich et l\'adresse d\'un autre foyer.', statChanges: { hunger: 12, mental: 5 } },
      ]},
    ],
  },
};

// ============ EVENT GENERATORS ============
function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEvents(_location: string, character: Character): GameEvent[] {
  // Check for pending follow-up events first
  const availableFollowUps = Object.values(FOLLOW_UP_EVENTS).filter(e => 
    e.requiresFlag && character.activeFlags.includes(e.requiresFlag)
  );
  // 30% chance to trigger a follow-up if available
  if (availableFollowUps.length > 0 && Math.random() < 0.3) {
    return [randomFromArray(availableFollowUps)];
  }
  // Otherwise return random explore events
  const shuffled = [...EXPLORE_EVENTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

function generateBegEvents(_location: string, character: Character): GameEvent[] {
  const availableFollowUps = Object.values(FOLLOW_UP_EVENTS).filter(e => 
    e.requiresFlag && character.activeFlags.includes(e.requiresFlag)
  );
  if (availableFollowUps.length > 0 && Math.random() < 0.25) {
    return [randomFromArray(availableFollowUps)];
  }
  const shuffled = [...BEG_EVENTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

function generateRestEvents(_location: string, character: Character): GameEvent[] {
  const availableFollowUps = Object.values(FOLLOW_UP_EVENTS).filter(e => 
    e.requiresFlag && character.activeFlags.includes(e.requiresFlag)
  );
  if (availableFollowUps.length > 0 && Math.random() < 0.2) {
    return [randomFromArray(availableFollowUps)];
  }
  const shuffled = [...REST_EVENTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

function generateStealEvents(_location: string, _character: Character): GameEvent[] {
  const shuffled = [...STEAL_EVENTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

function generateTravelEvent(_from: string, _to: string, _character: Character): GameEvent | null {
  if (Math.random() > 0.5) return null;
  return randomFromArray(TRAVEL_EVENTS);
}

// ============ HELPERS ============
function generateCharacter(): Character {
  const job = randomFromArray(JOBS);
  const availableTraits = [...TRAITS];
  const trait1Index = Math.floor(Math.random() * availableTraits.length);
  const trait1 = availableTraits.splice(trait1Index, 1)[0];
  const trait2 = randomFromArray(availableTraits);
  const name = randomFromArray(NAMES);

  const baseStats: Stats = { health: 70, mental: 60, hunger: 50, thirst: 50, sleep: 60, dignity: 40 };

  Object.entries(job.bonusStats).forEach(([key, val]) => {
    if (val) baseStats[key as keyof Stats] = Math.min(100, baseStats[key as keyof Stats] + val);
  });

  [trait1, trait2].forEach(trait => {
    Object.entries(trait.effects).forEach(([key, val]) => {
      if (val) baseStats[key as keyof Stats] = Math.max(0, Math.min(100, baseStats[key as keyof Stats] + val));
    });
  });

  const startingItems = job.startingItems.map(id => STARTING_ITEMS[id]).filter(Boolean);
  const startingMoney = job.id === 'comptable' ? 25 : job.id === 'vendeur' ? 10 : 2;

  return {
    name,
    job,
    traits: [trait1, trait2],
    stats: baseStats,
    money: startingMoney,
    respect: 0,
    inventory: startingItems,
    skills: {},
    day: 1,
    location: 'parc',
    alive: true,
    activeFlags: [],
    seed: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
    gender: genderFromName(name),
  };
}

function clampStats(stats: Stats): Stats {
  return {
    health: Math.max(0, Math.min(100, stats.health)),
    mental: Math.max(0, Math.min(100, stats.mental)),
    hunger: Math.max(0, Math.min(100, stats.hunger)),
    thirst: Math.max(0, Math.min(100, stats.thirst)),
    sleep: Math.max(0, Math.min(100, stats.sleep)),
    dignity: Math.max(0, Math.min(100, stats.dignity)),
  };
}

function applyDailyDecay(stats: Stats): Stats {
  // HARD MODE: aggressive daily decay
  return clampStats({
    health: stats.health - (stats.hunger < 15 ? 12 : 2) - (stats.thirst < 15 ? 14 : 2) - (stats.sleep < 15 ? 6 : 0),
    mental: stats.mental - 5 - (stats.dignity < 25 ? 8 : 0) - (stats.hunger < 20 ? 3 : 0),
    hunger: stats.hunger - 18,
    thirst: stats.thirst - 22,
    sleep: stats.sleep - 15,
    dignity: stats.dignity - 4,
  });
}

// ============ LOCAL STORAGE ============
const SAVE_KEY = 'roi-du-carton-save';
const SCORES_KEY = 'roi-du-carton-scores';

function saveGame(state: GameState) {
  try {
    if (state.character && state.character.alive && state.screen !== 'title' && state.screen !== 'character-select') {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        character: state.character,
        dayActions: state.dayActions,
        screen: 'main',
      }));
    }
  } catch { /* silent fail */ }
}

function loadGame(): Partial<GameState> | null {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.character && data.character.alive) {
        // Ensure activeFlags exists for old saves
        if (!data.character.activeFlags) data.character.activeFlags = [];
        if (!data.character.seed) data.character.seed = `${data.character.name || 'sdf'}-${data.character.job?.id || 'x'}`;
        if (!data.character.gender) data.character.gender = genderFromName(data.character.name || '');
        return {
          character: data.character,
          dayActions: data.dayActions || 0,
          screen: 'main',
        };
      }
    }
  } catch { /* silent fail */ }
  return null;
}

function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* silent fail */ }
}

function loadHighScores(): { name: string; days: number; score: number }[] {
  try {
    const saved = localStorage.getItem(SCORES_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* silent fail */ }
  return [];
}

function saveHighScore(name: string, days: number, score: number) {
  try {
    const scores = loadHighScores();
    scores.push({ name, days, score });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores.slice(0, 10)));
  } catch { /* silent fail */ }
}

// ============ REDUCER ============
type GameAction =
  | { type: 'START_GAME' }
  | { type: 'GENERATE_CHARACTERS' }
  | { type: 'SELECT_CHARACTER'; index: number }
  | { type: 'EXPLORE' }
  | { type: 'BEG' }
  | { type: 'STEAL' }
  | { type: 'REST' }
  | { type: 'DOUBLE_REWARD' }
  | { type: 'TRAVEL'; location: string }
  | { type: 'CHOOSE_EVENT'; choiceIndex: number }
  | { type: 'DISMISS_RESULT' }
  | { type: 'NEXT_DAY' }
  | { type: 'SET_SCREEN'; screen: GameScreen }
  | { type: 'USE_ITEM'; itemId: string }
  | { type: 'SELL_ITEM'; itemId: string }
  | { type: 'GAME_OVER' }
  | { type: 'RESTART' }
  | { type: 'REVIVE' }
  | { type: 'RESET_SCORES' }
  | { type: 'CONTINUE_SAVE' }
  | { type: 'START_COMBAT'; enemy: Enemy }
  | { type: 'COMBAT_ATTACK' }
  | { type: 'COMBAT_AIM'; targetId: string }
  | { type: 'COMBAT_INTIMIDATE' }
  | { type: 'COMBAT_FLEE' }
  | { type: 'BUY_ITEM'; shopItem: ShopItem; actualPrice: number }
  | { type: 'TRIGGER_SHOP_EVENT'; event: ShopEvent };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      clearSave();
      return { ...state, screen: 'character-select', characterChoices: [generateCharacter(), generateCharacter(), generateCharacter()] };

    case 'GENERATE_CHARACTERS':
      return { ...state, characterChoices: [generateCharacter(), generateCharacter(), generateCharacter()] };

    case 'SELECT_CHARACTER': {
      const char = state.characterChoices[action.index];
      return { ...state, screen: 'main', character: char, dayActions: 0 };
    }

    case 'CONTINUE_SAVE': {
      const saved = loadGame();
      if (saved && saved.character) {
        return { ...state, ...saved, weather: (saved as Partial<GameState>).weather || getInitialWeather() };
      }
      return state;
    }

    case 'EXPLORE': {
      if (!state.character || state.dayActions >= state.maxDayActions) return state;
      const events = generateEvents(state.character.location, state.character);
      if (events.length === 0) return state;
      const event = randomFromArray(events);
      return { ...state, screen: 'event', currentEvent: event, dayActions: state.dayActions + 1 };
    }

    case 'BEG': {
      if (!state.character || state.dayActions >= state.maxDayActions) return state;
      const begEvents = generateBegEvents(state.character.location, state.character);
      if (begEvents.length === 0) return state;
      const begEvent = randomFromArray(begEvents);
      return { ...state, screen: 'event', currentEvent: begEvent, dayActions: state.dayActions + 1 };
    }

    case 'STEAL': {
      if (!state.character || state.dayActions >= state.maxDayActions) return state;
      const stealEvents = generateStealEvents(state.character.location, state.character);
      if (stealEvents.length === 0) return state;
      const stealEvent = randomFromArray(stealEvents);
      return { ...state, screen: 'event', currentEvent: stealEvent, dayActions: state.dayActions + 1 };
    }

    case 'REST': {
      if (!state.character || state.dayActions >= state.maxDayActions) return state;
      const restEvents = generateRestEvents(state.character.location, state.character);
      if (restEvents.length === 0) return state;
      const restEvent = randomFromArray(restEvents);
      return { ...state, screen: 'event', currentEvent: restEvent, dayActions: state.dayActions + 1 };
    }

    case 'DOUBLE_REWARD': {
      // Doubler les gains via pub récompensée : ajoute une seconde fois
      // l'argent gagné dans le résultat courant. Utilisable une fois par résultat.
      if (!state.character || !state.eventResult) return state;
      const gain = state.eventResult.moneyChange || 0;
      if (gain <= 0 || state.eventResult.doubled) return state;
      return {
        ...state,
        character: { ...state.character, money: state.character.money + gain },
        eventResult: { ...state.eventResult, doubled: true },
      };
    }

    case 'TRAVEL': {
      if (!state.character) return state;
      const travelEvent = generateTravelEvent(state.character.location, action.location, state.character);
      const newChar = { ...state.character, location: action.location };
      if (travelEvent) {
        return { ...state, character: newChar, screen: 'event', currentEvent: travelEvent };
      }
      return { ...state, character: newChar, screen: 'main' };
    }

    case 'CHOOSE_EVENT': {
      if (!state.currentEvent || !state.character) return state;
      const choice = state.currentEvent.choices[action.choiceIndex];
      const roll = Math.random();

      let cumProb = 0;
      let outcome = choice.outcomes[0];
      for (const o of choice.outcomes) {
        cumProb += o.probability;
        if (roll <= cumProb) { outcome = o; break; }
      }

      let newStats = { ...state.character.stats };
      if (outcome.statChanges) {
        Object.entries(outcome.statChanges).forEach(([key, val]) => {
          if (val) newStats[key as keyof Stats] += val;
        });
      }
      newStats = clampStats(newStats);

      let newMoney = state.character.money + (outcome.moneyChange || 0);
      if (newMoney < 0) newMoney = 0;
      const newRespect = state.character.respect + (outcome.respectChange || 0);

      let newInventory = [...state.character.inventory];
      if (outcome.itemGain && newInventory.length < 20) {
        newInventory.push(outcome.itemGain);
      }
      if (outcome.itemLoss) {
        newInventory = newInventory.filter(i => i.id !== outcome.itemLoss);
      }

      // Handle flags for event chains
      let newFlags = [...state.character.activeFlags];
      if (outcome.addFlag && !newFlags.includes(outcome.addFlag)) {
        newFlags.push(outcome.addFlag);
      }
      if (outcome.removeFlag) {
        newFlags = newFlags.filter(f => f !== outcome.removeFlag);
      }

      // Handle follow-up events
      const pendingFollowUp = outcome.followUpEventId || null;

      const isAlive = newStats.health > 0 && newStats.mental > 0;

      if (!isAlive) {
        const score = state.character.day * 10 + newRespect * 5 + newMoney * 2;
        saveHighScore(state.character.name, state.character.day, score);
        clearSave();
      }

      return {
        ...state,
        screen: isAlive ? 'event' : 'game-over',
        character: { ...state.character, stats: newStats, money: newMoney, respect: newRespect, inventory: newInventory, alive: isAlive, activeFlags: newFlags },
        currentEvent: null,
        eventResult: { text: outcome.text, statChanges: outcome.statChanges, moneyChange: outcome.moneyChange, respectChange: outcome.respectChange },
        pendingFollowUp,
      };
    }

    case 'DISMISS_RESULT':
      return { ...state, eventResult: null, screen: state.character?.alive ? 'main' : 'game-over' };

    case 'NEXT_DAY': {
      if (!state.character) return state;
      const nextWeather = getNextWeather(state.weather);
      const weatherData = WEATHER_TYPES[state.weather];
      // Appliquer la pénalité météo en plus du decay normal
      const baseDecayed = applyDailyDecay(state.character.stats);
      const weatherPenalty = weatherData.dailyPenalty;
      const decayedStats = clampStats({
        health: baseDecayed.health + (weatherPenalty.health || 0),
        mental: baseDecayed.mental + (weatherPenalty.mental || 0),
        hunger: baseDecayed.hunger + (weatherPenalty.hunger || 0),
        thirst: baseDecayed.thirst + (weatherPenalty.thirst || 0),
        sleep: baseDecayed.sleep + (weatherPenalty.sleep || 0),
        dignity: baseDecayed.dignity + (weatherPenalty.dignity || 0),
      });
      const isAlive = decayedStats.health > 0 && decayedStats.mental > 0;

      if (!isAlive) {
        const score = state.character.day * 10 + state.character.respect * 5 + state.character.money * 2;
        saveHighScore(state.character.name, state.character.day, score);
        clearSave();
      }

      return {
        ...state,
        character: { ...state.character, stats: decayedStats, day: state.character.day + 1, alive: isAlive },
        dayActions: 0,
        screen: isAlive ? 'main' : 'game-over',
        weather: nextWeather,
      };
    }

    case 'SET_SCREEN':
      return { ...state, screen: action.screen };

    case 'USE_ITEM': {
      if (!state.character) return state;
      const idx = state.character.inventory.findIndex(i => i.id === action.itemId);
      if (idx === -1) return state;
      const item = state.character.inventory[idx];
      if (!item.effect) return state;
      let newStats = { ...state.character.stats };
      Object.entries(item.effect).forEach(([key, val]) => {
        if (val) newStats[key as keyof Stats] += val;
      });
      newStats = clampStats(newStats);
      // Retire un seul exemplaire (pas tous les objets du même type).
      const newInv = [...state.character.inventory.slice(0, idx), ...state.character.inventory.slice(idx + 1)];
      return {
        ...state,
        character: { ...state.character, stats: newStats, inventory: newInv },
        eventResult: { text: `Vous utilisez ${item.name}. Ça fait du bien !`, statChanges: item.effect },
      };
    }

    case 'SELL_ITEM': {
      if (!state.character) return state;
      const idx = state.character.inventory.findIndex(i => i.id === action.itemId);
      if (idx === -1) return state;
      const item = state.character.inventory[idx];
      const price = getSellPrice(item);
      const newInv = [...state.character.inventory.slice(0, idx), ...state.character.inventory.slice(idx + 1)];
      return {
        ...state,
        character: { ...state.character, money: state.character.money + price, inventory: newInv },
        eventResult: { text: `Vous revendez ${item.name} pour ${price}€. Chaque euro compte.`, moneyChange: price },
      };
    }

    case 'START_COMBAT': {
      if (!state.character) return state;
      const weapon = state.character.inventory.find(i => i.type === 'weapon');
      const targeting = getTargeting(action.enemy.name);
      const combat: CombatState = {
        enemyName: action.enemy.name,
        enemyEmoji: action.enemy.emoji,
        enemyHealth: action.enemy.health,
        enemyMaxHealth: action.enemy.health,
        enemyAttack: action.enemy.attack,
        description: action.enemy.description,
        playerWeapon: weapon,
        zones: targeting.zones,
        weakPointId: targeting.weak,
        weakPointHint: targeting.hint,
      };
      return { ...state, screen: 'combat', currentCombat: combat, combatLog: [`${action.enemy.emoji} ${action.enemy.name} apparaît ! ${action.enemy.description}`] };
    }

    case 'COMBAT_ATTACK': {
      if (!state.character || !state.currentCombat) return state;
      const isMilitaire = state.character.job.id === 'militaire';
      const hasForce = state.character.traits.some(t => t.id === 'costaud');
      const weapon = state.currentCombat.playerWeapon;
      const baseDmg = 6 + (isMilitaire ? 4 : 0) + (hasForce ? 3 : 0) + (weapon ? (weapon.attackBonus ?? 4) : 0);
      const playerDmg = Math.floor(baseDmg * (0.6 + Math.random() * 0.5));
      const hasOsMousse = state.character.traits.some(t => t.id === 'os-mousse');
      const enemyDmg = Math.floor(state.currentCombat.enemyAttack * (0.7 + Math.random() * 0.8) * (hasOsMousse ? 1.5 : 1));
      const newEnemyHp = Math.max(0, state.currentCombat.enemyHealth - playerDmg);
      const newHp = Math.max(0, state.character.stats.health - enemyDmg);
      const logs = [...state.combatLog];
      logs.push(`⚔️ Vous attaquez${weapon ? ` avec ${weapon.name}` : ''} ! ${playerDmg} dégâts !`);
      if (newEnemyHp > 0) logs.push(`💥 ${state.currentCombat.enemyName} riposte ! ${enemyDmg} dégâts !`);
      if (newEnemyHp <= 0) {
        const enemy = ENEMIES.find(e => e.name === state.currentCombat!.enemyName);
        const lootMoney = enemy?.loot?.money || 0;
        const lootRespect = enemy?.loot?.respect || 0;
        logs.push(`🎉 Victoire ! Vous avez vaincu ${state.currentCombat.enemyName} !`);
        if (lootMoney > 0) logs.push(`💰 +${lootMoney}€ récupérés`);
        if (lootRespect > 0) logs.push(`⭐ +${lootRespect} respect gagné`);
        const newStats = clampStats({ ...state.character.stats, health: newHp });
        return {
          ...state,
          character: { ...state.character, stats: newStats, money: state.character.money + lootMoney, respect: state.character.respect + lootRespect },
          currentCombat: null,
          combatLog: logs,
          eventResult: { text: `Victoire contre ${state.currentCombat.enemyName} ! ${lootMoney > 0 ? `+${lootMoney}€` : ''} ${lootRespect > 0 ? `+${lootRespect} respect` : ''}`, moneyChange: lootMoney, respectChange: lootRespect },
          screen: 'main',
        };
      }
      if (newHp <= 0) {
        return { ...state, screen: 'game-over', currentCombat: null, combatLog: [...logs, '💀 Vous succombez à vos blessures...'] };
      }
      const newStats2 = clampStats({ ...state.character.stats, health: newHp });
      return {
        ...state,
        character: { ...state.character, stats: newStats2 },
        currentCombat: { ...state.currentCombat, enemyHealth: newEnemyHp },
        combatLog: logs,
      };
    }

    case 'COMBAT_AIM': {
      if (!state.character || !state.currentCombat) return state;
      const combat = state.currentCombat;
      const zone = combat.zones.find(z => z.id === action.targetId);
      if (!zone) return state;
      const isCritical = action.targetId === combat.weakPointId;

      const isMilitaire = state.character.job.id === 'militaire';
      const hasForce = state.character.traits.some(t => t.id === 'costaud');
      const weapon = combat.playerWeapon;
      const baseDmg = 6 + (isMilitaire ? 4 : 0) + (hasForce ? 3 : 0) + (weapon ? (weapon.attackBonus ?? 4) : 0);
      const profile = getWeaponProfile(weapon);

      const hasOsMousse = state.character.traits.some(t => t.id === 'os-mousse');
      let playerDmg: number;
      let enemyDmg: number;
      const logs = [...state.combatLog];

      if (isCritical) {
        // Coup critique : gros dégâts + chance d'étourdir (pas de riposte).
        // L'arme précise frappe plus fort et sonne plus souvent.
        playerDmg = Math.floor(baseDmg * (profile.critMin + Math.random() * profile.critRange));
        const stunned = Math.random() < profile.stunChance;
        enemyDmg = stunned ? 0 : Math.floor(combat.enemyAttack * (0.6 + Math.random() * 0.5) * (hasOsMousse ? 1.5 : 1));
        logs.push(`🎯 COUP CRITIQUE sur ${zone.label.toLowerCase()} ! ${playerDmg} dégâts !`);
        if (stunned) logs.push(`💫 ${combat.enemyName} est sonné et ne riposte pas !`);
      } else {
        // Mauvaise zone : avec une arme lourde le coup porte quand même,
        // avec une lame il glisse dans le vide et l'ennemi en profite.
        playerDmg = Math.floor(baseDmg * (profile.missMin + Math.random() * profile.missRange));
        enemyDmg = Math.floor(combat.enemyAttack * (profile.riposteMin + Math.random() * profile.riposteRange) * (hasOsMousse ? 1.5 : 1));
        const missMsg = profile.style === 'heavy'
          ? `🪓 Pas le point faible (${zone.label.toLowerCase()}), mais ça cogne quand même : ${playerDmg} dégâts.`
          : `😬 Mauvaise cible (${zone.label.toLowerCase()}) ! Le coup glisse : ${playerDmg} dégâts.`;
        logs.push(missMsg);
      }

      const newEnemyHp = Math.max(0, combat.enemyHealth - playerDmg);
      const newHp = Math.max(0, state.character.stats.health - enemyDmg);
      if (enemyDmg > 0 && newEnemyHp > 0) logs.push(`💥 ${combat.enemyName} riposte ! ${enemyDmg} dégâts !`);

      // Mémorise le point faible découvert (pour l'afficher les fois suivantes).
      let newFlags = [...state.character.activeFlags];
      const wpFlag = `wp:${combat.enemyName}`;
      if (isCritical && !newFlags.includes(wpFlag)) newFlags.push(wpFlag);

      if (newEnemyHp <= 0) {
        const enemy = ENEMIES.find(e => e.name === combat.enemyName);
        const lootMoney = enemy?.loot?.money || 0;
        const lootRespect = (enemy?.loot?.respect || 0) + (isCritical ? 1 : 0);
        logs.push(`🎉 Victoire ! Vous avez vaincu ${combat.enemyName} !`);
        const newStats = clampStats({ ...state.character.stats, health: newHp });
        return {
          ...state,
          character: { ...state.character, stats: newStats, money: state.character.money + lootMoney, respect: state.character.respect + lootRespect, activeFlags: newFlags },
          currentCombat: null,
          combatLog: logs,
          eventResult: { text: `Victoire contre ${combat.enemyName} ! ${lootMoney > 0 ? `+${lootMoney}€` : ''} ${lootRespect > 0 ? `+${lootRespect} respect` : ''}`, moneyChange: lootMoney, respectChange: lootRespect },
          screen: 'main',
        };
      }
      if (newHp <= 0) {
        return { ...state, screen: 'game-over', currentCombat: null, combatLog: [...logs, '💀 Vous succombez à vos blessures...'] };
      }
      const newStats2 = clampStats({ ...state.character.stats, health: newHp });
      return {
        ...state,
        character: { ...state.character, stats: newStats2, activeFlags: newFlags },
        currentCombat: { ...combat, enemyHealth: newEnemyHp },
        combatLog: logs,
      };
    }

    case 'COMBAT_INTIMIDATE': {
      if (!state.character || !state.currentCombat) return state;
      const hasCharisme = state.character.traits.some(t => t.id === 'charismatique');
      const hasHaleine = state.character.traits.some(t => t.id === 'haleine');
      const isAvocat = state.character.job.id === 'avocat';
      const intimidateChance = 0.2 + (hasCharisme ? 0.15 : 0) + (hasHaleine ? 0.2 : 0) + (isAvocat ? 0.1 : 0);
      const logs = [...state.combatLog];
      if (Math.random() < intimidateChance) {
        const enemy = ENEMIES.find(e => e.name === state.currentCombat!.enemyName);
        const lootRespect = (enemy?.loot?.respect || 0) + 1;
        logs.push(`😱 ${state.currentCombat.enemyName} prend peur et s'enfuit !${hasHaleine ? ' Votre haleine a fait des ravages !' : ''}`);
        return {
          ...state,
          character: { ...state.character, respect: state.character.respect + lootRespect },
          currentCombat: null,
          combatLog: logs,
          eventResult: { text: `${state.currentCombat.enemyName} s'enfuit, terrorisé ! +${lootRespect} respect`, respectChange: lootRespect },
          screen: 'main',
        };
      } else {
        const hasOsMousse = state.character.traits.some(t => t.id === 'os-mousse');
        const enemyDmg = Math.floor(state.currentCombat.enemyAttack * (0.6 + Math.random() * 0.6) * (hasOsMousse ? 1.5 : 1));
        const newHp = Math.max(0, state.character.stats.health - enemyDmg);
        logs.push(`😤 ${state.currentCombat.enemyName} n'est pas impressionné et attaque ! ${enemyDmg} dégâts !`);
        if (newHp <= 0) {
          return { ...state, screen: 'game-over', currentCombat: null, combatLog: [...logs, '💀 Vous succombez à vos blessures...'] };
        }
        const newStats = clampStats({ ...state.character.stats, health: newHp });
        return { ...state, character: { ...state.character, stats: newStats }, combatLog: logs };
      }
    }

    case 'COMBAT_FLEE': {
      if (!state.character || !state.currentCombat) return state;
      const hasAgile = state.character.traits.some(t => t.id === 'agile');
      const isCascadeur = state.character.job.id === 'cascadeur';
      const fleeChance = 0.35 + (hasAgile ? 0.2 : 0) + (isCascadeur ? 0.15 : 0);
      const logs = [...state.combatLog];
      if (Math.random() < fleeChance) {
        logs.push('🏃 Vous prenez vos jambes à votre cou ! Fuite réussie !');
        const newStats = clampStats({ ...state.character.stats, dignity: state.character.stats.dignity - 5 });
        return {
          ...state,
          character: { ...state.character, stats: newStats },
          currentCombat: null,
          combatLog: logs,
          eventResult: { text: 'Vous avez fui le combat. Votre dignité en prend un coup...', statChanges: { dignity: -5 } },
          screen: 'main',
        };
      } else {
        const hasOsMousse = state.character.traits.some(t => t.id === 'os-mousse');
        const enemyDmg = Math.floor(state.currentCombat.enemyAttack * (0.8 + Math.random() * 0.4) * (hasOsMousse ? 1.5 : 1));
        const newHp = Math.max(0, state.character.stats.health - enemyDmg);
        logs.push(`❌ Fuite ratée ! ${state.currentCombat.enemyName} vous rattrape ! ${enemyDmg} dégâts !`);
        if (newHp <= 0) {
          return { ...state, screen: 'game-over', currentCombat: null, combatLog: [...logs, '💀 Vous succombez à vos blessures...'] };
        }
        const newStats = clampStats({ ...state.character.stats, health: newHp, dignity: state.character.stats.dignity - 8 });
        return { ...state, character: { ...state.character, stats: newStats }, combatLog: logs };
      }
    }

    case 'BUY_ITEM': {
      if (!state.character) return state;
      const shopItem = action.shopItem;
      const actualPrice = action.actualPrice;
      if (state.character.money < actualPrice) return state;
      if (shopItem.giveItem && state.character.inventory.length >= 20) return state;

      let newStats = { ...state.character.stats };
      if (shopItem.effect) {
        Object.entries(shopItem.effect).forEach(([key, val]) => {
          if (val) newStats[key as keyof Stats] += val;
        });
      }
      newStats = clampStats(newStats);

      let newInventory = [...state.character.inventory];
      if (shopItem.giveItem) {
        newInventory.push(shopItem.giveItem);
      }

      const newMoney = state.character.money - actualPrice;
      const discountText = actualPrice < shopItem.price ? ` (r\u00e9duit de ${shopItem.price}\u20ac gr\u00e2ce \u00e0 votre r\u00e9putation)` : '';

      return {
        ...state,
        character: { ...state.character, stats: newStats, money: newMoney, inventory: newInventory },
        eventResult: {
          text: `Vous achetez ${shopItem.name} pour ${actualPrice}\u20ac${discountText}. ${shopItem.description}`,
          statChanges: shopItem.effect,
          moneyChange: -actualPrice,
        },
      };
    }

    case 'TRIGGER_SHOP_EVENT': {
      if (!state.character) return state;
      const shopEvt = action.event;
      const outcome = shopEvt.outcomes[Math.floor(Math.random() * shopEvt.outcomes.length)];

      let newStats = { ...state.character.stats };
      if (outcome.statChanges) {
        Object.entries(outcome.statChanges).forEach(([key, val]) => {
          if (val) newStats[key as keyof Stats] += val;
        });
      }
      newStats = clampStats(newStats);

      const newMoney = state.character.money + (outcome.moneyChange || 0);
      const newRespect = state.character.respect + (outcome.respectChange || 0);
      let newInventory = [...state.character.inventory];
      if (outcome.itemGain && newInventory.length < 20) {
        newInventory.push(outcome.itemGain);
      }

      return {
        ...state,
        character: { ...state.character, stats: newStats, money: newMoney, respect: newRespect, inventory: newInventory },
        eventResult: {
          text: `\ud83c\udf1f ${shopEvt.text}\n\n${outcome.text}`,
          statChanges: outcome.statChanges,
          moneyChange: outcome.moneyChange,
          respectChange: outcome.respectChange,
        },
      };
    }

    case 'REVIVE': {
      // Seconde chance (via pub récompensée) : on remet le personnage
      // dans un état survivable et on relance la journée. Utilisable
      // une seule fois par partie (flag 'revived').
      if (!state.character) return state;
      const revivedStats: Stats = {
        ...state.character.stats,
        health: Math.max(state.character.stats.health, 50),
        mental: Math.max(state.character.stats.mental, 50),
        hunger: Math.max(state.character.stats.hunger, 40),
        thirst: Math.max(state.character.stats.thirst, 40),
        sleep: Math.max(state.character.stats.sleep, 40),
      };
      return {
        ...state,
        screen: 'main',
        currentCombat: null,
        combatLog: [],
        eventResult: { text: '🌅 Une âme charitable vous a porté secours. Vous reprenez vos esprits. La rue ne vous a pas encore eu...' },
        character: {
          ...state.character,
          stats: revivedStats,
          alive: true,
          activeFlags: [...state.character.activeFlags, 'revived'],
        },
      };
    }

    case 'RESET_SCORES': {
      try { localStorage.removeItem(SCORES_KEY); } catch { /* silent */ }
      return { ...state, highScores: [] };
    }

    case 'RESTART':
      clearSave();
      return { ...initialState, highScores: loadHighScores() };

    default:
      return state;
  }
}

const initialState: GameState = {
  screen: 'title',
  character: null,
  characterChoices: [],
  currentEvent: null,
  currentCombat: null,
  eventResult: null,
  combatLog: [],
  dayActions: 0,
  maxDayActions: 3,
  highScores: loadHighScores(),
  pendingFollowUp: null,
  weather: getInitialWeather(),
};

// ============ CONTEXT ============
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Auto-save on state changes
  useEffect(() => {
    if (state.character && state.character.alive && state.screen === 'main') {
      saveGame(state);
    }
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
}

export { ENEMIES };
export type { Enemy, GameAction };