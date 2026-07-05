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
 * nombre de parties jouées. Ces records vivent dans le profil joueur
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
  balancedDay: boolean; // a déjà tenu toutes ses jauges ≥ 60 le même jour
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

export const SLOT_LABELS: Record<AccessorySlot, { label: string; emoji: string }> = {
  hat: { label: 'Chapeaux', emoji: '🎩' },
  eyes: { label: 'Lunettes', emoji: '👓' },
  face: { label: 'Visage', emoji: '😊' },
  neck: { label: 'Cou', emoji: '🧣' },
  bg: { label: 'Fonds', emoji: '🌈' },
};

export const SLOT_ORDER: AccessorySlot[] = ['hat', 'eyes', 'face', 'neck', 'bg'];

export const ACCESSORIES: Accessory[] = [
  // Chapeaux
  { id: 'crown', name: 'Couronne dorée', slot: 'hat', emoji: '👑' },
  { id: 'halo', name: 'Auréole', slot: 'hat', emoji: '😇' },
  { id: 'tophat', name: 'Haut-de-forme', slot: 'hat', emoji: '🎩' },
  { id: 'santa', name: 'Bonnet de Noël', slot: 'hat', emoji: '🎅' },
  { id: 'cap-back', name: 'Casquette à l\'envers', slot: 'hat', emoji: '🧢' },
  // Lunettes / yeux
  { id: 'monocle', name: 'Monocle de gentleman', slot: 'eyes', emoji: '🧐' },
  { id: '3d-glasses', name: 'Lunettes 3D', slot: 'eyes', emoji: '🤓' },
  { id: 'eyepatch', name: 'Cache-œil de pirate', slot: 'eyes', emoji: '🏴‍☠️' },
  { id: 'heart-glasses', name: 'Lunettes en cœur', slot: 'eyes', emoji: '😍' },
  // Visage
  { id: 'mustache', name: 'Moustache guidon', slot: 'face', emoji: '👨' },
  { id: 'warpaint', name: 'Peinture de guerre', slot: 'face', emoji: '🎨' },
  { id: 'blush', name: 'Joues roses', slot: 'face', emoji: '☺️' },
  // Cou
  { id: 'scarf', name: 'Écharpe rayée', slot: 'neck', emoji: '🧣' },
  { id: 'gold-medal', name: 'Médaille d\'or', slot: 'neck', emoji: '🥇' },
  { id: 'bowtie', name: 'Nœud papillon', slot: 'neck', emoji: '🎀' },
  { id: 'gold-chain', name: 'Chaîne en or', slot: 'neck', emoji: '📿' },
  // Fonds
  { id: 'gold-bg', name: 'Aura dorée', slot: 'bg', emoji: '✨' },
  { id: 'rainbow-bg', name: 'Fond arc-en-ciel', slot: 'bg', emoji: '🌈' },
];

export const ACHIEVEMENTS: Achievement[] = [
  // Faciles
  { id: 'first-game', name: 'Premiers pas dans la rue', description: 'Terminez votre première partie.', icon: '👣', reward: 'scarf', tier: 'facile', goal: 1, progress: (r) => Math.min(r.totalGames, 1) },
  { id: 'survivor-3', name: 'Trois jours debout', description: 'Survivez jusqu\'au jour 3.', icon: '📅', reward: 'cap-back', tier: 'facile', goal: 3, progress: (r) => r.bestDay },
  { id: 'saver-30', name: 'Premier magot', description: 'Amassez 30 € en une partie.', icon: '💰', reward: 'bowtie', tier: 'facile', goal: 30, progress: (r) => r.bestMoney },
  { id: 'respected-15', name: 'On vous remarque', description: 'Atteignez 15 de respect.', icon: '⭐', reward: 'blush', tier: 'facile', goal: 15, progress: (r) => r.bestRespect },
  // Moyens
  { id: 'survivor-7', name: 'Une semaine de survie', description: 'Survivez jusqu\'au jour 7.', icon: '🗓️', reward: 'tophat', tier: 'moyen', goal: 7, progress: (r) => r.bestDay },
  { id: 'respected-40', name: 'Figure du quartier', description: 'Atteignez 40 de respect.', icon: '🌟', reward: 'gold-medal', tier: 'moyen', goal: 40, progress: (r) => r.bestRespect },
  { id: 'dignified-80', name: 'Tête haute', description: 'Montez votre dignité à 80.', icon: '👑', reward: 'halo', tier: 'moyen', goal: 80, progress: (r) => r.bestDignity },
  { id: 'saver-80', name: 'Bas de laine', description: 'Amassez 80 € en une partie.', icon: '💵', reward: 'gold-chain', tier: 'moyen', goal: 80, progress: (r) => r.bestMoney },
  { id: 'veteran-3', name: 'Habitué du bitume', description: 'Jouez 3 parties.', icon: '🔁', reward: 'warpaint', tier: 'moyen', goal: 3, progress: (r) => r.totalGames },
  { id: 'balanced', name: 'En pleine forme', description: 'Tenez toutes vos jauges à 60 ou plus le même jour.', icon: '⚖️', reward: '3d-glasses', tier: 'moyen', goal: 1, progress: (r) => (r.balancedDay ? 1 : 0) },
  { id: 'respected-25', name: 'Réputation qui monte', description: 'Atteignez 25 de respect.', icon: '💫', reward: 'heart-glasses', tier: 'moyen', goal: 25, progress: (r) => r.bestRespect },
  // Difficiles
  { id: 'survivor-15', name: 'Le Roi du Carton', description: 'Survivez jusqu\'au jour 15.', icon: '🏆', reward: 'crown', tier: 'difficile', goal: 15, progress: (r) => r.bestDay },
  { id: 'survivor-25', name: 'Légende de la rue', description: 'Survivez jusqu\'au jour 25.', icon: '🌇', reward: 'gold-bg', tier: 'difficile', goal: 25, progress: (r) => r.bestDay },
  { id: 'respected-70', name: 'Respecté de tous', description: 'Atteignez 70 de respect.', icon: '🎖️', reward: 'rainbow-bg', tier: 'difficile', goal: 70, progress: (r) => r.bestRespect },
  { id: 'dignified-95', name: 'Presque un notable', description: 'Montez votre dignité à 95.', icon: '🎩', reward: 'monocle', tier: 'difficile', goal: 95, progress: (r) => r.bestDignity },
  { id: 'veteran-10', name: 'Increvable', description: 'Jouez 10 parties.', icon: '🪖', reward: 'eyepatch', tier: 'difficile', goal: 10, progress: (r) => r.totalGames },
  { id: 'saver-150', name: 'Petit trésor', description: 'Amassez 150 € en une partie.', icon: '💎', reward: 'mustache', tier: 'difficile', goal: 150, progress: (r) => r.bestMoney },
  { id: 'respected-100', name: 'Idole du bitume', description: 'Atteignez 100 de respect.', icon: '👑', reward: 'santa', tier: 'difficile', goal: 100, progress: (r) => r.bestRespect },
];

const ACCESSORY_BY_ID = new Map(ACCESSORIES.map((a) => [a.id, a]));
const ACHIEVEMENT_BY_REWARD = new Map(ACHIEVEMENTS.map((a) => [a.reward, a]));

export function getAccessory(id: string): Accessory | undefined {
  return ACCESSORY_BY_ID.get(id);
}

export function achievementForAccessory(accessoryId: string): Achievement | undefined {
  return ACHIEVEMENT_BY_REWARD.get(accessoryId);
}

export const TIER_META: Record<Tier, { label: string; color: string }> = {
  facile: { label: 'Facile', color: '#4A9B5F' },
  moyen: { label: 'Moyen', color: '#B8860B' },
  difficile: { label: 'Difficile', color: '#D94F4F' },
};
