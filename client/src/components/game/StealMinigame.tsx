import { useGame } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { playHit, playCrit, playHurt } from '@/lib/sound';

type Tier = 'fail' | 'ok' | 'jackpot';

export default function StealMinigame() {
  const { state, dispatch } = useGame();
  const char = state.character;
  const agile = !!char?.traits.some(t => t.id === 'agile');

  // Zones (en %) centrées : jackpot au milieu de la zone de réussite.
  const greenHalf = 17 + (agile ? 7 : 0);
  const jackHalf = 5;
  const greenStart = 50 - greenHalf, greenEnd = 50 + greenHalf;
  const jackStart = 50 - jackHalf, jackEnd = 50 + jackHalf;

  const [pos, setPos] = useState(2);
  const [tier, setTier] = useState<Tier | null>(null);
  const posRef = useRef(2);
  const dirRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    const speed = 1.45;
    const loop = () => {
      if (stoppedRef.current) return;
      let p = posRef.current + dirRef.current * speed;
      if (p >= 98) { p = 98; dirRef.current = -1; }
      if (p <= 2) { p = 2; dirRef.current = 1; }
      posRef.current = p;
      setPos(p);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  function stop() {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const p = posRef.current;
    let t: Tier;
    if (p >= jackStart && p <= jackEnd) { t = 'jackpot'; playCrit(); }
    else if (p >= greenStart && p <= greenEnd) { t = 'ok'; playHit(); }
    else { t = 'fail'; playHurt(); }
    setTier(t);
    setTimeout(() => dispatch({ type: 'RESOLVE_STEAL', tier: t }), 1150);
  }

  if (!char) return null;

  const tierLabel = tier === 'jackpot' ? '💎 COUP DE MAÎTRE !' : tier === 'ok' ? '🤫 Réussi !' : tier === 'fail' ? '🚨 Raté !' : '';
  const tierColor = tier === 'jackpot' ? '#B8860B' : tier === 'ok' ? '#3d8b4f' : '#D94F4F';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-texture p-5 flex flex-col items-center justify-center gap-5"
    >
      <div className="text-center">
        <div className="text-5xl mb-2">🥷</div>
        <h1 className="text-2xl text-[#2A1F1A]">Vol à l'arraché</h1>
        <p className="text-sm text-[#8B6B4A] mt-1">Arrête le curseur dans la zone. Vise le cœur doré.</p>
      </div>

      {/* Barre de visée */}
      <div className="w-full max-w-sm craft-card p-3">
        <div className="relative h-10 rounded-lg overflow-hidden" style={{ background: '#F0E6DC' }}>
          {/* zone verte */}
          <div className="absolute inset-y-0" style={{ left: `${greenStart}%`, width: `${greenEnd - greenStart}%`, background: 'rgba(74,155,95,0.3)' }} />
          {/* zone or */}
          <div className="absolute inset-y-0" style={{ left: `${jackStart}%`, width: `${jackEnd - jackStart}%`, background: 'rgba(184,134,11,0.45)' }} />
          {/* curseur */}
          <motion.div
            className="absolute top-0 bottom-0 w-1 rounded-full"
            style={{ left: `calc(${pos}% - 2px)`, background: tier ? tierColor : '#2A1F1A', boxShadow: '0 1px 4px rgba(42,31,26,0.35)' }}
          />
        </div>
        {agile && <p className="text-[11px] text-[#3d8b4f] text-center mt-2">🏃 Agile : zone de réussite élargie.</p>}
      </div>

      {/* Résultat / action */}
      {tier ? (
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xl font-extrabold"
          style={{ color: tierColor }}
        >
          {tierLabel}
        </motion.div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={stop}
          className="btn-primary w-full max-w-sm py-4 text-lg"
        >
          STOP ✋
        </motion.button>
      )}
    </motion.div>
  );
}
