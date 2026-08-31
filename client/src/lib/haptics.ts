/*
 * LE RETOUR HAPTIQUE.
 *
 * Sur une surface de verre, c'est lui qui donne du poids à un geste. Il était
 * ici cassé de deux façons, et les deux privaient de vibration une bonne part
 * des joueurs :
 *
 * 1. IL ÉTAIT COUPÉ PAR LA SOURDINE. Le joueur qui coupe le son, c'est-à-dire
 *    la plupart des gens en public, exactement le contexte d'un jeu mobile,
 *    perdait aussi tout retour tactile. Or couper le son est précisément le
 *    moment où l'haptique devient le SEUL canal de retour. Les deux réglages
 *    sont donc séparés, et les vibrations sont actives par défaut.
 *
 * 2. `navigator.vibrate` N'EXISTE PAS SUR iOS. WKWebView ne l'implémente pas :
 *    sur iPhone, l'ancienne fonction ne faisait rien du tout, sur toute la
 *    plateforme. On passe donc par le pont natif de Capacitor, en gardant
 *    `navigator.vibrate` comme repli pour le web et les navigateurs Android.
 *
 * Trois intensités seulement. La lisibilité haptique vient du contraste entre
 * les niveaux, pas du nombre de motifs : dix vibrations différentes se
 * ressentent toutes pareil.
 */
import { Capacitor } from '@capacitor/core';

const HAPTICS_KEY = 'roi-du-carton-haptics';

// Actif par défaut : c'est le retour qui survit à la sourdine.
let enabled = (() => {
  try { return localStorage.getItem(HAPTICS_KEY) !== '0'; } catch { return true; }
})();

export function hapticsEnabled(): boolean {
  return enabled;
}

export function setHapticsEnabled(v: boolean): void {
  enabled = v;
  try { localStorage.setItem(HAPTICS_KEY, v ? '1' : '0'); } catch { /* silent */ }
}

export type HapticLevel = 'light' | 'medium' | 'heavy';

/** Durées du repli web, en millisecondes. */
const FALLBACK_MS: Record<HapticLevel, number> = { light: 12, medium: 28, heavy: 55 };

/*
 * Le module natif est chargé à la demande et gardé : un import dynamique à
 * chaque case déblayée de La Récup' coûterait plus cher que la vibration
 * elle-même.
 */
type HapticsPlugin = {
  impact: (o: { style: unknown }) => Promise<void>;
  vibrate: (o: { duration: number }) => Promise<void>;
};
let plugin: HapticsPlugin | null = null;
let styles: Record<string, unknown> | null = null;
let loading: Promise<void> | null = null;

function ensurePlugin(): Promise<void> {
  if (plugin || loading) return loading ?? Promise.resolve();
  loading = import('@capacitor/haptics')
    .then(m => {
      plugin = m.Haptics as unknown as HapticsPlugin;
      styles = {
        light: m.ImpactStyle.Light,
        medium: m.ImpactStyle.Medium,
        heavy: m.ImpactStyle.Heavy,
      };
    })
    .catch(() => { plugin = null; });
  return loading;
}

function fallback(level: HapticLevel): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(FALLBACK_MS[level]);
    }
  } catch { /* silent */ }
}

/**
 * Un coup sec. `light` pour un geste courant (une case déblayée, un clic),
 * `medium` pour un événement qui compte (un coup encaissé), `heavy` pour ce
 * qui doit faire sursauter (l'effondrement du tas, la mort).
 */
export function haptic(level: HapticLevel = 'light'): void {
  if (!enabled) return;
  if (!Capacitor.isNativePlatform()) { fallback(level); return; }
  ensurePlugin().then(() => {
    if (!plugin || !styles) { fallback(level); return; }
    plugin.impact({ style: styles[level] }).catch(() => fallback(level));
  });
}

/**
 * Un motif, pour les moments qui ont un rythme (une fanfare de victoire, un
 * K.O.). Sur natif, on enchaîne des impacts ; sur le web, `navigator.vibrate`
 * sait jouer le motif tel quel.
 */
export function hapticPattern(pattern: number[]): void {
  if (!enabled) return;
  if (!Capacitor.isNativePlatform()) {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
    } catch { /* silent */ }
    return;
  }
  // Les valeurs paires du motif sont des vibrations, les impaires des pauses.
  let delay = 0;
  pattern.forEach((ms, i) => {
    if (i % 2 === 0 && ms > 0) {
      const level: HapticLevel = ms >= 90 ? 'heavy' : ms >= 45 ? 'medium' : 'light';
      setTimeout(() => haptic(level), delay);
    }
    delay += ms;
  });
}
