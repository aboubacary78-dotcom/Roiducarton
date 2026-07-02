import { STAT_META, type Stats } from '@/contexts/GameContext';

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
  return (
    <div className={`grid ${compact ? 'grid-cols-3 gap-x-3 gap-y-1.5' : 'grid-cols-2 gap-x-3 gap-y-2'}`}>
      {STAT_CONFIG.map(({ key, emoji, color, dangerColor }) => {
        const value = stats[key];
        const isDanger = value <= 25;
        const activeColor = isDanger ? dangerColor : color;

        return (
          <div key={key} className="flex items-center gap-1.5">
            <span className="text-xs w-4 text-center">{emoji}</span>
            <div className="flex-1">
              <div className="stat-bar-track">
                <div
                  className={`stat-bar-fill ${isDanger ? 'animate-pulse-danger' : ''}`}
                  style={{
                    width: `${value}%`,
                    backgroundColor: activeColor,
                  }}
                />
              </div>
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
