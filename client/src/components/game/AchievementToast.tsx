import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { getAccessory, achievementForAccessory, accessoryName, achievementName } from '@/lib/cosmetics';
import { playUnlock } from '@/lib/sound';
import { useLang, tr } from '@/lib/lang';

/*
 * Notification de succès : s'affiche quand un accessoire vient d'être débloqué.
 * Les déblocages arrivent via le contexte (newlyUnlocked) ; on les montre un à
 * un, du plus récent au plus ancien, avec disparition automatique.
 */
export default function AchievementToast() {
  const { newlyUnlocked, dismissUnlock } = useGame();
  const en = useLang() === 'en';
  const current = newlyUnlocked[0];

  useEffect(() => {
    if (!current) return;
    playUnlock();
    const t = setTimeout(() => dismissUnlock(current), 4500);
    return () => clearTimeout(t);
  }, [current, dismissUnlock]);

  const acc = current ? getAccessory(current) : undefined;
  const ach = current ? achievementForAccessory(current) : undefined;

  return (
    <AnimatePresence>
      {current && acc && (
        <motion.button
          key={current}
          initial={{ y: -80, opacity: 0, rotate: -1.4 }}
          /*
            LA ROTATION PASSE PAR FRAMER-MOTION, PAS PAR LE CSS.
            `.postit` porte un `transform: rotate()`, et framer-motion réécrit
            `transform` pour animer `y` : le post-it serait ressorti bien
            droit. Le même piège avait déjà décalé les passants de la manche
            d'une demi-vignette. On confie donc l'angle à l'animation, qui
            compose les deux.
          */
          animate={{ y: 0, opacity: 1, rotate: -1.4 }}
          exit={{ y: -80, opacity: 0, rotate: -1.4 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={() => dismissUnlock(current)}
          /*
            LE SUCCÈS DÉBLOQUÉ EST UN POST-IT.

            C'était une carte blanche cerclée d'or, et l'or, mesuré à 43°, est
            un cousin du kraft : le bandeau le plus important du jeu avait la
            couleur de son propre décor. Le post-it fluo ne contraste qu'à
            1,25:1 posé sur le papier, ce qui en ferait une marque invisible,
            mais il monte à 11,95:1 sous une écriture noire, le meilleur score
            de toute la palette. C'est donc un FOND, jamais un trait, et c'est
            très exactement ce qu'est un post-it.

            Un seul par écran, et il porte toujours un mot.
          */
          className="fixed top-3 left-1/2 z-[60] postit px-4 py-3 flex items-center gap-3 w-[calc(100%-2rem)] max-w-sm text-left"
          style={{ translate: '-50% 0' }}
        >
          <span className="text-3xl shrink-0">{acc.emoji}</span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#6B5A0E] uppercase tracking-wide">{tr('🏆 Succès débloqué', '🏆 Achievement unlocked')}</p>
            <p className="text-sm font-semibold text-[#2A1F1A] leading-tight truncate">{ach ? achievementName(ach, en) : ''}</p>
            <p className="text-xs text-[#5C4E12] leading-tight truncate">
              {tr('Nouvel accessoire', 'New accessory')} : {accessoryName(acc, en)}
            </p>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
