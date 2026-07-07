import { useGame, PROJECTILE_PATTERNS, getCard } from '@/contexts/GameContext';
import type { Character, CombatState, CombatCard } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { playHurt, playWhoosh } from '@/lib/sound';
import { useLang, tr, tc } from '@/lib/lang';
import CardboardAvatar from './CardboardAvatar';
import { getEquipped } from '@/lib/profile';
import MinigameIntro, { introSeen } from './MinigameIntro';
import { stampTap, liftHover } from '@/lib/anim';
import { pushToast } from '@/lib/toast';

/*
 * Combat « Dodge & Draw ».
 * Round = 2 phases : (1) esquive en temps réel dans une arène de projectiles
 * (façon Undertale, avatar carton contrôlable), puis (2) riposte en piochant
 * des cartes selon la performance. Voir le reducer (DODGE_RESULT / PLAY_CARD)
 * pour la logique de résolution — ici on ne fait que jouer et remonter le
 * nombre de touches / la carte choisie.
 */

const ARENA = 300;          // côté de l'arène en px
const DURATION = 4200;      // durée d'une phase d'esquive (ms)
const IFRAME = 700;         // invulnérabilité après une touche (ms)

type Dir = 'up' | 'down' | 'left' | 'right';
interface Proj { id: number; x: number; y: number; vx: number; vy: number; size: number; kind: string; armUntil: number; }

const KIND_STYLE: Record<string, { color: string; shape: 'circle' | 'rect' }> = {
  feather: { color: '#7B68A8', shape: 'circle' },
  fist: { color: '#C4723A', shape: 'rect' },
  claw: { color: '#D94F4F', shape: 'circle' },
  bottle: { color: '#6B8E5A', shape: 'circle' },
  dash: { color: '#B8860B', shape: 'rect' },
  peck: { color: '#4A8FBF', shape: 'circle' },
};

export default function CombatScreen() {
  const [ready, setReady] = useState(() => introSeen('combat'));
  if (!ready) {
    return (
      <MinigameIntro
        id="combat"
        emoji="🥊"
        title="La bagarre"
        titleEn="The Fight"
        lines={[
          { emoji: '🏃', fr: 'Phase 1 — Esquive : déplacez votre personnage (ZQSD, flèches ou la croix tactile) pour éviter les projectiles pendant quelques secondes.', en: 'Phase 1 — Dodge: move your character (WASD, arrows or the on-screen pad) to avoid projectiles for a few seconds.' },
          { emoji: '🃏', fr: 'Phase 2 — Riposte : mieux vous esquivez, plus vous piochez de cartes (jusqu\'à 3). Choisissez-en une pour contre-attaquer.', en: 'Phase 2 — Riposte: the better you dodge, the more cards you draw (up to 3). Pick one to counter-attack.' },
          { emoji: '🎽', fr: 'Vos objets, vos stats et vos traits débloquent des cartes spéciales (arme, insulte, haleine, fuite…).', en: 'Your items, stats and traits unlock special cards (weapon, insult, breath, flee…).' },
          { emoji: '💀', fr: 'Les touches entament votre vraie santé. Videz les PV de l\'ennemi avant que les vôtres tombent à zéro.', en: 'Hits chip your real health. Empty the enemy\'s HP before yours drops to zero.' },
        ]}
        onStart={() => setReady(true)}
      />
    );
  }
  return <CombatScreenInner />;
}

function CombatScreenInner() {
  const { state, dispatch } = useGame();
  useLang();
  const { currentCombat, character } = state;
  if (!currentCombat || !character) return null;

  const hpPercent = (currentCombat.enemyHealth / currentCombat.enemyMaxHealth) * 100;
  const playerHpPercent = character.stats.health;

  return (
    <div className="min-h-screen bg-texture p-4 flex flex-col items-center gap-3 select-none">
      {/* En-tête ennemi */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm craft-card p-3 flex items-center gap-3"
      >
        <motion.span className="text-4xl" animate={{ rotate: [0, -4, 4, 0] }} transition={{ repeat: Infinity, duration: 2.6 }}>
          {currentCombat.enemyEmoji}
        </motion.span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#2A1F1A] truncate">{tc(currentCombat.enemyName)}</h2>
            <span className="text-[10px] font-mono text-[#B84A3A] shrink-0">{currentCombat.enemyHealth}/{currentCombat.enemyMaxHealth}</span>
          </div>
          <div className="mt-1 h-2.5 bg-[#F0E0D2] rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#D94F4F,#E86B5A)' }} animate={{ width: `${hpPercent}%` }} transition={{ duration: 0.35 }} />
          </div>
          <p className="text-[10px] text-[#8B6B4A] italic mt-1 truncate">{tr('Round', 'Round')} {currentCombat.round} · {tc(currentCombat.description)}</p>
        </div>
      </motion.div>

      {/* Barre de vie du joueur */}
      <div className="w-full max-w-sm flex items-center gap-2">
        <span className="text-[10px] font-mono text-[#3d8b4f] w-8">{tr('PV', 'HP')}</span>
        <div className="flex-1 h-2.5 bg-[#E9E0D4] rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: playerHpPercent > 40 ? 'linear-gradient(90deg,#4A9B5F,#5CB870)' : 'linear-gradient(90deg,#8B2020,#D94F4F)' }} animate={{ width: `${playerHpPercent}%` }} transition={{ duration: 0.35 }} />
        </div>
        <span className="text-[10px] font-mono text-[#3d8b4f] w-8 text-right">{Math.round(character.stats.health)}</span>
      </div>

      {/* Phase courante */}
      <AnimatePresence mode="wait">
        {currentCombat.phase === 'dodge' ? (
          <DodgeArena
            key={`dodge-${currentCombat.round}`}
            combat={currentCombat}
            character={character}
            onDone={(hits) => {
              if (hits === 0) pushToast(tr('Esquive parfaite !', 'Flawless dodge!'), { emoji: '✨', tone: 'good' });
              else if (hits === 1) pushToast(tr('Bien esquivé !', 'Nicely dodged!'), { emoji: '🛡️', tone: 'good' });
              dispatch({ type: 'DODGE_RESULT', hits });
            }}
          />
        ) : (
          <CardHand
            key={`draw-${currentCombat.round}`}
            combat={currentCombat}
            character={character}
            onPlay={(cardId) => dispatch({ type: 'PLAY_CARD', cardId })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Phase 1 — Esquive                                                   */
/* ------------------------------------------------------------------ */
function DodgeArena({ combat, character, onDone }: { combat: CombatState; character: Character; onDone: (hits: number) => void }) {
  const lang = useLang();
  const pattern = PROJECTILE_PATTERNS[combat.pattern] || PROJECTILE_PATTERNS.brute;
  const hasAgile = character.traits.some((t) => t.id === 'agile');
  const telegraph = character.traits.some((t) => t.id === 'nez-sensible' || t.id === 'paranoiaque');

  const R = hasAgile ? 11 : 15;
  const SPEED = hasAgile ? 205 : 168;
  const densityMul = (1 + (combat.round - 1) * 0.12) * (combat.enemyStunned ? 0.5 : 1);
  const speedMul = (1 + (combat.round - 1) * 0.06) * (combat.enemyStunned ? 0.8 : 1);

  const posRef = useRef({ x: ARENA / 2, y: ARENA - 40 });
  const projRef = useRef<Proj[]>([]);
  const keysRef = useRef<Set<Dir>>(new Set());
  const hitsRef = useRef(0);
  const iframeRef = useRef(0);
  const projId = useRef(0);
  const [, force] = useState(0);
  const [flash, setFlash] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1);
  const doneRef = useRef(false);

  const spawn = useCallback((now: number) => {
    const p = posRef.current;
    const add = (px: number, py: number, vx: number, vy: number) => {
      projRef.current.push({ id: ++projId.current, x: px, y: py, vx, vy, size: pattern.size, kind: pattern.kind, armUntil: telegraph ? now + 420 : 0 });
    };
    const speed = pattern.speed * speedMul;
    if (pattern.motion === 'spread') {
      // Éventail depuis le haut vers le bas.
      const cx = 40 + Math.random() * (ARENA - 80);
      for (let i = -1; i <= 1; i++) add(cx, -10, i * 55, speed);
    } else if (pattern.motion === 'lob') {
      // Cloche : part du haut, retombe (accélération verticale via vy croissant).
      add(30 + Math.random() * (ARENA - 60), -10, (Math.random() - 0.5) * 60, speed * 0.5);
    } else if (pattern.motion === 'homing') {
      // Depuis un bord aléatoire, vise le joueur.
      const edge = Math.floor(Math.random() * 4);
      const sx = edge === 0 ? -10 : edge === 1 ? ARENA + 10 : Math.random() * ARENA;
      const sy = edge === 2 ? -10 : edge === 3 ? ARENA + 10 : Math.random() * ARENA;
      const dx = p.x - sx, dy = p.y - sy; const d = Math.hypot(dx, dy) || 1;
      add(sx, sy, (dx / d) * speed, (dy / d) * speed);
    } else {
      // straight : d'un bord vers le point opposé.
      const fromTop = Math.random() < 0.5;
      if (fromTop) add(Math.random() * ARENA, -10, (Math.random() - 0.5) * 40, speed);
      else { const left = Math.random() < 0.5; add(left ? -10 : ARENA + 10, Math.random() * ARENA * 0.7, (left ? 1 : -1) * speed, 20); }
    }
  }, [pattern, speedMul, telegraph]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const start = last;
    let nextSpawn = last + 300;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const elapsed = now - start;
      setTimeLeft(Math.max(0, 1 - elapsed / DURATION));

      // Déplacement du joueur.
      let dx = 0, dy = 0;
      const k = keysRef.current;
      if (k.has('left')) dx -= 1; if (k.has('right')) dx += 1;
      if (k.has('up')) dy -= 1; if (k.has('down')) dy += 1;
      if (dx || dy) { const d = Math.hypot(dx, dy); const p = posRef.current; p.x += (dx / d) * SPEED * dt; p.y += (dy / d) * SPEED * dt; p.x = Math.max(R, Math.min(ARENA - R, p.x)); p.y = Math.max(R, Math.min(ARENA - R, p.y)); }

      // Apparition des projectiles.
      const interval = pattern.spawnMs / densityMul;
      while (now >= nextSpawn && elapsed < DURATION) { spawn(now); nextSpawn += interval; }

      // Déplacement + collisions.
      const p = posRef.current;
      const alive: Proj[] = [];
      for (const pr of projRef.current) {
        pr.x += pr.vx * dt; pr.y += pr.vy * dt;
        if (pattern.motion === 'lob') pr.vy += 260 * dt; // gravité
        if (pattern.motion === 'homing' && elapsed < DURATION) {
          const ax = p.x - pr.x, ay = p.y - pr.y; const d = Math.hypot(ax, ay) || 1;
          pr.vx += (ax / d) * 60 * dt; pr.vy += (ay / d) * 60 * dt;
        }
        if (pr.x < -40 || pr.x > ARENA + 40 || pr.y < -40 || pr.y > ARENA + 40) continue;
        const armed = pr.armUntil === 0 || now >= pr.armUntil;
        if (armed && now >= iframeRef.current) {
          const dist = Math.hypot(pr.x - p.x, pr.y - p.y);
          if (dist < R + pr.size / 2) {
            hitsRef.current += 1; iframeRef.current = now + IFRAME;
            setFlash(true); setTimeout(() => setFlash(false), 160); playHurt();
            continue; // le projectile disparaît après impact
          }
        }
        alive.push(pr);
      }
      projRef.current = alive;
      force((n) => n + 1);

      if (elapsed >= DURATION) {
        if (!doneRef.current) { doneRef.current = true; setTimeout(() => onDone(hitsRef.current), 250); }
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clavier (ZQSD / WASD / flèches).
  useEffect(() => {
    const map: Record<string, Dir> = {
      arrowup: 'up', z: 'up', w: 'up', arrowdown: 'down', s: 'down',
      arrowleft: 'left', q: 'left', a: 'left', arrowright: 'right', d: 'right',
    };
    const down = (e: KeyboardEvent) => { const dir = map[e.key.toLowerCase()]; if (dir) { e.preventDefault(); keysRef.current.add(dir); } };
    const up = (e: KeyboardEvent) => { const dir = map[e.key.toLowerCase()]; if (dir) keysRef.current.delete(dir); };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // Tactile : glissé direct sur l'arène (le doigt tire le personnage).
  const dragRef = useRef(false);
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const moveTo = (clientX: number, clientY: number) => {
    const el = arenaRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const scale = ARENA / rect.width;
    const x = (clientX - rect.left) * scale; const y = (clientY - rect.top) * scale;
    posRef.current.x = Math.max(R, Math.min(ARENA - R, x));
    posRef.current.y = Math.max(R, Math.min(ARENA - R, y));
  };

  const hold = (dir: Dir, on: boolean) => { if (on) keysRef.current.add(dir); else keysRef.current.delete(dir); };

  const p = posRef.current;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-2 w-full"
    >
      <div className="text-xs font-semibold text-[#B84A3A]">{tr('Esquivez !', 'Dodge!')} <span className="text-[#8B6B4A] font-normal">· {lang === 'en' ? pattern.labelEn : pattern.label}{telegraph ? tr(' · 👃 danger flairé', ' · 👃 danger sensed') : ''}</span></div>

      {/* Arène */}
      <div
        ref={arenaRef}
        className="relative rounded-xl overflow-hidden"
        style={{ width: 'min(300px, 82vw)', aspectRatio: '1 / 1', background: 'radial-gradient(circle at 50% 40%, #2E2438, #1C1622)', border: '3px solid #3A2A1E', touchAction: 'none' }}
        onPointerDown={(e) => { dragRef.current = true; moveTo(e.clientX, e.clientY); }}
        onPointerMove={(e) => { if (dragRef.current) moveTo(e.clientX, e.clientY); }}
        onPointerUp={() => { dragRef.current = false; }}
        onPointerLeave={() => { dragRef.current = false; }}
      >
        {/* jauge de temps */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/30">
          <div className="h-full bg-[#F2C14E]" style={{ width: `${timeLeft * 100}%` }} />
        </div>

        {/* projectiles */}
        {projRef.current.map((pr) => {
          const st = KIND_STYLE[pr.kind] || KIND_STYLE.fist;
          const armed = pr.armUntil === 0 || performance.now() >= pr.armUntil;
          return (
            <div
              key={pr.id}
              style={{
                position: 'absolute',
                left: `${(pr.x / ARENA) * 100}%`, top: `${(pr.y / ARENA) * 100}%`,
                width: pr.size, height: st.shape === 'rect' ? pr.size * 0.7 : pr.size,
                transform: 'translate(-50%,-50%)',
                background: st.color, opacity: armed ? 0.95 : 0.35,
                borderRadius: st.shape === 'rect' ? 3 : '50%',
                border: '2px solid #3A2A1E',
              }}
            />
          );
        })}

        {/* joueur */}
        <motion.div
          style={{ position: 'absolute', left: `${(p.x / ARENA) * 100}%`, top: `${(p.y / ARENA) * 100}%`, transform: 'translate(-50%,-50%)', width: R * 2.4, height: R * 2.4 }}
          animate={{ opacity: flash ? [1, 0.2, 1] : 1 }}
          transition={{ duration: 0.16 }}
        >
          <div className="w-full h-full rounded-full overflow-hidden" style={{ boxShadow: flash ? '0 0 0 3px #D94F4F' : '0 0 0 2px rgba(242,193,78,0.7)' }}>
            <CardboardAvatar seed={character.seed} gender={character.gender} size={Math.round(R * 2.4)} accessories={getEquipped()} />
          </div>
        </motion.div>
      </div>

      {/* Croix directionnelle tactile */}
      <div className="grid grid-cols-3 gap-1 w-36 mt-1" aria-label={tr('Déplacements', 'Movement')}>
        <span />
        <PadBtn label="▲" onHold={(on) => hold('up', on)} />
        <span />
        <PadBtn label="◀" onHold={(on) => hold('left', on)} />
        <PadBtn label="▼" onHold={(on) => hold('down', on)} />
        <PadBtn label="▶" onHold={(on) => hold('right', on)} />
      </div>
      <p className="text-[10px] text-[#8B6B4A]">{tr('Glissez dans l\'arène, ZQSD/flèches, ou la croix.', 'Drag in the arena, WASD/arrows, or the pad.')}</p>
    </motion.div>
  );
}

function PadBtn({ label, onHold }: { label: string; onHold: (on: boolean) => void }) {
  return (
    <button
      className="action-btn aspect-square flex items-center justify-center text-base"
      style={{ touchAction: 'none' }}
      onPointerDown={(e) => { e.preventDefault(); onHold(true); }}
      onPointerUp={() => onHold(false)}
      onPointerLeave={() => onHold(false)}
      onPointerCancel={() => onHold(false)}
    >
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Phase 2 — Riposte (cartes)                                          */
/* ------------------------------------------------------------------ */
function CardHand({ combat, character, onPlay }: { combat: CombatState; character: Character; onPlay: (cardId: string) => void }) {
  const lang = useLang();
  const [played, setPlayed] = useState(false);
  const cards = combat.hand.map((id) => getCard(id)).filter(Boolean) as CombatCard[];

  const play = (id: string) => { if (played) return; setPlayed(true); playWhoosh(); setTimeout(() => onPlay(id), 220); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-sm flex flex-col items-center gap-3 mt-1"
    >
      <div className="text-sm font-semibold text-[#2A1F1A]">{tr('Ripostez !', 'Counter-attack!')} <span className="text-xs text-[#8B6B4A] font-normal">({cards.length} {tr('carte', 'card')}{cards.length > 1 ? 's' : ''})</span></div>
      <div className={`grid gap-2.5 w-full ${cards.length >= 3 ? 'grid-cols-3' : cards.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {cards.map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 16, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.06 * i, type: 'spring', stiffness: 320, damping: 22 }}
            whileHover={liftHover}
            whileTap={stampTap}
            disabled={played}
            onClick={() => play(card.id)}
            className="craft-card-solid p-3 flex flex-col items-center text-center gap-1.5 disabled:opacity-60"
            style={{ border: '2px solid #E0C9AC' }}
          >
            <span className="text-3xl">{card.emoji}</span>
            <span className="text-sm font-bold text-[#2A1F1A] leading-tight">{lang === 'en' ? card.nameEn : card.name}</span>
            <span className="text-[10px] text-[#6B5740] leading-snug">{lang === 'en' ? card.descEn : card.desc}</span>
            <span className={`text-[10px] font-mono font-semibold mt-0.5 px-2 py-0.5 rounded-full ${
              card.kind === 'attack' ? 'bg-[#D94F4F]/10 text-[#B84A3A]'
                : card.kind === 'heal' ? 'bg-[#4A9B5F]/10 text-[#3d8b4f]'
                : card.kind === 'flee' ? 'bg-[#8B6B4A]/10 text-[#8B6B4A]'
                : 'bg-[#7B68EE]/10 text-[#7B68EE]'
            }`}>
              {card.estimate(character, combat)}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
