import { useGame, getWeaponProfile } from '@/contexts/GameContext';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface DmgFloat { id: number; target: 'enemy' | 'player'; value: number; crit: boolean; }

export default function CombatScreen() {
  const { state, dispatch } = useGame();
  const { currentCombat, combatLog, character } = state;
  const [aiming, setAiming] = useState(false);
  const [floats, setFloats] = useState<DmgFloat[]>([]);
  const prevEnemyHp = useRef<number | null>(null);
  const prevPlayerHp = useRef<number | null>(null);
  const floatId = useRef(0);
  const enemyCtrl = useAnimationControls();
  const playerCtrl = useAnimationControls();
  const critCtrl = useAnimationControls();

  function pushFloat(target: 'enemy' | 'player', value: number, crit: boolean) {
    const id = ++floatId.current;
    setFloats((f) => [...f, { id, target, value, crit }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 950);
  }

  // Détecte les variations de PV pour déclencher impacts + chiffres de dégâts.
  useEffect(() => {
    if (!currentCombat || !character) return;
    const eHp = currentCombat.enemyHealth;
    const pHp = character.stats.health;
    const crit = /CRITIQUE/i.test(combatLog.slice(-2).join(' '));

    if (prevEnemyHp.current !== null && eHp < prevEnemyHp.current) {
      pushFloat('enemy', prevEnemyHp.current - eHp, crit);
      enemyCtrl.start({ x: [0, -9, 9, -6, 6, 0], transition: { duration: 0.38 } });
      if (crit) critCtrl.start({ opacity: [0, 0.55, 0], transition: { duration: 0.5 } });
    }
    if (prevPlayerHp.current !== null && pHp < prevPlayerHp.current) {
      pushFloat('player', prevPlayerHp.current - pHp, false);
      playerCtrl.start({ x: [0, -7, 7, -4, 4, 0], transition: { duration: 0.35 } });
    }
    prevEnemyHp.current = eHp;
    prevPlayerHp.current = pHp;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCombat?.enemyHealth, character?.stats.health, combatLog.length]);

  if (!currentCombat || !character) return null;

  const weakDiscovered = character.activeFlags.includes(`wp:${currentCombat.enemyName}`);

  function aimAt(targetId: string) {
    setAiming(false);
    dispatch({ type: 'COMBAT_AIM', targetId });
  }

  const hpPercent = (currentCombat.enemyHealth / currentCombat.enemyMaxHealth) * 100;
  const playerHpPercent = character.stats.health;
  const weapon = character.inventory.find(i => i.type === 'weapon');
  const weaponProfile = getWeaponProfile(weapon);

  const isMilitaire = character.job.id === 'militaire';
  const hasForce = character.traits.some(t => t.id === 'costaud');
  const hasCharisme = character.traits.some(t => t.id === 'charismatique');
  const hasHaleine = character.traits.some(t => t.id === 'haleine');
  const hasAgile = character.traits.some(t => t.id === 'agile');
  const isCascadeur = character.job.id === 'cascadeur';

  const playerInDanger = playerHpPercent <= 30;

  const renderFloats = (target: 'enemy' | 'player') =>
    floats.filter((f) => f.target === target).map((f) => (
      <motion.div
        key={f.id}
        initial={{ y: 4, opacity: 0, scale: 0.5 }}
        animate={{ y: -44, opacity: [0, 1, 1, 0], scale: f.crit ? 1.5 : 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="absolute left-1/2 -translate-x-1/2 top-1 pointer-events-none font-extrabold text-center leading-none"
        style={{ color: f.crit ? '#F2C14E' : target === 'enemy' ? '#FF7A5A' : '#FF5A5A', textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}
      >
        {f.crit && <span className="block text-[9px] tracking-wider">CRITIQUE&nbsp;!</span>}
        <span className="text-lg">-{f.value}</span>
      </motion.div>
    ));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 flex flex-col gap-3 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1C1410 0%, #0A0806 100%)' }}
    >
      {/* Flash de coup critique */}
      <motion.div
        animate={critCtrl}
        initial={{ opacity: 0 }}
        className="absolute inset-0 z-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 35%, rgba(242,193,78,0.6), transparent 65%)' }}
      />

      {/* Header */}
      <div className="text-center py-1">
        <h2 className="text-sm font-semibold text-[#E8A87C] tracking-wide uppercase">Combat</h2>
      </div>

      {/* Enemy Card */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-xl p-4 border border-[#3D2A1A] relative"
        style={{ background: 'linear-gradient(135deg, #2A1C12, #1E1410)' }}
      >
        {renderFloats('enemy')}
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            animate={enemyCtrl}
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border border-[#4A2A1A]"
            style={{ background: 'radial-gradient(circle at 50% 40%, rgba(217,79,79,0.22), rgba(26,14,8,0.4) 72%)' }}
          >
            <motion.span
              className="text-4xl"
              animate={{ rotate: [0, -3, 3, 0] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              {currentCombat.enemyEmoji}
            </motion.span>
          </motion.div>
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
      <motion.div animate={playerCtrl}>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`rounded-xl p-4 border relative ${playerInDanger ? 'border-[#8B2020]' : 'border-[#3D5A2A]'}`}
          style={{ background: 'linear-gradient(135deg, #1A2A14, #141E10)' }}
        >
          {renderFloats('player')}
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
      </motion.div>

      {/* Combat Log */}
      <div className="rounded-xl p-3 flex-1 min-h-0 overflow-y-auto border border-[#2A2018]" style={{ background: '#140E0A' }}>
        <p className="text-[9px] uppercase tracking-widest text-[#5C4A38] mb-1.5">Journal du combat</p>
        <AnimatePresence>
          {combatLog.slice(-6).map((log, i) => (
            <motion.p
              key={`${combatLog.length - 6 + i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-xs mb-1 ${
                i === Math.min(combatLog.length, 6) - 1 ? 'text-[#F0D9C4] font-medium' : 'text-[#7A6050]'
              }`}
            >
              {log}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto">
        <AnimatePresence mode="wait">
          {aiming ? (
            <motion.div
              key="aim-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-col gap-2"
            >
              <div className="rounded-xl p-2.5 border border-[#5C4A38] flex flex-col gap-1.5" style={{ background: '#1A120C' }}>
                <p className="text-[11px] text-[#E8A87C] text-center">
                  🔎 {weakDiscovered
                    ? 'Point faible connu — la cible 🎯 marque la zone.'
                    : currentCombat.weakPointHint}
                </p>
                <p className="text-[10px] text-[#A08060] text-center border-t border-[#3D2A1A] pt-1.5">
                  {weaponProfile.label} — {weaponProfile.note}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {currentCombat.zones.map((zone) => {
                  const showMark = weakDiscovered && zone.id === currentCombat.weakPointId;
                  return (
                    <motion.button
                      key={zone.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => aimAt(zone.id)}
                      className={`py-3 rounded-xl text-xs font-semibold text-[#F0D9C4] flex flex-col items-center gap-1 border ${
                        showMark ? 'border-[#E8A87C]' : 'border-[#3D2A1A]'
                      }`}
                      style={{ background: showMark ? 'linear-gradient(135deg, #3A2614, #2A1C12)' : 'linear-gradient(135deg, #2A1C12, #1E1410)' }}
                    >
                      <span className="text-xl">{showMark ? '🎯' : zone.emoji}</span>
                      <span>{zone.label}</span>
                    </motion.button>
                  );
                })}
              </div>
              <button
                onClick={() => setAiming(false)}
                className="w-full py-2 rounded-xl text-xs font-medium text-[#A08060]"
                style={{ background: '#1A120C', border: '1px solid #3D2A1A' }}
              >
                Annuler
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="main-actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2"
            >
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => dispatch({ type: 'COMBAT_ATTACK' })}
                  className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #B84A3A, #8B2020)', boxShadow: '0 4px 12px rgba(184, 74, 58, 0.3)' }}
                >
                  Attaquer
                  {(isMilitaire || hasForce) && <span className="text-xs ml-1 opacity-60">+bonus</span>}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setAiming(true)}
                  className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #C99A3A, #9B7209)', boxShadow: '0 4px 12px rgba(201, 154, 58, 0.25)' }}
                >
                  🎯 Viser
                </motion.button>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => dispatch({ type: 'COMBAT_INTIMIDATE' })}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #D4874D, #9B5B3A)', boxShadow: '0 4px 12px rgba(212, 135, 77, 0.2)' }}
                >
                  Intimider
                  {(hasCharisme || hasHaleine) && <span className="text-[10px] ml-1 opacity-60">+</span>}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => dispatch({ type: 'COMBAT_FLEE' })}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-[#E8D5C0]"
                  style={{ background: 'linear-gradient(135deg, #3D2A1A, #2A1C12)', border: '1px solid #5C4A38' }}
                >
                  Fuir
                  {(hasAgile || isCascadeur) && <span className="text-[10px] ml-1 opacity-60">+</span>}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
