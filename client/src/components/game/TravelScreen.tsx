import { useGame, LOCATIONS, getShopsForLocation } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { playClick, playWhoosh } from '@/lib/sound';
import { useLang, tr, tc } from '@/lib/lang';

/*
 * Carte interactive de la ville, dessinée en SVG dans la DA Carton Craft
 * (trait feutre #3A2A1E, aplats chauds, papier kraft). On touche un quartier
 * pour le sélectionner, le panneau du bas affiche danger/ressources et le
 * bouton de voyage. La couronne dorée marque la position actuelle.
 */

const OUTLINE = '#3A2A1E';

interface ZoneShape {
  id: string;
  x: number; y: number; w: number; h: number;
  fill: string;
  // Position de l'icône dessinée à l'intérieur de la zone.
  icon: { x: number; y: number };
}

const ZONES: ZoneShape[] = [
  { id: 'parc', x: 14, y: 34, w: 150, h: 108, fill: '#B7CDA1', icon: { x: 89, y: 88 } },
  { id: 'gare', x: 208, y: 22, w: 138, h: 96, fill: '#D9BB8E', icon: { x: 277, y: 70 } },
  { id: 'centre-ville', x: 118, y: 154, w: 128, h: 92, fill: '#E3C9A4', icon: { x: 182, y: 200 } },
  { id: 'marche', x: 12, y: 190, w: 96, h: 104, fill: '#DFB394', icon: { x: 60, y: 242 } },
  { id: 'zone-industrielle', x: 256, y: 168, w: 92, h: 126, fill: '#C4BCAD', icon: { x: 302, y: 231 } },
];

function dangerColor(danger: number): string {
  return danger < 30 ? '#4A9B5F' : danger < 50 ? '#D4874D' : '#D94F4F';
}

// Petites illustrations de quartier, trait feutre.
function ZoneIcon({ id, x, y }: { id: string; x: number; y: number }) {
  const s = { stroke: OUTLINE, strokeWidth: 2, strokeLinejoin: 'round' as const };
  switch (id) {
    case 'parc':
      return (
        <g transform={`translate(${x} ${y})`}>
          <rect x="-4" y="6" width="8" height="14" rx="2" fill="#8A5A2A" {...s} />
          <circle cx="0" cy="-4" r="16" fill="#6B8E5A" {...s} />
          <rect x="-34" y="12" width="7" height="10" rx="2" fill="#8A5A2A" {...s} />
          <circle cx="-30" cy="4" r="11" fill="#7B9E6A" {...s} />
          <rect x="27" y="12" width="7" height="10" rx="2" fill="#8A5A2A" {...s} />
          <circle cx="31" cy="4" r="11" fill="#7B9E6A" {...s} />
        </g>
      );
    case 'gare':
      return (
        <g transform={`translate(${x} ${y})`}>
          <rect x="-30" y="-14" width="60" height="26" rx="4" fill="#C99A6A" {...s} />
          <path d="M-30 -14 L0 -30 L30 -14 Z" fill="#9B5B3A" {...s} />
          <rect x="-6" y="-4" width="12" height="16" rx="2" fill="#6B4A2C" {...s} />
          <line x1="-38" y1="22" x2="38" y2="22" stroke={OUTLINE} strokeWidth="2.5" />
          <line x1="-32" y1="18" x2="-32" y2="26" stroke={OUTLINE} strokeWidth="2" />
          <line x1="-16" y1="18" x2="-16" y2="26" stroke={OUTLINE} strokeWidth="2" />
          <line x1="0" y1="18" x2="0" y2="26" stroke={OUTLINE} strokeWidth="2" />
          <line x1="16" y1="18" x2="16" y2="26" stroke={OUTLINE} strokeWidth="2" />
          <line x1="32" y1="18" x2="32" y2="26" stroke={OUTLINE} strokeWidth="2" />
        </g>
      );
    case 'centre-ville':
      return (
        <g transform={`translate(${x} ${y})`}>
          <rect x="-34" y="-10" width="20" height="32" rx="2" fill="#C0814E" {...s} />
          <rect x="-10" y="-24" width="22" height="46" rx="2" fill="#B97C49" {...s} />
          <rect x="16" y="-2" width="18" height="24" rx="2" fill="#C99A6A" {...s} />
          {[-29, -21].map(wx => [-4, 6, 16].map(wy => (
            <rect key={`a${wx}${wy}`} x={wx} y={wy} width="5" height="5" fill="#FBE3A8" stroke="none" />
          )))}
          {[-5, 3].map(wx => [-18, -8, 2, 12].map(wy => (
            <rect key={`b${wx}${wy}`} x={wx} y={wy} width="5" height="5" fill="#FBE3A8" stroke="none" />
          )))}
        </g>
      );
    case 'marche':
      return (
        <g transform={`translate(${x} ${y})`}>
          <rect x="-26" y="0" width="52" height="20" rx="3" fill="#C99A6A" {...s} />
          <path d="M-32 0 L-32 -12 Q0 -22 32 -12 L32 0 Z" fill="#D94F4F" {...s} />
          <path d="M-20 -16.5 L-20 0 M-8 -18.5 L-8 0 M4 -18.5 L4 0 M16 -16.5 L16 0" stroke="#F5E6D3" strokeWidth="4" />
          <path d="M-32 0 L-32 -12 Q0 -22 32 -12 L32 0 Z" fill="none" {...s} />
        </g>
      );
    case 'zone-industrielle':
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d="M-28 22 L-28 -2 L-8 -14 L-8 -2 L12 -14 L12 22 Z" fill="#9B8E7A" {...s} />
          <rect x="16" y="-26" width="10" height="48" rx="2" fill="#8A5A2A" {...s} />
          <circle cx="21" cy="-34" r="5" fill="#D9D2C4" opacity="0.9" {...s} />
          <circle cx="28" cy="-42" r="4" fill="#D9D2C4" opacity="0.7" stroke="none" />
          <rect x="-22" y="4" width="8" height="8" fill="#FBE3A8" stroke="none" />
          <rect x="-6" y="4" width="8" height="8" fill="#FBE3A8" stroke="none" />
        </g>
      );
    default:
      return null;
  }
}

export default function TravelScreen() {
  const { state, dispatch } = useGame();
  const en = useLang() === 'en';
  const char = state.character!;
  const [selected, setSelected] = useState(char.location);

  const loc = LOCATIONS[selected];
  const isCurrent = selected === char.location;
  const currentZone = ZONES.find(z => z.id === char.location);
  const shops = getShopsForLocation(selected);

  return (
    <div className="min-h-screen bg-texture p-4 flex flex-col gap-3">
      <motion.div
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center pt-1"
      >
        <h2 className="text-xl text-[#2A1F1A]">{tr('Carte de la ville', 'City map')}</h2>
        <p className="text-xs text-[#8B6B4A]">{tr('Touchez un quartier pour le découvrir', 'Tap a district to explore it')}</p>
      </motion.div>

      {/* Carte */}
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="craft-card p-2 overflow-hidden"
      >
        <svg viewBox="0 0 360 310" className="w-full" role="img" aria-label="Carte des quartiers de la ville">
          {/* Papier de la carte */}
          <rect x="0" y="0" width="360" height="310" rx="10" fill="#F3E4CC" />
          <rect x="4" y="4" width="352" height="302" rx="8" fill="none" stroke="#D4B896" strokeWidth="1.5" strokeDasharray="6 4" />

          {/* Routes (pointillés feutre) */}
          <g stroke="#8B6B4A" strokeWidth="3" strokeDasharray="1 8" strokeLinecap="round" fill="none" opacity="0.75">
            <path d="M120 100 Q160 120 175 154" />
            <path d="M255 105 Q220 130 205 154" />
            <path d="M108 230 Q112 215 128 205" />
            <path d="M246 212 Q252 208 256 205" />
            <path d="M85 142 L78 190" />
            <path d="M280 118 Q290 140 296 168" />
          </g>

          {/* Quartiers */}
          {ZONES.map(z => {
            const l = LOCATIONS[z.id];
            const isSel = selected === z.id;
            return (
              <g key={z.id} onClick={() => { playClick(); setSelected(z.id); }} style={{ cursor: 'pointer' }}>
                <rect
                  x={z.x} y={z.y} width={z.w} height={z.h} rx="14"
                  fill={z.fill}
                  stroke={isSel ? '#B8860B' : OUTLINE}
                  strokeWidth={isSel ? 4 : 2.5}
                />
                <ZoneIcon id={z.id} x={z.icon.x} y={z.icon.y} />
                {/* Nom du quartier */}
                <text
                  x={z.x + z.w / 2} y={z.y + z.h - 8}
                  textAnchor="middle"
                  fontSize="11" fontWeight="600"
                  fill={OUTLINE}
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {en ? l.nameEn : l.name}
                </text>
                {/* Pastille de danger */}
                <circle cx={z.x + z.w - 12} cy={z.y + 12} r="6" fill={dangerColor(l.danger)} stroke={OUTLINE} strokeWidth="1.5" />
              </g>
            );
          })}

          {/* Couronne sur la position actuelle */}
          {currentZone && (
            <g transform={`translate(${currentZone.x + 18} ${currentZone.y + 16})`} pointerEvents="none">
              <motion.circle
                r="13"
                fill="none" stroke="#B8860B" strokeWidth="2"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                animate={{ scale: [0.82, 1.2], opacity: [0.8, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut' }}
              />
              <path d="M-9 4 L-9 -4 L-4.5 0 L0 -7 L4.5 0 L9 -4 L9 4 Z" fill="#E8B84B" stroke="#9B7209" strokeWidth="1.5" strokeLinejoin="round" />
              <rect x="-9" y="4" width="18" height="3.4" rx="1.5" fill="#D9A83A" stroke="#9B7209" strokeWidth="1.2" />
            </g>
          )}
        </svg>
      </motion.div>

      {/* Panneau du quartier sélectionné */}
      <motion.div
        key={selected}
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        className="craft-card p-4"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{loc.emoji}</span>
          <h3 className="text-lg text-[#2A1F1A]">{tr(loc.name, loc.nameEn)}</h3>
          {isCurrent && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#4A9B5F] text-white font-semibold">{tr('ICI', 'HERE')}</span>
          )}
        </div>
        <p className="text-xs text-[#6B5740] italic mb-3">{tr(loc.description, loc.descriptionEn)}</p>

        {/* Jauges danger / ressources */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-medium text-[#B84A3A] w-20">⚠️ {tr('Danger', 'Danger')}</span>
            <div className="flex-1 stat-bar-track">
              <div className="stat-bar-fill" style={{ width: `${loc.danger}%`, backgroundColor: dangerColor(loc.danger) }} />
            </div>
            <span className="text-[10px] font-mono text-[#6B5740] w-8 text-right">{loc.danger}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-medium text-[#3d8b4f] w-20">🎁 {tr('Ressources', 'Resources')}</span>
            <div className="flex-1 stat-bar-track">
              <div className="stat-bar-fill" style={{ width: `${loc.resources}%`, backgroundColor: '#4A9B5F' }} />
            </div>
            <span className="text-[10px] font-mono text-[#6B5740] w-8 text-right">{loc.resources}%</span>
          </div>
        </div>

        {/* Boutiques du quartier */}
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider text-[#A08B70] font-semibold mb-1.5">
            {tr('Boutiques sur place', 'Shops here')}
          </p>
          {shops.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {shops.map(shop => (
                <span
                  key={shop.id}
                  className="text-[11px] px-2 py-1 rounded-full font-medium text-[#6B5740]"
                  style={{ background: '#F5EDE4', border: '1px solid #E8D5C0' }}
                >
                  {shop.emoji} {tc(shop.name)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#A08B70] italic">{tr('Aucune boutique dans ce quartier.', 'No shops in this district.')}</p>
          )}
        </div>

        {isCurrent ? (
          <div className="text-center text-xs font-semibold text-[#4A9B5F] py-2.5">
            📍 {tr('Vous êtes déjà dans ce quartier.', 'You\'re already in this district.')}
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { playWhoosh(); dispatch({ type: 'TRAVEL', location: selected }); }}
            className="btn-primary w-full py-3 text-sm"
          >
            🚶 {tr('Voyager vers', 'Travel to')} {tr(loc.name, loc.nameEn)}
          </motion.button>
        )}
      </motion.div>

      <button
        onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'main' })}
        className="mt-auto action-btn py-3 text-sm font-semibold text-[#6B5740] flex items-center justify-center gap-1.5"
      >
        ← {tr('Retour', 'Back')}
      </button>
    </div>
  );
}
