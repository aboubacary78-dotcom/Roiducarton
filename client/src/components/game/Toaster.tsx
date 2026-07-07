import { AnimatePresence, motion } from 'framer-motion';
import { useToasts } from '@/lib/toast';

/*
 * Affiche la pile de toasts en haut de l'écran, façon carton (contour feutre,
 * léger rebond). Monté une seule fois dans Home, au-dessus de tout.
 */
const TONE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  good: { bg: '#EAF6EC', color: '#2E7D46', border: '#4A9B5F' },
  bad: { bg: '#FBEBEB', color: '#B84A3A', border: '#D94F4F' },
  info: { bg: '#FBF3E6', color: '#8B5E1F', border: '#C4723A' },
};

export default function Toaster() {
  const toasts = useToasts();
  return (
    <div className="fixed top-3 left-0 right-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none safe-area">
      <AnimatePresence>
        {toasts.map((t) => {
          const s = TONE_STYLE[t.tone] || TONE_STYLE.info;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.85, rotate: -2 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 420, damping: 24 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full shadow-[0_4px_14px_rgba(58,42,30,0.18)] max-w-[88%]"
              style={{ background: s.bg, color: s.color, border: `2px solid ${s.border}` }}
            >
              {t.emoji && <span className="text-lg leading-none">{t.emoji}</span>}
              <span className="text-sm font-semibold leading-tight">{t.text}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
