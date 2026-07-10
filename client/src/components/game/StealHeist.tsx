import { useGame, STEAL_TARGETS, randomFromArray } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { playHit, playCrit, playHurt, playStep, playSpotted } from '@/lib/sound';
import { useLang, tr } from '@/lib/lang';
import CardboardAvatar from './CardboardAvatar';
import { getEquipped } from '@/lib/profile';
import MinigameIntro, { introSeen } from './MinigameIntro';

/*
 * Mini-jeu de vol « casse en grille » (façon Pac-Man) : on entre dans un lieu,
 * on récupère l'objet convoité, puis on file vers la sortie 🚪 en évitant les
 * gardiens qui patrouillent. Se faire toucher = pris → conséquences
 * existantes (RESOLVE_STEAL) : bagarre, garde à vue, ou raclée.
 *
 * Jauge d'alerte à paliers-cliquets (0-100, ne redescend jamais sous le
 * palier atteint) : être adjacent à un gardien ou dans sa ligne de vue fait
 * monter la jauge (ramasser le butin aussi), se planquer la fait décroître.
 *   P0 Discret  — comportement de base.
 *   P1 Méfiance — les gardiens EXISTANTS accélèrent et collent davantage.
 *   P2 Alerte   — un renfort-chasseur entre par un bord (télégraphié 🚨).
 *   P3 Bouclage — un vigile vient camper autour de la sortie.
 * Règles d'équité : un renfort n'apparaît jamais à côté du joueur, il est
 * annoncé un tick à l'avance, et l'escalade ne vient QUE du bruit du joueur —
 * rester furtif = difficulté de base pour toujours.
 * Sortir en P0 = coup de maître (jackpot) ; en P3 = « sortie à chaud »
 * (gains normaux + bonus de respect : le culot, ça se respecte).
 */

const GRID_W = 7;
const GRID_H = 9;

type Cell = { x: number; y: number };
type GuardKind = 'patrol' | 'chaser' | 'camper';
type Guard = Cell & { kind: GuardKind };
type Pending = Cell & { kind: 'chaser' | 'camper'; ticks: number };
type Status = 'playing' | 'caught' | 'escaped';
type Tier = 0 | 1 | 2 | 3;
type EndTier = 'fail' | 'ok' | 'jackpot' | 'hot';

const k = (x: number, y: number) => `${x},${y}`;
const manhattan = (a: Cell, b: Cell) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const cheby = (a: Cell, b: Cell) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

// Paliers de la jauge d'alerte (cliquets : on ne redescend jamais en dessous).
const TIER_FLOORS = [0, 40, 70, 100];
const tierOf = (a: number): Tier => (a >= 100 ? 3 : a >= 70 ? 2 : a >= 40 ? 1 : 0);

const TIER_UI = [
  { emoji: '🤫', fr: 'Discret', en: 'Unseen', chip: 'bg-[#4A9B5F]/10 text-[#3d8b4f]', bar: '#4A9B5F' },
  { emoji: '❓', fr: 'Méfiance', en: 'Wary', chip: 'bg-[#F2C14E]/20 text-[#8B6B4A]', bar: '#D9A73E' },
  { emoji: '⚠️', fr: 'Alerte', en: 'Alert', chip: 'bg-[#E8842C]/15 text-[#B8641A]', bar: '#E8842C' },
  { emoji: '🚨', fr: 'Bouclage', en: 'Lockdown', chip: 'bg-[#D94F4F]/15 text-[#B84A3A]', bar: '#D94F4F' },
] as const;

// Ligne de vue : même ligne/colonne, à 3 cases max, sans caisse entre les deux.
function inSight(g: Cell, p: Cell, blocked: Set<string>): boolean {
  if (g.x !== p.x && g.y !== p.y) return false;
  const d = manhattan(g, p);
  if (d === 0 || d > 3) return false;
  const sx = Math.sign(p.x - g.x), sy = Math.sign(p.y - g.y);
  for (let i = 1; i < d; i++) if (blocked.has(k(g.x + sx * i, g.y + sy * i))) return false;
  return true;
}

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
  const [ready, setReady] = useState(() => introSeen('steal2'));
  if (!ready) {
    return (
      <MinigameIntro
        id="steal2"
        emoji="🗝️"
        title="Le casse"
        titleEn="The Heist"
        lines={[
          { emoji: '🎯', fr: 'Récupérez l\'objet convoité, puis filez jusqu\'à la sortie 🚪 pour l\'emporter.', en: 'Grab the coveted item, then slip to the exit 🚪 to make off with it.' },
          { emoji: '👁️', fr: 'Frôler un gardien ou traverser sa ligne de vue fait monter l\'alerte. Planqué, elle retombe — mais jamais sous le palier atteint.', en: 'Brushing past a guard or crossing its line of sight raises the alert. Hidden, it drops — but never below the tier you reached.' },
          { emoji: '🚨', fr: 'Paliers : gardiens plus vifs, puis un renfort télégraphié 🚨, puis un vigile qui boucle la sortie.', en: 'Tiers: quicker guards, then a telegraphed reinforcement 🚨, then a watchman locking down the exit.' },
          { emoji: '💎', fr: 'Sortir sans alerte = coup de maître (gros gain). Sortir en plein bouclage = bonus de respect — le culot, ça se respecte.', en: 'Escape with zero alert = masterstroke (big payout). Escape mid-lockdown = respect bonus — nerve earns respect.' },
          { emoji: '🕹️', fr: 'Glissez sur la grille ou utilisez les flèches pour bouger. Toucher un gardien = pris.', en: 'Swipe on the grid or use the arrows to move. Touch a guard = caught.' },
        ]}
        onStart={() => setReady(true)}
      />
    );
  }
  return <StealHeistInner />;
}

function StealHeistInner() {
  const { state, dispatch } = useGame();
  useLang();
  const char = state.character;
  const [target] = useState(() => randomFromArray(STEAL_TARGETS));
  const day = char?.day ?? 1;
  const guardEmoji = target.catcher === 'police' ? '👮' : '🧑‍🍳';
  const chaserEmoji = target.catcher === 'police' ? '🚓' : '🧹';

  // Traits qui résonnent ici comme au combat : l'agile fait retomber la
  // pression plus vite, le flair révèle les lignes de vue, l'haleine se sent.
  const hasAgile = char?.traits.some((t) => t.id === 'agile') ?? false;
  const hasFlair = char?.traits.some((t) => t.id === 'nez-sensible' || t.id === 'paranoiaque') ?? false;
  const hasHaleine = char?.traits.some((t) => t.id === 'haleine') ?? false;

  // Difficulté d'ENTRÉE (réglage de base) : le nombre de casses déjà tentés
  // durcit la surveillance, les jours écoulés ajoutent une pression de fond.
  // L'escalade EN COURS de partie, elle, ne dépend que de la jauge d'alerte.
  const steals = char?.stealCount ?? 1;
  const heat = (steals - 1) + Math.floor(day / 5);
  const guardCount = Math.min(1 + Math.floor(heat / 2), 4);
  const tickMs = Math.max(640 - heat * 45, 300);
  const chaseProb = Math.min(0.42 + heat * 0.045, 0.85);

  const [layout] = useState(() => makeLayout(guardCount));
  const [player, setPlayer] = useState<Cell>(layout.player);
  const [guards, setGuards] = useState<Guard[]>(layout.guards.map((g) => ({ ...g, kind: 'patrol' as const })));
  const [hasLoot, setHasLoot] = useState(false);
  const [status, setStatus] = useState<Status>('playing');
  const [endTier, setEndTier] = useState<EndTier | null>(null);
  const [alert, setAlert] = useState(0);
  const [tier, setTier] = useState<Tier>(0);
  const [pending, setPending] = useState<Pending[]>([]);

  const playerRef = useRef(player);
  const guardsRef = useRef<Guard[]>(guards);
  const hasLootRef = useRef(false);
  const statusRef = useRef<Status>('playing');
  const alertRef = useRef(0);
  const tierRef = useRef<Tier>(0);
  const pendingRef = useRef<Pending[]>([]);
  const spawnedRef = useRef({ chaser: false, camper: false });
  const tickCount = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const finish = useCallback((result: EndTier) => {
    if (statusRef.current !== 'playing') return;
    statusRef.current = result === 'fail' ? 'caught' : 'escaped';
    setStatus(statusRef.current);
    setEndTier(result);
    if (result === 'fail') playHurt();
    else if (result === 'jackpot' || result === 'hot') playCrit();
    else playHit();
    setTimeout(() => dispatch({ type: 'RESOLVE_STEAL', tier: result, targetId: target.id }), 1200);
  }, [dispatch, target.id]);

  // Choisit la case d'entrée d'un renfort : jamais à côté du joueur, jamais
  // sur un mur/le butin/la sortie, et d'où le joueur reste atteignable.
  const queueSpawn = useCallback((kind: 'chaser' | 'camper') => {
    const p = playerRef.current;
    const base: Cell[] = kind === 'camper'
      ? ([[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]] as const)
        .map(([dx, dy]) => ({ x: layout.exit.x + dx, y: layout.exit.y + dy }))
      : [{ x: 3, y: 0 }, { x: 0, y: 0 }, { x: GRID_W - 1, y: 0 }, { x: 0, y: 4 }, { x: GRID_W - 1, y: 4 }];
    const ok = base.filter((cl) =>
      cl.x >= 0 && cl.y >= 0 && cl.x < GRID_W && cl.y < GRID_H &&
      !layout.blocked.has(k(cl.x, cl.y)) &&
      !(cl.x === layout.exit.x && cl.y === layout.exit.y) &&
      !(cl.x === layout.loot.x && cl.y === layout.loot.y) &&
      !guardsRef.current.some((g) => g.x === cl.x && g.y === cl.y) &&
      cheby(cl, p) >= (kind === 'camper' ? 2 : 3) &&
      reachable(cl, p, layout.blocked));
    if (ok.length === 0) return;
    const cell = ok[Math.floor(Math.random() * ok.length)];
    pendingRef.current = [...pendingRef.current, { ...cell, kind, ticks: 1 }];
    setPending(pendingRef.current);
  }, [layout]);

  // Monte la jauge, franchit les paliers (cliquets) et déclenche les renforts.
  const raiseAlert = useCallback((pts: number) => {
    if (statusRef.current !== 'playing' || pts <= 0) return;
    const after = Math.min(100, alertRef.current + pts);
    if (after === alertRef.current) return;
    alertRef.current = after;
    setAlert(after);
    const t = tierOf(after);
    if (t > tierRef.current) {
      tierRef.current = t;
      setTier(t);
      playSpotted();
      if (t >= 2 && !spawnedRef.current.chaser) { spawnedRef.current.chaser = true; queueSpawn('chaser'); }
      if (t >= 3 && !spawnedRef.current.camper) { spawnedRef.current.camper = true; queueSpawn('camper'); }
    }
  }, [queueSpawn]);

  const move = useCallback((dx: number, dy: number) => {
    if (statusRef.current !== 'playing') return;
    const p = playerRef.current;
    const nx = p.x + dx, ny = p.y + dy;
    if (nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H) return;
    if (layout.blocked.has(k(nx, ny))) return;
    const np = { x: nx, y: ny };
    playerRef.current = np;
    setPlayer(np);
    playStep();

    let got = hasLootRef.current;
    if (!got && nx === layout.loot.x && ny === layout.loot.y) {
      got = true; hasLootRef.current = true; setHasLoot(true); playHit();
      raiseAlert(20); // l'étal remarque le trou : le retour est plus chaud que l'aller
    }
    if (guardsRef.current.some((g) => g.x === nx && g.y === ny)) { finish('fail'); return; }
    // Se déplacer sous le nez d'un gardien nourrit l'alerte (taux réduit).
    let gain = 0;
    for (const g of guardsRef.current) {
      if (cheby(g, np) <= 1) gain += hasHaleine ? 11 : 8;
      else if (inSight(g, np, layout.blocked)) gain += 4;
    }
    if (gain > 0) raiseAlert(gain);
    if (got && nx === layout.exit.x && ny === layout.exit.y) {
      finish(tierRef.current === 0 ? 'jackpot' : tierRef.current >= 3 ? 'hot' : 'ok');
    }
  }, [layout, finish, raiseAlert, hasHaleine]);

  // Ronde des gardiens (temps réel). Recréée quand le palier change : dès la
  // Méfiance (P1), les gardiens accélèrent (tick −20 %) et collent davantage.
  useEffect(() => {
    const effTick = Math.max(240, Math.round(tickMs * (tier >= 1 ? 0.8 : 1)));
    const id = setInterval(() => {
      if (statusRef.current !== 'playing') return;
      tickCount.current += 1;
      const p = playerRef.current;

      // Renforts : le télégraphe 🚨 dure un tick, puis entrée en scène.
      if (pendingRef.current.length > 0) {
        const still: Pending[] = [];
        let arrived = false;
        for (const pd of pendingRef.current) {
          if (pd.ticks > 0) { still.push({ ...pd, ticks: pd.ticks - 1 }); continue; }
          arrived = true;
          if (guardsRef.current.length < 6 && !guardsRef.current.some((g) => g.x === pd.x && g.y === pd.y)) {
            guardsRef.current = [...guardsRef.current, { x: pd.x, y: pd.y, kind: pd.kind }];
          }
        }
        pendingRef.current = still;
        setPending(still);
        if (arrived) setGuards(guardsRef.current);
      }

      const effChase = Math.min(0.9, chaseProb + (tierRef.current >= 1 ? 0.15 : 0));
      const next = guardsRef.current.map((g): Guard => {
        // Le campeur rôde autour de la sortie (jamais dessus) : il faut ruser.
        if (g.kind === 'camper') {
          const zone = ([[0, 1], [0, -1], [1, 0], [-1, 0], [0, 0]] as const)
            .map(([dx, dy]) => ({ x: g.x + dx, y: g.y + dy }))
            .filter((c2) => c2.x >= 0 && c2.y >= 0 && c2.x < GRID_W && c2.y < GRID_H
              && !layout.blocked.has(k(c2.x, c2.y))
              && cheby(c2, layout.exit) <= 1
              && !(c2.x === layout.exit.x && c2.y === layout.exit.y));
          if (zone.length === 0) return g;
          const z = zone[Math.floor(Math.random() * zone.length)];
          return { ...z, kind: g.kind };
        }
        // Le chasseur traque sans relâche mais est lent : un tick sur deux.
        if (g.kind === 'chaser' && tickCount.current % 2 === 1) return g;
        const cands = ([[0, 1], [0, -1], [1, 0], [-1, 0]] as const)
          .map(([dx, dy]) => ({ x: g.x + dx, y: g.y + dy }))
          .filter((c2) => c2.x >= 0 && c2.y >= 0 && c2.x < GRID_W && c2.y < GRID_H && !layout.blocked.has(k(c2.x, c2.y)));
        if (cands.length === 0) return g;
        const chasing = g.kind === 'chaser' || Math.random() < effChase;
        if (chasing) {
          const best = cands.reduce((b, c2) => (manhattan(c2, p) < manhattan(b, p) ? c2 : b), cands[0]);
          return { ...best, kind: g.kind };
        }
        const r = cands[Math.floor(Math.random() * cands.length)];
        return { ...r, kind: g.kind };
      });
      guardsRef.current = next;
      setGuards(next);

      if (next.some((g) => g.x === p.x && g.y === p.y)) { finish('fail'); return; }

      // Pression : adjacence et lignes de vue nourrissent l'alerte ; sinon
      // décrue, jamais sous le palier atteint (cliquet).
      let gain = 0;
      for (const g of next) {
        if (cheby(g, p) <= 1) gain += hasHaleine ? 20 : 15;
        else if (inSight(g, p, layout.blocked)) gain += 8;
      }
      if (gain > 0) raiseAlert(gain);
      else {
        const floor = TIER_FLOORS[tierRef.current];
        const dec = Math.max(floor, alertRef.current - (hasAgile ? 3 : 2));
        if (dec !== alertRef.current) { alertRef.current = dec; setAlert(dec); }
      }
    }, effTick);
    return () => clearInterval(id);
  }, [layout, chaseProb, tickMs, finish, tier, hasHaleine, hasAgile, raiseAlert]);

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

  const guardAt = (x: number, y: number) => guards.find((g) => g.x === x && g.y === y);
  const pendingAt = (x: number, y: number) => pending.some((pd) => pd.x === x && pd.y === y);

  // Le flair (nez sensible / paranoïaque) révèle les lignes de vue des gardiens.
  const sightKeys = new Set<string>();
  if (hasFlair && status === 'playing') {
    for (const g of guards) {
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as const) {
        for (let i = 1; i <= 3; i++) {
          const cx = g.x + dx * i, cy = g.y + dy * i;
          if (cx < 0 || cy < 0 || cx >= GRID_W || cy >= GRID_H) break;
          if (layout.blocked.has(k(cx, cy))) break;
          sightKeys.add(k(cx, cy));
        }
      }
    }
  }

  const instruction = hasLoot ? tr('Filez vers la sortie 🚪 !', 'Get to the exit 🚪 !') : `${tr('Récupérez', 'Grab')} ${target.emoji}`;
  const ui = TIER_UI[tier];

  return (
    <div className="min-h-screen bg-texture p-4 flex flex-col items-center gap-3">
      {/* En-tête */}
      <div className="text-center">
        <h1 className="text-2xl text-[#2A1F1A]">{tr('Le casse', 'The Heist')}</h1>
        <p className="text-sm text-[#6B5740] mt-1 max-w-xs mx-auto">
          {tr('Vous tentez de subtiliser', 'You try to swipe')} <strong>{tr(target.label, target.labelEn)}</strong>.
        </p>
      </div>

      {/* Bandeau d'état + jauge d'alerte */}
      <div className={`w-full max-w-sm rounded-xl px-3 pt-2 pb-1.5 flex flex-col gap-1.5 transition-colors ${ui.chip}`}>
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>{instruction}</span>
          <span className="text-xs">{ui.emoji} {tr(ui.fr, ui.en)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-black/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: ui.bar }}
            animate={{ width: `${alert}%` }}
            transition={{ duration: 0.25 }}
          />
        </div>
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
            const guard = guardAt(x, y);
            const isPending = pendingAt(x, y);
            const isLoot = !hasLoot && layout.loot.x === x && layout.loot.y === y;
            const isExit = layout.exit.x === x && layout.exit.y === y;
            const isWall = layout.blocked.has(k(x, y));
            let bg = '#F0E2CE';
            if (isWall) bg = '#DCC4A6';
            else if (isExit) bg = hasLoot ? '#CDE8C6' : '#E4EAD8';
            else if (sightKeys.has(k(x, y))) bg = '#F0D6C4';
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
                    className="drop-shadow flex items-center justify-center"
                  >
                    <CardboardAvatar seed={char.seed} gender={char.gender} size={30} accessories={getEquipped()} />
                  </motion.span>
                ) : guard ? (
                  <span>{guard.kind === 'camper' ? '🔦' : guard.kind === 'chaser' ? chaserEmoji : guardEmoji}</span>
                ) : isPending ? (
                  <motion.span animate={{ opacity: [1, 0.25, 1] }} transition={{ repeat: Infinity, duration: 0.7 }}>🚨</motion.span>
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
                <div className="text-4xl mb-1">
                  {endTier === 'fail' ? '🚨' : endTier === 'jackpot' ? '💎' : endTier === 'hot' ? '🔥' : '🤫'}
                </div>
                <p className="text-xl font-bold text-white">
                  {endTier === 'fail'
                    ? tr('Pris sur le fait !', 'Caught red-handed!')
                    : endTier === 'jackpot'
                      ? tr('Coup de maître !', 'Masterstroke!')
                      : endTier === 'hot'
                        ? tr('Sortie à chaud !', 'Out mid-lockdown!')
                        : tr('Filé de justesse !', 'Slipped away!')}
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
        {tr('Glissez sur la grille ou utilisez les flèches.', 'Swipe on the grid or use the arrows.')} {guardEmoji} {tr('patrouille — restez hors de vue, la jauge monte vite.', 'is on patrol — stay out of sight, the gauge climbs fast.')}
      </p>
    </div>
  );
}
