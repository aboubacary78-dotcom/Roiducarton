import { useGame, getSellPrice, STAT_META, type Stats } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useLang, tr, tc } from '@/lib/lang';
import SceneIllustration, { sceneForLocation } from './SceneIllustration';

const TYPE_LABELS: Record<string, { label: string; labelEn: string; color: string; bg: string }> = {
  food: { label: 'Nourriture', labelEn: 'Food', color: '#4A9B5F', bg: '#4A9B5F15' },
  weapon: { label: 'Arme', labelEn: 'Weapon', color: '#D94F4F', bg: '#D94F4F15' },
  armor: { label: 'Armure', labelEn: 'Armor', color: '#4A8FBF', bg: '#4A8FBF15' },
  tool: { label: 'Outil', labelEn: 'Tool', color: '#D4874D', bg: '#D4874D15' },
  junk: { label: 'Bazar', labelEn: 'Junk', color: '#B8860B', bg: '#B8860B15' },
  special: { label: 'Spécial', labelEn: 'Special', color: '#7B68EE', bg: '#7B68EE15' },
};


export default function InventoryScreen() {
  const { state, dispatch } = useGame();
  const en = useLang() === 'en';
  const char = state.character!;

  return (
    <div className="min-h-screen bg-texture p-4 flex flex-col gap-3">
      <motion.div
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="craft-card p-0 overflow-hidden"
      >
        <div className="relative h-20 w-full">
          <SceneIllustration theme={sceneForLocation(char.location)} className="w-full h-full" rounded={false} align="bottom" sway />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-white/15" />
          <div className="absolute inset-0 flex justify-between items-center px-3.5">
            <h2 className="text-xl text-[#2A1F1A]">{tr('Inventaire', 'Inventory')}</h2>
            <span className="text-xs text-[#A08B70] font-mono font-medium">{char.inventory.length}/20</span>
          </div>
        </div>
      </motion.div>

      {char.inventory.length === 0 ? (
        <div className="craft-card p-8 text-center">
          <p className="text-3xl mb-2">🕳️</p>
          <p className="text-sm text-[#8B6B4A]">{tr('Votre sac est vide. Comme votre estomac.', 'Your bag is empty. Like your stomach.')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {char.inventory.map((item, i) => {
            const typeInfo = TYPE_LABELS[item.type] || TYPE_LABELS.junk;
            const hasEffect = item.effect && Object.keys(item.effect).length > 0;
            return (
              <motion.div
                key={`${item.id}-${i}`}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="craft-card p-3 flex items-center gap-3"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: typeInfo.bg, border: `1px solid ${typeInfo.color}20` }}
                >
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#2A1F1A]">{tc(item.name)}</span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: typeInfo.bg, color: typeInfo.color }}
                    >
                      {tr(typeInfo.label, typeInfo.labelEn)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-[#6B5740] mt-0.5 font-mono">
                    {item.attackBonus && <span className="text-[#B84A3A]">🥊 +{item.attackBonus} att.</span>}
                    {item.defenseBonus && <span className="text-[#4A8FBF]">🛡️ +{item.defenseBonus} déf.</span>}
                    {item.effect && Object.entries(item.effect).map(([k, v]) => {
                      const meta = STAT_META[k as keyof Stats];
                      return (
                        <span key={k} className={v! > 0 ? 'text-[#3d8b4f]' : 'text-[#B84A3A]'}>
                          {meta ? meta.emoji : ''} {meta ? meta.label : k} {v! > 0 ? '+' : ''}{v}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col gap-1.5">
                  {hasEffect && (
                    <button
                      onClick={() => dispatch({ type: 'USE_ITEM', itemId: item.id })}
                      className="px-2.5 py-1.5 text-xs font-semibold text-white rounded-lg"
                      style={{ background: 'linear-gradient(135deg, #4A9B5F, #3d8b4f)', boxShadow: '0 2px 6px rgba(74, 155, 95, 0.25)' }}
                    >
                      {tr('Utiliser', 'Use')}
                    </button>
                  )}
                  <button
                    onClick={() => dispatch({ type: 'SELL_ITEM', itemId: item.id })}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-[#8B6B4A]"
                    style={{ background: '#F5EDE4', border: '1px solid #E8D5C0' }}
                  >
                    {tr('Vendre', 'Sell')} {getSellPrice(item)}€
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'main' })}
        className="mt-auto py-2 text-sm text-[#A08B70] font-medium text-center hover:text-[#6B5740] transition-colors"
      >
        ← {tr('Retour', 'Back')}
      </button>
    </div>
  );
}
