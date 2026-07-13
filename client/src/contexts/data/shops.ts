// ============ BOUTIQUES : STOCK, ÉVÉNEMENTS, PANNES & MARCHANDAGE ============
import type { Shop, ShopItem, ShopEvent, ShopClosure, Character, InventoryItem } from '../types';
import { randomFromArray } from './util';

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

// ============ ÉVÉNEMENTS DE BOUTIQUE ============
export const SHOP_EVENTS: ShopEvent[] = [
  {
    id: 'kebab-job', shopId: 'kebab', text: 'Le kebabier vous regarde et dit : "Tu reviens souvent. Tu veux bosser un peu ?"',
    probability: 0.12,
    outcomes: [
      { text: 'Vous aidez à la plonge pendant une heure. Le kebabier vous paye et vous offre un repas.', moneyChange: 5, statChanges: { hunger: 30, dignity: 5 }, respectChange: 3 },
    ],
  },
  {
    id: 'brocanteur-objet-rare', shopId: 'brocanteur', text: 'Le brocanteur fouille sous son comptoir : "J\'ai un truc spécial pour toi..."',
    probability: 0.10,
    outcomes: [
      { text: 'Il vous montre un médaillon ancien. "Prends-le, ça te portera chance."', respectChange: 2, itemGain: { id: 'medaillon-ancien', name: 'Médaillon ancien', emoji: '🧿', type: 'special', value: 15 } },
    ],
  },
  {
    id: 'boulangerie-invendu', shopId: 'boulangerie', text: 'La boulangère vous fait signe discrètement.',
    probability: 0.15,
    outcomes: [
      { text: '"Tiens, les invendus du jour. Faut pas gaspiller." Elle vous donne un sac de viennoiseries.', statChanges: { hunger: 25, mental: 10 }, respectChange: 1 },
    ],
  },
  {
    id: 'pharmacie-conseil', shopId: 'pharmacie', text: 'Le pharmacien vous examine d\'un œil bienveillant.',
    probability: 0.12,
    outcomes: [
      { text: '"Attendez, je vais vous donner des échantillons gratuits." Il vous tend des vitamines et du désinfectant.', statChanges: { health: 15, mental: 5 } },
    ],
  },
  {
    id: 'marche-puces-trouvaille', shopId: 'marche-aux-puces', text: 'En fouillant les étals, vous repérez quelque chose de brillant.',
    probability: 0.10,
    outcomes: [
      { text: 'Une montre qui fonctionne encore ! Le vendeur ne l\'avait pas remarquée.', itemGain: { id: 'montre-trouvee', name: 'Montre trouvée', emoji: '⌚', type: 'special', value: 12 }, statChanges: { dignity: 5 } },
    ],
  },
  {
    id: 'epicerie-tombola', shopId: 'epicerie', text: 'L\'épicier sort un carton : "Tombola gratuite pour les clients réguliers !"',
    probability: 0.10,
    outcomes: [
      { text: 'Vous grattez le ticket et... gagné ! Un bon d\'achat de 3€.', moneyChange: 3, statChanges: { mental: 8 } },
    ],
  },
  {
    id: 'herboriste-secret', shopId: 'herboriste', text: 'L\'herboriste vous observe longuement, puis sourit.',
    probability: 0.12,
    outcomes: [
      { text: '"Je vois que tu as besoin d\'un remontant spécial." Elle vous prépare une potion mystérieuse.', statChanges: { health: 10, mental: 15, sleep: 10 }, respectChange: 1 },
    ],
  },
  {
    id: 'laverie-rencontre', shopId: 'laverie', text: 'Un autre habitué de la laverie engage la conversation.',
    probability: 0.15,
    outcomes: [
      { text: '"Moi aussi j\'ai connu la rue. Tiens, prends ça." Il vous donne quelques pièces.', moneyChange: 2, respectChange: 2, statChanges: { mental: 10 } },
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
      { text: 'Des pièces jetées par des touristes ! Vous en récupérez quelques-unes.', moneyChange: 3, statChanges: { dignity: -3 } },
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

// ============ PANNES & FERMETURES DE BOUTIQUES ============
// La rue est imprévisible : au fil des jours, des commerces ferment un jour ou
// deux, avec une explication loufoque. Ça punit le pilotage automatique (« je
// vais toujours à la laverie ») et force à s'adapter.

// Raisons propres à certaines boutiques (plus savoureuses).
const CLOSURE_REASONS_BY_SHOP: Record<string, Array<[string, string]>> = {
  laverie: [
    ['une machine a avalé un pigeon entier, les pompiers sont sur place.', 'a machine swallowed a whole pigeon, firefighters are on site.'],
    ['le sèche-linge tourne à l\'envers depuis mardi. Personne ne sait pourquoi.', 'the dryer has been spinning backwards since Tuesday. Nobody knows why.'],
  ],
  fontaine: [
    ['un canard a élu domicile dans la tuyauterie. Elle est à sec.', 'a duck moved into the plumbing. It ran dry.'],
  ],
  distributeur: [
    ['il ne rend plus que des pièces de Monopoly. Hors service.', 'it only dispenses Monopoly coins now. Out of order.'],
  ],
  boulangerie: [
    ['le four a rendu l\'âme en pleine fournée. Deuil national du croissant.', 'the oven died mid-batch. National croissant mourning.'],
  ],
  kebab: [
    ['rupture de broche. Le patron est parti « chercher de la viande ». On l\'attend.', 'out of skewer. The owner went to "get more meat". Still waiting.'],
  ],
  pharmacie: [
    ['inventaire surprise : la pharmacienne compte les cotons-tiges un par un.', 'surprise inventory: the pharmacist is counting cotton swabs one by one.'],
  ],
  epicerie: [
    ['le gérant s\'est enfermé dehors. Encore.', 'the owner locked himself out. Again.'],
  ],
  brocanteur: [
    ['le brocanteur a « des ennuis ». Rideau baissé, pas de questions.', 'the dealer has "trouble". Shutters down, no questions.'],
  ],
  'marche-aux-puces': [
    ['grand vent : les étals se sont envolés vers le quartier d\'à côté.', 'windy day: the stalls blew off to the next neighborhood.'],
  ],
  herboriste: [
    ['l\'herboriste médite. Ne pas déranger avant l\'illumination.', 'the herbalist is meditating. Do not disturb before enlightenment.'],
  ],
};
// Raisons génériques (n'importe quelle boutique).
const CLOSURE_REASONS_GENERIC: Array<[string, string]> = [
  ['fermé pour « raisons personnelles ». Personne ne sait lesquelles.', 'closed for "personal reasons". Nobody knows which.'],
  ['grève surprise. Même le patron fait grève.', 'surprise strike. Even the owner is on strike.'],
  ['un contrôle sanitaire a mal tourné. Fermeture immédiate.', 'a health inspection went sideways. Immediate closure.'],
  ['panne de courant dans tout le pâté de maisons.', 'power outage across the whole block.'],
  ['le gérant a gagné au Loto (petit lot) et fête ça bruyamment.', 'the owner won the lottery (small prize) and is loudly celebrating.'],
];

// Résolutions absurdes quand le joueur « donne un coup de main » (via pub) pour
// rouvrir une boutique en panne. Aussi loufoques que les fermetures.
const REOPEN_REASONS_BY_SHOP: Record<string, Array<[string, string]>> = {
  laverie: [['Vous récupérez le pigeon (vivant, vexé) et relancez la machine. Ça tourne !', 'You retrieve the pigeon (alive, offended) and restart the machine. It spins!']],
  fontaine: [['Vous délogez le canard avec une baguette rassie. L\'eau coule à nouveau !', 'You dislodge the duck with a stale baguette. Water flows again!']],
  distributeur: [['Un grand coup d\'épaule et il recrache de vraies pièces. Miracle mécanique !', 'One shoulder-check and it spits out real coins again. Mechanical miracle!']],
  boulangerie: [['Vous prêtez votre briquet pour rallumer le four. Le boulanger vous bénit.', 'You lend your lighter to relight the oven. The baker blesses you.']],
  kebab: [['Vous croisez le patron qui « cherchait de la viande ». Vous portez les cartons.', 'You run into the owner who was "getting meat". You carry the boxes.']],
  pharmacie: [['Vous aidez à compter les cotons-tiges (il y en avait 4 212). Inventaire bouclé.', 'You help count the swabs (there were 4,212). Inventory done.']],
  epicerie: [['Vous crochetez la porte avec une carte de fidélité. Le gérant, gêné, rouvre.', 'You pick the lock with a loyalty card. The owner, embarrassed, reopens.']],
  brocanteur: [['Vous réglez « les ennuis » d\'un simple regard entendu. Rideau relevé.', 'You settle "the trouble" with a knowing look. Shutters up.']],
  'marche-aux-puces': [['Vous rapportez les étals du quartier d\'à côté, un par un. Marché sauvé !', 'You lug the stalls back from the next block, one by one. Market saved!']],
  herboriste: [['Vous atteignez l\'illumination à sa place. Impressionné, il rouvre.', 'You reach enlightenment on his behalf. Impressed, he reopens.']],
};
const REOPEN_REASONS_GENERIC: Array<[string, string]> = [
  ['Un coup de main, deux mots gentils, et le rideau se relève.', 'A helping hand, a few kind words, and the shutters roll up.'],
  ['Vous « arrangez » la situation. Ne posez pas de questions. Rouvert !', 'You "sort out" the situation. Ask no questions. Reopened!'],
  ['Vous soudoyez le destin avec votre plus beau sourire. Ça marche.', 'You bribe fate with your best smile. It works.'],
];

// Résolution absurde tirée pour une boutique donnée (utilisée par la pub).
export function absurdReopen(shopId: string): { fr: string; en: string } {
  const pool = REOPEN_REASONS_BY_SHOP[shopId] || REOPEN_REASONS_GENERIC;
  const [fr, en] = randomFromArray(pool);
  return { fr, en };
}

// Une boutique est-elle fermée au jour donné ?
export function shopClosure(char: Character | null, shopId: string): ShopClosure | undefined {
  return char?.shopClosures?.find(c => c.shopId === shopId && c.untilDay > char.day);
}

// Tire une nouvelle fermeture parmi les boutiques encore ouvertes (ou null).
export function rollShopClosure(active: ShopClosure[], day: number): ShopClosure | null {
  const open = SHOPS.filter(s => !active.some(c => c.shopId === s.id));
  if (open.length === 0) return null;
  const shop = randomFromArray(open);
  const specific = CLOSURE_REASONS_BY_SHOP[shop.id];
  const [reason, reasonEn] = specific && Math.random() < 0.7
    ? randomFromArray(specific)
    : randomFromArray(CLOSURE_REASONS_GENERIC);
  const duration = 1 + Math.floor(Math.random() * 2); // 1 à 2 jours
  return { shopId: shop.id, untilDay: day + duration, reason, reasonEn };
}

// ============ RESPECT & MARCHANDAGE ============
// Paliers de remise : seuil de respect → remise. Du plus haut au plus bas.
const DISCOUNT_TIERS: { threshold: number; discount: number }[] = [
  { threshold: 80, discount: 0.30 },
  { threshold: 50, discount: 0.25 },
  { threshold: 30, discount: 0.15 },
  { threshold: 20, discount: 0.10 },
  { threshold: 10, discount: 0.05 },
];

export function getDiscount(respect: number): number {
  for (const tier of DISCOUNT_TIERS) {
    if (respect >= tier.threshold) return tier.discount;
  }
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

// Prochain palier de remise à atteindre : combien de respect il manque et la
// remise correspondante. Renvoie null si le respect est déjà au palier maximal.
export function getNextDiscountTier(respect: number): { needed: number; discount: number } | null {
  // Les paliers sont ordonnés du plus haut au plus bas ; on cherche le plus bas
  // seuil encore au-dessus du respect actuel.
  for (let i = DISCOUNT_TIERS.length - 1; i >= 0; i--) {
    const tier = DISCOUNT_TIERS[i];
    if (respect < tier.threshold) {
      return { needed: tier.threshold - respect, discount: tier.discount };
    }
  }
  return null;
}

// Prix de revente d'un objet : 60% de sa valeur (empêche tout aller-retour
// achat→revente rentable, tout en donnant une utilité à chaque objet).
export function getSellPrice(item: InventoryItem): number {
  return Math.max(1, Math.round((item.value || 1) * 0.6));
}
