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

// Palette « diorama carton kraft » (cf. images d'événements) : tout est en
// tons de carton, contour feutre, lumière chaude. On garde les noms d'origine
// pour ne pas tout renommer, mais les valeurs sont désormais kraft/monochromes.
const OUTLINE = '#2E2015';   // marqueur brun foncé
const CREAM = '#EFDCB2';     // papier kraft clair (reflets, texte sur foncé)
const BROWN = '#A9743F';     // carton brun (accents)
const GOLD = '#E6A939';      // lumière chaude / laiton (guirlande, pièces)
const GREEN = '#8A7E3E';     // « peint » olive kraft (feuilles, yeux)
const BLUE = '#8B979A';      // carton peint gris-bleu éteint (eau, verre)
const RED = '#B4593A';       // terre cuite / brique (impacts)
const CARD = '#D3AE6E';      // face de carton (clair)

// Teintes de carton pour le décor de fond (pièce du diorama).
const KRAFT_DARK = '#5A4128';
const KRAFT_MID = '#7A5A38';
const KRAFT_FLOOR = '#8A6A45';

export type SceneTheme =
  | 'coins' | 'food' | 'fight' | 'police' | 'night' | 'rain'
  | 'cat' | 'dog' | 'rat' | 'bird' | 'trash' | 'shop' | 'friend' | 'discovery' | 'sun'
  | 'gift' | 'music' | 'garden' | 'fishing' | 'church' | 'treasure' | 'kid'
  | 'doctor' | 'drunk' | 'romance' | 'street'
  // Décors de quartier (bannière de l'écran principal)
  | 'park' | 'downtown' | 'industrial' | 'station' | 'market';

// Humeur du résultat : change la mise en scène (issue heureuse vs ratée) et
// ajoute un liseré visuel. 'neutral' = décor simple (bannières de lieu).
export type SceneMood = 'good' | 'bad' | 'neutral';

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
// gérés séparément) ; le premier thème dont un mot apparaît l'emporte. L'ordre
// va donc du plus spécifique au plus générique.
const KEYWORDS: [SceneTheme, string[]][] = [
  ['cat', ['chat', 'chaton', 'felin', 'matou', 'griffe', 'miaul']],
  ['dog', ['chien', 'molosse', 'clebard', 'aboie', 'toutou', 'croc']],
  ['rat', ['rat', 'rongeur', 'souris', 'vermine', 'nuisible']],
  ['bird', ['pigeon', 'mouette', 'oiseau', 'corbeau', 'canard', 'oie', 'cygne', 'coq', 'roucoul', 'bec']],
  ['police', ['polic', 'flic', 'gendarme', 'garde a vue', 'amende', 'menotte', 'arrete', 'vigile', 'agent de securite']],
  ['drunk', ['ivrogne', 'ivre', 'saoul', 'bourre', 'alcool', 'biere', 'vin', 'cuite']],
  ['fight', ['bagarre', 'baston', 'raclee', 'combat', 'poing', 'coup de', 'frappe', 'tabasse', 'voyou', 'blesse', 'amoche', 'castagne', 'roue de coups']],
  ['doctor', ['medecin', 'hopital', 'infirmier', 'soin', 'blessure', 'panseme', 'urgence', 'ambulance', 'pharmacie', 'malade']],
  ['music', ['musique', 'musicien', 'chante', 'guitare', 'accordeon', 'harmonica', 'melodie', 'concert']],
  ['fishing', ['peche', 'pecheur', 'poisson', 'canne', 'riviere', 'etang', 'appat']],
  ['garden', ['jardin', 'jardinier', 'plante', 'legume', 'tomate', 'graine', 'potager', 'pousse', 'fleur']],
  ['church', ['eglise', 'cure', 'pretre', 'chapelle', 'priere', 'benedict', 'messe', 'religieu']],
  ['romance', ['amour', 'coeur', 'romantique', 'baiser', 'rencard', 'seduit', 'charme', 'sourire complice']],
  ['kid', ['enfant', 'gamin', 'gosse', 'petit garcon', 'petite fille', 'mome', 'bambin']],
  ['gift', ['donne', 'offre', 'cadeau', 'genereux', 'aumone', 'charita', 'tend', 'partage', 'pourboire', 'don ']],
  ['treasure', ['tresor', 'coffre', 'relique', 'precieux', 'butin', 'pactole']],
  ['coins', ['€', 'euro', 'piece', 'billet', 'argent', 'monnaie', 'jackpot', 'porte-monnaie', 'gagne', 'revente', 'revend', 'empoche']],
  ['food', ['mange', 'nourriture', 'pain', 'sandwich', 'repas', 'soupe', 'faim', 'boulanger', 'conserve', 'cantine', 'restaurant', 'festin', 'croissant']],
  ['trash', ['poubelle', 'benne', 'dechet', 'recup', 'ordure', 'container', 'trie', 'recycl', 'dechetterie']],
  ['shop', ['boutique', 'magasin', 'commerc', 'echoppe', 'epicerie', 'vitrine']],
  ['rain', ['pluie', 'orage', 'averse', 'trempe', 'mouille', 'tempete', 'deluge']],
  ['night', ['nuit', 'dort', 'dormir', 'sommeil', 'carton', 'endort', 'reveil', 'lune', 'etoile']],
  ['sun', ['soleil', 'chaleur', 'beau temps', 'ensoleill', 'canicule', 'rayon']],
  ['friend', ['ami', 'rencontre', 'inconnu', 'passant', 'vieux', 'vieille', 'aide', 'discute', 'parle', 'brocanteur']],
  ['discovery', ['trouve', 'decouvre', 'fouille', 'objet', 'cache', 'ramasse', 'deniche', 'repere']],
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

// Déduit l'humeur du résultat à partir de mots-clés d'échec fréquents, sinon
// se rabat sur l'indication du composant appelant (positif/négatif).
const BAD_WORDS = ['rate', 'echoue', 'echec', 'perd', 'vole', 'blesse', 'amoche', 'fuit', 'fuyez', 'insulte', 'chasse', 'refuse', 'trop tard', 'rien', 'pris', 'amende', 'malheur', 'catastrophe', 'attrape', 'mefiance', 'degage', 'tombe', 'saigne', 'humilie'];
const GOOD_WORDS = ['reussi', 'gagne', 'merci', 'sourit', 'offre', 'donne', 'trouve', 'accepte', 'remercie', 'jackpot', 'festin', 'victoire', 'sauve', 'aide', 'genereux', 'ami', 'reconnaissa'];

export function moodFor(text: string, hintPositive?: boolean): SceneMood {
  const t = deburr(text);
  const bad = BAD_WORDS.some((w) => t.includes(w));
  const good = GOOD_WORDS.some((w) => t.includes(w));
  if (good && !bad) return 'good';
  if (bad && !good) return 'bad';
  if (hintPositive === true) return 'good';
  if (hintPositive === false) return 'bad';
  return 'neutral';
}

// Une caisse en carton (flaps + ligne de cannelure + bout de scotch).
function box(x: number, y: number, w: number, h: number, face = CARD) {
  const dark = '#9A7645';
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="2" fill={face} stroke={OUTLINE} strokeWidth="2.5" />
      {/* rabat supérieur */}
      <path d={`M${x} ${y} l${w / 2} 6 l${w / 2} -6`} fill="none" stroke={OUTLINE} strokeWidth="1.8" />
      {/* cannelure (bord) */}
      <path d={`M${x + 2} ${y + h - 3} q3 -3 6 0 t6 0 t6 0`} fill="none" stroke={dark} strokeWidth="1.2" opacity="0.6" />
      {/* scotch */}
      <rect x={x + w / 2 - 5} y={y - 2} width="10" height={h + 4} fill="#E7D3A6" opacity="0.35" />
    </g>
  );
}

// Fond de « pile de cartons » (remplace l'ancienne skyline d'immeubles).
function skyline() {
  return (
    <g>
      {box(6, 74, 58, 56)}
      {box(70, 54, 56, 76, '#C39A56')}
      {box(132, 66, 60, 64)}
      {box(150, 96, 44, 34, '#C39A56')}
    </g>
  );
}

// Guirlande lumineuse (élément signature du diorama).
function fairyLights() {
  const bulbs = [[20, 20], [56, 12], [96, 22], [136, 10], [176, 18]];
  return (
    <g>
      <path d="M0 16 Q28 30 56 14 T112 16 T168 14 T200 20" fill="none" stroke="#6E5230" strokeWidth="1.4" opacity="0.7" />
      {bulbs.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y + 6} r="6.5" fill={GOLD} opacity="0.35" />
          <circle cx={x} cy={y + 6} r="3" fill="#FFE29A" stroke="#B98A2A" strokeWidth="1" />
        </g>
      ))}
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

// Étoile d'impact « BAM » (issues violentes).
function impact(cx: number, cy: number, r: number, label?: string) {
  const pts = [];
  for (let i = 0; i < 20; i++) {
    const rr = i % 2 === 0 ? r : r * 0.55;
    const a = (Math.PI / 10) * i - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return (
    <g>
      <polygon points={pts.join(' ')} fill={RED} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      {label && <text x={cx} y={cy + r * 0.24} textAnchor="middle" fontSize={r * 0.5} fontWeight="bold" fill={CREAM}>{label}</text>}
    </g>
  );
}

// Petite personne en carton, réaction selon l'humeur.
// good = bras levés (content) · bad = renversé, sonné · neutral = debout.
function figure(cx: number, baseY: number, mood: SceneMood, skin = '#EAD0A8', body = BROWN) {
  const headY = baseY - 34;
  if (mood === 'bad') {
    // Renversé en arrière, étoiles au-dessus de la tête.
    return (
      <g transform={`rotate(-16 ${cx} ${baseY})`}>
        <path d={`M${cx - 12} ${baseY} q0 -28 12 -28 q12 0 12 28 z`} fill={body} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx={cx} cy={headY} r="11" fill={skin} stroke={OUTLINE} strokeWidth="2.5" />
        <path d={`M${cx - 5} ${headY - 2} l4 4 M${cx - 1} ${headY - 2} l-4 4`} stroke={OUTLINE} strokeWidth="1.6" />
        <path d={`M${cx + 3} ${headY - 2} l4 4 M${cx + 7} ${headY - 2} l-4 4`} stroke={OUTLINE} strokeWidth="1.6" />
        <path d={`M${cx - 4} ${headY + 6} q4 -3 8 0`} fill="none" stroke={OUTLINE} strokeWidth="1.6" />
        {[[-10, -14], [6, -18], [-2, -22]].map(([dx, dy], i) => (
          <text key={i} x={cx + dx} y={headY + dy} fontSize="9" fill={GOLD}>✦</text>
        ))}
      </g>
    );
  }
  const armUp = mood === 'good';
  return (
    <g>
      <path d={`M${cx - 12} ${baseY} q0 -30 12 -30 q12 0 12 30 z`} fill={body} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      {/* bras */}
      {armUp ? (
        <>
          <path d={`M${cx - 9} ${baseY - 22} q-8 -8 -6 -18`} fill="none" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
          <path d={`M${cx + 9} ${baseY - 22} q8 -8 6 -18`} fill="none" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d={`M${cx - 10} ${baseY - 20} q-6 6 -4 14`} fill="none" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
          <path d={`M${cx + 10} ${baseY - 20} q6 6 4 14`} fill="none" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      <circle cx={cx} cy={headY} r="12" fill={skin} stroke={OUTLINE} strokeWidth="2.5" />
      <circle cx={cx - 4} cy={headY - 1} r="1.6" fill={OUTLINE} />
      <circle cx={cx + 4} cy={headY - 1} r="1.6" fill={OUTLINE} />
      {mood === 'good'
        ? <path d={`M${cx - 5} ${headY + 4} q5 5 10 0`} fill="none" stroke={OUTLINE} strokeWidth="1.8" strokeLinecap="round" />
        : <line x1={cx - 4} y1={headY + 5} x2={cx + 4} y2={headY + 5} stroke={OUTLINE} strokeWidth="1.8" strokeLinecap="round" />}
    </g>
  );
}

// Chat en carton ; angry = dos rond, poil hérissé, griffes.
function cat(cx: number, baseY: number, s: number, color: string, angry: boolean) {
  const eye = angry ? RED : GREEN;
  return (
    <g>
      <path d={`M${cx - 14 * s} ${baseY} q${-4 * s} ${-38 * s} ${14 * s} ${-38 * s} q${18 * s} 0 ${14 * s} ${38 * s} z`} fill={color} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d={`M${cx - 8 * s} ${baseY - 34 * s} l${-5 * s} ${-13 * s} ${12 * s} ${6 * s} z`} fill={color} stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
      <path d={`M${cx + 8 * s} ${baseY - 34 * s} l${5 * s} ${-13 * s} ${-12 * s} ${6 * s} z`} fill={color} stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
      <circle cx={cx - 5 * s} cy={baseY - 22 * s} r={2.6 * s} fill={eye} />
      <circle cx={cx + 5 * s} cy={baseY - 22 * s} r={2.6 * s} fill={eye} />
      {angry
        ? <path d={`M${cx - 4 * s} ${baseY - 14 * s} q${4 * s} ${-3 * s} ${8 * s} 0`} fill="none" stroke={OUTLINE} strokeWidth="1.6" />
        : <path d={`M${cx - 4 * s} ${baseY - 13 * s} q${4 * s} ${3 * s} ${8 * s} 0`} fill="none" stroke={OUTLINE} strokeWidth="1.6" />}
      <path d={`M${cx + 12 * s} ${baseY - 4 * s} q${16 * s} ${-6 * s} ${9 * s} ${-24 * s}`} fill="none" stroke={color} strokeWidth={6 * s} strokeLinecap="round" />
    </g>
  );
}

function SceneBody({ theme, mood }: { theme: SceneTheme; mood: SceneMood }) {
  const bad = mood === 'bad';
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
      // bad = vous prenez le coup ; good = vous le placez, l'adversaire encaisse.
      return (
        <g>
          {skyline()}
          {bad ? (
            <>
              {figure(70, 122, 'bad')}
              {/* poing adverse qui arrive */}
              <circle cx="130" cy="82" r="15" fill="#B27F4C" stroke={OUTLINE} strokeWidth="2.5" />
              <path d="M118 96 l-14 8 M120 104 l-16 4" stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" />
              {impact(96, 84, 20, 'AÏE')}
            </>
          ) : (
            <>
              {figure(128, 122, 'good', '#DDB483', GREEN)}
              {/* adversaire sonné à gauche */}
              {figure(66, 122, 'bad', '#CB9A63', '#9B5B3A')}
              {impact(96, 82, 20, 'POW')}
            </>
          )}
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
      // Nuit dans la « pièce » du diorama : on garde le fond chaud, une lune en
      // carton découpé et le carton-lit.
      return (
        <g>
          <circle cx="150" cy="40" r="18" fill="#E7D3A6" stroke={OUTLINE} strokeWidth="2" />
          <circle cx="143" cy="36" r="15" fill={KRAFT_MID} />
          {[[40, 30], [70, 20], [110, 30], [30, 60]].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y - 4} l1.5 3 3 1 -3 1 -1.5 3 -1.5 -3 -3 -1 3 -1 z`} fill={GOLD} />
          ))}
          {/* Carton-lit */}
          {box(46, 96, 108, 30)}
          <path d="M60 100 q40 -12 80 0" fill="none" stroke={OUTLINE} strokeWidth="1.6" opacity="0.4" />
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
      // Deux chats. bad = ils vous tombent dessus (griffes, AÏE) ;
      // good = ils sont calmés, l'un ronronne près de vous.
      return (
        <g>
          {skyline()}
          <ellipse cx="100" cy="122" rx="70" ry="9" fill="#000" opacity="0.06" />
          {bad ? (
            <>
              {figure(102, 124, 'bad')}
              {cat(48, 120, 0.8, '#6B5748', true)}
              {cat(150, 120, 0.8, '#8A6A48', true)}
              {impact(102, 92, 16, 'AÏE')}
            </>
          ) : (
            <>
              {figure(100, 124, 'good')}
              {cat(50, 122, 0.72, '#6B5748', false)}
              {cat(150, 122, 0.72, '#8A6A48', false)}
              <text x="70" y="92" fontSize="12" fill={RED}>♥</text>
            </>
          )}
        </g>
      );
    case 'dog':
      return (
        <g>
          {skyline()}
          <ellipse cx="100" cy="122" rx="56" ry="9" fill="#000" opacity="0.06" />
          {bad && figure(150, 124, 'bad')}
          {/* Chien */}
          <path d="M60 120 q-4 -30 24 -30 q30 0 30 22 l-6 8 z" fill="#8A5A2A" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M116 104 q16 -6 22 6 q-2 8 -14 8" fill="#8A5A2A" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M64 92 l-2 -16 12 8 z" fill="#6B4A2C" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="128" cy="106" r="2.4" fill={OUTLINE} />
          <circle cx="122" cy="112" r="2.6" fill={OUTLINE} />
          {bad
            ? <path d="M120 118 l6 -2 6 2 6 -2" fill="none" stroke={CREAM} strokeWidth="2" />
            : <path d="M120 116 q6 4 12 0" fill="none" stroke={OUTLINE} strokeWidth="1.6" />}
          <path d="M56 118 q-14 -4 -8 -20" fill="none" stroke="#8A5A2A" strokeWidth="6" strokeLinecap="round" />
          {bad && impact(150, 92, 14, 'GRR')}
        </g>
      );
    case 'rat':
      return (
        <g>
          {skyline()}
          <ellipse cx="100" cy="122" rx="52" ry="8" fill="#000" opacity="0.06" />
          {[[72, '#7C7C7C'], [116, '#8A8A8A']].map(([x, col], i) => (
            <g key={i}>
              <ellipse cx={Number(x)} cy="112" rx="20" ry="13" fill={col as string} stroke={OUTLINE} strokeWidth="2.5" />
              <circle cx={Number(x) + 16} cy="106" r="8" fill={col as string} stroke={OUTLINE} strokeWidth="2.2" />
              <circle cx={Number(x) + 13} cy="100" r="3" fill={col as string} stroke={OUTLINE} strokeWidth="1.6" />
              <circle cx={Number(x) + 21} cy="105" r="1.6" fill={bad ? RED : OUTLINE} />
              <path d={`M${Number(x) - 18} 116 q-16 2 -20 -8`} fill="none" stroke="#B58" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ))}
          {bad && impact(100, 84, 13, 'BEURK')}
        </g>
      );
    case 'bird':
      return (
        <g>
          {skyline()}
          {[[70, 96], [120, 88], [150, 104]].map(([x, y], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx="16" ry="12" fill={i === 1 ? '#8A8F98' : '#A7ADB5'} stroke={OUTLINE} strokeWidth="2.5" />
              <circle cx={x - 12} cy={y - 4} r="7" fill={i === 1 ? '#8A8F98' : '#A7ADB5'} stroke={OUTLINE} strokeWidth="2.2" />
              <path d={`M${x - 18} ${y - 4} l-7 2 7 3 z`} fill={GOLD} stroke={OUTLINE} strokeWidth="1.6" strokeLinejoin="round" />
              <circle cx={x - 14} cy={y - 5} r="1.4" fill={bad ? RED : OUTLINE} />
              <path d={`M${x + 4} ${y - 6} q10 -8 12 2`} fill={i === 1 ? '#767B84' : '#949AA2'} stroke={OUTLINE} strokeWidth="2" />
            </g>
          ))}
          {bad && impact(100, 60, 13, 'PIAF')}
        </g>
      );
    case 'gift':
      return (
        <g>
          {skyline()}
          {/* Main tendue + pièce/cadeau */}
          {figure(150, 124, mood === 'bad' ? 'bad' : 'good', '#DDB483', GREEN)}
          <path d="M40 112 q10 -10 26 -6" fill="none" stroke="#B27F4C" strokeWidth="8" strokeLinecap="round" />
          {mood === 'bad'
            ? <text x="70" y="70" fontSize="22">🚫</text>
            : coin(78, 84, 16)}
          <path d="M62 108 q20 -10 34 -20" fill="none" stroke={GOLD} strokeWidth="2" strokeDasharray="2 4" opacity="0.6" />
        </g>
      );
    case 'music':
      return (
        <g>
          {skyline()}
          {figure(150, 124, 'good', '#DDB483', '#7B68A8')}
          {/* Guitare */}
          <g transform="rotate(-18 84 104)">
            <ellipse cx="84" cy="104" rx="20" ry="24" fill={BROWN} stroke={OUTLINE} strokeWidth="2.5" />
            <circle cx="84" cy="104" r="7" fill="#3A2A1E" />
            <rect x="80" y="58" width="8" height="30" rx="2" fill="#8A5A2A" stroke={OUTLINE} strokeWidth="2" />
          </g>
          {['♪', '♫', '♩'].map((n, i) => <text key={i} x={120 + i * 14} y={70 - i * 10} fontSize="16" fill={GOLD}>{n}</text>)}
        </g>
      );
    case 'garden':
      // Pots de fortune sur le sol de la pièce (fond kraft conservé).
      return (
        <g>
          {[46, 100, 154].map((x, i) => (
            <g key={i}>
              <path d={`M${x - 16} 104 h32 l-4 22 h-24 z`} fill={BROWN} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
              {bad
                ? <path d={`M${x} 104 q-2 -6 0 -12`} fill="none" stroke="#8A7E3E" strokeWidth="3" strokeLinecap="round" />
                : <>
                    <path d={`M${x} 104 q0 -20 0 -28`} fill="none" stroke={GREEN} strokeWidth="3.5" strokeLinecap="round" />
                    <ellipse cx={x - 7} cy={78} rx="7" ry="4" fill={GREEN} stroke={OUTLINE} strokeWidth="1.6" transform={`rotate(-30 ${x - 7} 78)`} />
                    <ellipse cx={x + 7} cy={80} rx="7" ry="4" fill="#9A8A46" stroke={OUTLINE} strokeWidth="1.6" transform={`rotate(30 ${x + 7} 80)`} />
                    <circle cx={x} cy={70} r="5" fill={RED} stroke={OUTLINE} strokeWidth="1.6" />
                  </>}
            </g>
          ))}
        </g>
      );
    case 'fishing':
      return (
        <g>
          {skyline()}
          <rect x="0" y="104" width="200" height="26" fill="#7FA8C0" />
          <path d="M0 104 q50 -6 100 0 t100 0" fill="none" stroke={CREAM} strokeWidth="2" opacity="0.5" />
          {figure(46, 108, 'good', '#DDB483', '#4A8FBF')}
          <line x1="58" y1="82" x2="140" y2="98" stroke={OUTLINE} strokeWidth="2" />
          {bad
            ? <path d="M138 96 l6 6 M144 96 l-6 6" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
            : <g><ellipse cx="150" cy="110" rx="16" ry="9" fill="#5FA0B8" stroke={OUTLINE} strokeWidth="2.5" /><path d="M166 110 l10 -6 0 12 z" fill="#5FA0B8" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" /><circle cx="144" cy="108" r="1.8" fill={OUTLINE} /></g>}
        </g>
      );
    case 'church':
      return (
        <g>
          {skyline()}
          <rect x="66" y="66" width="68" height="60" fill="#E8CBA0" stroke={OUTLINE} strokeWidth="2.5" />
          <path d="M66 66 l34 -30 34 30 z" fill={BROWN} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
          <line x1="100" y1="20" x2="100" y2="6" stroke={OUTLINE} strokeWidth="3" />
          <line x1="94" y1="12" x2="106" y2="12" stroke={OUTLINE} strokeWidth="3" />
          <path d="M90 126 v-30 a10 10 0 0 1 20 0 v30 z" fill={CARD} stroke={OUTLINE} strokeWidth="2.2" />
          <circle cx="100" cy="80" r="8" fill="#CFE3EC" stroke={OUTLINE} strokeWidth="2" />
        </g>
      );
    case 'treasure':
      return (
        <g>
          {skyline()}
          {/* Coffre */}
          <rect x="66" y="90" width="68" height="34" rx="3" fill="#8A5A2A" stroke={OUTLINE} strokeWidth="2.5" />
          <path d="M66 90 q34 -20 68 0" fill="#9B6B3A" stroke={OUTLINE} strokeWidth="2.5" />
          <rect x="94" y="98" width="12" height="14" rx="2" fill={GOLD} stroke={OUTLINE} strokeWidth="2" />
          {!bad && <>{coin(78, 84, 12)}{coin(122, 82, 12)}{coin(100, 74, 13)}
            {[[70, 70], [130, 68], [100, 60]].map(([x, y], i) => <text key={i} x={x} y={y} fontSize="11" fill={GOLD}>✦</text>)}</>}
          {bad && <text x="100" y="80" textAnchor="middle" fontSize="16" fill={OUTLINE}>vide…</text>}
        </g>
      );
    case 'kid':
      return (
        <g>
          {skyline()}
          {/* Enfant (petit) + vous */}
          {figure(132, 124, mood === 'bad' ? 'bad' : 'good', '#EAD0A8', BROWN)}
          <g>
            <path d="M60 124 q0 -22 12 -22 q12 0 12 22 z" fill="#D98CA0" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="72" cy="96" r="10" fill="#EAD0A8" stroke={OUTLINE} strokeWidth="2.5" />
            {mood === 'bad'
              ? <path d="M68 100 q4 3 8 0" fill="none" stroke={OUTLINE} strokeWidth="1.6" />
              : <path d="M68 98 q4 4 8 0" fill="none" stroke={OUTLINE} strokeWidth="1.6" />}
            <circle cx="69" cy="94" r="1.3" fill={OUTLINE} /><circle cx="75" cy="94" r="1.3" fill={OUTLINE} />
            {mood === 'bad' && <path d="M78 92 q3 2 3 6" fill="none" stroke={BLUE} strokeWidth="2" />}
          </g>
        </g>
      );
    case 'doctor':
      return (
        <g>
          {skyline()}
          {/* Croix médicale + personnage */}
          {figure(60, 124, mood === 'bad' ? 'bad' : 'good')}
          <rect x="112" y="70" width="56" height="56" rx="6" fill={CREAM} stroke={OUTLINE} strokeWidth="2.5" />
          <rect x="135" y="80" width="10" height="36" rx="2" fill={RED} />
          <rect x="122" y="93" width="36" height="10" rx="2" fill={RED} />
        </g>
      );
    case 'drunk':
      return (
        <g>
          {skyline()}
          {figure(130, 124, 'bad', '#CB9A63', '#9B5B3A')}
          {/* Bouteille */}
          <g transform="rotate(18 80 100)">
            <rect x="72" y="86" width="16" height="34" rx="4" fill={GREEN} stroke={OUTLINE} strokeWidth="2.5" />
            <rect x="76" y="76" width="8" height="12" fill={GREEN} stroke={OUTLINE} strokeWidth="2" />
          </g>
          {['~', '~'].map((s, i) => <text key={i} x={150 + i * 8} y={80 - i * 8} fontSize="14" fill={BLUE}>{s}</text>)}
        </g>
      );
    case 'romance':
      return (
        <g>
          {skyline()}
          {figure(72, 124, mood === 'bad' ? 'bad' : 'good', '#EAD0A8', BROWN)}
          {figure(128, 124, mood === 'bad' ? 'neutral' : 'good', '#DDB483', '#D98CA0')}
          {mood === 'bad'
            ? <path d="M92 74 l16 16 M108 74 l-16 16" stroke={RED} strokeWidth="3" strokeLinecap="round" />
            : [[100, 68, 12], [82, 78, 7], [118, 78, 7]].map(([x, y, s], i) => (
                <path key={i} d={`M${x} ${y + s * 0.9} C${x - s * 1.2} ${y - s * 0.2}, ${x - s} ${y - s}, ${x} ${y - s * 0.3} C${x + s} ${y - s}, ${x + s * 1.2} ${y - s * 0.2}, ${x} ${y + s * 0.9} Z`} fill={RED} stroke={OUTLINE} strokeWidth="1.6" />
              ))}
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
  mood = 'neutral',
}: {
  theme: SceneTheme;
  className?: string;
  rounded?: boolean;
  // 'bottom' garde le niveau du sol visible (utile pour les décors de quartier
  // dans une bannière large et courte) ; 'center' recadre au milieu.
  align?: 'center' | 'bottom';
  // Respiration stop-motion (à n'utiliser que dans un conteneur overflow-hidden).
  sway?: boolean;
  // Issue heureuse/ratée : ajuste la scène et pose un liseré + accent.
  mood?: SceneMood;
}) {
  const Svg = sway ? motion.svg : 'svg';
  const clip = `scene-clip-${theme}-${mood}`;
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
        <clipPath id={clip}>
          <rect x="0" y="0" width="200" height="130" rx={rounded ? 10 : 0} />
        </clipPath>
        <radialGradient id={`room-${clip}`} cx="50%" cy="34%" r="75%">
          <stop offset="0%" stopColor={KRAFT_MID} />
          <stop offset="100%" stopColor={KRAFT_DARK} />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${clip})`}>
        {/* Décor de « pièce » en carton : mur chaud, sol, guirlande. */}
        <rect x="0" y="0" width="200" height="130" fill={`url(#room-${clip})`} />
        <rect x="0" y="104" width="200" height="26" fill={KRAFT_FLOOR} />
        <line x1="0" y1="104" x2="200" y2="104" stroke={OUTLINE} strokeWidth="1.5" opacity="0.35" />
        {fairyLights()}
        <SceneBody theme={theme} mood={mood} />
        {/* Liseré + teinte selon l'issue (léger, ne cache pas la scène). */}
        {mood === 'good' && (
          <>
            <rect x="0" y="0" width="200" height="130" fill="#4A9B5F" opacity="0.06" />
            <rect x="1.5" y="1.5" width="197" height="127" rx={rounded ? 9 : 0} fill="none" stroke="#4A9B5F" strokeWidth="3" opacity="0.55" />
            {[[14, 16], [186, 22], [176, 14]].map(([x, y], i) => <text key={i} x={x} y={y} fontSize="13" fill={GOLD}>✦</text>)}
          </>
        )}
        {mood === 'bad' && (
          <>
            <rect x="0" y="0" width="200" height="130" fill="#3A2A1E" opacity="0.14" />
            <rect x="1.5" y="1.5" width="197" height="127" rx={rounded ? 9 : 0} fill="none" stroke="#D94F4F" strokeWidth="3" opacity="0.5" />
          </>
        )}
      </g>
    </Svg>
  );
}
