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
  const tierColor = tier === 'jackpot' ? '#F2C14E' : tier === 'ok' ? '#5FBE76' : '#F27575';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-5 flex flex-col items-center justify-center gap-6"
      style={{ background: 'radial-gradient(95% 50% at 50% 6%, rgba(120,140,220,0.14), transparent 60%), linear-gradient(180deg, #232338 0%, #14141F 100%)' }}
    >
      <div className="text-center">
        <div className="text-5xl mb-2">🥷</div>
        <h1 className="text-2xl text-[#E6E1F2]">Vol à l'arraché</h1>
        <p className="text-sm text-[#9A98C0] mt-1">Arrête le curseur dans la zone. Vise le cœur doré.</p>
      </div>

      {/* Barre de visée */}
      <div className="w-full max-w-sm">
        <div className="relative h-11 rounded-xl overflow-hidden border border-[#3A3A55]" style={{ background: '#1B1B2A' }}>
          {/* zone verte */}
          <div className="absolute inset-y-0" style={{ left: `${greenStart}%`, width: `${greenEnd - greenStart}%`, background: 'rgba(74,155,95,0.35)' }} />
          {/* zone or */}
          <div className="absolute inset-y-0" style={{ left: `${jackStart}%`, width: `${jackEnd - jackStart}%`, background: 'rgba(242,193,78,0.55)' }} />
          {/* curseur */}
          <motion.div
            className="absolute top-0 bottom-0 w-1 rounded-full"
            style={{ left: `calc(${pos}% - 2px)`, background: tier ? tierColor : '#F5F0FF', boxShadow: '0 0 8px rgba(255,255,255,0.6)' }}
          />
        </div>
        {agile && <p className="text-[11px] text-[#7FB58F] text-center mt-2">🏃 Agile : zone de réussite élargie.</p>}
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
          className="w-full max-w-sm py-5 rounded-2xl text-lg font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #C99A3A, #9B5B3A)', boxShadow: '0 6px 20px rgba(155,91,58,0.4)' }}
        >
          STOP ✋
        </motion.button>
      )}
    </motion.div>
  );
}
