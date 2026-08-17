// ============================================================================
// TYPES PARTAGÉS
// ----------------------------------------------------------------------------
// Toutes les interfaces et alias de type du jeu vivent ici, dans un module sans
// aucune dépendance runtime, pour que les modules de données (data/*) et le
// reducer puissent les importer sans risque de cycle. GameContext ré-exporte
// tout (`export * from './types'`) : les composants continuent d'importer les
// types depuis '@/contexts/GameContext' comme avant.
// ============================================================================

// ============ JOUEUR ============
export interface Job {
  id: string;
  name: string;
  description: string;
  bonusStats: Partial<Stats>;
  startingItems: string[];
  emoji: string;
  // Métier verrouillé : n'entre dans le tirage qu'une fois acheté dans
  // L'Héritage (Karma de Rue). Débloquage latéral, pas de puissance brute.
  locked?: boolean;
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

// Table unique emoji/libellé des jauges, utilisée par tous les écrans
// (inventaire, boutique, résultats, barres de stats) pour rester cohérents.
export const STAT_META: Record<keyof Stats, { emoji: string; label: string; labelEn: string }> = {
  health: { emoji: '❤️', label: 'Santé', labelEn: 'Health' },
  mental: { emoji: '🧠', label: 'Mental', labelEn: 'Mind' },
  hunger: { emoji: '🍖', label: 'Faim', labelEn: 'Hunger' },
  thirst: { emoji: '💧', label: 'Soif', labelEn: 'Thirst' },
  sleep: { emoji: '😴', label: 'Sommeil', labelEn: 'Sleep' },
  dignity: { emoji: '👑', label: 'Dignité', labelEn: 'Dignity' },
};

export interface Character {
  name: string;
  job: Job;
  traits: [Trait, Trait];
  stats: Stats;
  money: number;
  respect: number;
  inventory: InventoryItem[];
  day: number;
  location: string;
  alive: boolean;
  activeFlags: string[];
  // Nombre de casses tentés durant cette partie : chaque vol rend le
  // prochain mini-jeu plus difficile (voir StealHeist).
  stealCount: number;
  // Jour du dernier GRAND coup réussi. Un quartier ne se laisse pas dévaliser
  // deux fois dans la même journée : tant que ce jour est le jour courant, les
  // grosses cibles sont hors de portée, partout. Absent = jamais réussi.
  bigScoreDay?: number;
  // Nombre de gorgées prises à la fontaine du parc (eau gratuite) : toutes les
  // 3 gorgées, la fontaine fait des siennes (pub récompensée). Anti-exploit.
  fountainUses?: number;
  // Quartiers déjà rejoints AUJOURD'HUI : la route ne se redécouvre pas deux
  // fois dans la même journée (voir TRAVEL). Remis à zéro chaque nuit.
  travelsToday?: string[];
  // Gorgées de fontaine prises aujourd'hui, et le jour où on les compte.
  fountainToday?: number;
  fountainDay?: number;
  // Sacré Roi du Carton (a battu le Roi en place). À sa mort, ce personnage
  // devient le boss des parties suivantes (voir la couronne, lib/necrology).
  crowned?: boolean;
  // Nombre de rois que ce personnage a détrônés (durcit son règne s'il gagne).
  kingsBeaten?: number;
  // Mémoire courte : les derniers événements vus, pour éviter les répétitions.
  recentEvents?: string[];
  // Boutiques en panne/fermées pendant la partie (voir ShopClosure).
  shopClosures?: ShopClosure[];
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
  // Effet permanent tant que l'objet est dans le sac, décrit en clair pour
  // l'inventaire. Les objets passifs n'ont pas de bouton « Utiliser » : c'est
  // cette ligne, et elle seule, qui dit au joueur ce qu'ils lui apportent.
  passive?: string;
  passiveEn?: string;
}

// ============ ÉVÉNEMENTS ============
export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
  type: 'narrative' | 'combat' | 'discovery' | 'social';
  location?: string;
  image?: string;
  // Diorama de secours quand `image` n'est pas encore livrée : une scène
  // voisine déjà en place vaut mieux que le tracé vectoriel de repli, qui
  // détonne au milieu des dioramas photographiés.
  fallbackImage?: string;
  requiresFlag?: string;
  isFollowUp?: boolean;
}

export interface EventChoice {
  text: string;
  risk: 'safe' | 'normal' | 'risky';
  emoji: string;
  requirements?: { item?: string; stat?: keyof Stats; minValue?: number; respect?: number };
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
}

// Modèle d'événement « légende » : {name}/{days} remplis à l'affichage.
export interface LegendTemplate {
  id: string;
  title: string;
  type: GameEvent['type'];
  description: string;
  choices: EventChoice[];
  image?: string;
}

// Cible concrète du mini-jeu de vol, et qui vous attrape en cas d'échec.
export interface StealTarget {
  id: string;
  label: string;      // "l'étal du primeur" (s'insère dans une phrase)
  labelEn: string;
  emoji: string;
  catcher: 'commercant' | 'police';
}

// ============ COMBAT ============
// Combat « Signe, Esquive & Riposte » : chaque manche s'ouvre sur un duel de
// signes (pierre-feuille-ciseaux thématisé, informé par les tendances de
// l'ennemi et un indice faillible). Manche gagnée → riposte aux cartes.
// Manche perdue → esquive de rattrapage en temps réel (arène de projectiles) ;
// parfaite, elle vole une riposte réduite. Les traits débloquent en plus un
// coup spécial à charges (voir SPECIAL_DEFS).
export type CombatPhase = 'sign' | 'dodge' | 'draw';

// ---- Duel de signes ----
// Triangle façon baston : Châtaigne bat Feinte, Feinte bat Garde,
// Garde bat Châtaigne. Les « tells » sont les indices affichés avant la manche.
export type SignId = 'strike' | 'feint' | 'guard';

export interface SignDef {
  id: SignId;
  name: string; nameEn: string;
  emoji: string;
  beats: SignId;
  tells: string[]; tellsEn: string[];
}

// Coups spéciaux : un seul par personnage (premier trait correspondant),
// chargé en gagnant une manche au signe, 2 usages max par combat.
export type SpecialId = 'haleine' | 'piege' | 'pas-de-cote' | 'desescalade';

export interface SpecialDef {
  id: SpecialId;
  traitId: string;
  name: string; nameEn: string;
  emoji: string;
  desc: string; descEn: string;
}

export interface CombatState {
  enemyName: string;
  enemyEmoji: string;
  enemyHealth: number;
  enemyMaxHealth: number;
  enemyAttack: number;
  description: string;
  // Butin de l'ennemi, copié à l'entrée en combat (certains ennemis n'existent
  // que dans la liste par lieu de MainScreen, d'où la copie plutôt qu'un lookup).
  loot?: { money?: number; respect?: number; item?: InventoryItem };
  // Image (diorama) de l'ennemi, réutilisée sur l'écran de victoire.
  image?: string;
  round: number;
  phase: CombatPhase;
  // Motif de projectiles de l'ennemi (voir PROJECTILE_PATTERNS / getPattern).
  pattern: string;
  // Cartes piochées à jouer ce round (ids, voir CARD_DEFS).
  hand: string[];
  // Bonus d'attaque temporaire (Cri de Guerre) appliqué au prochain coup.
  atkBuff: number;
  // Ennemi sonné : son prochain signe est télégraphié à coup sûr (et ses
  // projectiles raréfiés si une esquive survient avant).
  enemyStunned: boolean;
  // Réduction d'attaque ennemie cumulée (Insulte Ciblée).
  enemyAtkDebuff: number;
  // Duel de signes : signe (déjà) choisi par l'ennemi pour la manche en cours,
  // indice affiché (peut mentir sauf tellSure) et nonce pour re-clefer l'UI.
  enemySign: SignId;
  tellSign: SignId | null;
  tellSure: boolean;
  signNonce: number;
  // Dernier signe joué par le JOUEUR : les adversaires humains s'en servent
  // pour anticiper (voir rollSignRound).
  lastPlayerSign?: SignId | null;
  // Coup spécial du personnage (déterminé par ses traits, null sinon).
  specialId: SpecialId | null;
  specialCharged: boolean;
  specialUses: number;
  // Piège à Carton : manches restantes où l'ennemi peut marcher dedans.
  trapRounds: number;
  // Multiplicateur de densité de la prochaine esquive (spécial contré = 1.2).
  dodgePenalty: number;
}

// Adversaire canonique (fiche) ou adversaire de la « Bagarre ».
export interface Enemy {
  name: string;
  emoji: string;
  health: number;
  attack: number;
  description: string;
  image?: string;
  loot?: { money?: number; respect?: number; item?: InventoryItem };
}

// ---- Motifs de projectiles (phase d'esquive) ----
export type ProjectileKind = 'peck' | 'feather' | 'fist' | 'claw' | 'bottle' | 'dash';
export type ProjectileMotion = 'straight' | 'homing' | 'lob' | 'spread';

export interface ProjectilePattern {
  id: string;
  label: string;
  labelEn: string;
  kind: ProjectileKind;   // forme/emoji du projectile
  motion: ProjectileMotion;
  spawnMs: number;        // intervalle entre deux tirs (plus petit = plus dense)
  speed: number;          // vitesse en px/s dans l'arène 300×300
  size: number;           // rayon du projectile (px)
}

// ---- Cartes de riposte (phase « Draw ») ----
export type CardKind = 'attack' | 'debuff' | 'buff' | 'flee' | 'heal';

export interface CombatCard {
  id: string;
  name: string; nameEn: string;
  emoji: string;
  kind: CardKind;
  desc: string; descEn: string;
  // Étiquette de dégâts/effet affichée sur la carte.
  estimate: (c: Character, combat: CombatState) => string;
  available: (c: Character, combat: CombatState) => boolean;
}

// ============ MÉTÉO ============
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'storm' | 'heatwave' | 'fog' | 'snow';

export interface Weather {
  type: WeatherType;
  label: string;
  labelEn: string;
  emoji: string;
  description: string;
  descriptionEn: string;
  // Décay supplémentaire par jour
  dailyPenalty: Partial<Stats>;
  // Modificateur sur les actions (ex: mendier rapporte moins sous la pluie)
  actionModifier: number; // 0.5 = moitié moins de gains, 1.5 = 50% de plus
  // Couleur du filtre visuel
  filter: string;
  // Opacité du filtre
  filterOpacity: number;
}

// ============ BOUTIQUES ============
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

// Pannes & fermetures : la rue est imprévisible. Stocké sur le personnage
// (persistant dans la partie, remis à zéro au personnage suivant).
export interface ShopClosure {
  shopId: string;
  untilDay: number;   // la boutique rouvre à partir de ce jour
  reason: string; reasonEn: string;
  // Fermeture provoquée par un marchandage qui a mal tourné (et non par une
  // panne). Change le texte de réouverture : on ne répare rien, on s'excuse.
  fromHaggle?: boolean;
}

// ============ MÉTA / PROGRESSION ============
// Kits de départ de L'Héritage : achetés au Cimetière avec le Karma de Rue,
// consommés au prochain personnage. Petits coups de pouce, jamais décisifs.
export interface HeritageKit {
  id: string;
  name: string; nameEn: string;
  emoji: string;
  desc: string; descEn: string;
  cost: number;
  money: number;
  items: InventoryItem[];
}

// Titres de rue : franchir un palier de jours donne un titre (+ un peu de respect).
export interface StreetTitle { day: number; fr: string; en: string; respect: number; emoji: string }

// Contrats du matin : un micro-objectif par jour, jugé à la nuit tombée.
export interface Contract {
  id: string;
  emoji: string;
  label: string; labelEn: string;
  rewardLabel: string; rewardLabelEn: string;
  // Évalué à la fin de la journée (NEXT_DAY)…
  check?: (c: Character) => boolean;
  // …ou accompli en cours de journée (ex. gagner un combat → done).
  needsFlag?: boolean;
  reward: { stats?: Partial<Stats>; money?: number; respect?: number };
}

// ============ ÉTAT GLOBAL ============
export type GameScreen = 'title' | 'character-select' | 'main' | 'event' | 'combat' | 'travel' | 'inventory' | 'game-over' | 'shop' | 'registre' | 'cimetiere' | 'settings' | 'steal-game' | 'beg-game' | 'salvage-game' | 'wardrobe' | 'audio-test';

export interface GameState {
  screen: GameScreen;
  character: Character | null;
  characterChoices: Character[];
  currentEvent: GameEvent | null;
  currentCombat: CombatState | null;
  /*
   * `journeeFinie` : le nombre d'actions que ce résultat vient d'emporter.
   *
   * La garde à vue coupe la journée net. Elle le disait dans sa phrase, au
   * milieu du reste, et s'affichait ensuite comme n'importe quel résultat
   * mineur : trois pastilles grises. La perte la plus lourde du jeu — deux
   * actions sur trois, parfois — passait inaperçue. Ce champ permet à la
   * fenêtre de résultat de la traiter à part.
   */
  eventResult: { text: string; statChanges?: Partial<Stats>; moneyChange?: number; respectChange?: number; doubled?: boolean; faceKept?: boolean; image?: string; fallbackImage?: string; journeeFinie?: number } | null;
  // Bilan de la nuit affiché après « Jour suivant » : nouveau jour, météo,
  // pertes/gains de jauges de la nuit, et éventuels effets de traits.
  daySummary: { day: number; weather: WeatherType; deltas: Partial<Stats>; moneyChange: number; notes: string[]; notesEn: string[] } | null;
  // Contrat du matin : micro-objectif du jour (jugé à la nuit). `done` sert
  // aux contrats accomplis en cours de journée (ex. gagner un combat).
  contract: { id: string; done: boolean } | null;
  combatLog: string[];
  dayActions: number;
  maxDayActions: number;
  highScores: { name: string; days: number; score: number }[];
  weather: WeatherType;
  /*
   * La météo de DEMAIN, tirée une seule fois et conservée.
   *
   * L'écran principal l'affichait en appelant `getNextWeather` à chaque rendu :
   * un tirage neuf, sans rapport avec celui que la nuit ferait réellement. La
   * prévision changeait donc en cours d'écran et se trompait toujours. On la
   * décide au moment où le jour bascule, on la montre, et c'est elle qui
   * arrive.
   */
  nextWeather: WeatherType;
  // Cause de mort contextuelle (ex. l'ennemi qui vous a achevé), sinon null
  // et l'écran de fin la déduit de vos jauges.
  deathCause: string | null;
}
