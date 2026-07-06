/*
 * Vocabulaire d'animations « Carton Craft ».
 *
 * La DA du jeu est une maquette en carton découpé, façon stop-motion : contours
 * feutre, formes plates, léger fait-main. Les animations doivent donner cette
 * sensation d'objets physiques posés/pressés, plutôt que des fondus « lisses ».
 *
 *  - cutoutIn   : une découpe qu'on POSE (pop + légère rotation, petit rebond).
 *  - springCraft: ressort commun, un peu rebondi mais bref.
 *  - stampTap   : appui « tampon » sur un bouton (enfonce + micro-rotation).
 *  - liftHover  : la découpe se soulève légèrement au survol.
 *  - paperSway  : respiration stop-motion pour les illustrations (sans trous
 *                 aux coins : on respire par l'échelle, pas par la rotation).
 *  - screenIn   : transition d'écran, comme un panneau de carton qui se pose.
 */
import type { Transition, TargetAndTransition, Variants } from 'framer-motion';

export const springCraft: Transition = { type: 'spring', stiffness: 430, damping: 24, mass: 0.7 };

export const cutoutIn: Variants = {
  hidden: { opacity: 0, scale: 0.9, rotate: -2.5, y: 12 },
  show: { opacity: 1, scale: 1, rotate: 0, y: 0, transition: springCraft },
};

export const stampTap: TargetAndTransition = { scale: 0.93, rotate: -1.4 };
export const liftHover: TargetAndTransition = { scale: 1.03, rotate: 0.5, y: -2 };

// Respiration douce des illustrations : on reste dans overflow-hidden et on
// « respire » par l'échelle pour éviter les coins qui se découvrent.
export const paperSway: TargetAndTransition = {
  scale: [1, 1.02, 1],
  transition: { duration: 6, ease: 'easeInOut', repeat: Infinity },
};

// Transition d'écran : léger glissé + micro-rotation, comme un panneau posé.
export const screenIn = {
  initial: { opacity: 0, y: 10, scale: 0.985, rotate: 0.5 },
  animate: { opacity: 1, y: 0, scale: 1, rotate: 0 },
  exit: { opacity: 0, y: -8, scale: 0.985, rotate: -0.5 },
  transition: { duration: 0.26, ease: [0.34, 1.32, 0.5, 1] as [number, number, number, number] },
};
