/*
 * Petit système de « toasts » (retours flash) à la carton.
 * Pattern module-level façon lang.ts : n'importe quel code peut appeler
 * pushToast(...) et le composant <Toaster/> (monté dans Home) les affiche,
 * animés puis auto-disparus. Sert à donner un retour immédiat aux actions
 * (« Bravo ! », « +3€ », « Équipé ! »…) même quand aucun écran ne change.
 */
import { useSyncExternalStore } from 'react';

export type ToastTone = 'good' | 'bad' | 'info';
export interface Toast {
  id: number;
  text: string;
  emoji?: string;
  tone: ToastTone;
}

let toasts: Toast[] = [];
const listeners = new Set<() => void>();
let counter = 0;

function emit() {
  // Nouvelle référence de tableau pour que useSyncExternalStore détecte le changement.
  toasts = [...toasts];
  listeners.forEach((l) => l());
}

export function pushToast(text: string, opts?: { emoji?: string; tone?: ToastTone; duration?: number }): void {
  const id = ++counter;
  const toast: Toast = { id, text, emoji: opts?.emoji, tone: opts?.tone ?? 'info' };
  toasts.push(toast);
  // Au plus 3 toasts empilés.
  if (toasts.length > 3) toasts.shift();
  emit();
  const duration = opts?.duration ?? 2000;
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, duration);
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => toasts,
    () => toasts,
  );
}
