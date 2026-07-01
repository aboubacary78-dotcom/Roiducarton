import { useGame } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { playHit, playCrit, playHurt } from '@/lib/sound';

/*
 * Mini-jeu de mendicité : pendant quelques secondes, des pièces (et parfois
 * des billets) apparaissent — tape dessus pour les ramasser. Si tu touches
 * le policier, il te déloge et la manche s'arrête net.
 * Le trait Charismatique fait apparaître plus de dons.
 */

const ROUND_MS = 8000;
const ITEM_TTL = 1300;

interface Item { id: number; x: number; y: number; kind: 'coin' | 'bill' | 'cop'; }

export default function BegMinigame() {
  const { state, dispatch } = useGame();
  const char = state.character;
  const charisma = !!char?.traits.some(t => t.id === 'charismatique');

  const [items, setItems] = useState<Item[]>([]);
  const [coins, setCoins] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_MS);
  const [ended, setEnded] = useState<null | 'time' | 'cop'>(null);

  const idRef = useRef(0);
  const coinsRef = useRef(0);
  const endedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setInterval>[]>([]);

  function finish(reason: 'time' | 'cop') {
    if (endedRef.current) return;
    endedRef.current = true;
    timersRef.current.forEach(clearInterval);
    setEnded(reason);
    if (reason === 'cop') playHurt();
    setTimeout(() => dispatch({ type: 'RESOLVE_BEG', coins: coinsRef.current, copTapped: reason === 'cop' }), 1200);
  }

  useEffect(() => {
    const spawnEvery = charisma ? 520 : 650;
    const spawner = setInterval(() => {
      if (endedRef.current) return;
      const roll = Math.random();
      const kind: Item['kind'] = roll < 0.14 ? 'cop' : roll < 0.30 ? 'bill' : 'coin';
      const item: Item = { id: ++idRef.current, x: 8 + Math.random() * 76, y: 8 + Math.random() * 76, kind };
      setItems(prev => [...prev, item]);
      setTimeout(() => setItems(prev => prev.filter(i => i.id !== item.id)), ITEM_TTL);
    }, spawnEvery);
    const ticker = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 100;
        if (next <= 0) finish('time');
        return Math.max(0, next);
      });
    }, 100);
    timersRef.current = [spawner, ticker];
    return () => timersRef.current.forEach(clearInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tap(item: Item) {
    if (endedRef.current) return;
    setItems(prev => prev.filter(i => i.id !== item.id));
    if (item.kind === 'cop') { finish('cop'); return; }
    const gain = item.kind === 'bill' ? 2 : 1;
    coinsRef.current += gain;
    setCoins(coinsRef.current);
    if (item.kind === 'bill') playCrit(); else playHit();
  }

  if (!char) return null;

  const pct = (timeLeft / ROUND_MS) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-5 flex flex-col gap-4"
      style={{ background: 'radial-gradient(95% 50% at 50% 6%, rgba(242,193,78,0.16), transparent 60%), linear-gradient(180deg, #3A3226 0%, #201B14 100%)' }}
    >
      <div className="text-center">
        <div className="text-4xl mb-1">🎩</div>
        <h1 className="text-2xl text-[#F2E8D8]">La manche</h1>
        <p className="text-sm text-[#B8A98E] mt-1">Ramasse les pièces 🪙 et billets 💶. Ne touche pas le policier 👮 !</p>
        {charisma && <p className="text-[11px] text-[#D9B96A] mt-1">✨ Charismatique : les passants donnent plus souvent.</p>}
      </div>

      {/* Timer + compteur */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: '#171310' }}>
          <div className="h-full rounded-full transition-[width] duration-100" style={{ width: `${pct}%`, background: pct > 30 ? 'linear-gradient(90deg,#D9B96A,#C99A3A)' : '#D94F4F' }} />
        </div>
        <span className="text-sm font-bold font-mono text-[#F2C14E] w-14 text-right">🪙 {coins}</span>
      </div>

      {/* Aire de jeu */}
      <div className="relative flex-1 rounded-2xl border border-[#4A3F2E] overflow-hidden" style={{ background: 'rgba(20,16,12,0.5)' }}>
        <AnimatePresence>
          {items.map(item => (
            <motion.button
              key={item.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 16, stiffness: 400 }}
              onClick={() => tap(item)}
              className="absolute text-3xl leading-none select-none"
              style={{ left: `${item.x}%`, top: `${item.y}%`, filter: item.kind === 'bill' ? 'drop-shadow(0 0 6px rgba(242,193,78,0.8))' : undefined }}
              aria-label={item.kind}
            >
              {item.kind === 'coin' ? '🪙' : item.kind === 'bill' ? '💶' : '👮'}
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Fin de manche */}
        {ended && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: 'rgba(20,14,10,0.72)' }}
          >
            <span className="text-4xl">{ended === 'cop' ? '👮' : '🎩'}</span>
            <span className="text-xl font-extrabold" style={{ color: ended === 'cop' ? '#F27575' : '#F2C14E' }}>
              {ended === 'cop' ? 'Circulez !' : `${coins} pièce${coins > 1 ? 's' : ''} !`}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
