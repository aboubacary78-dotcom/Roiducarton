/*
 * D'OÙ L'ÉCRAN SUIVANT SORT.
 *
 * Le passage d'un choix textuel à un mini-jeu d'adresse est le moment le plus
 * fragile de la boucle : le joueur change de mode cognitif, de la délibération
 * au réflexe. La transition doit préparer ce changement plutôt que le subir.
 *
 * La version canonique, la tuile touchée qui grandit jusqu'à devenir le fond
 * du mini-jeu, demanderait un élément partagé entre deux écrans. Or les
 * écrans s'échangent en `mode="wait"` : le sortant est démonté AVANT que le
 * suivant ne soit monté, et un élément partagé n'a jamais les deux bouts à
 * l'écran en même temps. Changer ce mode toucherait toutes les transitions du
 * jeu, pour un gain de finition.
 *
 * On garde donc l'effet et pas la mécanique : le nouvel écran s'ouvre EN
 * GRANDISSANT DEPUIS L'ENDROIT EXACT où le doigt s'est posé. La continuité est
 * la même (l'écran suit le doigt) et rien d'autre ne bouge.
 */

let origine: { x: number; y: number } | null = null;

/** À appeler au moment du toucher, avec l'événement. */
export function noteTap(e: { clientX: number; clientY: number }): void {
  origine = { x: e.clientX, y: e.clientY };
}

/**
 * Le point d'origine à donner à `transform-origin`, en pourcentages de la
 * fenêtre. Renvoie le centre quand on ne sait pas d'où ça vient (navigation
 * au clavier, retour arrière, premier écran).
 */
export function tapOrigin(): string {
  if (!origine || typeof window === 'undefined') return '50% 50%';
  const x = Math.round((origine.x / window.innerWidth) * 100);
  const y = Math.round((origine.y / window.innerHeight) * 100);
  return `${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`;
}

/*
 * On ne remet PAS l'origine à zéro après la transition. Le réflexe serait de
 * le faire sur `onAnimationComplete`, mais cet événement se déclenche aussi
 * sur l'animation de SORTIE : l'origine était effacée avant même que l'écran
 * entrant ne la lise, et tout repartait du centre.
 *
 * La laisser en place est sans danger : chaque changement d'écran est précédé
 * d'un toucher, et une origine d'un geste précédent reste plus proche de la
 * main que le centre de l'écran.
 */
