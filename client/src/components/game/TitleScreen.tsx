import { useGame, getLegend } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLang, tr } from '@/lib/lang';
import { DEATH_DEFS, loadDeathBook, loadKarma, loadGraves, loadCrown } from '@/lib/necrology';
import { knownEnemyNames } from '@/contexts/GameContext';
import { getEquipped } from '@/lib/profile';
import CardboardAvatar from './CardboardAvatar';

const SAVE_KEY = 'roi-du-carton-save';

export default function TitleScreen() {
  const { state, dispatch } = useGame();
  useLang();
  const [hasSave, setHasSave] = useState(false);
  const legend = getLegend(state.highScores);
  // La lignée : tous les personnages joués, le plus récent d'abord. Elle
  // défile en procession sur la rue de l'illustration (voir StreetParade).
  const [lineage, setLineage] = useState<{ seed: string; gender: 'm' | 'f'; name: string; day: number; acc?: Record<string, string>; alive?: boolean }[]>([]);
  const crown = loadCrown();
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      const c = saved ? JSON.parse(saved).character : null;
      const graves = loadGraves();
      const list: typeof lineage = [];
      // Le personnage en cours ouvre la lignée (avec sa tenue actuelle).
      if (c?.seed) list.push({ seed: c.seed, gender: c.gender === 'f' ? 'f' : 'm', name: c.name, day: c.day ?? 1, acc: getEquipped() as Record<string, string>, alive: true });
      // Puis les défunts, chacun dans la tenue qu'il portait ce jour-là.
      for (const g of graves) list.push({ seed: g.seed, gender: g.gender === 'f' ? 'f' : 'm', name: g.name, day: g.day, acc: g.accessories });
      setLineage(list);
    } catch { /* silent */ }
  }, []);
  // Avancement du Registre des Morts + Karma de Rue (méta persistante).
  const deathsFound = Object.keys(loadDeathBook()).length;
  const deathsTotal = DEATH_DEFS.length + knownEnemyNames().length;
  const karma = loadKarma();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.character && data.character.alive) {
          setHasSave(true);
        }
      }
    } catch { /* silent */ }
  }, []);

  return (
    <div className="min-h-screen bg-texture flex flex-col items-center justify-center p-5 gap-5">
      {/* Hero Image */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="w-full rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(42,31,26,0.12)] relative"
      >
        <CardboardCityHero lineage={lineage} crownSeed={crown?.seed} />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center"
      >
        <h1 className="text-4xl text-[#2A1F1A] leading-tight">
          {tr('Le Roi du Carton', 'Cardboard King')}
        </h1>
        <p className="text-sm text-[#8B6B4A] mt-1.5">
          {tr('Une Épopée Urbaine', 'An Urban Epic')}
        </p>
        <p className="text-xs text-[#A08B70] mt-3 max-w-xs mx-auto">
          {tr('Survivez dans la rue. Devenez une légende.', 'Survive the streets. Become a legend.')}
        </p>
        {legend && (
          <p className="text-xs text-[#B8860B] font-semibold mt-2">
            👑 {tr('Légende à battre', 'Legend to beat')} : {legend.name}, {legend.days} {tr(legend.days > 1 ? 'jours' : 'jour', legend.days > 1 ? 'days' : 'day')}
          </p>
        )}
      </motion.div>

      {/* Buttons */}
      <div className="w-full flex flex-col gap-3 mt-2">
        {hasSave && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => dispatch({ type: 'CONTINUE_SAVE' })}
            className="w-full py-3.5 text-sm font-semibold text-white rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #4A9B5F, #3d8b4f)',
              boxShadow: '0 4px 16px rgba(74, 155, 95, 0.3)',
            }}
          >
            {tr('Continuer la partie', 'Continue')}
          </motion.button>
        )}

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: hasSave ? 0.6 : 0.5 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => dispatch({ type: 'START_GAME' })}
          className="btn-primary w-full py-3.5 text-sm"
        >
          {tr('Nouvelle Partie', 'New Game')}
        </motion.button>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: hasSave ? 0.7 : 0.6 }}
          className="flex gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'registre' })}
            className="action-btn flex-1 py-3 text-sm text-[#6B5740] font-medium flex flex-col items-center leading-tight"
          >
            <span>📕 {tr('Registre', 'Registry')}</span>
            <span className="text-[10px] font-mono text-[#A08B70]">{deathsFound}/{deathsTotal}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'cimetiere' })}
            className="action-btn flex-1 py-3 text-sm text-[#6B5740] font-medium flex flex-col items-center leading-tight"
          >
            <span>⚰️ {tr('Cimetière', 'Cemetery')}</span>
            <span className="text-[10px] font-mono text-[#A08B70]">👑 {karma}</span>
          </motion.button>
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: hasSave ? 0.8 : 0.7 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'settings' })}
          className="action-btn w-full py-3 text-sm text-[#6B5740] font-medium"
        >
          ⚙️ {tr('Options', 'Settings')}
        </motion.button>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-xs text-[#A08B70] text-center italic mt-2"
      >
        {tr('« La rue est dure, mais l\'humour est plus dur. »', '"The street is hard, but humor is harder."')}
      </motion.p>
    </div>
  );
}

// Illustration "ville en carton" entièrement intégrée (SVG) :
// pas de dépendance à un CDN externe, donc elle s'affiche toujours.
function CardboardBuilding({ x, w, top, fill }: { x: number; w: number; top: number; fill: string }) {
  const h = 192 - top;
  const cols = Math.max(2, Math.floor(w / 18));
  const rows = Math.max(2, Math.floor((h - 18) / 22));
  const winW = 7;
  const gap = 6;
  const padX = (w - (cols * (winW + gap) - gap)) / 2;
  const wins = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = (r * 7 + c * 3) % 4 !== 0;
      wins.push(
        <rect
          key={`${r}-${c}`}
          x={x + padX + c * (winW + gap)}
          y={top + 12 + r * 22}
          width={winW}
          height={9}
          rx={1}
          fill={lit ? '#FBE3A8' : '#6E4F38'}
          opacity={lit ? 0.95 : 0.55}
        />,
      );
    }
  }
  return (
    <g>
      <rect x={x} y={top} width={w} height={h} rx={2} fill={fill} />
      <rect x={x} y={top} width={w} height={5} fill="#00000022" />
      {/* bande de scotch */}
      <rect x={x} y={top + h * 0.42} width={w} height={9} fill="#EAD3B0" opacity={0.4} />
      {wins}
    </g>
  );
}

// ---- Cycle jour/nuit de l'écran-titre ----
// La ville vit en boucle (~40 s) : jour → coucher de soleil → nuit étoilée →
// aube. Tout est interpolé entre ces étapes : couleurs du ciel, course du
// soleil, lever de lune, étoiles, voile nocturne sur les immeubles.
interface SkyKey { t: number; top: string; mid: string; bot: string; overlay: number; sun: number; moon: number; stars: number; sunY: number; moonY: number }
const SKY_KEYS: SkyKey[] = [
  { t: 0.00, top: '#AED4E6', mid: '#DCE6CB', bot: '#F0DFC0', overlay: 0.00, sun: 0.9, moon: 0, stars: 0, sunY: 36, moonY: 150 },
  { t: 0.28, top: '#F7E3C6', mid: '#EBB387', bot: '#D88B57', overlay: 0.04, sun: 0.85, moon: 0, stars: 0, sunY: 64, moonY: 140 },
  { t: 0.42, top: '#8A5D74', mid: '#B76A56', bot: '#7E4A44', overlay: 0.16, sun: 0.35, moon: 0.25, stars: 0.2, sunY: 96, moonY: 84 },
  { t: 0.52, top: '#232B4A', mid: '#2E3A5C', bot: '#3A4668', overlay: 0.34, sun: 0, moon: 0.9, stars: 0.95, sunY: 130, moonY: 46 },
  { t: 0.78, top: '#202846', mid: '#2B3758', bot: '#374363', overlay: 0.34, sun: 0, moon: 0.85, stars: 0.9, sunY: 130, moonY: 58 },
  { t: 0.90, top: '#D9C4D6', mid: '#EFC7A2', bot: '#E2A171', overlay: 0.10, sun: 0.35, moon: 0.25, stars: 0.2, sunY: 98, moonY: 104 },
  { t: 1.00, top: '#AED4E6', mid: '#DCE6CB', bot: '#F0DFC0', overlay: 0.00, sun: 0.9, moon: 0, stars: 0, sunY: 36, moonY: 150 },
];
const STARS = [
  [30, 24], [74, 40], [118, 18], [158, 34], [196, 22], [238, 44], [268, 16], [302, 36], [348, 26], [372, 48], [52, 58], [214, 60],
] as const;

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
function mixHex(a: string, b: string, k: number): string {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp(pa >> 16, pb >> 16, k));
  const g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, k));
  const bl = Math.round(lerp(pa & 255, pb & 255, k));
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0')}`;
}
function sampleSky(t: number): SkyKey {
  let i = 0;
  while (i < SKY_KEYS.length - 2 && SKY_KEYS[i + 1].t < t) i++;
  const a = SKY_KEYS[i], b = SKY_KEYS[i + 1];
  const k = (t - a.t) / (b.t - a.t || 1);
  return {
    t,
    top: mixHex(a.top, b.top, k), mid: mixHex(a.mid, b.mid, k), bot: mixHex(a.bot, b.bot, k),
    overlay: lerp(a.overlay, b.overlay, k),
    sun: lerp(a.sun, b.sun, k), moon: lerp(a.moon, b.moon, k), stars: lerp(a.stars, b.stars, k),
    sunY: lerp(a.sunY, b.sunY, k), moonY: lerp(a.moonY, b.moonY, k),
  };
}

// La procession : tous les personnages joués traversent la rue de l'écran
// titre. Les défunts sont grisés et translucides, comme des fantômes ; le
// personnage en vie passe en couleur, un peu plus grand, bien vivant.
type Walker = { seed: string; gender: 'm' | 'f'; name: string; day: number; acc?: Record<string, string>; alive?: boolean };

function StreetParade({ lineage, crownSeed }: { lineage: Walker[]; crownSeed?: string }) {
  if (!lineage.length) return null;
  const SPACING = 3.1;                                   // secondes entre deux marcheurs
  const WALK = 17;                                       // durée d'une traversée
  const cycle = Math.max(lineage.length * SPACING, WALK + 2.5);
  // On fait défiler du plus ancien au plus récent : le vivant ferme la marche.
  const order = [...lineage].reverse();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {order.map((p, i) => {
        const reigns = crownSeed && crownSeed === p.seed;
        const size = p.alive ? 34 : 28;
        return (
          <motion.div
            key={`${p.seed}-${i}`}
            className="absolute"
            style={{ bottom: p.alive ? 13 : 17, left: -46 }}
            initial={{ x: 0 }}
            animate={{ x: 436 }}
            transition={{ duration: WALK, ease: 'linear', repeat: Infinity, repeatDelay: cycle - WALK, delay: i * SPACING }}
          >
            {/* petit balancement de marche */}
            <motion.div
              animate={{ y: [0, -2.5, 0], rotate: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 0.62, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <div
                  className="rounded-full overflow-hidden"
                  style={{
                    width: size, height: size,
                    border: `2px solid ${reigns ? '#FFD34E' : p.alive ? '#F5EEDC' : '#C9BDA8'}`,
                    filter: p.alive ? 'none' : 'grayscale(1)',
                    opacity: p.alive ? 1 : 0.58,
                    boxShadow: p.alive ? '0 3px 10px rgba(0,0,0,0.35)' : 'none',
                  }}
                >
                  <CardboardAvatar seed={p.seed} gender={p.gender} size={size} accessories={p.acc} />
                </div>
                {reigns && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-sm drop-shadow">👑</span>}
              </div>
              {/* Le vivant dit son nom ; les fantômes passent en silence. */}
              {p.alive && (
                <span className="mt-0.5 text-[8px] font-semibold text-white px-1.5 rounded-full bg-black/45 whitespace-nowrap">
                  {p.name} · {p.day}j
                </span>
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

function CardboardCityHero({ lineage = [], crownSeed }: { lineage?: Walker[]; crownSeed?: string }) {
  // On démarre au coucher de soleil (l'identité visuelle du jeu), puis ça vit.
  const [t, setT] = useState(0.28);
  useEffect(() => {
    const id = setInterval(() => setT(v => (v + 0.125 / 40) % 1), 125);
    return () => clearInterval(id);
  }, []);
  const k = sampleSky(t);

  return (
    <div className="relative w-full h-48 overflow-hidden">
    <svg viewBox="0 0 390 192" className="w-full h-48" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Une ville faite de cartons, du jour à la nuit">
      <defs>
        <linearGradient id="rdc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={k.top} />
          <stop offset="55%" stopColor={k.mid} />
          <stop offset="100%" stopColor={k.bot} />
        </linearGradient>
      </defs>
      <rect width="390" height="192" fill="url(#rdc-sky)" />
      {/* étoiles (nuit) */}
      <g opacity={k.stars}>
        {STARS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.5 : 1} fill="#F5EEDC" />
        ))}
      </g>
      {/* soleil : descend et s'éteint le soir */}
      <g opacity={k.sun}>
        <circle cx="316" cy={k.sunY} r="34" fill="#FBE7C0" opacity="0.85" />
        <circle cx="316" cy={k.sunY} r="22" fill="#FCEFD4" opacity="0.9" />
      </g>
      {/* lune (croissant) : se lève la nuit */}
      <g opacity={k.moon}>
        <circle cx="76" cy={k.moonY} r="16" fill="#F1E9D2" />
        <circle cx="83" cy={k.moonY - 4} r="14" fill={k.top} />
      </g>
      {/* nuages en carton qui dérivent, discrets la nuit */}
      <motion.g
        opacity={0.5 - k.stars * 0.35}
        initial={{ x: -120 }}
        animate={{ x: 420 }}
        transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
      >
        <ellipse cx="0" cy="40" rx="34" ry="10" fill="#FFFFFF" opacity="0.8" />
        <ellipse cx="24" cy="35" rx="22" ry="8" fill="#FFFFFF" opacity="0.7" />
      </motion.g>
      <motion.g
        opacity={0.4 - k.stars * 0.3}
        initial={{ x: 180 }}
        animate={{ x: 540 }}
        transition={{ duration: 95, repeat: Infinity, ease: 'linear' }}
      >
        <ellipse cx="-260" cy="70" rx="28" ry="8" fill="#FFFFFF" opacity="0.75" />
      </motion.g>
      {/* immeubles lointains, brumeux */}
      <g opacity="0.45">
        <rect x="0" y="110" width="60" height="82" fill="#C98A56" />
        <rect x="150" y="118" width="70" height="74" fill="#C98A56" />
        <rect x="300" y="112" width="90" height="80" fill="#C98A56" />
      </g>
      {/* immeubles en carton au premier plan */}
      <CardboardBuilding x={6} w={52} top={92} fill="#B97C49" />
      <CardboardBuilding x={62} w={42} top={122} fill="#A86C3C" />
      <CardboardBuilding x={108} w={58} top={70} fill="#C0814E" />
      <CardboardBuilding x={172} w={46} top={112} fill="#A86C3C" />
      <CardboardBuilding x={222} w={52} top={88} fill="#B97C49" />
      <CardboardBuilding x={278} w={42} top={126} fill="#9B5B3A" />
      <CardboardBuilding x={324} w={60} top={100} fill="#B97C49" />
      {/* voile nocturne : la ville s'assombrit, les fenêtres ressortent */}
      <rect width="390" height="192" fill="#141B38" opacity={k.overlay} />
      {/* couronne sur l'immeuble le plus haut (le Roi du Carton) */}
      <g transform="translate(0,-2)">
        <path d="M122 70 L122 56 L130 63 L137 51 L144 63 L152 56 L152 70 Z" fill="#E8B84B" stroke="#9B7209" strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx="137" cy="50" r="2.6" fill="#F2D27A" stroke="#9B7209" strokeWidth="1" />
      </g>
      {/* rue */}
      <rect x="0" y="180" width="390" height="12" fill="#5A4636" />
    </svg>
    {/* La lignée du joueur défile sur cette rue. */}
    <StreetParade lineage={lineage} crownSeed={crownSeed} />
    </div>
  );
}
