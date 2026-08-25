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
    /*
     * LES TOASTS PASSENT SOUS LE POST-IT DES SUCCÈS.
     *
     * Les deux étaient posés en `top-3` avec le même z-index : ils se
     * recouvraient exactement, et le bandeau le plus rare du jeu — un succès
     * débloqué — disparaissait derrière un retour éphémère. Ça se produit sur
     * un chemin parfaitement ordinaire : le changement de jour débloque un
     * accessoire ET déclenche une pique du matin.
     *
     * Le succès garde le haut, parce qu'il est rare et qu'il célèbre ; les
     * toasts descendent d'une hauteur de post-it. Quand il n'y a pas de succès
     * à l'écran, ils sont simplement un peu plus bas qu'avant, ce qui ne coûte
     * rien.
     */
    <div
      /* Prise stable pour les tests : ils cherchaient la pile par sa classe de
         position, et la déplacer d'un cran les a tous rendus aveugles. Une
         position est un choix de mise en page, pas un contrat. */
      data-toasts
      className="fixed top-24 left-0 right-0 z-[59] flex flex-col items-center gap-2 px-4 pointer-events-none safe-area"
    >
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
