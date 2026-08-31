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

/*
 * LE DICTIONNAIRE ANGLAIS NE PART QU'AUX ANGLOPHONES.
 *
 * Les deux tables de traduction pèsent 441 ko de source, 179 ko une fois
 * compressées, soit près du tiers du paquet JavaScript du jeu. Or `tc()` ne
 * les consulte JAMAIS quand la langue n'est pas l'anglais : elles étaient
 * téléchargées, décompressées et analysées par tous les joueurs français pour
 * n'être jamais lues une seule fois.
 *
 * Elles sont donc chargées à la demande. Le point d'entrée attend ce
 * chargement avant de monter l'application quand la langue est déjà l'anglais
 * (voir `main.tsx`) : l'anglophone retrouve exactement ce qu'il avait, sans
 * texte français qui clignote, et le francophone ne les voit jamais passer.
 */
type Dictionnaire = Record<string, string>;
let dico: Dictionnaire | null = null;
let dico2: Dictionnaire | null = null;
let chargement: Promise<void> | null = null;

export function chargerTraductions(): Promise<void> {
  if (dico) return Promise.resolve();
  if (!chargement) {
    chargement = Promise.all([import('./content-en'), import('./content-en-2')])
      .then(([a, b]) => {
        dico = a.CONTENT_EN;
        dico2 = b.CONTENT_EN_2;
        // Ce qui est déjà à l'écran doit passer à l'anglais tout seul.
        listeners.forEach((f) => f());
      })
      .catch(() => {
        // Le jeu reste jouable en français plutôt que de casser : `tc` se
        // replie déjà sur le texte d'origine quand rien n'est chargé.
        chargement = null;
      });
  }
  return chargement;
}

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
  // Basculer vers l'anglais en cours de partie va chercher le dictionnaire ;
  // l'écran passe à l'anglais dès qu'il arrive, sans recharger le jeu.
  if (l === 'en') chargerTraductions();
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

/**
 * Traduit un texte de CONTENU (événements, objets, ennemis, métiers…) via le
 * dictionnaire FR→EN. Repli sur le français si la traduction manque : le jeu
 * n'est jamais cassé, il reste juste partiellement français le temps qu'on
 * complète le dictionnaire.
 */
export function tc(fr: string | undefined | null): string {
  if (!fr) return fr ?? '';
  if (current !== 'en') return fr;
  // Tant que le dictionnaire n'est pas là, on rend le français : le jeu reste
  // lisible en toutes circonstances, il n'affiche jamais de clé brute.
  return dico?.[fr] ?? dico2?.[fr] ?? fr;
}

/** Hook : renvoie la langue courante et redessine le composant au changement. */
export function useLang(): Lang {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => subscribeLang(force), []);
  return current;
}
