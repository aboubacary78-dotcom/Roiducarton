import {
  useGame, LAYERS, SALVAGE_TUNING, rollLayerFinds, nextLayerRisk, salvagePayout,
  BUST_REASONS, hasTrait, randomFromArray,
} from '@/contexts/GameContext';
import type { SalvageFind } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { playHit, playCrit, playHurt, playStep } from '@/lib/sound';
import { useLang, tr, tc } from '@/lib/lang';
import MinigameIntro, { introSeen } from './MinigameIntro';
import LocationBackdrop from './LocationBackdrop';

/*
 * LA RÉCUP' — le fond du container.
 *
 * On déblaie une couche de détritus du doigt ; ce qu'elle cachait apparaît et
 * tombe dans les poches. Puis vient la seule vraie question du jeu :
 *
 *      remonter avec ce qu'on a, ou descendre d'une couche ?
 *
 * Plus bas ça vaut plus cher, et le tas s'agite. S'il se réveille avant qu'on
 * soit ressorti, on perd TOUT — d'où le fait que renoncer soit l'action
 * principale. Voir data/salvage pour les couches et le réglage.
 */

const T = SALVAGE_TUNING;
const CELLS = T.gridW * T.gridH;

// Les détritus qui recouvrent une couche : purement décoratifs, mais il en
// faut assez de variété pour qu'on ait envie de gratter.
const MUCK = ['🗞️', '🧻', '🥡', '🍂', '🧃', '📄', '🍌', '🧺', '📰', '🥚'];

interface Cell { muck: string; cleared: boolean; find?: SalvageFind; revealed?: boolean }

export default function SalvageMinigame() {
  const [ready, setReady] = useState(() => introSeen('recup2'));
  if (!ready) {
    return (
      <MinigameIntro
        id="recup2"
        emoji="♻️"
        title="La Récup'"
        titleEn="Salvage"
        lines={[
          { emoji: '🫳', fr: 'Frottez le doigt sur les détritus pour déblayer. Ce qui est dessous apparaît et part dans vos poches.', en: 'Rub your finger over the rubbish to clear it. What\'s underneath appears and goes into your pockets.' },
          { emoji: '⬇️', fr: 'Une couche déblayée, vous choisissez : REMONTER avec le butin, ou CREUSER encore.', en: 'Once a layer is cleared you choose: CLIMB OUT with the haul, or DIG deeper.' },
          { emoji: '💎', fr: 'Plus bas, ça vaut plus cher. Les vraies trouvailles — manteau, barre de fer, duvet — sont tout au fond.', en: 'The deeper you go, the better it gets. The real finds — a coat, an iron bar, a sleeping bag — are at the very bottom.' },
          { emoji: '🐀', fr: 'Mais le tas s\'agite : à chaque couche, et à chaque saleté que vous réveillez.', en: 'But the pile stirs: with every layer, and every nasty thing you wake up.' },
          { emoji: '💀', fr: 'S\'il se réveille avant que vous soyez ressorti, vous perdez TOUT. Savoir s\'arrêter, c\'est le jeu.', en: 'If it wakes before you\'re out, you lose EVERYTHING. Knowing when to stop is the game.' },
        ]}
        onStart={() => setReady(true)}
      />
    );
  }
  return <SalvageInner />;
}

function makeLayer(depth: number, malus: number): Cell[] {
  const finds = rollLayerFinds(depth, malus);
  const cells: Cell[] = Array.from({ length: CELLS }, () => ({
    muck: MUCK[Math.floor(Math.random() * MUCK.length)],
    cleared: false,
  }));
  // Les objets sont placés au hasard, jamais sur la première rangée : sinon
  // un simple effleurement suffirait et il n'y aurait rien à fouiller.
  const spots = Array.from({ length: CELLS - T.gridW }, (_, i) => i + T.gridW).sort(() => Math.random() - 0.5);
  finds.forEach((f, i) => { if (spots[i] !== undefined) cells[spots[i]].find = f; });
  return cells;
}

function SalvageInner() {
  const { state, dispatch } = useGame();
  useLang();
  const char = state.character;
  const flair = !!char && (hasTrait(char, 'nez-sensible') || hasTrait(char, 'paranoiaque'));
  const poissard = !!char && hasTrait(char, 'poissard');
  const bricoleur = !!char && hasTrait(char, 'bricoleur');
  const malus = poissard ? 1 : 0;
  // Le Bricoleur fouille sans faire de bruit : le tas s'agite moins vite.
  const riskMul = bricoleur ? 0.8 : 1;

  const [depth, setDepth] = useState(0);
  const [cells, setCells] = useState<Cell[]>(() => makeLayer(0, malus));
  const [risk, setRisk] = useState(0);
  const [centimes, setCentimes] = useState(0);
  const [bazar, setBazar] = useState(0);
  const [trouvailles, setTrouvailles] = useState<string[]>([]);
  const [ended, setEnded] = useState<null | { how: 'out' | 'bust'; reason?: typeof BUST_REASONS[number] }>(null);
  const [pop, setPop] = useState<{ f: SalvageFind; key: number } | null>(null);

  const cellsRef = useRef(cells);
  const riskRef = useRef(0);
  const depthRef = useRef(0);
  const centimesRef = useRef(0);
  const bazarRef = useRef(0);
  const trouvaillesRef = useRef<string[]>([]);
  const endedRef = useRef(false);
  const rubbingRef = useRef(false);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const layer = LAYERS[Math.min(depth, LAYERS.length - 1)];
  const clearedPct = cells.filter(c => c.cleared).length / CELLS;
  const canDig = clearedPct >= T.clearToDig && depth < LAYERS.length - 1;

  function finish(how: 'out' | 'bust') {
    if (endedRef.current) return;
    endedRef.current = true;
    const reason = how === 'bust' ? randomFromArray(BUST_REASONS) : undefined;
    setEnded({ how, reason });
    if (how === 'bust') playHurt(); else playCrit();
    setTimeout(() => dispatch({
      type: 'RESOLVE_SALVAGE',
      centimes: how === 'bust' ? 0 : centimesRef.current,
      bazar: how === 'bust' ? 0 : bazarRef.current,
      trouvailles: how === 'bust' ? [] : trouvaillesRef.current,
      depth: depthRef.current,
      busted: how === 'bust',
    }), 1600);
  }

  // Le tas s'agite tant qu'on a les bras dedans. Fouiller coûte du temps, et
  // le temps coûte du risque : c'est ce qui empêche de tout déblayer tranquille.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      if (!endedRef.current && rubbingRef.current) {
        const l = LAYERS[Math.min(depthRef.current, LAYERS.length - 1)];
        riskRef.current = Math.min(T.riskMax, riskRef.current + l.riskPerS * riskMul * dt);
        setRisk(riskRef.current);
        if (riskRef.current >= T.riskMax) { finish('bust'); return; }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addRisk(n: number) {
    riskRef.current = Math.min(T.riskMax, riskRef.current + n);
    setRisk(riskRef.current);
    if (riskRef.current >= T.riskMax) finish('bust');
  }

  /** Déblaie la case sous le doigt et empoche ce qu'elle cachait. */
  function rubAt(clientX: number, clientY: number) {
    if (endedRef.current) return;
    const el = gridRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = Math.floor(((clientX - r.left) / r.width) * T.gridW);
    const cy = Math.floor(((clientY - r.top) / r.height) * T.gridH);
    if (cx < 0 || cy < 0 || cx >= T.gridW || cy >= T.gridH) return;
    const i = cy * T.gridW + cx;
    const cell = cellsRef.current[i];
    if (!cell || cell.cleared) return;

    const next = [...cellsRef.current];
    next[i] = { ...cell, cleared: true, revealed: !!cell.find };
    cellsRef.current = next;
    setCells(next);

    if (!cell.find) { playStep(); return; }
    const f = cell.find;
    setPop({ f, key: Date.now() });
    if (f.kind === 'consigne') {
      centimesRef.current += f.value; setCentimes(centimesRef.current); playCrit();
    } else if (f.kind === 'bazar') {
      bazarRef.current += 1; setBazar(bazarRef.current); playCrit();
    } else if (f.kind === 'trouvaille') {
      trouvaillesRef.current = [...trouvaillesRef.current, f.id];
      setTrouvailles(trouvaillesRef.current); playCrit();
    } else {
      playHurt(); addRisk(T.piegeRisk);
    }
  }

  function dig() {
    if (!canDig || endedRef.current) return;
    const d = depthRef.current + 1;
    depthRef.current = d; setDepth(d);
    const l = LAYERS[Math.min(d, LAYERS.length - 1)];
    const fresh = makeLayer(d, malus);
    cellsRef.current = fresh; setCells(fresh);
    playHit();
    addRisk(l.entryRisk);
  }

  if (!char) return null;

  const riskPct = (risk / T.riskMax) * 100;
  const next = nextLayerRisk(depth);
  const held = salvagePayout(centimes);

  return (
    <div className="h-screen bg-texture p-3 flex flex-col items-center gap-2 select-none overflow-hidden">
      {/* Ce qu'on tient — et qu'on peut encore tout perdre */}
      <div className="w-full max-w-sm flex gap-1.5 shrink-0">
        {([
          ['♻️', `${centimes}c`, held > 0 ? `${held}€` : '', '#B8860B'],
          ['🔧', `×${bazar}`, '', '#8B6B4A'],
          ['💎', `×${trouvailles.length}`, '', '#7B68EE'],
        ] as const).map(([emo, main, sub, col], i) => (
          <div key={i} className="flex-1 craft-card px-2 py-1.5 text-center">
            <div className="text-[10px] text-[#8B6B4A] leading-none">{emo}</div>
            <div className="text-sm font-mono font-bold leading-tight" style={{ color: col }}>{main}</div>
            {sub && <div className="text-[9px] text-[#A08B70] leading-none">{sub}</div>}
          </div>
        ))}
      </div>

      {/* L'agitation du tas : la seule jauge qui compte */}
      <div className="w-full max-w-sm shrink-0">
        <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
          <span className="text-[#6B5740]">🐀 {tr('Le tas s\'agite', 'The pile stirs')}</span>
          <span className="font-mono" style={{ color: riskPct > 70 ? '#B84A3A' : '#6B5740' }}>{Math.round(riskPct)}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-[#E9E0D4] overflow-hidden border border-[#3A2A1E]/20">
          <motion.div
            className="h-full rounded-full"
            style={{ background: riskPct > 70 ? 'linear-gradient(90deg,#B84A3A,#D94F4F)' : riskPct > 40 ? 'linear-gradient(90deg,#D9A73E,#E8842C)' : 'linear-gradient(90deg,#7C8B5A,#4A9B5F)' }}
            animate={{ width: `${riskPct}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      {/* La couche en cours */}
      <p className="text-[11px] font-bold text-[#3D3020] shrink-0">
        {tr(layer.name, layer.nameEn)} · {tr('couche', 'layer')} {depth + 1}/{LAYERS.length}
      </p>

      {/* Le tas à déblayer */}
      <div
        ref={gridRef}
        role="application"
        aria-label={tr('Tas de détritus : frottez pour déblayer', 'Pile of rubbish: rub to clear it')}
        className="relative w-full max-w-sm flex-1 min-h-[260px] rounded-xl overflow-hidden"
        style={{ touchAction: 'none', border: '3px solid #3A2A1E', background: '#241E18' }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); rubbingRef.current = true; rubAt(e.clientX, e.clientY); }}
        onPointerMove={(e) => { if (rubbingRef.current) rubAt(e.clientX, e.clientY); }}
        onPointerUp={() => { rubbingRef.current = false; }}
        onPointerCancel={() => { rubbingRef.current = false; }}
      >
        {/* Le fond du container, c'est le quartier où l'on fouille */}
        <div className="absolute inset-0 opacity-40">
          <LocationBackdrop location={char.location} />
        </div>
        <div className="absolute inset-0 bg-[#1C1710]/55" />

        <div
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: `repeat(${T.gridW}, 1fr)`, gridTemplateRows: `repeat(${T.gridH}, 1fr)` }}
        >
          {cells.map((c, i) => (
            <div key={`${depth}-${i}`} className="relative flex items-center justify-center">
              {/* ce que la case cachait */}
              {c.cleared && c.find && (
                <motion.span
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: c.find.kind === 'piege' ? 0.7 : 1 }}
                  className="text-xl"
                >
                  {c.find.emoji}
                </motion.span>
              )}
              {/* les détritus par-dessus */}
              <AnimatePresence>
                {!c.cleared && (
                  <motion.span
                    exit={{ opacity: 0, scale: 1.4, rotate: 25 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 flex items-center justify-center text-lg"
                    style={{
                      background: 'linear-gradient(150deg,#6B5B45,#4A3E2E)',
                      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.25)',
                      // Le flair fait transparaître ce qui pue avant qu'on y touche.
                      filter: flair && c.find?.kind === 'piege' ? 'hue-rotate(70deg) brightness(0.85)' : undefined,
                    }}
                  >
                    {c.muck}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* le nom de ce qu'on vient de sortir */}
        <AnimatePresence>
          {pop && (
            <motion.div
              key={pop.key}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: -6 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute left-0 right-0 bottom-3 text-center pointer-events-none z-20"
            >
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(24,18,14,0.8)',
                  color: pop.f.kind === 'piege' ? '#F09A8A' : pop.f.kind === 'trouvaille' ? '#C9B6FF' : '#7BD48A',
                }}
              >
                {pop.f.emoji} {tc(pop.f.name)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* fin de fouille */}
        <AnimatePresence>
          {ended && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-5"
              style={{ background: 'rgba(20,15,11,0.94)' }}
            >
              <div className="text-5xl mb-2">{ended.how === 'bust' ? ended.reason?.emoji : '♻️'}</div>
              <p className="text-base font-bold text-white leading-snug">
                {ended.how === 'bust'
                  ? tr(ended.reason?.fr || '', ended.reason?.en || '')
                  : tr('Vous ressortez du container avec votre butin.', 'You climb out of the bin with your haul.')}
              </p>
              {ended.how === 'out' && (
                <p className="text-xs text-white/80 mt-2">
                  ♻️ {centimes}c · 🔧 ×{bazar}{trouvailles.length > 0 ? ` · 💎 ×${trouvailles.length}` : ''}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* LA décision, toujours à l'écran */}
      <div className="w-full max-w-sm flex gap-2 shrink-0">
        <button
          onClick={() => finish('out')}
          disabled={!!ended}
          className="flex-1 btn-primary py-3 text-sm font-bold flex flex-col items-center leading-tight disabled:opacity-50"
        >
          <span>🪜 {tr('Remonter', 'Climb out')}</span>
          <span className="text-[9px] font-normal opacity-90">{tr('le butin est acquis', 'the haul is yours')}</span>
        </button>
        <button
          onClick={dig}
          disabled={!canDig || !!ended}
          className={`flex-1 action-btn py-3 text-sm font-bold flex flex-col items-center leading-tight ${canDig && !ended ? 'border-[#B84A3A]/50 text-[#B84A3A]' : 'opacity-45 text-[#8B6B4A]'}`}
        >
          <span>⛏️ {tr('Creuser', 'Dig deeper')}</span>
          <span className="text-[9px] font-normal">
            {depth >= LAYERS.length - 1
              ? tr('c\'est le fond', 'this is the bottom')
              : canDig && next
                ? tr(`+${next.entry}% d'un coup`, `+${next.entry}% at once`)
                : tr(`déblayez ${Math.round(T.clearToDig * 100)}%`, `clear ${Math.round(T.clearToDig * 100)}%`)}
          </span>
        </button>
      </div>
      <p className="text-[10px] text-[#A08B70] text-center shrink-0">
        {tr(`Déblayé : ${Math.round(clearedPct * 100)}% · tout est perdu si le tas se réveille`,
            `Cleared: ${Math.round(clearedPct * 100)}% · everything is lost if the pile wakes`)}
      </p>
    </div>
  );
}
