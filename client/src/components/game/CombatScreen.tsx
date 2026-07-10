import { useGame, PROJECTILE_PATTERNS, getCard, SIGNS, SPECIAL_DEFS, bestWeapon } from '@/contexts/GameContext';
import type { Character, CombatState, CombatCard, SignId } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { playHurt, playWhoosh } from '@/lib/sound';
import { useLang, tr, tc } from '@/lib/lang';
import CardboardAvatar from './CardboardAvatar';
import { getEquipped } from '@/lib/profile';
import MinigameIntro, { introSeen } from './MinigameIntro';
import { stampTap, liftHover } from '@/lib/anim';
import { pushToast } from '@/lib/toast';

/*
 * Combat « Signe, Esquive & Riposte ».
 * Chaque manche : (0) duel de signes — triangle Châtaigne/Feinte/Garde, informé
 * par les tendances de l'ennemi et un indice faillible ; manche gagnée →
 * (2) riposte aux cartes ; manche perdue → (1) esquive de rattrapage en temps
 * réel (une esquive parfaite vole une riposte réduite). Voir le reducer
 * (PLAY_SIGN / DODGE_RESULT / PLAY_CARD) pour la résolution — ici on ne fait
 * que jouer et remonter le choix.
 */

const ARENA = 300;          // côté de l'arène en px
const DURATION = 3200;      // durée d'une esquive de rattrapage (ms)
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
  const [ready, setReady] = useState(() => introSeen('combat2'));
  if (!ready) {
    return (
      <MinigameIntro
        id="combat2"
        emoji="🥊"
        title="La bagarre"
        titleEn="The Fight"
        lines={[
          { emoji: '✊', fr: 'Chaque manche s\'ouvre sur un duel de signes : 👊 Châtaigne bat 🎭 Feinte, qui bat 📦 Garde, qui bat 👊 Châtaigne.', en: 'Each round opens with a sign duel: 👊 Haymaker beats 🎭 Feint, which beats 📦 Block, which beats 👊 Haymaker.' },
          { emoji: '👀', fr: 'Guettez les indices (« Il serre le poing… ») : chaque ennemi a ses habitudes, mais un indice peut mentir.', en: 'Watch the tells ("It clenches a fist…"): every foe has habits, but a tell can lie.' },
          { emoji: '🃏', fr: 'Manche gagnée : piochez des cartes et ripostez. Manche perdue : esquivez la riposte ennemie — parfaite, elle vous rend un contre.', en: 'Win the round: draw cards and strike back. Lose it: dodge the foe\'s onslaught — a flawless dodge steals a counter back.' },
          { emoji: '⚡', fr: 'Vos traits débloquent un coup spécial (haleine, piège…) : gagnez des manches pour le charger, 2 usages par combat.', en: 'Your traits unlock a special move (breath, trap…): win rounds to charge it, 2 uses per fight.' },
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
  // Portrait (diorama) de l'ennemi ; repli sur l'emoji si le fichier manque.
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [currentCombat?.enemyName]);
  // Toast quand le coup spécial vient d'être chargé (manche gagnée).
  const prevCharged = useRef(false);
  useEffect(() => {
    const charged = !!currentCombat?.specialCharged;
    if (charged && !prevCharged.current) {
      const sp = SPECIAL_DEFS.find(s => s.id === currentCombat?.specialId);
      if (sp) pushToast(tr(`${sp.name} chargé !`, `${sp.nameEn} charged!`), { emoji: sp.emoji, tone: 'good' });
    }
    prevCharged.current = charged;
  }, [currentCombat?.specialCharged, currentCombat?.specialId]);
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
        {currentCombat.image && !imgError ? (
          <motion.div
            animate={{ rotate: [0, -2, 2, 0] }}
            transition={{ repeat: Infinity, duration: 2.6 }}
            className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 border-[#3A2A1E]/20 shadow"
          >
            <img src={currentCombat.image} alt="" onError={() => setImgError(true)} className="w-full h-full object-cover" />
          </motion.div>
        ) : (
          <motion.span className="text-4xl" animate={{ rotate: [0, -4, 4, 0] }} transition={{ repeat: Infinity, duration: 2.6 }}>
            {currentCombat.enemyEmoji}
          </motion.span>
        )}
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
        {currentCombat.phase === 'sign' ? (
          <SignPhase
            key={`sign-${currentCombat.round}-${currentCombat.signNonce}`}
            combat={currentCombat}
            character={character}
            onPick={(sign) => dispatch({ type: 'PLAY_SIGN', sign })}
            onFlee={() => dispatch({ type: 'FLEE_ATTEMPT' })}
          />
        ) : currentCombat.phase === 'dodge' ? (
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
/* Phase 0 — Duel de signes                                            */
/* ------------------------------------------------------------------ */
const SIGN_ORDER: SignId[] = ['strike', 'feint', 'guard'];

function SignPhase({ combat, character, onPick, onFlee }: {
  combat: CombatState;
  character: Character;
  onPick: (sign: SignId | 'special') => void;
  onFlee: () => void;
}) {
  const lang = useLang();
  const [choice, setChoice] = useState<SignId | 'special' | null>(null);
  const special = combat.specialId ? SPECIAL_DEFS.find(s => s.id === combat.specialId) : undefined;
  const usesLeft = 2 - combat.specialUses;
  // Arme lourde : les accrochages (égalités) tournent pour vous — affiché
  // pour que l'achat d'une batte se sente dès le duel de signes.
  const weapon = bestWeapon(character);
  const heavyWeapon = weapon?.combatStyle === 'heavy' ? weapon : undefined;

  // Indice de la manche : phrase piochée une fois pour toutes.
  const tellText = useMemo(() => {
    if (!combat.tellSign) return null;
    const def = SIGNS[combat.tellSign];
    const list = lang === 'en' ? def.tellsEn : def.tells;
    return list[Math.floor(Math.random() * list.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combat.signNonce, lang]);

  const pick = (s: SignId | 'special') => {
    if (choice) return;
    setChoice(s);
    playWhoosh();
    setTimeout(() => onPick(s), 1350);
  };

  // Verdict affiché pendant la révélation (reflète la résolution du reducer).
  const verdict = ((): { txt: string; tone: 'good' | 'bad' | 'neutral' } | null => {
    if (!choice) return null;
    if (choice === 'special') {
      if (!special) return null;
      if (special.id === 'haleine') return combat.enemySign === 'guard' ? { txt: tr('Contré !', 'Countered!'), tone: 'bad' } : { txt: tr('Ça porte !', 'It lands!'), tone: 'good' };
      if (special.id === 'piege') return combat.enemySign === 'strike' ? { txt: tr('CLAC ! En plein dedans !', 'SNAP! Right in it!'), tone: 'good' } : { txt: tr('Piège posé…', 'Trap set…'), tone: 'neutral' };
      if (special.id === 'pas-de-cote') return { txt: tr('Son jeu est lu !', 'Its game is read!'), tone: 'good' };
      return { txt: tr('Vous parlementez…', 'You parley…'), tone: 'neutral' };
    }
    const p = SIGNS[choice];
    if (p.beats === combat.enemySign) return { txt: tr('Vous prenez l\'avantage !', 'You take the upper hand!'), tone: 'good' };
    if (choice === combat.enemySign) return { txt: tr('Égalité ! Accrochage !', 'Tie! Clash!'), tone: 'neutral' };
    return { txt: tr('Il vous a lu… Esquivez !', 'It read you… Dodge!'), tone: 'bad' };
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-sm flex flex-col items-center gap-3 mt-1"
    >
      {/* Indice (tell) */}
      <div className={`w-full rounded-xl px-3 py-2 text-center text-sm ${combat.tellSign ? 'bg-[#F2C14E]/15 text-[#8B6B4A]' : 'bg-[#E9E0D4] text-[#A08B70]'}`}>
        {combat.tellSign ? (
          <>👁️ <em>{tellText}</em>{combat.tellSure && <span className="ml-1 text-[10px] font-bold text-[#3d8b4f]">{tr('(indice sûr)', '(sure tell)')}</span>}</>
        ) : (
          <>🃏 {tr('Il ne laisse rien paraître…', 'It gives nothing away…')}</>
        )}
      </div>

      {/* Les trois signes */}
      <div className="grid grid-cols-3 gap-2.5 w-full">
        {SIGN_ORDER.map((id, i) => {
          const s = SIGNS[id];
          const beats = SIGNS[s.beats];
          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, y: 16, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.05 * i, type: 'spring', stiffness: 320, damping: 22 }}
              whileHover={liftHover}
              whileTap={stampTap}
              disabled={!!choice}
              onClick={() => pick(id)}
              className="craft-card-solid p-3 flex flex-col items-center text-center gap-1 disabled:opacity-60"
              style={{ border: '2px solid #E0C9AC' }}
            >
              <span className="text-3xl">{s.emoji}</span>
              <span className="text-sm font-bold text-[#2A1F1A] leading-tight">{lang === 'en' ? s.nameEn : s.name}</span>
              <span className="text-[10px] text-[#8B6B4A]">{tr('bat', 'beats')} {beats.emoji} {lang === 'en' ? beats.nameEn : beats.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Arme lourde : rappel de son effet sur les accrochages */}
      {heavyWeapon && (
        <div className="text-[10px] text-[#8B6B4A] bg-[#E9E0D4] rounded-full px-3 py-1">
          🏏 {tc(heavyWeapon.name)} — {tr('les accrochages tournent pour vous.', 'clashes turn in your favor.')}
        </div>
      )}

      {/* Coup spécial (traits) */}
      {special && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={stampTap}
          disabled={!combat.specialCharged || usesLeft <= 0 || !!choice}
          onClick={() => pick('special')}
          className="w-full craft-card-solid p-3 flex items-center gap-3 text-left disabled:opacity-55"
          style={{ border: combat.specialCharged && usesLeft > 0 ? '2px solid #F2C14E' : '2px dashed #D8C4A8' }}
        >
          <motion.span
            className="text-3xl"
            animate={combat.specialCharged && usesLeft > 0 ? { scale: [1, 1.18, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.4 }}
          >
            {special.emoji}
          </motion.span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-[#2A1F1A]">{lang === 'en' ? special.nameEn : special.name}
              <span className="ml-1.5 text-[10px] font-normal text-[#A08B70]">{'●'.repeat(Math.max(0, usesLeft))}{'○'.repeat(Math.max(0, 2 - usesLeft))}</span>
            </span>
            <span className="block text-[10px] text-[#6B5740] leading-snug">{lang === 'en' ? special.descEn : special.desc}</span>
            <span className={`block text-[10px] font-semibold mt-0.5 ${combat.specialCharged && usesLeft > 0 ? 'text-[#B8860B]' : 'text-[#A08B70]'}`}>
              {usesLeft <= 0 ? tr('Épuisé pour ce combat', 'Spent for this fight') : combat.specialCharged ? tr('⚡ Chargé !', '⚡ Charged!') : tr('Gagnez une manche pour charger', 'Win a round to charge')}
            </span>
          </span>
        </motion.button>
      )}

      {/* Fuite (toujours possible avant l'échange) */}
      <button
        onClick={() => { if (!choice) onFlee(); }}
        className="text-xs text-[#8B6B4A] underline underline-offset-2 decoration-[#D8C4A8]"
      >
        🏃 {tr('Tenter de fuir', 'Try to flee')}
      </button>

      {/* Révélation des signes */}
      <AnimatePresence>
        {choice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 flex items-center justify-center px-6"
            style={{ background: 'rgba(42,31,26,0.6)' }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="craft-card-solid p-5 flex flex-col items-center gap-3 w-full max-w-xs"
            >
              <div className="flex items-center justify-center gap-5">
                <div className="flex flex-col items-center">
                  <span className="text-4xl">{choice === 'special' ? special?.emoji : SIGNS[choice as SignId].emoji}</span>
                  <span className="text-[10px] text-[#8B6B4A] mt-1">{tr('Vous', 'You')}</span>
                </div>
                <span className="text-lg font-black text-[#B84A3A]">VS</span>
                <motion.div
                  initial={{ opacity: 0, rotateY: 90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-4xl">{SIGNS[combat.enemySign].emoji}</span>
                  <span className="text-[10px] text-[#8B6B4A] mt-1 max-w-20 truncate">{tc(combat.enemyName)}</span>
                </motion.div>
              </div>
              {verdict && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  className={`text-base font-bold ${verdict.tone === 'good' ? 'text-[#3d8b4f]' : verdict.tone === 'bad' ? 'text-[#B84A3A]' : 'text-[#8B6B4A]'}`}
                >
                  {verdict.txt}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
  const densityMul = (1 + (combat.round - 1) * 0.12) * (combat.enemyStunned ? 0.5 : 1) * (combat.dodgePenalty || 1);
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
