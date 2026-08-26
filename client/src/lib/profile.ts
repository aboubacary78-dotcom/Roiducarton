/*
 * Profil joueur PERMANENT, vit dans une clé localStorage distincte de la
 * sauvegarde de partie (roi-du-carton-save), qui est effacée à la mort du
 * personnage. Le profil, lui, survit à toutes les parties : c'est là que sont
 * conservés les records, les accessoires débloqués et ceux équipés.
 */

import {
  ACHIEVEMENTS,
  type ProfileRecords,
  type AccessorySlot,
} from './cosmetics';

const PROFILE_KEY = 'roi-du-carton-profile';

export interface PlayerProfile {
  records: ProfileRecords;
  unlocked: string[]; // ids d'accessoires débloqués
  /*
   * ANCIEN EMPLACEMENT DE LA TENUE — conservé pour la reprise, plus alimenté.
   *
   * Ce qui est PORTÉ appartient maintenant au personnage (voir
   * `Character.equipped`) : rangée ici, la tenue passait du mort au vivant, et
   * deux vies successives avaient la même tête. Le champ reste lu une fois,
   * au chargement d'une partie commencée avant le changement, pour ne pas
   * déshabiller quelqu'un en cours de route. Rien ne l'écrit plus.
   */
  equipped: Partial<Record<AccessorySlot, string>>;
}

function defaultProfile(): PlayerProfile {
  return {
    records: {
      bestDay: 0, bestRespect: 0, bestMoney: 0, bestDignity: 0,
      totalGames: 0, totalDays: 0,
      balancedDay: false, lowDignity: false, brokeDay: false, ironMental: false,
    },
    unlocked: [],
    equipped: {},
  };
}

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as Partial<PlayerProfile>;
      const base = defaultProfile();
      return {
        records: { ...base.records, ...(data.records || {}) },
        unlocked: Array.isArray(data.unlocked) ? data.unlocked : [],
        equipped: data.equipped && typeof data.equipped === 'object' ? data.equipped : {},
      };
    }
  } catch { /* silent */ }
  return defaultProfile();
}

function saveProfile(p: PlayerProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch { /* silent */ }
}

// Réévalue tous les succès face aux records courants et débloque les
// accessoires nouvellement gagnés. Renvoie la liste des ids nouvellement
// débloqués (pour la notification).
function reevaluate(p: PlayerProfile): string[] {
  const newly: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (!p.unlocked.includes(a.reward) && a.progress(p.records) >= a.goal) {
      p.unlocked.push(a.reward);
      newly.push(a.reward);
    }
  }
  return newly;
}

// Met à jour les records (valeurs jamais décroissantes) depuis l'état de la
// partie en cours, puis débloque les nouveaux accessoires atteints.
export function syncRecords(partial: Partial<ProfileRecords>): string[] {
  const p = loadProfile();
  const r = p.records;
  if (partial.bestDay !== undefined) r.bestDay = Math.max(r.bestDay, partial.bestDay);
  if (partial.bestRespect !== undefined) r.bestRespect = Math.max(r.bestRespect, partial.bestRespect);
  if (partial.bestMoney !== undefined) r.bestMoney = Math.max(r.bestMoney, partial.bestMoney);
  if (partial.bestDignity !== undefined) r.bestDignity = Math.max(r.bestDignity, partial.bestDignity);
  if (partial.totalGames !== undefined) r.totalGames = Math.max(r.totalGames, partial.totalGames);
  if (partial.totalDays !== undefined) r.totalDays = Math.max(r.totalDays, partial.totalDays);
  if (partial.balancedDay) r.balancedDay = true;
  if (partial.lowDignity) r.lowDignity = true;
  if (partial.brokeDay) r.brokeDay = true;
  if (partial.ironMental) r.ironMental = true;
  const newly = reevaluate(p);
  saveProfile(p);
  return newly;
}

// À appeler une fois par fin de partie : incrémente le compteur de parties,
// cumule les jours survécus, puis réévalue les succès.
export function recordGameEnd(days: number): string[] {
  const p = loadProfile();
  p.records.totalGames += 1;
  p.records.totalDays += Math.max(0, days);
  const newly = reevaluate(p);
  saveProfile(p);
  return newly;
}
