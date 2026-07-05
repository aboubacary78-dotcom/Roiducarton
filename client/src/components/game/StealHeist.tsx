import { useGame, STEAL_TARGETS, randomFromArray } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { playHit, playCrit, playHurt, playClick } from '@/lib/sound';

/*
 * Mini-jeu de vol « casse en grille » (façon Pac-Man) : on entre dans un lieu,
 * on récupère l'objet convoité, puis on file vers la sortie 🚪 en évitant les
 * gardiens qui patrouillent (police ou commerçant selon la cible). Se faire
 * toucher = pris → on retombe sur les conséquences existantes (RESOLVE_STEAL) :
 * bagarre avec le commerçant, garde à vue avec la police, ou raclée.
 * Sortir sans jamais s'être fait repérer = coup de maître (jackpot).
 */

const GRID_W = 7;
const GRID_H = 9;

type Cell = { x: number; y: number };
type Status = 'playing' | 'caught' | 'escaped';

const k = (x: number, y: number) => `${x},${y}`;
const manhattan = (a: Cell, b: Cell) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const cheby = (a: Cell, b: Cell) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

// Un chemin existe-t-il entre deux cases en contournant les obstacles ? (BFS)
function reachable(start: Cell, goal: Cell, blocked: Set<string>): boolean {
  const q: Cell[] = [start];
  const seen = new Set([k(start.x, start.y)]);
  while (q.length) {
    const c = q.shift()!;
    if (c.x === goal.x && c.y === goal.y) return true;
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nx = c.x + dx, ny = c.y + dy;
      if (nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H) continue;
      const nk = k(nx, ny);
      if (seen.has(nk) || blocked.has(nk)) continue;
      seen.add(nk);
      q.push({ x: nx, y: ny });
    }
  }
  return false;
}

interface Layout {
  player: Cell;
  exit: Cell;
  loot: Cell;
  blocked: Set<string>;
  guards: Cell[];
}

function makeLayout(guardCount: number): Layout {
  const exit: Cell = { x: 3, y: GRID_H - 1 };
  const player: Cell = { x: 3, y: GRID_H - 1 };
  const loot: Cell = { x: 1 + Math.floor(Math.random() * (GRID_W - 2)), y: Math.floor(Math.random() * 3) };

  for (let attempt = 0; attempt < 40; attempt++) {
    const blocked = new Set<string>();
    while (blocked.size < 7) {
      const x = Math.floor(Math.random() * GRID_W);
      const y = 1 + Math.floor(Math.random() * (GRID_H - 2));
      const kk = k(x, y);
      if (kk === k(exit.x, exit.y) || kk === k(loot.x, loot.y) || kk === k(player.x, player.y)) continue;
      blocked.add(kk);
    }
    if (!reachable(player, loot, blocked) || !reachable(loot, exit, blocked)) continue;

    const guards: Cell[] = [];
    let tries = 0;
    while (guards.length < guardCount && tries < 200) {
      tries++;
      const x = Math.floor(Math.random() * GRID_W);
      const y = Math.floor(Math.random() * (GRID_H - 3)); // moitié haute
      const kk = k(x, y);
      if (blocked.has(kk) || kk === k(loot.x, loot.y)) continue;
      if (cheby({ x, y }, player) < 3) continue;
      if (guards.some((g) => g.x === x && g.y === y)) continue;
      guards.push({ x, y });
    }
    if (guards.length < guardCount) continue;
    return { player, exit, loot, blocked, guards };
  }
  // Repli sans obstacles (toujours résoluble)
  return {
    player, exit, loot, blocked: new Set<string>(),
    guards: Array.from({ length: guardCount }, (_, i) => ({ x: i * 2, y: 0 })),
  };
}

export default function StealHeist() {
  const { state, dispatch } = useGame();
  const char = state.character;
  const [target] = useState(() => randomFromArray(STEAL_TARGETS));
  const day = char?.day ?? 1;
  const guardEmoji = target.catcher === 'police' ? '👮' : '🧑‍🍳';

  // Difficulté croissante avec les jours.
  const guardCount = Math.min(1 + Math.floor(day / 4), 3);
  const tickMs = Math.max(620 - day * 18, 380);
  const chaseProb = Math.min(0.45 + day * 0.02, 0.75);

  const [layout] = useState(() => makeLayout(guardCount));
  const [player, setPlayer] = useState<Cell>(layout.player);
  const [guards, setGuards] = useState<Cell[]>(layout.guards);
  const [hasLoot, setHasLoot] = useState(false);
  const [status, setStatus] = useState<Status>('playing');
  const [spotted, setSpotted] = useState(false);

  const playerRef = useRef(player);
  const guardsRef = useRef(guards);
  const hasLootRef = useRef(false);
  const statusRef = useRef<Status>('playing');
  const spottedRef = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const finish = useCallback((tier: 'fail' | 'ok' | 'jackpot') => {
    if (statusRef.current !== 'playing') return;
    statusRef.current = tier === 'fail' ? 'caught' : 'escaped';
    setStatus(statusRef.current);
    if (tier === 'fail') playHurt();
    else if (tier === 'jackpot') playCrit();
    else playHit();
    setTimeout(() => dispatch({ type: 'RESOLVE_STEAL', tier, targetId: target.id }), 1200);
  }, [dispatch, target.id]);

  const markSpotted = () => {
    if (!spottedRef.current) { spottedRef.current = true; setSpotted(true); }
  };

  const move = useCallback((dx: number, dy: number) => {
    if (statusRef.current !== 'playing') return;
    const p = playerRef.current;
    const nx = p.x + dx, ny = p.y + dy;
    if (nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H) return;
    if (layout.blocked.has(k(nx, ny))) return;
    const np = { x: nx, y: ny };
    playerRef.current = np;
    setPlayer(np);
    playClick();

    let got = hasLootRef.current;
    if (!got && nx === layout.loot.x && ny === layout.loot.y) {
      got = true; hasLootRef.current = true; setHasLoot(true); playHit();
    }
    if (guardsRef.current.some((g) => g.x === nx && g.y === ny)) { finish('fail'); return; }
    if (guardsRef.current.some((g) => cheby(g, np) <= 1)) markSpotted();
    if (got && nx === layout.exit.x && ny === layout.exit.y) {
      finish(spottedRef.current ? 'ok' : 'jackpot');
    }
  }, [layout, finish]);

  // Ronde des gardiens (temps réel).
  useEffect(() => {
    const id = setInterval(() => {
      if (statusRef.current !== 'playing') return;
      const p = playerRef.current;
      const prev = guardsRef.current;
      const next = prev.map((g) => {
        const cands = ([[0, 1], [0, -1], [1, 0], [-1, 0]] as const)
          .map(([dx, dy]) => ({ x: g.x + dx, y: g.y + dy }))
          .filter((c) => c.x >= 0 && c.y >= 0 && c.x < GRID_W && c.y < GRID_H && !layout.blocked.has(k(c.x, c.y)));
        if (cands.length === 0) return g;
        if (Math.random() < chaseProb) {
          return cands.reduce((best, c) => (manhattan(c, p) < manhattan(best, p) ? c : best), cands[0]);
        }
        return cands[Math.floor(Math.random() * cands.length)];
      });
      guardsRef.current = next;
      setGuards(next);
      if (next.some((g) => g.x === p.x && g.y === p.y)) finish('fail');
      else if (next.some((g) => cheby(g, p) <= 1)) markSpotted();
    }, tickMs);
    return () => clearInterval(id);
  }, [layout, chaseProb, tickMs, finish]);

  // Flèches du clavier (confort sur ordinateur).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, [number, number]> = {
        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
      };
      const d = map[e.key];
      if (d) { e.preventDefault(); move(d[0], d[1]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchStart.current;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    touchStart.current = null;
    if (Math.abs(dx) < 14 && Math.abs(dy) < 14) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1, 0);
    else move(0, dy > 0 ? 1 : -1);
  };

  if (!char) return null;

  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) cells.push({ x, y });

  const guardHere = (x: number, y: number) => guards.some((g) => g.x === x && g.y === y);

  const instruction = hasLoot ? `Filez vers la sortie 🚪 !` : `Récupérez ${target.emoji}`;

  return (
    <div className="min-h-screen bg-texture p-4 flex flex-col items-center gap-3">
      {/* En-tête */}
      <div className="text-center">
        <h1 className="text-2xl text-[#2A1F1A]">Le casse</h1>
        <p className="text-sm text-[#6B5740] mt-1 max-w-xs mx-auto">
          Vous tentez de subtiliser <strong>{target.label}</strong>.
        </p>
      </div>

      {/* Bandeau d'état */}
      <div
        className={`w-full max-w-sm rounded-xl px-3 py-2 flex items-center justify-between text-sm font-semibold transition-colors ${
          spotted ? 'bg-[#D94F4F]/12 text-[#B84A3A]' : 'bg-[#4A9B5F]/10 text-[#3d8b4f]'
        }`}
      >
        <span>{instruction}</span>
        <span className="text-xs">{spotted ? '⚠️ Repéré !' : '🤫 Discret'}</span>
      </div>

      {/* Grille */}
      <div
        className="w-full max-w-sm craft-card p-2 relative"
        style={{ touchAction: 'none' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_W}, 1fr)` }}>
          {cells.map(({ x, y }) => {
            const isPlayer = player.x === x && player.y === y;
            const isGuard = guardHere(x, y);
            const isLoot = !hasLoot && layout.loot.x === x && layout.loot.y === y;
            const isExit = layout.exit.x === x && layout.exit.y === y;
            const isWall = layout.blocked.has(k(x, y));
            let bg = '#F0E2CE';
            if (isWall) bg = '#DCC4A6';
            else if (isExit) bg = hasLoot ? '#CDE8C6' : '#E4EAD8';
            return (
              <div
                key={k(x, y)}
                className="aspect-square rounded-md flex items-center justify-center text-lg select-none"
                style={{ background: bg, boxShadow: 'inset 0 0 0 1px rgba(58,42,30,0.06)' }}
              >
                {isPlayer ? (
                  <motion.span
                    key="player"
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ repeat: Infinity, duration: 1.1 }}
                    className="drop-shadow"
                  >
                    🥷
                  </motion.span>
                ) : isGuard ? (
                  <span>{guardEmoji}</span>
                ) : isLoot ? (
                  <span>{target.emoji}</span>
                ) : isExit ? (
                  <span className={hasLoot ? '' : 'opacity-40'}>🚪</span>
                ) : isWall ? (
                  <span className="opacity-70">📦</span>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Overlay résultat */}
        <AnimatePresence>
          {status !== 'playing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(42,31,26,0.55)' }}
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center px-4"
              >
                <div className="text-4xl mb-1">{status === 'caught' ? '🚨' : spotted ? '🤫' : '💎'}</div>
                <p className="text-xl font-bold text-white">
                  {status === 'caught' ? 'Pris sur le fait !' : spotted ? 'Filé de justesse !' : 'Coup de maître !'}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Croix directionnelle */}
      <div className="grid grid-cols-3 gap-1.5 w-40 select-none" aria-label="Déplacements">
        <span />
        <button onClick={() => move(0, -1)} className="action-btn aspect-square flex items-center justify-center text-lg">▲</button>
        <span />
        <button onClick={() => move(-1, 0)} className="action-btn aspect-square flex items-center justify-center text-lg">◀</button>
        <button onClick={() => move(0, 1)} className="action-btn aspect-square flex items-center justify-center text-lg">▼</button>
        <button onClick={() => move(1, 0)} className="action-btn aspect-square flex items-center justify-center text-lg">▶</button>
      </div>

      <p className="text-[11px] text-[#8B6B4A] text-center">
        Glissez sur la grille ou utilisez les flèches. {guardEmoji} patrouille — ne le touchez pas.
      </p>
    </div>
  );
}
