/*
 * Catalogue des accessoires cosmétiques et des succès qui les débloquent.
 *
 * Les accessoires sont purement cosmétiques (prestige / collection) : ils ne
 * touchent aucune statistique. Chaque accessoire est débloqué par un succès,
 * et le rendu SVG de chaque accessoire vit dans CardboardAvatar (calque par
 * emplacement, cohérent avec la DA « carton »).
 *
 * Les succès s'évaluent sur des RECORDS permanents (jamais décroissants) :
 * meilleur jour atteint, meilleur respect, meilleur pécule, meilleure dignité,
 * jours cumulés, parties jouées, et quelques hauts faits (jour équilibré,
 * misère traversée…). Ces records vivent dans le profil joueur
 * (voir lib/profile.ts), séparé de la sauvegarde de partie.
 */

export type AccessorySlot = 'hat' | 'eyes' | 'face' | 'neck' | 'bg';
export type Tier = 'facile' | 'moyen' | 'difficile';

export interface Accessory {
  id: string;
  name: string;
  slot: AccessorySlot;
  emoji: string; // aperçu dans la liste de la garde-robe
}

export interface ProfileRecords {
  bestDay: number;
  bestRespect: number;
  bestMoney: number;
  bestDignity: number;
  totalGames: number;
  totalDays: number;
  balancedDay: boolean; // a déjà tenu toutes ses jauges ≥ 60 le même jour
  lowDignity: boolean;  // a survécu la misère (dignité ≤ 10)
  brokeDay: boolean;    // a connu la fauche totale (0 €) après le jour 4
  ironMental: boolean;  // a tenu avec le moral au plus bas (≤ 12)
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji du succès
  reward: string; // id de l'accessoire débloqué
  tier: Tier;
  goal: number;
  progress: (r: ProfileRecords) => number; // valeur courante vers le palier
}

export const SLOT_LABELS: Record<AccessorySlot, { label: string; labelEn: string; emoji: string }> = {
  hat: { label: 'Chapeaux', labelEn: 'Hats', emoji: '🎩' },
  eyes: { label: 'Lunettes', labelEn: 'Eyewear', emoji: '👓' },
  face: { label: 'Visage', labelEn: 'Face', emoji: '😊' },
  neck: { label: 'Cou', labelEn: 'Neck', emoji: '🧣' },
  bg: { label: 'Fonds', labelEn: 'Backgrounds', emoji: '🌈' },
};

export const SLOT_ORDER: AccessorySlot[] = ['hat', 'eyes', 'face', 'neck', 'bg'];

export const ACCESSORIES: Accessory[] = [
  // Chapeaux (14)
  { id: 'crown', name: 'Couronne dorée', slot: 'hat', emoji: '👑' },
  { id: 'halo', name: 'Auréole', slot: 'hat', emoji: '😇' },
  { id: 'tophat', name: 'Haut-de-forme', slot: 'hat', emoji: '🎩' },
  { id: 'santa', name: 'Bonnet de Noël', slot: 'hat', emoji: '🎅' },
  { id: 'cap-back', name: 'Casquette à l\'envers', slot: 'hat', emoji: '🧢' },
  { id: 'party', name: 'Chapeau de fête', slot: 'hat', emoji: '🥳' },
  { id: 'beanie', name: 'Bonnet à pompon', slot: 'hat', emoji: '🧶' },
  { id: 'cowboy', name: 'Chapeau de cowboy', slot: 'hat', emoji: '🤠' },
  { id: 'wizard', name: 'Chapeau de mage', slot: 'hat', emoji: '🧙' },
  { id: 'chef', name: 'Toque de chef', slot: 'hat', emoji: '👨‍🍳' },
  { id: 'flower-crown', name: 'Couronne de fleurs', slot: 'hat', emoji: '🌸' },
  { id: 'pirate-hat', name: 'Tricorne de pirate', slot: 'hat', emoji: '🏴‍☠️' },
  { id: 'graduation', name: 'Toque de diplômé', slot: 'hat', emoji: '🎓' },
  { id: 'beret', name: 'Béret', slot: 'hat', emoji: '🎨' },
  // Lunettes / yeux (9)
  { id: 'monocle', name: 'Monocle de gentleman', slot: 'eyes', emoji: '🧐' },
  { id: '3d-glasses', name: 'Lunettes 3D', slot: 'eyes', emoji: '🤓' },
  { id: 'eyepatch', name: 'Cache-œil de pirate', slot: 'eyes', emoji: '🏴‍☠️' },
  { id: 'heart-glasses', name: 'Lunettes en cœur', slot: 'eyes', emoji: '😍' },
  { id: 'star-glasses', name: 'Lunettes étoiles', slot: 'eyes', emoji: '🤩' },
  { id: 'sunglasses', name: 'Lunettes de soleil', slot: 'eyes', emoji: '😎' },
  { id: 'nerd-glasses', name: 'Lunettes d\'intello', slot: 'eyes', emoji: '🤓' },
  { id: 'ski-goggles', name: 'Masque de ski', slot: 'eyes', emoji: '🥽' },
  { id: 'thug-glasses', name: 'Lunettes pixel', slot: 'eyes', emoji: '🕶️' },
  // Visage (9)
  { id: 'mustache', name: 'Moustache guidon', slot: 'face', emoji: '👨' },
  { id: 'warpaint', name: 'Peinture de guerre', slot: 'face', emoji: '🎨' },
  { id: 'blush', name: 'Joues roses', slot: 'face', emoji: '☺️' },
  { id: 'clown-nose', name: 'Nez de clown', slot: 'face', emoji: '🤡' },
  { id: 'bandage', name: 'Pansement', slot: 'face', emoji: '🩹' },
  { id: 'face-tattoo', name: 'Tatouage larme', slot: 'face', emoji: '💧' },
  { id: 'goatee', name: 'Bouc', slot: 'face', emoji: '🧔' },
  { id: 'unibrow', name: 'Monosourcil', slot: 'face', emoji: '🤨' },
  { id: 'star-cheeks', name: 'Étoiles sur les joues', slot: 'face', emoji: '⭐' },
  // Cou (9)
  { id: 'scarf', name: 'Écharpe rayée', slot: 'neck', emoji: '🧣' },
  { id: 'gold-medal', name: 'Médaille d\'or', slot: 'neck', emoji: '🥇' },
  { id: 'bowtie', name: 'Nœud papillon', slot: 'neck', emoji: '🎀' },
  { id: 'gold-chain', name: 'Chaîne en or', slot: 'neck', emoji: '📿' },
  { id: 'tie', name: 'Cravate', slot: 'neck', emoji: '👔' },
  { id: 'bandana', name: 'Bandana', slot: 'neck', emoji: '🔴' },
  { id: 'cape', name: 'Cape de héros', slot: 'neck', emoji: '🦸' },
  { id: 'pearls', name: 'Collier de perles', slot: 'neck', emoji: '📿' },
  { id: 'whistle', name: 'Sifflet d\'arbitre', slot: 'neck', emoji: '📯' },
  // Fonds (9)
  { id: 'gold-bg', name: 'Aura dorée', slot: 'bg', emoji: '✨' },
  { id: 'rainbow-bg', name: 'Fond arc-en-ciel', slot: 'bg', emoji: '🌈' },
  { id: 'stars-bg', name: 'Nuit étoilée', slot: 'bg', emoji: '🌙' },
  { id: 'flames-bg', name: 'Fond enflammé', slot: 'bg', emoji: '🔥' },
  { id: 'hearts-bg', name: 'Fond de cœurs', slot: 'bg', emoji: '💕' },
  { id: 'confetti-bg', name: 'Fond confettis', slot: 'bg', emoji: '🎉' },
  { id: 'royal-bg', name: 'Fond royal', slot: 'bg', emoji: '🟣' },
  { id: 'spotlight-bg', name: 'Sous les projecteurs', slot: 'bg', emoji: '🔦' },
  { id: 'sunset-bg', name: 'Coucher de soleil', slot: 'bg', emoji: '🌅' },
];

// Petits raccourcis pour écrire les conditions.
const day = (n: number) => (r: ProfileRecords) => r.bestDay >= n ? n : r.bestDay;
const resp = (n: number) => (r: ProfileRecords) => r.bestRespect >= n ? n : r.bestRespect;
const money = (n: number) => (r: ProfileRecords) => r.bestMoney >= n ? n : r.bestMoney;
const dign = (n: number) => (r: ProfileRecords) => r.bestDignity >= n ? n : r.bestDignity;
const games = (n: number) => (r: ProfileRecords) => Math.min(r.totalGames, n);
const tdays = (n: number) => (r: ProfileRecords) => Math.min(r.totalDays, n);
const flag = (f: (r: ProfileRecords) => boolean) => (r: ProfileRecords) => (f(r) ? 1 : 0);

export const ACHIEVEMENTS: Achievement[] = [
  // ===== Faciles =====
  { id: 'first-game', name: 'Premiers pas dans la rue', description: 'Terminez votre première partie.', icon: '👣', reward: 'scarf', tier: 'facile', goal: 1, progress: games(1) },
  { id: 'survivor-2', name: 'Deux jours', description: 'Survivez jusqu\'au jour 2.', icon: '📆', reward: 'beanie', tier: 'facile', goal: 2, progress: day(2) },
  { id: 'survivor-3', name: 'Trois jours debout', description: 'Survivez jusqu\'au jour 3.', icon: '📅', reward: 'cap-back', tier: 'facile', goal: 3, progress: day(3) },
  { id: 'saver-20', name: 'Première pièce', description: 'Amassez 20 € en une partie.', icon: '🪙', reward: 'bowtie', tier: 'facile', goal: 20, progress: money(20) },
  { id: 'respected-10', name: 'On vous remarque', description: 'Atteignez 10 de respect.', icon: '⭐', reward: 'blush', tier: 'facile', goal: 10, progress: resp(10) },
  { id: 'respected-15', name: 'Réputation naissante', description: 'Atteignez 15 de respect.', icon: '✨', reward: 'star-cheeks', tier: 'facile', goal: 15, progress: resp(15) },
  { id: 'dignified-50', name: 'La tête froide', description: 'Montez votre dignité à 50.', icon: '🙂', reward: 'bandana', tier: 'facile', goal: 50, progress: dign(50) },
  { id: 'saver-30', name: 'Petit pécule', description: 'Amassez 30 € en une partie.', icon: '💰', reward: 'tie', tier: 'facile', goal: 30, progress: money(30) },
  { id: 'survivor-5', name: 'Cinq jours', description: 'Survivez jusqu\'au jour 5.', icon: '🗓️', reward: 'party', tier: 'facile', goal: 5, progress: day(5) },
  { id: 'respected-20', name: 'On parle de vous', description: 'Atteignez 20 de respect.', icon: '🌟', reward: 'star-glasses', tier: 'facile', goal: 20, progress: resp(20) },
  { id: 'dignified-60', name: 'Présentable', description: 'Montez votre dignité à 60.', icon: '😊', reward: 'flower-crown', tier: 'facile', goal: 60, progress: dign(60) },
  { id: 'games-3', name: 'Habitué du bitume', description: 'Jouez 3 parties.', icon: '🔁', reward: 'warpaint', tier: 'facile', goal: 3, progress: games(3) },
  { id: 'saver-50', name: 'Bas de laine', description: 'Amassez 50 € en une partie.', icon: '💵', reward: 'nerd-glasses', tier: 'facile', goal: 50, progress: money(50) },
  { id: 'survivor-7', name: 'Une semaine', description: 'Survivez jusqu\'au jour 7.', icon: '📖', reward: 'tophat', tier: 'facile', goal: 7, progress: day(7) },
  { id: 'tdays-25', name: 'Du vécu', description: 'Cumulez 25 jours de survie, toutes parties confondues.', icon: '⏳', reward: 'sunset-bg', tier: 'facile', goal: 25, progress: tdays(25) },
  { id: 'balanced', name: 'En pleine forme', description: 'Tenez toutes vos jauges à 60 ou plus le même jour.', icon: '⚖️', reward: '3d-glasses', tier: 'facile', goal: 1, progress: flag((r) => r.balancedDay) },
  // ===== Moyens =====
  { id: 'survivor-8', name: 'Huit jours', description: 'Survivez jusqu\'au jour 8.', icon: '🎨', reward: 'beret', tier: 'moyen', goal: 8, progress: day(8) },
  { id: 'respected-25', name: 'Réputation qui monte', description: 'Atteignez 25 de respect.', icon: '💫', reward: 'heart-glasses', tier: 'moyen', goal: 25, progress: resp(25) },
  { id: 'dignified-70', name: 'Digne', description: 'Montez votre dignité à 70.', icon: '🎩', reward: 'pearls', tier: 'moyen', goal: 70, progress: dign(70) },
  { id: 'saver-80', name: 'Économe', description: 'Amassez 80 € en une partie.', icon: '💸', reward: 'gold-chain', tier: 'moyen', goal: 80, progress: money(80) },
  { id: 'survivor-10', name: 'Dizaine', description: 'Survivez jusqu\'au jour 10.', icon: '🤠', reward: 'cowboy', tier: 'moyen', goal: 10, progress: day(10) },
  { id: 'respected-40', name: 'Figure du quartier', description: 'Atteignez 40 de respect.', icon: '🥇', reward: 'gold-medal', tier: 'moyen', goal: 40, progress: resp(40) },
  { id: 'dignified-80', name: 'Tête haute', description: 'Montez votre dignité à 80.', icon: '👑', reward: 'halo', tier: 'moyen', goal: 80, progress: dign(80) },
  { id: 'games-5', name: 'Récidiviste', description: 'Jouez 5 parties.', icon: '😎', reward: 'sunglasses', tier: 'moyen', goal: 5, progress: games(5) },
  { id: 'saver-120', name: 'Bon gestionnaire', description: 'Amassez 120 € en une partie.', icon: '💶', reward: 'whistle', tier: 'moyen', goal: 120, progress: money(120) },
  { id: 'survivor-13', name: 'Treize jours', description: 'Survivez jusqu\'au jour 13.', icon: '👨‍🍳', reward: 'chef', tier: 'moyen', goal: 13, progress: day(13) },
  { id: 'respected-50', name: 'Respecté', description: 'Atteignez 50 de respect.', icon: '🧔', reward: 'goatee', tier: 'moyen', goal: 50, progress: resp(50) },
  { id: 'low-dignity', name: 'Le fond du trou', description: 'Survivez un jour avec la dignité au plus bas (10 ou moins).', icon: '🩹', reward: 'bandage', tier: 'moyen', goal: 1, progress: flag((r) => r.lowDignity) },
  { id: 'tdays-60', name: 'Vieux de la rue', description: 'Cumulez 60 jours de survie.', icon: '🌙', reward: 'stars-bg', tier: 'moyen', goal: 60, progress: tdays(60) },
  { id: 'dignified-90', name: 'Presque respectable', description: 'Montez votre dignité à 90.', icon: '🎓', reward: 'graduation', tier: 'moyen', goal: 90, progress: dign(90) },
  { id: 'games-10', name: 'Increvable', description: 'Jouez 10 parties.', icon: '🥽', reward: 'ski-goggles', tier: 'moyen', goal: 10, progress: games(10) },
  { id: 'survivor-16', name: 'Seize jours', description: 'Survivez jusqu\'au jour 16.', icon: '🤡', reward: 'clown-nose', tier: 'moyen', goal: 16, progress: day(16) },
  { id: 'broke-day', name: 'Sans un rond', description: 'Survivez fauché (0 €) après le jour 4.', icon: '💧', reward: 'face-tattoo', tier: 'moyen', goal: 1, progress: flag((r) => r.brokeDay) },
  // ===== Difficiles =====
  { id: 'survivor-20', name: 'Le Roi du Carton', description: 'Survivez jusqu\'au jour 20.', icon: '👑', reward: 'crown', tier: 'difficile', goal: 20, progress: day(20) },
  { id: 'respected-70', name: 'Respecté de tous', description: 'Atteignez 70 de respect.', icon: '🌈', reward: 'rainbow-bg', tier: 'difficile', goal: 70, progress: resp(70) },
  { id: 'saver-160', name: 'Magot', description: 'Amassez 160 € en une partie.', icon: '🦸', reward: 'cape', tier: 'difficile', goal: 160, progress: money(160) },
  { id: 'dignified-95', name: 'Presque un notable', description: 'Montez votre dignité à 95.', icon: '🧐', reward: 'monocle', tier: 'difficile', goal: 95, progress: dign(95) },
  { id: 'survivor-25', name: 'Légende de la rue', description: 'Survivez jusqu\'au jour 25.', icon: '🌇', reward: 'gold-bg', tier: 'difficile', goal: 25, progress: day(25) },
  { id: 'respected-85', name: 'Idole montante', description: 'Atteignez 85 de respect.', icon: '🧙', reward: 'wizard', tier: 'difficile', goal: 85, progress: resp(85) },
  { id: 'saver-220', name: 'Petit trésor', description: 'Amassez 220 € en une partie.', icon: '👨', reward: 'mustache', tier: 'difficile', goal: 220, progress: money(220) },
  { id: 'games-20', name: 'Pilier du bitume', description: 'Jouez 20 parties.', icon: '🏴‍☠️', reward: 'eyepatch', tier: 'difficile', goal: 20, progress: games(20) },
  { id: 'survivor-30', name: 'Trente jours', description: 'Survivez jusqu\'au jour 30.', icon: '☠️', reward: 'pirate-hat', tier: 'difficile', goal: 30, progress: day(30) },
  { id: 'respected-100', name: 'Idole du bitume', description: 'Atteignez 100 de respect.', icon: '🎅', reward: 'santa', tier: 'difficile', goal: 100, progress: resp(100) },
  { id: 'dignified-100', name: 'Irréprochable', description: 'Montez votre dignité à 100.', icon: '🤨', reward: 'unibrow', tier: 'difficile', goal: 100, progress: dign(100) },
  { id: 'tdays-120', name: 'Une vie entière', description: 'Cumulez 120 jours de survie.', icon: '🔥', reward: 'flames-bg', tier: 'difficile', goal: 120, progress: tdays(120) },
  { id: 'iron-mental', name: 'Nerfs d\'acier', description: 'Survivez un jour avec le moral au plus bas (12 ou moins).', icon: '🕶️', reward: 'thug-glasses', tier: 'difficile', goal: 1, progress: flag((r) => r.ironMental) },
  { id: 'saver-300', name: 'Fortune', description: 'Amassez 300 € en une partie.', icon: '🟣', reward: 'royal-bg', tier: 'difficile', goal: 300, progress: money(300) },
  { id: 'games-40', name: 'Éternel de la rue', description: 'Jouez 40 parties.', icon: '💕', reward: 'hearts-bg', tier: 'difficile', goal: 40, progress: games(40) },
  { id: 'survivor-40', name: 'Immortel du carton', description: 'Survivez jusqu\'au jour 40.', icon: '🎉', reward: 'confetti-bg', tier: 'difficile', goal: 40, progress: day(40) },
  { id: 'tdays-250', name: 'Monument vivant', description: 'Cumulez 250 jours de survie.', icon: '🔦', reward: 'spotlight-bg', tier: 'difficile', goal: 250, progress: tdays(250) },
];

const ACCESSORY_BY_ID = new Map(ACCESSORIES.map((a) => [a.id, a]));
const ACHIEVEMENT_BY_REWARD = new Map(ACHIEVEMENTS.map((a) => [a.reward, a]));

export function getAccessory(id: string): Accessory | undefined {
  return ACCESSORY_BY_ID.get(id);
}

export function achievementForAccessory(accessoryId: string): Achievement | undefined {
  return ACHIEVEMENT_BY_REWARD.get(accessoryId);
}

export const TIER_META: Record<Tier, { label: string; labelEn: string; color: string }> = {
  facile: { label: 'Facile', labelEn: 'Easy', color: '#4A9B5F' },
  moyen: { label: 'Moyen', labelEn: 'Medium', color: '#B8860B' },
  difficile: { label: 'Difficile', labelEn: 'Hard', color: '#D94F4F' },
};

// ===== Traductions anglaises (résolues via les helpers ci-dessous) =====
const ACCESSORY_NAME_EN: Record<string, string> = {
  crown: 'Golden Crown', halo: 'Halo', tophat: 'Top Hat', santa: 'Santa Hat', 'cap-back': 'Backwards Cap',
  party: 'Party Hat', beanie: 'Pompom Beanie', cowboy: 'Cowboy Hat', wizard: 'Wizard Hat', chef: 'Chef\'s Toque',
  'flower-crown': 'Flower Crown', 'pirate-hat': 'Pirate Tricorne', graduation: 'Graduation Cap', beret: 'Beret',
  monocle: 'Gentleman\'s Monocle', '3d-glasses': '3D Glasses', eyepatch: 'Pirate Eyepatch', 'heart-glasses': 'Heart Glasses',
  'star-glasses': 'Star Glasses', sunglasses: 'Sunglasses', 'nerd-glasses': 'Nerd Glasses', 'ski-goggles': 'Ski Goggles', 'thug-glasses': 'Pixel Shades',
  mustache: 'Handlebar Mustache', warpaint: 'War Paint', blush: 'Rosy Cheeks', 'clown-nose': 'Clown Nose', bandage: 'Bandage',
  'face-tattoo': 'Teardrop Tattoo', goatee: 'Goatee', unibrow: 'Unibrow', 'star-cheeks': 'Star Cheeks',
  scarf: 'Striped Scarf', 'gold-medal': 'Gold Medal', bowtie: 'Bow Tie', 'gold-chain': 'Gold Chain', tie: 'Necktie',
  bandana: 'Bandana', cape: 'Hero Cape', pearls: 'Pearl Necklace', whistle: 'Referee Whistle',
  'gold-bg': 'Golden Aura', 'rainbow-bg': 'Rainbow', 'stars-bg': 'Starry Night', 'flames-bg': 'Flames', 'hearts-bg': 'Hearts',
  'confetti-bg': 'Confetti', 'royal-bg': 'Royal', 'spotlight-bg': 'Spotlight', 'sunset-bg': 'Sunset',
};

const ACHIEVEMENT_EN: Record<string, { name: string; description: string }> = {
  'first-game': { name: 'First steps on the street', description: 'Finish your first run.' },
  'survivor-2': { name: 'Two days', description: 'Survive to day 2.' },
  'survivor-3': { name: 'Three days standing', description: 'Survive to day 3.' },
  'saver-20': { name: 'First coin', description: 'Gather €20 in one run.' },
  'respected-10': { name: 'People notice you', description: 'Reach 10 respect.' },
  'respected-15': { name: 'A budding reputation', description: 'Reach 15 respect.' },
  'dignified-50': { name: 'Level head', description: 'Raise your dignity to 50.' },
  'saver-30': { name: 'Small nest egg', description: 'Gather €30 in one run.' },
  'survivor-5': { name: 'Five days', description: 'Survive to day 5.' },
  'respected-20': { name: 'They talk about you', description: 'Reach 20 respect.' },
  'dignified-60': { name: 'Presentable', description: 'Raise your dignity to 60.' },
  'games-3': { name: 'Street regular', description: 'Play 3 runs.' },
  'saver-50': { name: 'Stash', description: 'Gather €50 in one run.' },
  'survivor-7': { name: 'One week', description: 'Survive to day 7.' },
  'tdays-25': { name: 'Some mileage', description: 'Rack up 25 total days survived across all runs.' },
  'balanced': { name: 'In top shape', description: 'Keep all your gauges at 60 or more on the same day.' },
  'survivor-8': { name: 'Eight days', description: 'Survive to day 8.' },
  'respected-25': { name: 'Rising reputation', description: 'Reach 25 respect.' },
  'dignified-70': { name: 'Dignified', description: 'Raise your dignity to 70.' },
  'saver-80': { name: 'Thrifty', description: 'Gather €80 in one run.' },
  'survivor-10': { name: 'Double digits', description: 'Survive to day 10.' },
  'respected-40': { name: 'Neighborhood figure', description: 'Reach 40 respect.' },
  'dignified-80': { name: 'Head held high', description: 'Raise your dignity to 80.' },
  'games-5': { name: 'Repeat offender', description: 'Play 5 runs.' },
  'saver-120': { name: 'Good manager', description: 'Gather €120 in one run.' },
  'survivor-13': { name: 'Thirteen days', description: 'Survive to day 13.' },
  'respected-50': { name: 'Respected', description: 'Reach 50 respect.' },
  'low-dignity': { name: 'Rock bottom', description: 'Survive a day with dignity at its lowest (10 or less).' },
  'tdays-60': { name: 'Street veteran', description: 'Rack up 60 total days survived.' },
  'dignified-90': { name: 'Almost respectable', description: 'Raise your dignity to 90.' },
  'games-10': { name: 'Unkillable', description: 'Play 10 runs.' },
  'survivor-16': { name: 'Sixteen days', description: 'Survive to day 16.' },
  'broke-day': { name: 'Flat broke', description: 'Survive with €0 after day 4.' },
  'survivor-20': { name: 'The Cardboard King', description: 'Survive to day 20.' },
  'respected-70': { name: 'Respected by all', description: 'Reach 70 respect.' },
  'saver-160': { name: 'Loot', description: 'Gather €160 in one run.' },
  'dignified-95': { name: 'Almost a somebody', description: 'Raise your dignity to 95.' },
  'survivor-25': { name: 'Street legend', description: 'Survive to day 25.' },
  'respected-85': { name: 'Rising idol', description: 'Reach 85 respect.' },
  'saver-220': { name: 'Little treasure', description: 'Gather €220 in one run.' },
  'games-20': { name: 'Pillar of the street', description: 'Play 20 runs.' },
  'survivor-30': { name: 'Thirty days', description: 'Survive to day 30.' },
  'respected-100': { name: 'Street idol', description: 'Reach 100 respect.' },
  'dignified-100': { name: 'Flawless', description: 'Raise your dignity to 100.' },
  'tdays-120': { name: 'A whole lifetime', description: 'Rack up 120 total days survived.' },
  'iron-mental': { name: 'Nerves of steel', description: 'Survive a day with your mind at its lowest (12 or less).' },
  'saver-300': { name: 'Fortune', description: 'Gather €300 in one run.' },
  'games-40': { name: 'Eternal of the street', description: 'Play 40 runs.' },
  'survivor-40': { name: 'Cardboard immortal', description: 'Survive to day 40.' },
  'tdays-250': { name: 'Living monument', description: 'Rack up 250 total days survived.' },
};

export function accessoryName(a: Accessory, en: boolean): string {
  return en ? (ACCESSORY_NAME_EN[a.id] ?? a.name) : a.name;
}
export function achievementName(a: Achievement, en: boolean): string {
  return en ? (ACHIEVEMENT_EN[a.id]?.name ?? a.name) : a.name;
}
export function achievementDesc(a: Achievement, en: boolean): string {
  return en ? (ACHIEVEMENT_EN[a.id]?.description ?? a.description) : a.description;
}
