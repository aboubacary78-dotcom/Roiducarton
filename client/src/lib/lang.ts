/*
 * Bilingue FR / EN. La langue est mémorisée dans le localStorage ; au premier
 * lancement on la déduit de la langue de l'appareil (anglais → en, sinon fr).
 * Un bouton dans les Options permet de basculer à tout moment.
 *
 * Deux façons de traduire :
 *  - tr(fr, en)  : texte en ligne, le plus simple pour le « chrome » d'écran.
 *  - useLang()   : hook qui réabonne le composant pour qu'il se redessine
 *                  quand on change de langue.
 */
import { useEffect, useReducer } from 'react';

export type Lang = 'fr' | 'en';

const LANG_KEY = 'roi-du-carton-lang';

function detect(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'fr' || saved === 'en') return saved;
    const nav = (typeof navigator !== 'undefined' ? navigator.language : 'fr') || 'fr';
    return nav.toLowerCase().startsWith('en') ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
}

let current: Lang = detect();
const listeners = new Set<() => void>();

export function getLang(): Lang {
  return current;
}

export function setLang(l: Lang): void {
  if (l === current) return;
  current = l;
  try { localStorage.setItem(LANG_KEY, l); } catch { /* silent */ }
  listeners.forEach((f) => f());
}

export function subscribeLang(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

/** Texte bilingue en ligne : tr('Options', 'Settings'). */
export function tr(fr: string, en: string): string {
  return current === 'en' ? en : fr;
}

/** Hook : renvoie la langue courante et redessine le composant au changement. */
export function useLang(): Lang {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => subscribeLang(force), []);
  return current;
}
