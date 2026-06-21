import { useGame } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const SAVE_KEY = 'roi-du-carton-save';

export default function TitleScreen() {
  const { dispatch } = useGame();
  const [hasSave, setHasSave] = useState(false);

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
        className="w-full rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(42,31,26,0.12)]"
      >
        <CardboardCityHero />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center"
      >
        <h1 className="text-4xl text-[#2A1F1A] leading-tight">
          Le Roi du Carton
        </h1>
        <p className="text-sm text-[#8B6B4A] mt-1.5">
          Une Épopée Urbaine
        </p>
        <p className="text-xs text-[#A08B70] mt-3 max-w-xs mx-auto">
          Survivez dans la rue. Devenez une légende.
        </p>
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
            Continuer la partie
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
          Nouvelle Partie
        </motion.button>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: hasSave ? 0.7 : 0.6 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'settings' })}
          className="action-btn w-full py-3 text-sm text-[#6B5740] font-medium"
        >
          ⚙️ Options
        </motion.button>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-xs text-[#A08B70] text-center italic mt-2"
      >
        "La rue est dure, mais l'humour est plus dur."
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

function CardboardCityHero() {
  return (
    <svg viewBox="0 0 390 192" className="w-full h-48" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Une ville faite de cartons au coucher du soleil">
      <defs>
        <linearGradient id="rdc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7E3C6" />
          <stop offset="55%" stopColor="#EBB387" />
          <stop offset="100%" stopColor="#D88B57" />
        </linearGradient>
      </defs>
      <rect width="390" height="192" fill="url(#rdc-sky)" />
      {/* soleil bas */}
      <circle cx="316" cy="58" r="34" fill="#FBE7C0" opacity="0.85" />
      <circle cx="316" cy="58" r="22" fill="#FCEFD4" opacity="0.9" />
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
      {/* couronne sur l'immeuble le plus haut (le Roi du Carton) */}
      <g transform="translate(0,-2)">
        <path d="M122 70 L122 56 L130 63 L137 51 L144 63 L152 56 L152 70 Z" fill="#E8B84B" stroke="#9B7209" strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx="137" cy="50" r="2.6" fill="#F2D27A" stroke="#9B7209" strokeWidth="1" />
      </g>
      {/* rue */}
      <rect x="0" y="180" width="390" height="12" fill="#5A4636" />
    </svg>
  );
}
