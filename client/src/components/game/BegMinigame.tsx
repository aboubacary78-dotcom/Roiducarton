import { useGame, BEG_SPOTS, randomFromArray } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { playHit, playCrit, playHurt } from '@/lib/sound';
import { useLang, tr } from '@/lib/lang';
import MinigameIntro, { introSeen } from './MinigameIntro';

/*
 * Mini-jeu de mendicité : pendant quelques secondes, des pièces (et parfois
 * des billets) apparaissent — tape dessus pour les ramasser. Si tu touches
 * le policier, il te déloge et la manche s'arrête net.
 * Le trait Charismatique fait apparaître plus de dons.
 */

const ROUND_MS = 8000;
const ITEM_TTL = 900;

interface Item { id: number; x: number; y: number; kind: 'coin' | 'bill' | 'cop'; }

export default function BegMinigame() {
  const [ready, setReady] = useState(() => introSeen('beg'));
  if (!ready) {
    return (
      <MinigameIntro
        id="beg"
        emoji="🎩"
        title="La manche"
        titleEn="Begging"
        lines={[
          { emoji: '🪙', fr: 'Des pièces et des billets 💶 apparaissent : tapez dessus vite avant qu\'ils ne disparaissent.', en: 'Coins and notes 💶 pop up: tap them fast before they vanish.' },
          { emoji: '👮', fr: 'Ne touchez JAMAIS le policier, sinon il vous déloge et la manche s\'arrête net.', en: 'NEVER tap the cop, or he moves you along and begging ends at once.' },
          { emoji: '👔', fr: 'Une allure soignée (dignité haute) fait donner les passants plus généreusement.', en: 'A tidy look (high dignity) makes passers-by give more generously.' },
        ]}
        onStart={() => setReady(true)}
      />
    );
  }
  return <BegMinigameInner />;
}

function BegMinigameInner() {
  const { state, dispatch } = useGame();
  useLang();
  const char = state.character;
  const charisma = !!char?.traits.some(t => t.id === 'charismatique');

  const [spot] = useState(() => randomFromArray(BEG_SPOTS));
  const [items, setItems] = useState<Item[]>([]);
  const [coins, setCoins] = useState(0);
  const [ended, setEnded] = useState<null | 'time' | 'cop'>(null);

  const idRef = useRef(0);
  const coinsRef = useRef(0);
  const endedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setInterval>[]>([]);
  // Timeouts de disparition des pièces : suivis pour être annulés en fin
  // de manche (sinon ils continuent de modifier l'état après la fin).
  const itemTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const timeBarRef = useRef<HTMLDivElement | null>(null);

  function clearAllTimers() {
    timersRef.current.forEach(clearInterval);
    itemTimeoutsRef.current.forEach(clearTimeout);
    itemTimeoutsRef.current.clear();
  }

  function finish(reason: 'time' | 'cop') {
    if (endedRef.current) return;
    endedRef.current = true;
    clearAllTimers();
    setEnded(reason);
    if (reason === 'cop') playHurt();
    setTimeout(() => dispatch({ type: 'RESOLVE_BEG', coins: coinsRef.current, copTapped: reason === 'cop' }), 1200);
  }

  useEffect(() => {
    const spawnEvery = charisma ? 480 : 600;
    const end = performance.now() + ROUND_MS;
    const spawner = setInterval(() => {
      if (endedRef.current) return;
      const roll = Math.random();
      // Plus de policiers qu'avant : il faut viser, pas mitrailler.
      const kind: Item['kind'] = roll < 0.22 ? 'cop' : roll < 0.34 ? 'bill' : 'coin';
      const item: Item = { id: ++idRef.current, x: 8 + Math.random() * 76, y: 8 + Math.random() * 76, kind };
      setItems(prev => [...prev, item]);
      const to = setTimeout(() => {
        itemTimeoutsRef.current.delete(to);
        setItems(prev => prev.filter(i => i.id !== item.id));
      }, ITEM_TTL);
      itemTimeoutsRef.current.add(to);
    }, spawnEvery);
    // Barre de temps pilotée par ref : pas de re-rendu toutes les 100 ms.
    const ticker = setInterval(() => {
      const left = Math.max(0, end - performance.now());
      if (timeBarRef.current) {
        const pct = (left / ROUND_MS) * 100;
        timeBarRef.current.style.width = `${pct}%`;
        timeBarRef.current.style.background = pct > 30 ? 'linear-gradient(90deg, #C4723A, #9B5B3A)' : '#D94F4F';
      }
      if (left <= 0) finish('time');
    }, 100);
    timersRef.current = [spawner, ticker];
    return () => clearAllTimers();
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-texture p-5 flex flex-col gap-4"
    >
      <div className="text-center">
        <div className="text-4xl mb-1">🎩</div>
        <h1 className="text-2xl text-[#2A1F1A]">{tr('La manche', 'Begging')}</h1>
        <p className="text-sm text-[#6B5740] mt-1.5">{tr('Vous tendez votre chapeau', 'You hold out your hat')} <strong>{spot}</strong>.</p>
        <p className="text-xs text-[#8B6B4A] mt-1">{tr('Ramassez les pièces 🪙 et billets 💶. Ne touchez pas le policier 👮, sinon c\'est l\'amende !', 'Grab coins 🪙 and notes 💶. Don\'t touch the cop 👮, or you\'ll be fined!')}</p>
        {charisma && <p className="text-[11px] text-[#B8860B] mt-1">{tr('✨ Charismatique : les passants donnent plus souvent.', '✨ Charismatic: passers-by give more often.')}</p>}
        {char.stats.dignity >= 70 && <p className="text-[11px] text-[#3d8b4f] mt-1">{tr('👔 Allure soignée : les passants donnent davantage.', '👔 Well-groomed: passers-by give more.')}</p>}
        {char.stats.dignity < 25 && <p className="text-[11px] text-[#D94F4F] mt-1">{tr('🫥 Allure négligée : les passants se méfient (gains réduits).', '🫥 Unkempt: passers-by are wary (reduced gains).')}</p>}
      </div>

      {/* Timer + compteur */}
      <div className="flex items-center gap-3">
        <div className="flex-1 stat-bar-track" style={{ height: '10px' }}>
          <div ref={timeBarRef} className="h-full rounded-full transition-[width] duration-100" style={{ width: '100%', background: 'linear-gradient(90deg, #C4723A, #9B5B3A)' }} />
        </div>
        <span className="text-sm font-bold font-mono text-[#B8860B] w-14 text-right">🪙 {coins}</span>
      </div>

      {/* Aire de jeu */}
      <div className="craft-card relative flex-1 overflow-hidden">
        <AnimatePresence>
          {items.map(item => (
            <motion.button
              key={item.id}
              initial={{ scale: 0, opacity: 0, y: 0 }}
              animate={{ scale: 1, opacity: 1, y: 30 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                scale: { type: 'spring', damping: 16, stiffness: 400 },
                opacity: { duration: 0.15 },
                y: { duration: ITEM_TTL / 1000, ease: 'linear' },
              }}
              onClick={() => tap(item)}
              className="absolute text-3xl leading-none select-none"
              style={{ left: `${item.x}%`, top: `${item.y}%`, filter: item.kind === 'bill' ? 'drop-shadow(0 0 6px rgba(184,134,11,0.55))' : undefined }}
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
            style={{ background: 'rgba(251,246,240,0.88)' }}
          >
            <span className="text-4xl">{ended === 'cop' ? '👮' : '🎩'}</span>
            <span className="text-xl font-bold" style={{ color: ended === 'cop' ? '#D94F4F' : '#B8860B' }}>
              {ended === 'cop' ? tr('Circulez !', 'Move along!') : `${coins} ${tr(coins > 1 ? 'pièces' : 'pièce', coins > 1 ? 'coins' : 'coin')} !`}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
