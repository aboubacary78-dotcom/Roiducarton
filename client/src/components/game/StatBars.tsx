import { STAT_META, type Stats } from '@/contexts/GameContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// Couleurs propres aux barres ; emoji/label viennent de la table commune.
const STAT_COLORS: { key: keyof Stats; color: string; dangerColor: string }[] = [
  { key: 'health', color: '#D94F4F', dangerColor: '#8B2020' },
  { key: 'mental', color: '#7B68EE', dangerColor: '#4A3A9B' },
  { key: 'hunger', color: '#D4874D', dangerColor: '#8B4513' },
  { key: 'thirst', color: '#4A8FBF', dangerColor: '#2A5A8B' },
  { key: 'sleep', color: '#8B7EC8', dangerColor: '#5A4A8B' },
  { key: 'dignity', color: '#B8860B', dangerColor: '#7A5A08' },
];

const STAT_CONFIG = STAT_COLORS.map(c => ({ ...c, ...STAT_META[c.key] }));

export default function StatBars({ stats, compact = false }: { stats: Stats; compact?: boolean }) {
  // Deltas flottants : on compare aux valeurs précédentes pour faire apparaître
  // un petit « +X / −X » près de la jauge qui bouge (retour visuel clair).
  const prev = useRef<Stats | null>(null);
  const [deltas, setDeltas] = useState<Partial<Record<keyof Stats, { id: number; v: number }>>>({});
  const idRef = useRef(0);

  useEffect(() => {
    const before = prev.current;
    prev.current = { ...stats };
    if (!before) return;
    const changed: Partial<Record<keyof Stats, { id: number; v: number }>> = {};
    for (const { key } of STAT_COLORS) {
      const d = Math.round(stats[key] - before[key]);
      if (d !== 0) changed[key] = { id: ++idRef.current, v: d };
    }
    if (Object.keys(changed).length === 0) return;
    setDeltas((cur) => ({ ...cur, ...changed }));
    // Chaque delta disparaît après son animation.
    const ids = changed;
    const to = setTimeout(() => {
      setDeltas((cur) => {
        const next = { ...cur };
        for (const k of Object.keys(ids) as (keyof Stats)[]) {
          if (next[k] && next[k]!.id === ids[k]!.id) delete next[k];
        }
        return next;
      });
    }, 1100);
    return () => clearTimeout(to);
  }, [stats]);

  return (
    <div className={`grid ${compact ? 'grid-cols-3 gap-x-3 gap-y-1.5' : 'grid-cols-2 gap-x-3 gap-y-2'}`}>
      {STAT_CONFIG.map(({ key, emoji, color, dangerColor }) => {
        const value = stats[key];
        const isDanger = value <= 25;
        const activeColor = isDanger ? dangerColor : color;
        const delta = deltas[key];

        return (
          <div key={key} className="flex items-center gap-1.5">
            <span className="text-xs w-4 text-center">{emoji}</span>
            <div className="flex-1 relative">
              <div className="stat-bar-track">
                <motion.div
                  className={`stat-bar-fill ${isDanger ? 'animate-pulse-danger' : ''}`}
                  style={{ backgroundColor: activeColor }}
                  animate={{ width: `${value}%` }}
                  transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                />
              </div>
              {/* Delta flottant */}
              <AnimatePresence>
                {delta && (
                  <motion.span
                    key={delta.id}
                    initial={{ opacity: 0, y: 2, scale: 0.7 }}
                    animate={{ opacity: 1, y: -10, scale: 1 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.5 }}
                    className="absolute -top-1 right-0 text-[10px] font-mono font-bold pointer-events-none"
                    style={{ color: delta.v > 0 ? '#3d8b4f' : '#D94F4F', textShadow: '0 1px 2px rgba(251,246,240,0.9)' }}
                  >
                    {delta.v > 0 ? '+' : ''}{delta.v}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <span className={`text-[10px] font-mono w-6 text-right font-medium ${isDanger ? 'text-[#D94F4F]' : 'text-[#6B5740]'}`}>
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
