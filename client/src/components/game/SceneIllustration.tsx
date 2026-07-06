/*
 * Illustrations d'événements générées en SVG, dans la direction artistique
 * « carton » (crème, brun, or, contour marqueur). Aucune image externe : chaque
 * scène est dessinée par le code, à plat, avec un gros contour façon feutre.
 *
 * On choisit la scène à partir des mots-clés du texte de l'événement/résultat
 * (sceneFor). Ainsi, chaque rencontre reçoit une vignette cohérente sans avoir
 * à stocker une image par événement.
 */

import { motion } from 'framer-motion';
import { paperSway } from '@/lib/anim';

const OUTLINE = '#3A2A1E';
const CREAM = '#FBF6F0';
const BROWN = '#C4723A';
const GOLD = '#B8860B';
const GREEN = '#6B8E5A';
const BLUE = '#4A8FBF';
const RED = '#D94F4F';
const CARD = '#D8B98C'; // teinte carton

export type SceneTheme =
  | 'coins' | 'food' | 'fight' | 'police' | 'night' | 'rain'
  | 'cat' | 'trash' | 'shop' | 'friend' | 'discovery' | 'sun'
  | 'street'
  // Décors de quartier (bannière de l'écran principal)
  | 'park' | 'downtown' | 'industrial' | 'station' | 'market';

// Décor par quartier (voir LOCATIONS).
const LOCATION_SCENE: Record<string, SceneTheme> = {
  'parc': 'park',
  'centre-ville': 'downtown',
  'zone-industrielle': 'industrial',
  'gare': 'station',
  'marche': 'market',
};

export function sceneForLocation(locationId: string): SceneTheme {
  return LOCATION_SCENE[locationId] ?? 'street';
}

// Chaque scène est une liste de mots-clés (français, minuscules, sans accents
// gérés séparément) ; le premier thème dont un mot apparaît l'emporte.
const KEYWORDS: [SceneTheme, string[]][] = [
  ['police', ['polic', 'flic', 'agent', 'gendarme', 'garde a vue', 'amende', 'menotte', 'arrete']],
  ['fight', ['bagarre', 'coup', 'frappe', 'baston', 'voyou', 'raclee', 'combat', 'poing', 'blesse', 'amoche', 'castagne']],
  ['coins', ['€', 'euro', 'piece', 'billet', 'argent', 'monnaie', 'pactole', 'jackpot', 'porte-monnaie', 'gagne', 'revente', 'revend']],
  ['food', ['mange', 'nourriture', 'pain', 'sandwich', 'repas', 'soupe', 'faim', 'boulanger', 'conserve', 'cantine', 'restaurant', 'boit', 'boire']],
  ['cat', ['chat', 'chaton', 'felin', 'matou', 'chien', 'animal']],
  ['trash', ['poubelle', 'benne', 'dechet', 'recup', 'ordure', 'container', 'trie', 'recycl']],
  ['shop', ['boutique', 'magasin', 'commerc', 'echoppe', 'epicerie', 'vitrine', 'marche']],
  ['rain', ['pluie', 'orage', 'averse', 'trempe', 'mouille', 'tempete', 'deluge']],
  ['night', ['nuit', 'dort', 'dormir', 'sommeil', 'carton', 'endort', 'reveil', 'lune', 'etoile']],
  ['sun', ['soleil', 'chaleur', 'beau temps', 'ensoleill', 'canicule', 'rayon']],
  ['friend', ['ami', 'rencontre', 'inconnu', 'passant', 'vieux', 'vieille', 'aide', 'donne', 'sourit', 'discute', 'parle', 'partage', 'musicien', 'pecheur', 'jardinier']],
  ['discovery', ['trouve', 'decouvre', 'fouille', 'objet', 'cache', 'tresor', 'ramasse', 'deniche']],
];

// Retire les accents pour une recherche de mots-clés robuste.
function deburr(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function sceneFor(text: string, fallback: SceneTheme = 'street'): SceneTheme {
  const t = deburr(text);
  for (const [theme, words] of KEYWORDS) {
    for (const w of words) {
      if (t.includes(w)) return theme;
    }
  }
  return fallback;
}

// Toit crénelé d'immeuble simple, réutilisé en fond.
function skyline() {
  return (
    <g>
      <rect x="8" y="70" width="60" height="60" rx="3" fill={CARD} stroke={OUTLINE} strokeWidth="2.5" />
      <rect x="74" y="52" width="52" height="78" rx="3" fill="#E8CBA0" stroke={OUTLINE} strokeWidth="2.5" />
      <rect x="132" y="64" width="60" height="66" rx="3" fill={CARD} stroke={OUTLINE} strokeWidth="2.5" />
      {[18, 34, 50].map((x) => <rect key={`a${x}`} x={x} y="82" width="10" height="12" fill={CREAM} stroke={OUTLINE} strokeWidth="1.6" />)}
      {[84, 100, 116].map((x) => <rect key={`b${x}`} x={x} y="66" width="10" height="12" fill={CREAM} stroke={OUTLINE} strokeWidth="1.6" />)}
      {[144, 160, 176].map((x) => <rect key={`c${x}`} x={x} y="78" width="10" height="12" fill={CREAM} stroke={OUTLINE} strokeWidth="1.6" />)}
    </g>
  );
}

function coin(cx: number, cy: number, r: number) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={GOLD} stroke={OUTLINE} strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r={r - 4} fill="none" stroke="#8B6B0A" strokeWidth="1.4" />
      <text x={cx} y={cy + r * 0.32} textAnchor="middle" fontSize={r * 0.9} fontWeight="bold" fill="#8B6B0A">€</text>
    </g>
  );
}

function SceneBody({ theme }: { theme: SceneTheme }) {
  switch (theme) {
    case 'coins':
      return (
        <g>
          {skyline()}
          <ellipse cx="100" cy="118" rx="66" ry="12" fill="#000" opacity="0.06" />
          {coin(66, 96, 20)}
          {coin(104, 104, 24)}
          {coin(140, 92, 18)}
          <path d="M52 118 q48 -22 96 0" fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        </g>
      );
    case 'food':
      return (
        <g>
          {skyline()}
          {/* Baguette */}
          <g transform="rotate(-18 100 96)">
            <rect x="46" y="86" width="108" height="22" rx="11" fill="#E0A24B" stroke={OUTLINE} strokeWidth="2.5" />
            {[64, 84, 104, 124].map((x) => <line key={x} x1={x} y1="90" x2={x + 6} y2="104" stroke={OUTLINE} strokeWidth="1.6" />)}
          </g>
          {/* Boîte de conserve */}
          <rect x="120" y="96" width="30" height="30" rx="3" fill={RED} stroke={OUTLINE} strokeWidth="2.5" />
          <rect x="120" y="102" width="30" height="12" fill={CREAM} opacity="0.85" />
        </g>
      );
    case 'fight':
      return (
        <g>
          {skyline()}
          {/* Étoile d'impact */}
          <path d="M100 60 l10 22 24 3 -18 16 6 24 -22 -12 -22 12 6 -24 -18 -16 24 -3 z" fill={RED} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
          <text x="100" y="104" textAnchor="middle" fontSize="20" fontWeight="bold" fill={CREAM}>POW</text>
          {/* Pansement */}
          <g transform="rotate(28 150 108)">
            <rect x="132" y="100" width="36" height="16" rx="8" fill="#F0D9B8" stroke={OUTLINE} strokeWidth="2.2" />
            <rect x="146" y="100" width="8" height="16" fill="#E0C39A" stroke={OUTLINE} strokeWidth="1.4" />
          </g>
        </g>
      );
    case 'police':
      return (
        <g>
          {skyline()}
          {/* Casquette */}
          <path d="M60 108 q40 -40 80 0 z" fill={BLUE} stroke={OUTLINE} strokeWidth="2.5" />
          <rect x="52" y="106" width="96" height="12" rx="5" fill="#3A6E97" stroke={OUTLINE} strokeWidth="2.5" />
          <circle cx="100" cy="82" r="8" fill={GOLD} stroke={OUTLINE} strokeWidth="2" />
          {/* Gyrophare */}
          <rect x="150" y="70" width="20" height="14" rx="3" fill={RED} stroke={OUTLINE} strokeWidth="2.2" />
          <path d="M150 70 l10 -12 10 12" fill={RED} stroke={OUTLINE} strokeWidth="2.2" strokeLinejoin="round" />
        </g>
      );
    case 'night':
      return (
        <g>
          <rect x="0" y="0" width="200" height="130" fill="#2E3A4E" />
          <circle cx="150" cy="42" r="20" fill="#F2E3B0" stroke={OUTLINE} strokeWidth="2" />
          <circle cx="142" cy="38" r="18" fill="#2E3A4E" />
          {[[40, 30], [70, 20], [110, 34], [176, 78], [30, 64]].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y - 4} l1.5 3 3 1 -3 1 -1.5 3 -1.5 -3 -3 -1 3 -1 z`} fill="#F2E3B0" />
          ))}
          {/* Carton-lit */}
          <rect x="46" y="96" width="108" height="30" rx="4" fill={CARD} stroke={OUTLINE} strokeWidth="2.5" />
          <line x1="100" y1="96" x2="100" y2="126" stroke={OUTLINE} strokeWidth="1.6" />
          <path d="M60 96 q40 -14 80 0" fill="none" stroke={OUTLINE} strokeWidth="1.6" opacity="0.5" />
        </g>
      );
    case 'rain':
      return (
        <g>
          {skyline()}
          <ellipse cx="96" cy="52" rx="46" ry="24" fill="#B8C2CC" stroke={OUTLINE} strokeWidth="2.5" />
          <ellipse cx="132" cy="56" rx="30" ry="18" fill="#C8D0D8" stroke={OUTLINE} strokeWidth="2.5" />
          {[64, 84, 104, 124, 144].map((x, i) => (
            <line key={x} x1={x} y1={72 + (i % 2) * 6} x2={x - 6} y2={92 + (i % 2) * 6} stroke={BLUE} strokeWidth="3" strokeLinecap="round" />
          ))}
        </g>
      );
    case 'cat':
      return (
        <g>
          {skyline()}
          <ellipse cx="100" cy="120" rx="48" ry="10" fill="#000" opacity="0.06" />
          {/* Corps chat */}
          <path d="M74 118 q-4 -40 26 -40 q30 0 26 40 z" fill="#6B5748" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M80 82 l-6 -16 14 8 z" fill="#6B5748" stroke={OUTLINE} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M120 82 l6 -16 -14 8 z" fill="#6B5748" stroke={OUTLINE} strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="90" cy="98" r="3.5" fill={GREEN} />
          <circle cx="110" cy="98" r="3.5" fill={GREEN} />
          <path d="M96 106 q4 4 8 0" fill="none" stroke={OUTLINE} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M148 116 q18 -6 10 -26" fill="none" stroke="#6B5748" strokeWidth="7" strokeLinecap="round" />
          <path d="M148 116 q18 -6 10 -26" fill="none" stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        </g>
      );
    case 'trash':
      return (
        <g>
          {skyline()}
          <path d="M64 78 h72 l-8 50 h-56 z" fill={GREEN} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="58" y="70" width="84" height="12" rx="4" fill="#5A7A4B" stroke={OUTLINE} strokeWidth="2.5" />
          <rect x="92" y="60" width="16" height="12" rx="3" fill="#5A7A4B" stroke={OUTLINE} strokeWidth="2.5" />
          {/* Symbole recyclage */}
          <g transform="translate(100 104)" stroke={CREAM} strokeWidth="2.4" fill="none" strokeLinecap="round">
            <path d="M-9 3 l4 -8 4 3" />
            <path d="M9 3 l-1 -9 -5 2" />
            <path d="M-4 10 l6 6 3 -5" />
          </g>
        </g>
      );
    case 'shop':
      return (
        <g>
          <rect x="0" y="0" width="200" height="130" fill={CREAM} />
          <rect x="34" y="54" width="132" height="72" fill="#EBD3B4" stroke={OUTLINE} strokeWidth="2.5" />
          {/* Store */}
          <path d="M28 54 h144 l-6 20 h-132 z" fill={BROWN} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
          {[36, 58, 80, 102, 124, 146].map((x) => <rect key={x} x={x} y="54" width="22" height="20" fill={x % 44 === 36 || x === 80 || x === 124 ? CREAM : BROWN} opacity="0.9" />)}
          {/* Vitrine + porte */}
          <rect x="44" y="84" width="40" height="42" fill="#CFE3EC" stroke={OUTLINE} strokeWidth="2.2" />
          <rect x="116" y="84" width="34" height="42" rx="2" fill={CARD} stroke={OUTLINE} strokeWidth="2.2" />
          <circle cx="122" cy="106" r="2.4" fill={OUTLINE} />
        </g>
      );
    case 'friend':
      return (
        <g>
          {skyline()}
          <ellipse cx="100" cy="122" rx="60" ry="10" fill="#000" opacity="0.06" />
          {/* Deux silhouettes */}
          <g>
            <circle cx="78" cy="72" r="13" fill="#EAD0A8" stroke={OUTLINE} strokeWidth="2.5" />
            <path d="M62 124 q0 -34 16 -34 q16 0 16 34 z" fill={BROWN} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
          </g>
          <g>
            <circle cx="124" cy="72" r="13" fill="#DDB483" stroke={OUTLINE} strokeWidth="2.5" />
            <path d="M108 124 q0 -34 16 -34 q16 0 16 34 z" fill={GREEN} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
          </g>
          {/* Poignée de main */}
          <path d="M92 104 h18" stroke={OUTLINE} strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case 'discovery':
      return (
        <g>
          {skyline()}
          {/* Loupe */}
          <circle cx="94" cy="86" r="26" fill="#CFE3EC" stroke={OUTLINE} strokeWidth="3" />
          <circle cx="94" cy="86" r="26" fill="none" stroke={CREAM} strokeWidth="1.5" opacity="0.6" />
          <rect x="112" y="104" width="26" height="9" rx="4" transform="rotate(45 112 104)" fill={BROWN} stroke={OUTLINE} strokeWidth="2.5" />
          {/* Étincelles */}
          {[[92, 84], [98, 90], [88, 92]].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y - 5} l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6 z`} fill={GOLD} />
          ))}
        </g>
      );
    case 'sun':
      return (
        <g>
          {skyline()}
          <circle cx="150" cy="46" r="20" fill={GOLD} stroke={OUTLINE} strokeWidth="2.5" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (Math.PI / 4) * i;
            const x1 = 150 + Math.cos(a) * 26, y1 = 46 + Math.sin(a) * 26;
            const x2 = 150 + Math.cos(a) * 36, y2 = 46 + Math.sin(a) * 36;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={GOLD} strokeWidth="3" strokeLinecap="round" />;
          })}
        </g>
      );
    case 'park':
      return (
        <g>
          <rect x="0" y="0" width="200" height="130" fill="#DCEAD3" />
          <circle cx="164" cy="34" r="15" fill={GOLD} stroke={OUTLINE} strokeWidth="2.2" />
          {/* Arbres */}
          {[[40, 96], [150, 100]].map(([x, y], i) => (
            <g key={i}>
              <rect x={x - 4} y={y} width="8" height="24" fill="#8A5A2A" stroke={OUTLINE} strokeWidth="2" />
              <circle cx={x} cy={y - 6} r="22" fill={GREEN} stroke={OUTLINE} strokeWidth="2.5" />
              <circle cx={x - 12} cy={y + 2} r="14" fill="#7BA05B" stroke={OUTLINE} strokeWidth="2.2" />
              <circle cx={x + 12} cy={y + 2} r="14" fill="#7BA05B" stroke={OUTLINE} strokeWidth="2.2" />
            </g>
          ))}
          {/* Banc */}
          <g>
            <rect x="80" y="104" width="44" height="7" rx="2" fill={BROWN} stroke={OUTLINE} strokeWidth="2.2" />
            <rect x="80" y="94" width="44" height="6" rx="2" fill={BROWN} stroke={OUTLINE} strokeWidth="2.2" />
            <rect x="84" y="111" width="5" height="12" fill={OUTLINE} />
            <rect x="115" y="111" width="5" height="12" fill={OUTLINE} />
          </g>
          <rect x="0" y="122" width="200" height="8" fill="#8FAe78" />
        </g>
      );
    case 'downtown':
      return (
        <g>
          <rect x="0" y="0" width="200" height="130" fill="#EAD9C2" />
          <rect x="6" y="40" width="40" height="90" rx="2" fill="#D8B98C" stroke={OUTLINE} strokeWidth="2.5" />
          <rect x="52" y="20" width="44" height="110" rx="2" fill="#E8CBA0" stroke={OUTLINE} strokeWidth="2.5" />
          <rect x="102" y="52" width="40" height="78" rx="2" fill="#D8B98C" stroke={OUTLINE} strokeWidth="2.5" />
          <rect x="148" y="30" width="46" height="100" rx="2" fill="#E8CBA0" stroke={OUTLINE} strokeWidth="2.5" />
          {[[10, 48], [58, 28], [108, 60], [154, 38]].flatMap(([bx, by], b) =>
            Array.from({ length: 8 }, (_, i) => {
              const r = Math.floor(i / 2), c = i % 2;
              return <rect key={`${b}-${i}`} x={bx + 6 + c * 16} y={by + 6 + r * 18} width="9" height="11" fill={CREAM} stroke={OUTLINE} strokeWidth="1.3" />;
            }),
          )}
          <rect x="0" y="124" width="200" height="6" fill="#CBB79A" />
        </g>
      );
    case 'industrial':
      return (
        <g>
          <rect x="0" y="0" width="200" height="130" fill="#E4D3BC" />
          {/* Usine */}
          <rect x="20" y="70" width="120" height="60" fill="#B99A78" stroke={OUTLINE} strokeWidth="2.5" />
          <path d="M20 70 l16 -16 16 16 16 -16 16 16 16 -16 16 16 16 -16 16 16" fill="#B99A78" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
          {/* Cheminée + fumée */}
          <rect x="150" y="46" width="20" height="84" fill="#9B7A58" stroke={OUTLINE} strokeWidth="2.5" />
          <rect x="148" y="42" width="24" height="8" fill="#7C5E3E" stroke={OUTLINE} strokeWidth="2.2" />
          {[[160, 30, 10], [172, 18, 8], [156, 12, 7]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#C9BBA9" stroke={OUTLINE} strokeWidth="1.8" opacity="0.85" />
          ))}
          {[30, 54, 78, 102].map((x) => <rect key={x} x={x} y="86" width="14" height="16" fill="#7FA0B0" stroke={OUTLINE} strokeWidth="1.6" />)}
          <rect x="0" y="124" width="200" height="6" fill="#B0987C" />
        </g>
      );
    case 'station':
      return (
        <g>
          <rect x="0" y="0" width="200" height="130" fill="#E7D6BF" />
          {/* Halle */}
          <rect x="10" y="34" width="180" height="14" rx="4" fill={BROWN} stroke={OUTLINE} strokeWidth="2.5" />
          <line x1="26" y1="48" x2="26" y2="120" stroke={OUTLINE} strokeWidth="3" />
          <line x1="174" y1="48" x2="174" y2="120" stroke={OUTLINE} strokeWidth="3" />
          {/* Train */}
          <rect x="42" y="70" width="116" height="42" rx="7" fill="#9B5B3A" stroke={OUTLINE} strokeWidth="2.5" />
          <rect x="50" y="78" width="24" height="18" rx="3" fill="#CFE3EC" stroke={OUTLINE} strokeWidth="2" />
          <rect x="86" y="78" width="24" height="18" rx="3" fill="#CFE3EC" stroke={OUTLINE} strokeWidth="2" />
          <circle cx="130" cy="88" r="10" fill={GOLD} stroke={OUTLINE} strokeWidth="2" />
          <circle cx="62" cy="116" r="7" fill="#3A2A1E" stroke={OUTLINE} strokeWidth="2" />
          <circle cx="140" cy="116" r="7" fill="#3A2A1E" stroke={OUTLINE} strokeWidth="2" />
          <rect x="0" y="122" width="200" height="8" fill="#CBB79A" />
        </g>
      );
    case 'market':
      return (
        <g>
          {skyline()}
          {/* Étals avec auvents rayés */}
          {[[26, BROWN], [96, RED], [150, GREEN]].map(([x, col], i) => (
            <g key={i}>
              <rect x={Number(x)} y="78" width="44" height="48" fill="#E8CBA0" stroke={OUTLINE} strokeWidth="2.2" />
              <path d={`M${Number(x) - 4} 78 h52 l-6 -14 h-40 z`} fill={col as string} stroke={OUTLINE} strokeWidth="2.2" strokeLinejoin="round" />
              {[0, 1, 2].map((s) => <rect key={s} x={Number(x) + 2 + s * 14} y="64" width="7" height="14" fill={CREAM} opacity="0.5" />)}
              <circle cx={Number(x) + 12} cy="94" r="4" fill={RED} stroke={OUTLINE} strokeWidth="1.4" />
              <circle cx={Number(x) + 24} cy="94" r="4" fill={GOLD} stroke={OUTLINE} strokeWidth="1.4" />
              <circle cx={Number(x) + 18} cy="104" r="4" fill={GREEN} stroke={OUTLINE} strokeWidth="1.4" />
            </g>
          ))}
          <rect x="0" y="124" width="200" height="6" fill="#CBB79A" />
        </g>
      );
    case 'street':
    default:
      return (
        <g>
          {skyline()}
          {/* Lampadaire */}
          <line x1="168" y1="130" x2="168" y2="58" stroke={OUTLINE} strokeWidth="3" />
          <path d="M168 58 q0 -8 12 -8" fill="none" stroke={OUTLINE} strokeWidth="3" />
          <circle cx="182" cy="54" r="6" fill={GOLD} stroke={OUTLINE} strokeWidth="2" />
          {/* Trottoir */}
          <rect x="0" y="122" width="200" height="8" fill="#CBB79A" />
        </g>
      );
  }
}

export default function SceneIllustration({
  theme,
  className = '',
  rounded = true,
  align = 'center',
  sway = false,
}: {
  theme: SceneTheme;
  className?: string;
  rounded?: boolean;
  // 'bottom' garde le niveau du sol visible (utile pour les décors de quartier
  // dans une bannière large et courte) ; 'center' recadre au milieu.
  align?: 'center' | 'bottom';
  // Respiration stop-motion (à n'utiliser que dans un conteneur overflow-hidden).
  sway?: boolean;
}) {
  const Svg = sway ? motion.svg : 'svg';
  return (
    <Svg
      viewBox="0 0 200 130"
      className={className}
      role="img"
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height: '100%' }}
      preserveAspectRatio={align === 'bottom' ? 'xMidYMax slice' : 'xMidYMid slice'}
      {...(sway ? { animate: paperSway } : {})}
    >
      <defs>
        <clipPath id={`scene-clip-${theme}`}>
          <rect x="0" y="0" width="200" height="130" rx={rounded ? 10 : 0} />
        </clipPath>
      </defs>
      <g clipPath={`url(#scene-clip-${theme})`}>
        <rect x="0" y="0" width="200" height="130" fill={CREAM} />
        <SceneBody theme={theme} />
      </g>
    </Svg>
  );
}
