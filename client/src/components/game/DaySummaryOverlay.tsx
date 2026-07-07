import { useGame, STAT_META, WEATHER_TYPES, type Stats } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang, tr } from '@/lib/lang';

/*
 * Bilan de la nuit, affiché après « Jour suivant » : nouveau jour, météo,
 * variations de jauges (ce que la nuit a coûté ou rapporté) et effets de traits.
 * C'est le petit pop-up qui annonce ce qui vient de se passer.
 */
export default function DaySummaryOverlay() {
  const { state, dispatch } = useGame();
  const lang = useLang();
  const s = state.daySummary;
  if (!s) return null;

  const weather = WEATHER_TYPES[s.weather];
  const entries = Object.entries(s.deltas) as [keyof Stats, number][];
  const notes = lang === 'en' ? s.notesEn : s.notes;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-backdrop"
        onClick={() => dispatch({ type: 'DISMISS_DAY_SUMMARY' })}
      >
        <motion.div
          initial={{ scale: 0.9, y: 16, rotate: 0.5 }}
          animate={{ scale: 1, y: 0, rotate: 0 }}
          exit={{ scale: 0.9, y: 16 }}
          transition={{ type: 'spring', damping: 24, stiffness: 340 }}
          className="craft-card-solid p-5 max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête : nouveau jour + météo */}
          <div className="text-center mb-3">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#A08B70]">{tr('Une nuit passe…', 'A night passes…')}</div>
            <h2 className="text-2xl text-[#2A1F1A] mt-0.5">{tr('Jour', 'Day')} {s.day}</h2>
            <div className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full bg-[#F3E7D8] text-[#6B5740] text-xs font-semibold">
              <span className="text-base">{weather.emoji}</span>
              {tr(weather.label, weather.labelEn)}
            </div>
          </div>

          {/* Variations de jauges pendant la nuit */}
          {entries.length > 0 && (
            <div className="border-t border-[#E8D5C0] pt-3 mb-3">
              <p className="text-[10px] text-center text-[#A08B70] mb-2 uppercase tracking-wide">{tr('Cette nuit', 'Overnight')}</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {entries.map(([key, val], i) => {
                  const meta = STAT_META[key];
                  const pos = val > 0;
                  return (
                    <motion.span
                      key={key}
                      initial={{ scale: 0, y: 4 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ type: 'spring', delay: 0.08 + i * 0.05 }}
                      className={`text-[11px] px-2 py-1 rounded-full font-semibold font-mono ${
                        pos ? 'bg-[#4A9B5F]/12 text-[#3d8b4f]' : 'bg-[#D94F4F]/12 text-[#B84A3A]'
                      }`}
                    >
                      {meta.emoji} {tr(meta.label, meta.labelEn)} {pos ? '+' : ''}{val}
                    </motion.span>
                  );
                })}
                {s.moneyChange > 0 && (
                  <span className="text-[11px] px-2 py-1 rounded-full font-semibold font-mono bg-[#B8860B]/12 text-[#8B6B4A]">💰 +{s.moneyChange}€</span>
                )}
              </div>
            </div>
          )}

          {/* Effets de traits / petits événements de la nuit */}
          {notes.length > 0 && (
            <div className="mb-3 flex flex-col gap-1.5">
              {notes.map((n, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="text-xs text-[#6B5740] bg-[#F5EDE4] rounded-lg px-2.5 py-1.5 leading-snug"
                >
                  {n}
                </motion.p>
              ))}
            </div>
          )}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => dispatch({ type: 'DISMISS_DAY_SUMMARY' })}
            className="btn-primary w-full py-3 text-sm"
          >
            {tr('Nouvelle journée', 'New day')}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
