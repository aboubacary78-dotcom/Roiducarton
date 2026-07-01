import { useGame, getWeaponProfile } from '@/contexts/GameContext';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { playHit, playCrit, playHurt } from '@/lib/sound';
import CardboardAvatar from './CardboardAvatar';

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
  const enemyLungeCtrl = useAnimationControls();
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
      if (crit) {
        critCtrl.start({ opacity: [0, 0.55, 0], transition: { duration: 0.5 } });
        playCrit();
      } else {
        playHit();
      }
    }
    if (prevPlayerHp.current !== null && pHp < prevPlayerHp.current) {
      pushFloat('player', prevPlayerHp.current - pHp, false);
      playerCtrl.start({ x: [0, -7, 7, -4, 4, 0], transition: { duration: 0.35 } });
      // L'ennemi charge vers le joueur quand il riposte.
      enemyLungeCtrl.start({ y: [0, 16, 0], scale: [1, 1.12, 1], transition: { duration: 0.32 } });
      playHurt();
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
        className="absolute left-1/2 -translate-x-1/2 top-1 pointer-events-none font-bold text-center leading-none"
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
      style={{ background: 'radial-gradient(95% 55% at 50% 4%, rgba(242,193,78,0.14), transparent 58%), linear-gradient(180deg, #5C3A34 0%, #3A2438 55%, #1E1426 100%)' }}
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
        <h2 className="text-sm font-semibold text-[#F2C14E] tracking-[0.2em] uppercase">Combat</h2>
      </div>

      {/* Enemy Card */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-xl p-4 border border-[#8A424C] relative"
        style={{ background: 'linear-gradient(135deg, #4C2A32, #331E2A)', boxShadow: '0 0 24px rgba(200,70,70,0.12)' }}
      >
        {renderFloats('enemy')}
        <div className="flex items-center gap-3 mb-3">
          <motion.div animate={enemyLungeCtrl} className="shrink-0">
            <motion.div
              animate={enemyCtrl}
              className="w-16 h-16 rounded-2xl flex items-center justify-center border border-[#8A424C]"
              style={{ background: 'radial-gradient(circle at 50% 40%, rgba(230,90,90,0.28), rgba(40,16,24,0.5) 72%)' }}
            >
              <motion.span
                className="text-4xl"
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              >
                {currentCombat.enemyEmoji}
              </motion.span>
            </motion.div>
          </motion.div>
          <div className="flex-1">
            <h3 className="text-lg text-[#F8E6D2] font-bold">{currentCombat.enemyName}</h3>
            <p className="text-xs text-[#D6A896] italic">{currentCombat.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-[#F27575] font-mono w-6">PV</span>
          <div className="flex-1 h-3 bg-[#2A1622] rounded-full overflow-hidden relative">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: 'rgba(255,240,220,0.5)' }}
              animate={{ width: `${hpPercent}%` }}
              transition={{ duration: 0.75, delay: 0.18 }}
            />
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: hpPercent > 50 ? 'linear-gradient(90deg, #D94F4F, #E86B5A)'
                  : hpPercent > 25 ? 'linear-gradient(90deg, #D4874D, #E8A060)'
                  : 'linear-gradient(90deg, #8B2020, #D94F4F)',
              }}
              animate={{ width: `${hpPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-[10px] font-semibold text-[#F27575] font-mono w-14 text-right">
            {currentCombat.enemyHealth}/{currentCombat.enemyMaxHealth}
          </span>
        </div>
      </motion.div>

      {/* VS */}
      <div className="text-center">
        <span className="text-sm font-bold text-[#B98CA0] tracking-widest">VS</span>
      </div>

      {/* Player Card */}
      <motion.div animate={playerCtrl}>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`rounded-xl p-4 border relative ${playerInDanger ? 'border-[#C24A4A]' : 'border-[#43764F]'}`}
          style={{ background: 'linear-gradient(135deg, #23392E, #172A26)', boxShadow: '0 0 24px rgba(74,155,95,0.10)' }}
        >
          {renderFloats('player')}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#43764F]">
              <CardboardAvatar seed={character.seed} gender={character.gender} size={48} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg text-[#C4E0B8] font-bold">{character.name}</h3>
              <p className="text-xs text-[#93B89E]">
                {character.job.name}{weapon && ` · ${weapon.emoji} ${weapon.name}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-[#5FBE76] font-mono w-6">PV</span>
            <div className="flex-1 h-3 bg-[#142622] rounded-full overflow-hidden relative">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: 'rgba(255,180,160,0.5)' }}
                animate={{ width: `${playerHpPercent}%` }}
                transition={{ duration: 0.75, delay: 0.18 }}
              />
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: playerHpPercent > 50 ? 'linear-gradient(90deg, #4A9B5F, #5CB870)'
                    : playerHpPercent > 25 ? 'linear-gradient(90deg, #D4874D, #E8A060)'
                    : 'linear-gradient(90deg, #8B2020, #D94F4F)',
                }}
                animate={{
                  width: `${playerHpPercent}%`,
                  opacity: playerInDanger ? [0.6, 1, 0.6] : 1,
                }}
                transition={playerInDanger ? { opacity: { repeat: Infinity, duration: 0.8 } } : { duration: 0.3 }}
              />
            </div>
            <span className="text-[10px] font-semibold text-[#5FBE76] font-mono w-14 text-right">
              {character.stats.health}/100
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Combat Log */}
      <div className="rounded-xl p-3 flex-1 min-h-0 overflow-y-auto border border-[#412B41]" style={{ background: 'rgba(38,24,42,0.55)' }}>
        <p className="text-[9px] uppercase tracking-widest text-[#9A7788] mb-1.5">Journal du combat</p>
        <AnimatePresence>
          {combatLog.slice(-6).map((log, i) => (
            <motion.p
              key={`${combatLog.length - 6 + i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-xs mb-1 ${
                i === Math.min(combatLog.length, 6) - 1 ? 'text-[#F6E3D2] font-medium' : 'text-[#A98A98]'
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
              <div className="rounded-xl p-2.5 border border-[#5C3A54] flex flex-col gap-1.5" style={{ background: '#2C1A2A' }}>
                <p className="text-[11px] text-[#F2C14E] text-center">
                  🔎 {weakDiscovered
                    ? 'Point faible connu — la cible 🎯 marque la zone.'
                    : currentCombat.weakPointHint}
                </p>
                <p className="text-[10px] text-[#D6A896] text-center border-t border-[#4E3448] pt-1.5">
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
                      className={`py-3 rounded-xl text-xs font-semibold text-[#F6E3D2] flex flex-col items-center gap-1 border ${
                        showMark ? 'border-[#F2C14E]' : 'border-[#4E2E44]'
                      }`}
                      style={{ background: showMark ? 'linear-gradient(135deg, #46283C, #34202E)' : 'linear-gradient(135deg, #34202E, #281A26)' }}
                    >
                      <span className="text-xl">{showMark ? '🎯' : zone.emoji}</span>
                      <span>{zone.label}</span>
                    </motion.button>
                  );
                })}
              </div>
              <button
                onClick={() => setAiming(false)}
                className="w-full py-2 rounded-xl text-xs font-medium text-[#B98CA0]"
                style={{ background: '#2C1A2A', border: '1px solid #4E3448' }}
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
                  style={{ background: 'linear-gradient(135deg, #3E2A3E, #2A1A2A)', border: '1px solid #5C4A5C' }}
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
