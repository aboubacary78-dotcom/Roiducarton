import { useGame } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CombatScreen() {
  const { state, dispatch } = useGame();
  const { currentCombat, combatLog, character } = state;

  if (!currentCombat || !character) return null;

  const hpPercent = (currentCombat.enemyHealth / currentCombat.enemyMaxHealth) * 100;
  const playerHpPercent = character.stats.health;
  const weapon = character.inventory.find(i => i.type === 'weapon');

  const isMilitaire = character.job.id === 'militaire';
  const hasForce = character.traits.some(t => t.id === 'costaud');
  const hasCharisme = character.traits.some(t => t.id === 'charismatique');
  const hasHaleine = character.traits.some(t => t.id === 'haleine');
  const hasAgile = character.traits.some(t => t.id === 'agile');
  const isCascadeur = character.job.id === 'cascadeur';

  const playerInDanger = playerHpPercent <= 30;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 flex flex-col gap-3"
      style={{ background: 'linear-gradient(180deg, #1C1410 0%, #0A0806 100%)' }}
    >
      {/* Header */}
      <div className="text-center py-1">
        <h2 className="text-sm font-semibold text-[#E8A87C] tracking-wide uppercase">Combat</h2>
      </div>

      {/* Enemy Card */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-xl p-4 border border-[#3D2A1A]"
        style={{ background: 'linear-gradient(135deg, #2A1C12, #1E1410)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <motion.span
            className="text-4xl"
            animate={{ rotate: [0, -3, 3, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            {currentCombat.enemyEmoji}
          </motion.span>
          <div className="flex-1">
            <h3 className="text-lg text-[#F0D9C4] font-bold">{currentCombat.enemyName}</h3>
            <p className="text-xs text-[#A08060] italic">{currentCombat.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-[#D94F4F] font-mono w-6">PV</span>
          <div className="flex-1 h-3 bg-[#1A0E08] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: hpPercent > 50 ? 'linear-gradient(90deg, #D94F4F, #E86B5A)'
                  : hpPercent > 25 ? 'linear-gradient(90deg, #D4874D, #E8A060)'
                  : 'linear-gradient(90deg, #8B2020, #D94F4F)',
              }}
              animate={{ width: `${hpPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-[10px] font-semibold text-[#D94F4F] font-mono w-14 text-right">
            {currentCombat.enemyHealth}/{currentCombat.enemyMaxHealth}
          </span>
        </div>
      </motion.div>

      {/* VS */}
      <div className="text-center">
        <span className="text-sm font-bold text-[#5C4A38] tracking-widest">VS</span>
      </div>

      {/* Player Card */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`rounded-xl p-4 border ${playerInDanger ? 'border-[#8B2020]' : 'border-[#3D5A2A]'}`}
        style={{ background: 'linear-gradient(135deg, #1A2A14, #141E10)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{character.job.emoji}</span>
          <div className="flex-1">
            <h3 className="text-lg text-[#C4E0B8] font-bold">{character.name}</h3>
            <p className="text-xs text-[#80A070]">
              {character.job.name}{weapon && ` · ${weapon.emoji} ${weapon.name}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-[#4A9B5F] font-mono w-6">PV</span>
          <div className="flex-1 h-3 bg-[#0A1408] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: playerHpPercent > 50 ? 'linear-gradient(90deg, #4A9B5F, #5CB870)'
                  : playerHpPercent > 25 ? 'linear-gradient(90deg, #D4874D, #E8A060)'
                  : 'linear-gradient(90deg, #8B2020, #D94F4F)',
              }}
              animate={{
                width: `${playerHpPercent}%`,
                opacity: playerInDanger ? [0.6, 1, 0.6] : 1,
              }}
              transition={playerInDanger ? { opacity: { repeat: Infinity, duration: 0.8 } } : { duration: 0.4 }}
            />
          </div>
          <span className="text-[10px] font-semibold text-[#4A9B5F] font-mono w-14 text-right">
            {character.stats.health}/100
          </span>
        </div>
      </motion.div>

      {/* Combat Log */}
      <div className="rounded-xl p-3 flex-1 max-h-24 overflow-y-auto border border-[#2A2018]" style={{ background: '#140E0A' }}>
        <AnimatePresence>
          {combatLog.slice(-4).map((log, i) => (
            <motion.p
              key={`${combatLog.length - 4 + i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-xs mb-1 ${
                i === Math.min(combatLog.length, 4) - 1 ? 'text-[#F0D9C4] font-medium' : 'text-[#7A6050]'
              }`}
            >
              {log}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => dispatch({ type: 'COMBAT_ATTACK' })}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #B84A3A, #8B2020)', boxShadow: '0 4px 12px rgba(184, 74, 58, 0.3)' }}
        >
          Attaquer {weapon ? `(${weapon.name})` : '(mains nues)'}
          {(isMilitaire || hasForce) && <span className="text-xs ml-1 opacity-60">+bonus</span>}
        </motion.button>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => dispatch({ type: 'COMBAT_INTIMIDATE' })}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #D4874D, #9B5B3A)', boxShadow: '0 4px 12px rgba(212, 135, 77, 0.2)' }}
          >
            Intimider
            {(hasCharisme || hasHaleine) && <span className="text-[10px] ml-1 opacity-60">+</span>}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => dispatch({ type: 'COMBAT_FLEE' })}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-[#E8D5C0]"
            style={{ background: 'linear-gradient(135deg, #3D2A1A, #2A1C12)', border: '1px solid #5C4A38' }}
          >
            Fuir
            {(hasAgile || isCascadeur) && <span className="text-[10px] ml-1 opacity-60">+</span>}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
