import { useGame } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { showInterstitial, showRewarded } from '@/lib/ads';
import CardboardAvatar from './CardboardAvatar';

const DEATH_MESSAGES = [
  'La rue a eu raison de vous. Mais votre légende perdure.',
  'Votre aventure se termine ici. Le carton retourne au carton.',
  'Vous avez survécu plus longtemps que la plupart. Respect.',
  'Le Roi du Carton est tombé. Vive le prochain Roi !',
  'La ville vous a oublié. Comme elle oublie tout le monde.',
];

export default function GameOverScreen() {
  const { state, dispatch } = useGame();
  const char = state.character;
  const [deathMsg] = useState(() => DEATH_MESSAGES[Math.floor(Math.random() * DEATH_MESSAGES.length)]);
  const [reviving, setReviving] = useState(false);

  // Pub interstitielle à l'arrivée sur l'écran de fin (entre deux parties).
  useEffect(() => {
    showInterstitial();
  }, []);

  const canRevive = !!char && !char.activeFlags.includes('revived');

  async function handleRevive() {
    if (reviving) return;
    setReviving(true);
    const rewarded = await showRewarded();
    if (rewarded) {
      dispatch({ type: 'REVIVE' });
    } else {
      setReviving(false);
    }
  }

  if (!char) return null;

  const deathCause = char.stats.health <= 0
    ? 'Votre corps a lâché. Trop de blessures, pas assez de soins.'
    : 'Votre esprit s\'est égaré. La rue a brisé votre moral.';

  const score = char.day * 10 + char.respect * 5 + char.money * 2 + char.inventory.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-5 flex flex-col items-center justify-center gap-4"
      style={{ background: 'linear-gradient(180deg, #1C1410 0%, #0A0806 100%)' }}
    >
      {/* Death Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12, delay: 0.2 }}
        className="text-5xl"
      >
        💀
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-3xl text-[#D94F4F] text-center"
      >
        Fin de l'Aventure
      </motion.h1>

      {/* Death cause */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-sm text-[#E8A87C]/70 text-center max-w-xs"
      >
        {deathCause}
      </motion.p>

      {/* Quote */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs text-[#A08060]/50 text-center italic max-w-xs"
      >
        "{deathMsg}"
      </motion.p>

      {/* Score Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="w-full max-w-sm rounded-xl p-4 border border-[#3D2A1A]"
        style={{ background: 'linear-gradient(135deg, #2A1C12, #1E1410)' }}
      >
        <div className="w-14 h-14 rounded-xl overflow-hidden mx-auto mb-2 border border-[#3D2A1A]">
          <CardboardAvatar seed={char.seed} gender={char.gender} size={56} />
        </div>
        <h3 className="text-base font-semibold text-[#F0D9C4] text-center mb-1">
          {char.job.emoji} {char.name}
        </h3>
        <p className="text-[10px] text-[#A08060] text-center mb-3">
          {char.job.name} · {char.traits.map(t => `${t.emoji} ${t.name}`).join(' · ')}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg text-center" style={{ background: '#1A0E0A' }}>
            <p className="text-xl font-bold text-[#E8A87C]">{char.day}</p>
            <p className="text-[10px] text-[#A08060]">Jours</p>
          </div>
          <div className="p-2.5 rounded-lg text-center" style={{ background: '#1A0E0A' }}>
            <p className="text-xl font-bold text-[#7B68EE]">{char.respect}</p>
            <p className="text-[10px] text-[#A08060]">Respect</p>
          </div>
          <div className="p-2.5 rounded-lg text-center" style={{ background: '#1A0E0A' }}>
            <p className="text-xl font-bold text-[#B8860B]">{char.money}€</p>
            <p className="text-[10px] text-[#A08060]">Fortune</p>
          </div>
          <div className="p-2.5 rounded-lg text-center border border-[#D4874D]/30" style={{ background: '#1A0E0A' }}>
            <p className="text-xl font-bold text-[#D4874D]">{score}</p>
            <p className="text-[10px] text-[#A08060]">Score</p>
          </div>
        </div>
      </motion.div>

      {/* High Scores */}
      {state.highScores && state.highScores.length > 0 && (
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="w-full max-w-sm rounded-xl p-3 border border-[#3D2A1A]"
          style={{ background: 'linear-gradient(135deg, #2A1C12, #1E1410)' }}
        >
          <h4 className="text-sm font-semibold text-[#F0D9C4] text-center mb-2">
            Hall of Fame
          </h4>
          <div className="flex flex-col gap-1.5">
            {state.highScores.slice(0, 5).map((hs, i) => (
              <div key={i} className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#A08060]">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {hs.name}
                </span>
                <span className="text-[#E8A87C] font-semibold">{hs.score}pts · J{hs.days}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Seconde chance (pub récompensée) — une fois par partie */}
      {canRevive && (
        <motion.button
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={reviving}
          onClick={handleRevive}
          className="w-full max-w-sm py-3.5 text-sm font-semibold text-white rounded-xl disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #4A9B5F, #3d8b4f)',
            boxShadow: '0 4px 16px rgba(74, 155, 95, 0.3)',
          }}
        >
          {reviving ? '⏳ Chargement…' : '🎬 Seconde chance (regarder une pub)'}
        </motion.button>
      )}

      {/* Restart */}
      <motion.button
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.4 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => dispatch({ type: 'RESTART' })}
        className="w-full max-w-sm py-3.5 text-sm font-semibold text-white rounded-xl"
        style={{
          background: 'linear-gradient(135deg, #D4874D, #9B5B3A)',
          boxShadow: '0 4px 16px rgba(212, 135, 77, 0.3)',
        }}
      >
        Recommencer
      </motion.button>
    </motion.div>
  );
}
