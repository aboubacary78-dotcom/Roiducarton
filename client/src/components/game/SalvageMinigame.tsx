import { useGame, SALVAGE_TUNING, rollSalvageItem, expectedBin, salvagePayout, hasTrait } from '@/contexts/GameContext';
import type { SalvageDef, SalvageBin } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { playHit, playCrit, playHurt, playStep } from '@/lib/sound';
import { useLang, tr, tc } from '@/lib/lang';
import MinigameIntro, { introSeen } from './MinigameIntro';

/*
 * LA RÉCUP' — on renverse un container et on trie ce qui en tombe.
 *
 * Un seul geste : on attrape un objet qui tombe et on l'envoie d'une
 * chiquenaude vers la caisse de gauche (consigne, ça fait de l'argent) ou de
 * droite (bazar, ça nourrit l'atelier). Tout le reste — et il y en a — doit
 * finir par terre : y toucher ne rapporte rien et remplit la jauge de dégoût.
 * D'où la vraie décision du jeu : est-ce que ça vaut le geste ?
 *
 * Voir data/salvage pour la table des objets et le réglage.
 */

const W = 300;              // largeur logique de la zone de chute
const H = 300;              // hauteur logique
const GRAB_R = 30;          // rayon de préhension (généreux : on joue au pouce)

interface Falling {
  id: number;
  def: SalvageDef;
  x: number;                // 0..W
  born: number;             // date d'apparition
  gone?: 'bin' | 'floor';   // sorti du jeu
}

export default function SalvageMinigame() {
  const [ready, setReady] = useState(() => introSeen('recup'));
  if (!ready) {
    return (
      <MinigameIntro
        id="recup"
        emoji="♻️"
        title="La Récup'"
        titleEn="Salvage"
        lines={[
          { emoji: '🫳', fr: 'Le container se renverse. Attrapez ce qui tombe et lancez-le vers la bonne caisse.', en: 'The bin tips over. Grab what falls and fling it into the right crate.' },
          { emoji: '♻️', fr: 'À GAUCHE la consigne : bouteilles, canettes, cartons. Ça se revend au poids, c\'est votre argent.', en: 'LEFT is deposit: bottles, cans, cardboard. Sold by weight, that\'s your money.' },
          { emoji: '🔧', fr: 'À DROITE le bazar : ferraille, câbles, tissu. C\'est la matière première de votre atelier.', en: 'RIGHT is scrap: metal, cables, cloth. That\'s your workshop\'s raw material.' },
          { emoji: '🤢', fr: 'Le reste, LAISSEZ-LE TOMBER. Y toucher ne rapporte rien et vous soulève le cœur.', en: 'Everything else, LET IT DROP. Touching it earns nothing and turns your stomach.' },
          { emoji: '🐀', fr: 'Et méfiez-vous : tout ce qui bouge dans un container n\'est pas un objet.', en: 'And beware: not everything moving in a bin is an object.' },
        ]}
        onStart={() => setReady(true)}
      />
    );
  }
  return <SalvageInner />;
}

function SalvageInner() {
  const { state, dispatch } = useGame();
  useLang();
  const char = state.character;
  const flair = !!char && (hasTrait(char, 'nez-sensible') || hasTrait(char, 'paranoiaque'));
  const poissard = !!char && hasTrait(char, 'poissard');
  const bricoleur = !!char && hasTrait(char, 'bricoleur');

  const T = SALVAGE_TUNING;
  // Le Poissard sort plus de saletés du container. C'est sa vie.
  const malus = poissard ? 1 : 0;
  // Le Bricoleur a l'œil : ses objets tombent un peu plus lentement pour lui,
  // il « voit » la pièce utile avant les autres.
  const fallMs = T.fallMs * (bricoleur ? 1.15 : 1);

  const [items, setItems] = useState<Falling[]>([]);
  const [centimes, setCentimes] = useState(0);
  const [bazar, setBazar] = useState(0);
  const [disgust, setDisgust] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1);
  const [flash, setFlash] = useState<null | { bin: SalvageBin | 'bad'; key: number }>(null);
  const [ended, setEnded] = useState<null | 'time' | 'sick'>(null);

  const itemsRef = useRef<Falling[]>([]);
  const idRef = useRef(0);
  const centimesRef = useRef(0);
  const bazarRef = useRef(0);
  const disgustRef = useRef(0);
  const endedRef = useRef(false);
  const zoneRef = useRef<HTMLDivElement | null>(null);
  // L'objet actuellement tenu entre le pouce et l'écran.
  const heldRef = useRef<{ id: number; fromX: number } | null>(null);
  const [held, setHeld] = useState<number | null>(null);

  function finish(reason: 'time' | 'sick') {
    if (endedRef.current) return;
    endedRef.current = true;
    setEnded(reason);
    if (reason === 'sick') playHurt();
    setTimeout(() => dispatch({
      type: 'RESOLVE_SALVAGE',
      centimes: centimesRef.current,
      bazar: bazarRef.current,
      sick: reason === 'sick',
    }), 1300);
  }

  // Boucle : chute, apparition, chrono, dégoût de fond.
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    let nextSpawn = start + 250;
    let last = start;
    const loop = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      const elapsed = now - start;
      setTimeLeft(Math.max(0, 1 - elapsed / T.roundMs));

      if (now >= nextSpawn && elapsed < T.roundMs) {
        itemsRef.current = [...itemsRef.current, {
          id: ++idRef.current,
          def: rollSalvageItem(malus),
          x: 34 + Math.random() * (W - 68),
          born: now,
        }];
        nextSpawn += T.spawnMs;
      }

      // Ce qui touche le sol sort du jeu. Un déchet au sol, c'est très bien :
      // c'est même le geste gagnant.
      itemsRef.current = itemsRef.current.filter(it => {
        if (it.gone) return false;
        return now - it.born < fallMs + 260;
      });

      // Rester le nez dans les ordures suffit à écœurer, doucement.
      if (!endedRef.current) {
        disgustRef.current = Math.min(T.disgustMax, disgustRef.current + T.disgustDrift * dt);
        setDisgust(disgustRef.current);
        if (disgustRef.current >= T.disgustMax) { finish('sick'); return; }
      }

      setItems([...itemsRef.current]);

      if (elapsed >= T.roundMs) { finish('time'); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Position verticale d'un objet, 0 (haut) → 1 (sol).
  const progress = (it: Falling) => Math.min(1, (performance.now() - it.born) / fallMs);
  // Sa hauteur RÉELLE à l'écran, en unités logiques. La chute se joue entre le
  // rebord du container (8 %) et le haut des caisses (82 %) : le test de
  // préhension doit viser exactement là où l'objet est dessiné, sinon on
  // attrape le vide.
  const screenY = (it: Falling) => ((8 + progress(it) * 74) / 100) * H;

  function toZone(clientX: number, clientY: number) {
    const el = zoneRef.current; if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: ((clientX - r.left) / r.width) * W, y: ((clientY - r.top) / r.height) * H };
  }

  function onDown(clientX: number, clientY: number) {
    if (endedRef.current) return;
    const p = toZone(clientX, clientY); if (!p) return;
    // On attrape le plus proche dans le rayon de préhension.
    let best: Falling | null = null, bestD = Infinity;
    for (const it of itemsRef.current) {
      const d = Math.hypot(it.x - p.x, screenY(it) - p.y);
      if (d < GRAB_R && d < bestD) { best = it; bestD = d; }
    }
    if (!best) return;
    heldRef.current = { id: best.id, fromX: best.x };
    setHeld(best.id);
    playStep();
  }

  function release(clientX: number) {
    const h = heldRef.current; if (!h) return;
    heldRef.current = null; setHeld(null);
    const it = itemsRef.current.find(x => x.id === h.id);
    if (!it || endedRef.current) return;
    const el = zoneRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    // Vers quelle caisse le geste part-il ? Moitié gauche = consigne.
    const bin: SalvageBin = clientX < r.left + r.width / 2 ? 'consigne' : 'bazar';
    const want = expectedBin(it.def);

    itemsRef.current = itemsRef.current.map(x => (x.id === it.id ? { ...x, gone: 'bin' } : x));
    setItems([...itemsRef.current]);

    if (want === bin) {
      // Bon bac.
      if (bin === 'consigne') { centimesRef.current += it.def.value; setCentimes(centimesRef.current); }
      else { bazarRef.current += 1; setBazar(bazarRef.current); }
      playCrit();
      setFlash({ bin, key: Date.now() });
    } else if (want && want !== bin) {
      // Bon objet, mauvaise caisse : perdu, mais rien d'écœurant.
      playHit();
      setFlash({ bin: 'bad', key: Date.now() });
    } else {
      // On a touché ce qu'il fallait laisser tomber.
      const cost = it.def.kind === 'piege' ? SALVAGE_TUNING.disgustPiege : SALVAGE_TUNING.disgustDechet;
      disgustRef.current = Math.min(SALVAGE_TUNING.disgustMax, disgustRef.current + cost);
      setDisgust(disgustRef.current);
      playHurt();
      setFlash({ bin: 'bad', key: Date.now() });
      if (disgustRef.current >= SALVAGE_TUNING.disgustMax) finish('sick');
    }
  }

  if (!char) return null;

  const disgustPct = (disgust / SALVAGE_TUNING.disgustMax) * 100;

  return (
    <div className="h-screen bg-texture p-4 flex flex-col items-center gap-2.5 select-none overflow-hidden">
      {/* En-tête */}
      <div className="text-center shrink-0">
        <h1 className="text-2xl text-[#2A1F1A]">{tr('La Récup\'', 'Salvage')}</h1>
        <p className="text-xs text-[#8B6B4A] mt-0.5">
          {tr('Attrapez, envoyez dans la bonne caisse. Le reste, laissez tomber.',
              'Grab it, fling it in the right crate. Let the rest drop.')}
        </p>
      </div>

      {/* Récolte + dégoût */}
      <div className="w-full max-w-sm flex gap-2 shrink-0">
        <div className="flex-1 craft-card px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#6B5740]">♻️ {tr('Consigne', 'Deposit')}</span>
          <span className="text-sm font-mono font-bold text-[#B8860B]">{centimes}c</span>
        </div>
        <div className="flex-1 craft-card px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#6B5740]">🔧 {tr('Bazar', 'Scrap')}</span>
          <span className="text-sm font-mono font-bold text-[#8B6B4A]">×{bazar}</span>
        </div>
      </div>
      <div className="w-full max-w-sm shrink-0">
        <div className="flex items-center justify-between text-[10px] font-semibold text-[#6B5740] mb-1">
          <span>🤢 {tr('Haut-le-cœur', 'Queasiness')}</span>
          <span className="font-mono">{Math.round(disgustPct)}%</span>
        </div>
        <div className="h-2 rounded-full bg-[#E9E0D4] overflow-hidden border border-[#7C8B5A]/30">
          <motion.div
            className="h-full rounded-full"
            style={{ background: disgustPct > 66 ? 'linear-gradient(90deg,#7C8B5A,#5E7A3A)' : 'linear-gradient(90deg,#B8AA6A,#7C8B5A)' }}
            animate={{ width: `${disgustPct}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      {/* Zone de chute */}
      <div
        ref={zoneRef}
        role="application"
        aria-label={tr('Container : attrapez un objet et lancez-le vers une caisse', 'Bin: grab an item and fling it into a crate')}
        className="relative w-full max-w-sm flex-1 min-h-[340px] rounded-xl overflow-hidden"
        style={{
          touchAction: 'none',
          background: 'radial-gradient(ellipse at 50% -10%, #554B3A, #241E18 70%)',
          border: '3px solid #3A2A1E',
        }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); onDown(e.clientX, e.clientY); }}
        onPointerUp={(e) => release(e.clientX)}
        onPointerCancel={() => { heldRef.current = null; setHeld(null); }}
      >
        {/* jauge de temps */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/40 z-10">
          <div className="h-full bg-[#F2C14E]" style={{ width: `${timeLeft * 100}%` }} />
        </div>

        {/* Le container renversé, en haut : c'est de là que ça tombe. */}
        <div className="absolute top-0 left-0 right-0 h-7 pointer-events-none">
          <div className="absolute inset-x-6 top-0 h-5 rounded-b-lg" style={{ background: 'linear-gradient(180deg,#6B5B45,#463B2C)', boxShadow: '0 3px 8px rgba(0,0,0,0.5)' }} />
          <div className="absolute inset-x-3 top-4 h-2 rounded-full" style={{ background: '#2A231A' }} />
        </div>

        {/* La ligne de partage, et les DEUX CAISSES au sol : on relâche
            du côté de celle qui convient. Sans elles, la consigne d'usage
            (« du bon côté ») n'avait aucune cible à regarder. */}
        <div className="absolute inset-y-7 left-1/2 w-px bg-white/8" />
        {([['consigne', '♻️', '#4A9B5F'], ['bazar', '🔧', '#B8894A']] as const).map(([id, emo, col], i) => (
          <div
            key={id}
            className="absolute bottom-0 h-16 flex flex-col items-center justify-end pb-1.5 pointer-events-none"
            style={{ left: i === 0 ? 0 : '50%', width: '50%' }}
          >
            <div
              className="w-[78%] h-9 rounded-t-md flex items-center justify-center gap-1.5 transition-colors"
              style={{
                background: flash?.bin === id ? `${col}` : 'linear-gradient(180deg,#5C4C36,#3B3125)',
                border: `2px solid ${flash?.bin === id ? col : 'rgba(240,217,196,0.25)'}`,
                borderBottom: 'none',
              }}
            >
              <span className="text-base">{emo}</span>
              <span className="text-[10px] font-bold text-[#F0D9C4]">
                {id === 'consigne' ? tr('CONSIGNE', 'DEPOSIT') : tr('BAZAR', 'SCRAP')}
              </span>
            </div>
          </div>
        ))}

        {/* objets qui tombent */}
        {items.map((it) => {
          const t = progress(it);
          const isHeld = held === it.id;
          // Le nez sensible repère les saletés avant de les toucher.
          const stinks = flair && (it.def.kind === 'dechet' || it.def.kind === 'piege');
          return (
            <motion.div
              key={it.id}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: isHeld ? 1.35 : 1, opacity: it.gone ? 0 : 1 }}
              transition={{ duration: it.gone ? 0.18 : 0.15 }}
              style={{
                position: 'absolute',
                left: `${(it.x / W) * 100}%`,
                top: `${8 + t * 74}%`,
                transform: 'translate(-50%,-50%)',
              }}
            >
              <span
                className="text-3xl block drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]"
                style={{ filter: isHeld ? 'brightness(1.25)' : undefined }}
              >
                {it.def.emoji}
              </span>
              {stinks && (
                <motion.span
                  className="absolute -top-1 -right-1 text-[11px]"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 0.9 }}
                >
                  🤢
                </motion.span>
              )}
            </motion.div>
          );
        })}

        {/* retour visuel du dernier geste */}
        <AnimatePresence>
          {flash && (
            <motion.div
              key={flash.key}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-y-0 w-1/2 pointer-events-none"
              style={{
                left: flash.bin === 'consigne' ? 0 : flash.bin === 'bazar' ? '50%' : 0,
                right: flash.bin === 'bad' ? 0 : undefined,
                width: flash.bin === 'bad' ? '100%' : '50%',
                background: flash.bin === 'bad' ? '#D94F4F' : '#4A9B5F',
              }}
            />
          )}
        </AnimatePresence>

        {/* fin de manche */}
        <AnimatePresence>
          {ended && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-5"
              style={{ background: 'rgba(24,18,14,0.9)' }}
            >
              <div className="text-5xl mb-2">{ended === 'sick' ? '🤮' : '♻️'}</div>
              <p className="text-lg font-bold text-white">
                {ended === 'sick'
                  ? tr('Le cœur a lâché avant vous.', 'Your stomach gave out first.')
                  : tr('Container vidé.', 'Bin emptied.')}
              </p>
              <p className="text-xs text-white/80 mt-1">
                ♻️ {centimes}c · 🔧 ×{bazar}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-[10px] text-[#A08B70] text-center shrink-0">
        {tr(`100c = 1€ · dans la poche : ${salvagePayout(centimes)}€`,
            `100c = €1 · in your pocket: €${salvagePayout(centimes)}`)}
      </p>
    </div>
  );
}
