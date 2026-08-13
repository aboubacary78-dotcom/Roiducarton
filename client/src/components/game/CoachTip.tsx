import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang, tr } from '@/lib/lang';
import { nextCoach, markCoachSeen, allCoachesSeen, type CoachContext } from '@/lib/coach';

/*
 * LE CONSEIL DU MOMENT.
 *
 * Une seule phrase, en bas de l'écran principal, qui apparaît quand la
 * situation la rend utile et disparaît d'un geste. Il ne bloque rien : le
 * joueur peut l'ignorer et continuer à jouer, ce qui est exactement la
 * différence avec l'ancien tutoriel en huit écrans imposés.
 *
 * Un léger délai avant l'apparition : surgir en même temps que l'écran ferait
 * du conseil un élément de l'interface, alors qu'on veut qu'il se remarque
 * comme une remarque.
 */
export default function CoachTip({ ctx }: { ctx: CoachContext }) {
  useLang();
  const [shown, setShown] = useState<ReturnType<typeof nextCoach>>(null);

  useEffect(() => {
    if (allCoachesSeen()) return;
    const c = nextCoach(ctx);
    if (!c || c.id === shown?.id) return;
    const t = setTimeout(() => setShown(c), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.char.day, ctx.actionsLeft, ctx.char.money, ctx.char.inventory.length, ctx.weather,
      ctx.char.stats.dignity, ctx.char.stats.health, ctx.char.stats.mental]);

  function fermer() {
    if (shown) markCoachSeen(shown.id);
    setShown(null);
  }

  return (
    <AnimatePresence>
      {shown && (
        <motion.button
          key={shown.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ type: 'spring', damping: 24 }}
          onClick={fermer}
          className="fixed left-3 right-3 bottom-3 z-40 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left shadow-[0_6px_20px_rgba(42,31,26,0.22)]"
          style={{ background: '#2A1F1A', border: '1px solid #4A3A2A' }}
        >
          <span className="text-lg shrink-0">{shown.emoji}</span>
          <span className="flex-1 text-[12px] text-[#F0D9C4] leading-snug">
            {tr(shown.fr, shown.en)}
          </span>
          <span className="text-[10px] text-[#8B6B4A] shrink-0 font-mono">
            {tr('compris', 'got it')}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
