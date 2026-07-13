// Petits utilitaires partagés par les modules de données et le reducer.
import { getLang } from '@/lib/lang';

export function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Choix de langue pour les chaînes GÉNÉRÉES à la volée (journaux de combat,
// résultats interpolés) qu'on ne peut pas passer par le dictionnaire.
export const L = (fr: string, en: string): string => (getLang() === 'en' ? en : fr);
