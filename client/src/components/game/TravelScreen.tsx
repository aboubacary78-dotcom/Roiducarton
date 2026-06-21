import { useGame, LOCATIONS } from '@/contexts/GameContext';
import { motion } from 'framer-motion';

export default function TravelScreen() {
  const { state, dispatch } = useGame();
  const char = state.character!;

  return (
    <div className="min-h-screen bg-texture p-4 flex flex-col gap-3">
      <motion.div
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center pt-1 pb-2"
      >
        <h2 className="text-xl text-[#2A1F1A]">Voyager</h2>
        <p className="text-xs text-[#8B6B4A]">Choisissez votre prochaine destination</p>
      </motion.div>

      <div className="flex flex-col gap-2">
        {Object.entries(LOCATIONS).map(([id, loc], i) => {
          const isCurrent = char.location === id;
          return (
            <motion.button
              key={id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.06 }}
              whileHover={isCurrent ? {} : { scale: 1.01 }}
              whileTap={isCurrent ? {} : { scale: 0.98 }}
              onClick={isCurrent ? undefined : () => dispatch({ type: 'TRAVEL', location: id })}
              disabled={isCurrent}
              className={`craft-card p-3.5 text-left flex items-center gap-3 ${
                isCurrent ? 'ring-2 ring-[#4A9B5F]/40 bg-[#4A9B5F]/4' : ''
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E8D5C0] to-[#D4B896] flex items-center justify-center text-2xl shadow-sm shrink-0">
                {loc.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#2A1F1A]">{loc.name}</span>
                  {isCurrent && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#4A9B5F] text-white font-semibold">ICI</span>
                  )}
                </div>
                <p className="text-xs text-[#6B5740] italic mt-0.5">{loc.description}</p>
                <div className="flex gap-3 mt-1.5">
                  <span className="text-[10px] font-mono text-[#B84A3A] font-medium">Danger {loc.danger}%</span>
                  <span className="text-[10px] font-mono text-[#8B6B4A] font-medium">Ressources {loc.resources}%</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'main' })}
        className="mt-auto py-2 text-sm text-[#A08B70] font-medium text-center hover:text-[#6B5740] transition-colors"
      >
        ← Retour
      </button>
    </div>
  );
}
