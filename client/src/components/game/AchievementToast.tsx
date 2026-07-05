import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { getAccessory, achievementForAccessory } from '@/lib/cosmetics';
import { playUnlock } from '@/lib/sound';

/*
 * Notification de succès : s'affiche quand un accessoire vient d'être débloqué.
 * Les déblocages arrivent via le contexte (newlyUnlocked) ; on les montre un à
 * un, du plus récent au plus ancien, avec disparition automatique.
 */
export default function AchievementToast() {
  const { newlyUnlocked, dismissUnlock } = useGame();
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
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={() => dismissUnlock(current)}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] craft-card-solid px-4 py-3 flex items-center gap-3 w-[calc(100%-2rem)] max-w-sm text-left"
          style={{ border: '2px solid #B8860B' }}
        >
          <span className="text-3xl shrink-0">{acc.emoji}</span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#B8860B] uppercase tracking-wide">🏆 Succès débloqué</p>
            <p className="text-sm font-semibold text-[#2A1F1A] leading-tight truncate">{ach?.name}</p>
            <p className="text-xs text-[#6B5740] leading-tight truncate">
              Nouvel accessoire : {acc.name}
            </p>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
