import { useEffect } from 'react';

/*
 * QUAND UN VOILE S'OUVRE, LA PAGE S'ARRÊTE.
 *
 * Les quatre voiles du jeu, résultat d'événement, bilan de nuit, récit
 * d'origine, rencontre de rue, se posent au-dessus de l'écran principal sans
 * le bloquer. On lisait donc son résultat pendant que le décor continuait de
 * défiler derrière au moindre glissement de doigt : le regard partait sur le
 * contrat, la météo, les jauges, et l'information du moment se diluait.
 *
 * On fige le corps de la page tant que le voile est là. Deux précautions :
 *
 * - on RESTAURE la valeur précédente, pas une valeur en dur. Deux voiles
 *   peuvent se superposer (le cadeau du matin par-dessus le récit d'origine),
 *   et remettre `overflow: auto` au premier qui se ferme débloquerait la page
 *   sous celui qui reste.
 *
 * - on conserve la position de défilement. iOS la remet à zéro quand on fige
 *   la page, ce qui renvoie le joueur en haut de l'écran à la fermeture.
 *
 * On fige l'élément qui défile RÉELLEMENT. Le réflexe est de bloquer `body`,
 * et c'est ce que faisait la première version : sans effet, parce qu'ici
 * `document.scrollingElement` est `<html>`, `body` porte déjà un
 * `overflow: hidden auto` venu de la feuille de style et ne défile pas.
 * Mesuré : avec `body` figé, un défilement de 400 px passait toujours.
 */
export function useVerrouScroll(actif: boolean): void {
  useEffect(() => {
    if (!actif || typeof document === 'undefined') return;
    const cible = (document.scrollingElement as HTMLElement) ?? document.documentElement;
    const avant = cible.style.overflow;
    const position = window.scrollY;
    cible.style.overflow = 'hidden';
    return () => {
      cible.style.overflow = avant;
      window.scrollTo(0, position);
    };
  }, [actif]);
}
