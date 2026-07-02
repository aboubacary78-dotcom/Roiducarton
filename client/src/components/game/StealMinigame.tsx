import { useGame, STEAL_TARGETS, randomFromArray } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { playHit, playCrit, playHurt } from '@/lib/sound';

type Tier = 'fail' | 'ok' | 'jackpot';

export default function StealMinigame() {
  const { state, dispatch } = useGame();
  const char = state.character;
  const agile = !!char?.traits.some(t => t.id === 'agile');
  // La cible du vol, tirée une fois à l'ouverture.
  const [target] = useState(() => randomFromArray(STEAL_TARGETS));

  // La zone change de place à chaque tentative (impossible de mémoriser le
  // centre), et le curseur a une vitesse légèrement variable.
  const [zoneCenter] = useState(() => 25 + Math.random() * 50);
  const [speed] = useState(() => 2.0 + Math.random() * 0.5);
  const greenHalf = 10 + (agile ? 5 : 0);
  const jackHalf = 3.5;
  const greenStart = zoneCenter - greenHalf, greenEnd = zoneCenter + greenHalf;
  const jackStart = zoneCenter - jackHalf, jackEnd = zoneCenter + jackHalf;

  const [tier, setTier] = useState<Tier | null>(null);
  const posRef = useRef(2);
  const dirRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const stoppedRef = useRef(false);
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Curseur piloté par ref (pas de re-rendu par frame) et normalisé au
    // temps réel : même vitesse à 60, 90 ou 120 Hz.
    let last = performance.now();
    const loop = (now: number) => {
      if (stoppedRef.current) return;
      const dt = Math.min(50, now - last);
      last = now;
      let p = posRef.current + dirRef.current * speed * (dt / 16.667);
      if (p >= 98) { p = 98; dirRef.current = -1; }
      if (p <= 2) { p = 2; dirRef.current = 1; }
      posRef.current = p;
      if (cursorRef.current) cursorRef.current.style.left = `calc(${p}% - 2px)`;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setTimeout(() => dispatch({ type: 'RESOLVE_STEAL', tier: t, targetId: target.id }), 1150);
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
        <div className="text-5xl mb-2">{target.emoji}</div>
        <h1 className="text-2xl text-[#2A1F1A]">Vol à l'arraché</h1>
        <p className="text-sm text-[#6B5740] mt-2 max-w-xs mx-auto">
          Vous tentez de voler <strong>{target.label}</strong>…
        </p>
        <p className="text-xs text-[#8B6B4A] mt-1">Arrêtez le curseur dans la zone. Visez le cœur doré.</p>
        <p className="text-[11px] text-[#D94F4F] mt-2">
          {target.catcher === 'commercant'
            ? '⚠️ Si le commerçant vous attrape, ça peut finir en bagarre.'
            : '⚠️ La police rôde : pris sur le fait, c\'est la garde à vue.'}
        </p>
      </div>

      {/* Barre de visée */}
      <div className="w-full max-w-sm craft-card p-3">
        <div className="relative h-10 rounded-lg overflow-hidden" style={{ background: '#F0E6DC' }}>
          {/* zone verte */}
          <div className="absolute inset-y-0" style={{ left: `${greenStart}%`, width: `${greenEnd - greenStart}%`, background: 'rgba(74,155,95,0.3)' }} />
          {/* zone or */}
          <div className="absolute inset-y-0" style={{ left: `${jackStart}%`, width: `${jackEnd - jackStart}%`, background: 'rgba(184,134,11,0.45)' }} />
          {/* curseur (position pilotée par ref dans la boucle rAF) */}
          <div
            ref={cursorRef}
            className="absolute top-0 bottom-0 w-1 rounded-full"
            style={{ background: tier ? tierColor : '#2A1F1A', boxShadow: '0 1px 4px rgba(42,31,26,0.35)' }}
          />
        </div>
        {agile && <p className="text-[11px] text-[#3d8b4f] text-center mt-2">🏃 Agile : zone de réussite élargie.</p>}
      </div>

      {/* Résultat / action */}
      {tier ? (
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xl font-bold"
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
