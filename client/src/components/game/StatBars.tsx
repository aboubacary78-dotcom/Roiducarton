import { STAT_META, type Stats } from '@/contexts/GameContext';
import { dignityTier } from '@/contexts/data/dignity';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useLang, tr } from '@/lib/lang';

/*
 * LES JAUGES.
 *
 * Six barres identiques ne se lisent pas : elles se comptent. Et une jauge
 * qu'il faut compter n'est pas lue. Le problème n'a jamais été le nombre de
 * jauges — six tiennent très bien dans une lecture périphérique — mais
 * l'absence de hiérarchie entre elles, qui rangeait la Dignité au sixième rang
 * d'une liste alors qu'elle est le sujet du jeu.
 *
 * D'où deux règles ici :
 *
 * 1. LE CORPS EN UNE LIGNE. Les cinq jauges de survie sont des segments
 *    côte à côte, sans chiffres. La Dignité prend la ligne du dessous, pleine
 *    largeur, avec son palier écrit en toutes lettres.
 *
 * 2. LES CHIFFRES PAR EXCEPTION. Tant que tout va, l'écran n'affiche AUCUN
 *    nombre. Dès qu'une jauge passe sous le seuil de danger, son nombre
 *    apparaît — et c'est le bon. On peut déplier le détail d'un appui.
 */

const DANGER = 25;

const BODY: { key: keyof Stats; color: string; dangerColor: string }[] = [
  { key: 'health', color: '#D94F4F', dangerColor: '#8B2020' },
  { key: 'mental', color: '#7B68EE', dangerColor: '#4A3A9B' },
  { key: 'hunger', color: '#D4874D', dangerColor: '#8B4513' },
  { key: 'thirst', color: '#4A8FBF', dangerColor: '#2A5A8B' },
  { key: 'sleep', color: '#8B7EC8', dangerColor: '#5A4A8B' },
];

const DIGNITY = { color: '#B8860B', dangerColor: '#7A5A08' };

/** Petit « +X / −X » qui monte au-dessus d'une jauge qui vient de bouger. */
function useDeltas(stats: Stats) {
  const prev = useRef<Stats | null>(null);
  const [deltas, setDeltas] = useState<Partial<Record<keyof Stats, { id: number; v: number }>>>({});
  const idRef = useRef(0);

  useEffect(() => {
    const before = prev.current;
    prev.current = { ...stats };
    if (!before) return;
    const changed: Partial<Record<keyof Stats, { id: number; v: number }>> = {};
    for (const key of Object.keys(STAT_META) as (keyof Stats)[]) {
      const d = Math.round(stats[key] - before[key]);
      if (d !== 0) changed[key] = { id: ++idRef.current, v: d };
    }
    if (Object.keys(changed).length === 0) return;
    setDeltas(cur => ({ ...cur, ...changed }));
    const ids = changed;
    const to = setTimeout(() => {
      setDeltas(cur => {
        const next = { ...cur };
        for (const k of Object.keys(ids) as (keyof Stats)[]) {
          if (next[k] && next[k]!.id === ids[k]!.id) delete next[k];
        }
        return next;
      });
    }, 1100);
    return () => clearTimeout(to);
  }, [stats]);

  return deltas;
}

function Delta({ d }: { d?: { id: number; v: number } }) {
  return (
    <AnimatePresence>
      {d && (
        <motion.span
          key={d.id}
          initial={{ opacity: 0, y: 2, scale: 0.7 }}
          animate={{ opacity: 1, y: -11, scale: 1 }}
          exit={{ opacity: 0, y: -19 }}
          transition={{ duration: 0.5 }}
          className="absolute -top-1 right-0 text-[10px] font-mono font-bold pointer-events-none z-10"
          style={{ color: d.v > 0 ? '#3d8b4f' : '#D94F4F', textShadow: '0 1px 2px rgba(251,246,240,0.9)' }}
        >
          {d.v > 0 ? '+' : ''}{d.v}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export default function StatBars({ stats, compact = false }: { stats: Stats; compact?: boolean }) {
  useLang();
  const deltas = useDeltas(stats);
  const [expanded, setExpanded] = useState(false);
  const tier = dignityTier(stats.dignity);
  const dignityDanger = stats.dignity <= DANGER;

  // Le détail dépliable : les six jauges nommées, pour qui veut les valeurs.
  if (expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="w-full grid grid-cols-2 gap-x-3 gap-y-2 text-left"
        aria-label={tr('Replier les jauges', 'Collapse gauges')}
      >
        {(Object.keys(STAT_META) as (keyof Stats)[]).map(key => {
          const value = stats[key];
          const danger = value <= DANGER;
          const conf = key === 'dignity' ? DIGNITY : BODY.find(b => b.key === key)!;
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span className="text-xs w-4 text-center">{STAT_META[key].emoji}</span>
              <div className="flex-1 relative">
                <div className="stat-bar-track">
                  <motion.div
                    className={`stat-bar-fill ${danger ? 'animate-pulse-danger' : ''}`}
                    style={{ backgroundColor: danger ? conf.dangerColor : conf.color }}
                    animate={{ width: `${value}%` }}
                    transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                  />
                </div>
                <Delta d={deltas[key]} />
              </div>
              <span className={`text-[10px] font-mono w-6 text-right font-medium ${danger ? 'text-[#D94F4F]' : 'text-[#6B5740]'}`}>
                {value}
              </span>
            </div>
          );
        })}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setExpanded(true)}
      className={`w-full flex flex-col text-left ${compact ? 'gap-1.5' : 'gap-2'}`}
      aria-label={tr('Voir le détail des jauges', 'Show gauge detail')}
    >
      {/* LE CORPS — cinq segments, aucun chiffre tant que rien ne va mal. */}
      <div className="flex items-end gap-1.5">
        {BODY.map(({ key, color, dangerColor }) => {
          const value = stats[key];
          const danger = value <= DANGER;
          return (
            <div key={key} className="flex-1 relative">
              <div className="flex items-center justify-between mb-0.5 h-3">
                <span className="text-[9px] leading-none opacity-80">{STAT_META[key].emoji}</span>
                {/* Le chiffre n'existe que quand il y a un problème. */}
                {danger && (
                  <span className="text-[9px] font-mono font-bold text-[#D94F4F] leading-none">{value}</span>
                )}
              </div>
              <div className="stat-bar-track">
                <motion.div
                  className={`stat-bar-fill ${danger ? 'animate-pulse-danger' : ''}`}
                  style={{ backgroundColor: danger ? dangerColor : color }}
                  animate={{ width: `${value}%` }}
                  transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                />
              </div>
              <Delta d={deltas[key]} />
            </div>
          );
        })}
      </div>

      {/* LA DIGNITÉ — pleine largeur, et son palier en toutes lettres. */}
      <div className="relative">
        <div className="stat-bar-track">
          <motion.div
            className={`stat-bar-fill ${dignityDanger ? 'animate-pulse-danger' : ''}`}
            style={{ backgroundColor: dignityDanger ? DIGNITY.dangerColor : DIGNITY.color }}
            animate={{ width: `${stats.dignity}%` }}
            transition={{ type: 'spring', stiffness: 160, damping: 22 }}
          />
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[11px] font-semibold leading-none" style={{ color: tier.color }}>
            {STAT_META.dignity.emoji} {tr(tier.fr, tier.en)}
          </span>
          {dignityDanger && (
            <span className="text-[9px] font-mono font-bold text-[#D94F4F] leading-none">{stats.dignity}</span>
          )}
        </div>
        <Delta d={deltas.dignity} />
      </div>
    </button>
  );
}
