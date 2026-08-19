// ============ TITRES DE RUE & CONTRATS DU MATIN ============
import type { StreetTitle, Contract } from '../types';

// La rue reconnaît ceux qui durent : franchir un palier de jours donne un
// titre (affiché sur l'écran principal) et un peu de respect au passage.
export const STREET_TITLES: StreetTitle[] = [
  { day: 3, fr: 'Le Débrouillard', en: 'The Resourceful', respect: 1, emoji: '🧦' },
  { day: 5, fr: 'L\'Habitué', en: 'The Regular', respect: 2, emoji: '🪑' },
  { day: 8, fr: 'Le Doyen', en: 'The Elder', respect: 3, emoji: '🧓' },
  { day: 12, fr: 'Le Roi du Carton', en: 'The Cardboard King', respect: 5, emoji: '👑' },
];

export function streetTitleFor(day: number): StreetTitle | null {
  let t: StreetTitle | null = null;
  for (const st of STREET_TITLES) if (day >= st.day) t = st;
  return t;
}

// Un micro-objectif par jour, annoncé au réveil et jugé à la nuit tombée :
// le petit « encore une journée » qui donne une direction à la survie.
export const CONTRACTS: Contract[] = [
  {
    id: 'contrat-pecule', emoji: '💶',
    label: 'Finir la journée avec au moins 12€', labelEn: 'End the day with at least €12',
    rewardLabel: '+2 respect', rewardLabelEn: '+2 respect',
    check: c => c.money >= 12, progress: c => ({ valeur: c.money, cible: 12 }), reward: { respect: 2 },
  },
  {
    id: 'contrat-forme', emoji: '💪',
    label: 'Finir la journée avec toutes les jauges au-dessus de 30', labelEn: 'End the day with every gauge above 30',
    rewardLabel: '+6 mental', rewardLabelEn: '+6 mind',
    check: c => (Object.values(c.stats) as number[]).every(v => v > 30),
    // La jauge la plus basse décide : c'est elle qui a fait rater le contrat.
    progress: c => ({ valeur: Math.min(...(Object.values(c.stats) as number[])), cible: 31 }),
    reward: { stats: { mental: 6 } },
  },
  {
    id: 'contrat-digne', emoji: '👑',
    label: 'Finir la journée avec 50 de dignité ou plus', labelEn: 'End the day with 50+ dignity',
    rewardLabel: '+2 respect', rewardLabelEn: '+2 respect',
    check: c => c.stats.dignity >= 50, progress: c => ({ valeur: c.stats.dignity, cible: 50 }), reward: { respect: 2 },
  },
  {
    id: 'contrat-combatif', emoji: '🥊',
    label: 'Gagner un combat aujourd\'hui', labelEn: 'Win a fight today',
    rewardLabel: '+4 mental, +1 respect', rewardLabelEn: '+4 mind, +1 respect',
    needsFlag: true, reward: { stats: { mental: 4 }, respect: 1 },
  },
  {
    id: 'contrat-fourmi', emoji: '🎒',
    label: 'Finir la journée avec 5 objets ou plus dans le sac', labelEn: 'End the day with 5+ items in your bag',
    rewardLabel: '+3€', rewardLabelEn: '+€3',
    check: c => c.inventory.length >= 5, progress: c => ({ valeur: c.inventory.length, cible: 5 }), reward: { money: 3 },
  },
];

export function getContract(id: string): Contract | undefined {
  return CONTRACTS.find(c => c.id === id);
}
