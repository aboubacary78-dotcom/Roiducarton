/*
 * Visage de personnage généré en SVG, dans la direction artistique "carton".
 * Chaque personnage a une graine (seed) : le même personnage a toujours le
 * même visage, et deux personnages différents ont des visages différents.
 * Aucune image externe, tout est dessiné par le code.
 */

import type { AccessorySlot } from '@/lib/cosmetics';

const OUTLINE = '#3A2A1E';

// Points d'une étoile à 5 branches (accessoires étoilés & fonds).
function star(cx: number, cy: number, outer: number, inner: number): string {
  let p = '';
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    p += `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)} `;
  }
  return p.trim();
}

// Tracé d'un cœur centré (accessoires & fonds).
function heart(cx: number, cy: number, s: number): string {
  return `M${cx} ${cy + s * 0.9} C${cx - s * 1.2} ${cy - s * 0.2}, ${cx - s} ${cy - s}, ${cx} ${cy - s * 0.3} C${cx + s} ${cy - s}, ${cx + s * 1.2} ${cy - s * 0.2}, ${cx} ${cy + s * 0.9} Z`;
}

const SKIN = ['#F2DAB8', '#EAD0A8', '#DDB483', '#CB9A63', '#B27F4C', '#946237', '#7C5230', '#5E3E24'];
const HAIR = ['#2E2018', '#4A3320', '#6B4A2C', '#141414', '#7C7C7C', '#B8862F', '#CBCBCB', '#8A5A2A', '#E8E8E8', '#B5432F'];
const BG = ['#F1E1C9', '#EBD3B4', '#F0DAC0', '#E7D8C0', '#F2E0CE', '#E9D6BB', '#EFE0CA'];
const HAT_COLORS = ['#C4723A', '#4A7FB5', '#6B8E5A', '#9B5B3A', '#7B68A8', '#B8894A'];

// Hash déterministe (FNV-1a) d'une chaîne -> entier 32 bits.
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/*
 * DEUX AXES SUR LE VISAGE.
 *
 * `condition` (la moyenne des cinq jauges de survie) dit dans quel ÉTAT est le
 * corps : le teint, les cernes, les joues.
 *
 * `dignity` dit dans quelle TENUE il est, ce qui n'est pas la même chose. Un
 * personnage peut être en pleine forme et complètement débraillé, et c'est
 * exactement la tension du jeu.
 *
 * Ce second axe manquait, alors que la Dignité est la mécanique centrale et
 * que le joueur regarde ce visage plus souvent que n'importe quelle barre.
 * Le carton s'écorne, le trait de feutre bave, le col se plie : on lit ce que
 * la survie coûte sans qu'aucun texte ne le dise.
 */
export default function CardboardAvatar({ seed, gender, size = 40, className = '', accessories, condition, dignity }: { seed: string; gender?: 'm' | 'f'; size?: number; className?: string; accessories?: Partial<Record<AccessorySlot, string>>; condition?: number; dignity?: number }) {
  const s = seed || 'anon';
  const female = gender === 'f';
  // Un tirage indépendant par caractéristique (graine + sel).
  const pick = (salt: string, n: number) => hashSeed(`${s}|${salt}`) % n;

  const skin = SKIN[pick('skin', SKIN.length)];
  const hair = HAIR[pick('hair', HAIR.length)];
  const bg = BG[pick('bg', BG.length)];
  const hatColor = HAT_COLORS[pick('hatc', HAT_COLORS.length)];

  // Coiffure : les femmes ont toujours des cheveux (pas chauve/dégarni).
  let hairStyle = pick('hairstyle', 7);      // 0 chauve, 1 court, 2 touffe, 3 raie, 4 volume, 5 dégarni, 6 longs
  if (female) {
    const femaleHair = [1, 2, 3, 4, 6, 6];   // biais vers volume/longs
    hairStyle = femaleHair[pick('fhair', femaleHair.length)];
  }
  const eyeStyle = pick('eyes', 4);          // 0 points, 1 ronds, 2 traits, 3 fatigué
  const browStyle = pick('brow', 3);         // 0 aucun, 1 droit, 2 relevé
  const mouthStyle = pick('mouth', 5);       // 0 neutre, 1 sourire, 2 grimace, 3 "o", 4 rictus
  const beardStyle = female ? 0 : pick('beard', 4); // pas de barbe/moustache pour les femmes
  const hat = pick('hat', 4);                // 0 aucun, 1 bonnet, 2 casquette, 3 aucun (pondère le "aucun")
  const glasses = pick('glasses', 5);        // 0/1 aucun, 2 rondes, 3 carrées, 4 solaires
  const hasFreckles = pick('freckles', 4) === 0;
  const hasScar = !female && pick('scar', 7) === 0;
  const earrings = female && pick('earring', 3) === 0;
  const mouthColor = female ? '#B85763' : OUTLINE; // lèvres colorées pour les femmes

  // Accessoires cosmétiques équipés (voir lib/cosmetics + garde-robe).
  const accHat = accessories?.hat;
  const accEyes = accessories?.eyes;
  const accFace = accessories?.face;
  const accNeck = accessories?.neck;
  const accBg = accessories?.bg;
  // Un chapeau ne rend plus chauve : on garde les cheveux et on ne coupe que
  // ce qui passerait AU TRAVERS du couvre-chef. Chaque chapeau a donc sa
  // « ligne de coupe » : au-dessus, le chapeau ; en dessous, les cheveux qui
  // dépassent. Plus le chapeau est posé haut (béret, toque, chapeau de fête),
  // plus la ligne est basse et plus la chevelure reste visible.
  const HAT_HAIR_LINE: Record<string, number> = {
    party: 24, beret: 26, graduation: 28, 'cap-back': 31, 'pirate-hat': 32,
    cowboy: 33, tophat: 34, chef: 35, crown: 36, santa: 36, beanie: 36, wizard: 36,
  };
  // L'auréole flotte et la couronne de fleurs est un serre-tête : rien à couper.
  const accCovers = !!accHat && accHat !== 'halo' && accHat !== 'flower-crown';
  // Chapeau procédural (bonnet / casquette) : dessiné seulement si aucun
  // chapeau-accessoire ne l'a remplacé.
  const procHat = !accHat && (hat === 1 || hat === 2);
  const hairLine = accCovers ? (HAT_HAIR_LINE[accHat!] ?? 34) : procHat ? 33 : null;
  // Identifiant de découpe propre à cet avatar : plusieurs visages coexistent
  // sur un même écran, leurs clipPath ne doivent pas se marcher dessus.
  const clipId = `hairclip-${hashSeed(`${s}|hair`)}`;
  const hairClip = hairLine !== null ? `url(#${clipId})` : undefined;
  // Les coiffures courtes (1 court, 2 touffe, 3 raie, 5 dégarni) ne descendent
  // pas sous la ligne du chapeau : les rogner ne laisserait rien, le
  // personnage aurait encore l'air rasé. On lui dessine donc les mèches qui
  // dépassent sur les tempes. Les coiffures longues (4, 6) ont déjà leur
  // volume derrière la tête, elles n'en ont pas besoin.
  const needsTufts = hairLine !== null && [1, 2, 3, 5].includes(hairStyle);
  const L = hairLine ?? 0;

  const eyeL = 40, eyeR = 60, eyeY = 47;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-label="Visage du personnage">
      {/* Découpe des cheveux sous la ligne du chapeau (voir hairLine) */}
      {hairLine !== null && (
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y={hairLine} width="100" height={100 - hairLine} />
          </clipPath>
        </defs>
      )}

      {/* Fond kraft */}
      <rect x="0" y="0" width="100" height="100" rx="20" fill={bg} />

      {/* Fond-accessoire (derrière la tête) */}
      {accBg === 'gold-bg' && (
        <g>
          <rect x="0" y="0" width="100" height="100" rx="20" fill="#F5E3B0" />
          <g fill="#EFCF78" opacity="0.75">
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              const p1 = `${50 + Math.cos(a) * 6},${50 + Math.sin(a) * 6}`;
              const p2 = `${50 + Math.cos(a - 0.14) * 72},${50 + Math.sin(a - 0.14) * 72}`;
              const p3 = `${50 + Math.cos(a + 0.14) * 72},${50 + Math.sin(a + 0.14) * 72}`;
              return <polygon key={i} points={`${p1} ${p2} ${p3}`} />;
            })}
          </g>
        </g>
      )}
      {accBg === 'rainbow-bg' && (
        <g opacity="0.85">
          {['#E86A5A', '#EBA23F', '#E8C84B', '#5FB56A', '#4A8FBF', '#7B68C4'].map((c, i) => (
            <rect key={i} x="0" y={i * 16.67} width="100" height="16.68" fill={c} />
          ))}
        </g>
      )}
      {accBg === 'sunset-bg' && (
        <g>
          {['#F7D9A0', '#F3B87A', '#EB8E6A', '#C46A6A'].map((c, i) => (
            <rect key={i} x="0" y={i * 25} width="100" height="25" fill={c} />
          ))}
          <circle cx="50" cy="38" r="15" fill="#FBE7C0" opacity="0.9" />
        </g>
      )}
      {accBg === 'stars-bg' && (
        <g>
          <rect x="0" y="0" width="100" height="100" rx="20" fill="#2E2A4A" />
          <circle cx="78" cy="20" r="8" fill="#F2E4A8" opacity="0.9" />
          <circle cx="74" cy="17" r="7" fill="#2E2A4A" />
          <g fill="#F2E4A8">
            <polygon points={star(20, 22, 3, 1.3)} />
            <polygon points={star(40, 14, 2.4, 1)} />
            <polygon points={star(58, 30, 2, 0.9)} />
            <circle cx="30" cy="40" r="1" /><circle cx="14" cy="55" r="1" /><circle cx="86" cy="46" r="1" />
            <circle cx="50" cy="20" r="0.9" /><circle cx="68" cy="60" r="1" /><circle cx="24" cy="72" r="1" />
          </g>
        </g>
      )}
      {accBg === 'flames-bg' && (
        <g>
          <rect x="0" y="0" width="100" height="100" rx="20" fill="#3A1F14" />
          <g fill="#E8641E">
            <path d="M0 100 Q12 60 22 100 Q34 55 46 100 Q58 62 70 100 Q82 55 94 100 L100 100 L100 100 L0 100 Z" />
          </g>
          <g fill="#F2A83A">
            <path d="M8 100 Q18 74 28 100 Q40 70 52 100 Q64 76 76 100 Q86 72 96 100 Z" />
          </g>
        </g>
      )}
      {accBg === 'hearts-bg' && (
        <g>
          <rect x="0" y="0" width="100" height="100" rx="20" fill="#F6D9E4" />
          <g fill="#E88AA0" opacity="0.75">
            {[[20, 24, 5], [78, 30, 6], [30, 62, 4], [70, 72, 5], [50, 44, 4], [12, 80, 4], [88, 62, 4]].map(([x, y, s], i) => (
              <path key={i} d={heart(x, y, s)} />
            ))}
          </g>
        </g>
      )}
      {accBg === 'confetti-bg' && (
        <g>
          <rect x="0" y="0" width="100" height="100" rx="20" fill="#FBF3E6" />
          {[['#E86A5A', 18, 20, 20], ['#4A8FBF', 74, 16, -25], ['#5FB56A', 40, 34, 40], ['#EBA23F', 84, 44, 10], ['#7B68C4', 22, 58, -30], ['#E8C84B', 60, 66, 25], ['#E86A5A', 84, 78, -15], ['#4A8FBF', 30, 82, 35], ['#5FB56A', 66, 26, -20], ['#EBA23F', 12, 40, 15]].map(([c, x, y, r], i) => (
            <rect key={i} x={x as number} y={y as number} width="5" height="8" rx="1.5" fill={c as string} transform={`rotate(${r} ${x as number} ${y as number})`} />
          ))}
        </g>
      )}
      {accBg === 'royal-bg' && (
        <g>
          <rect x="0" y="0" width="100" height="100" rx="20" fill="#4B2E83" />
          <g fill="#EAC24A" opacity="0.4">
            {Array.from({ length: 20 }).map((_, i) => {
              const cx = 15 + (i % 4) * 24;
              const cy = 15 + Math.floor(i / 4) * 20;
              return <rect key={i} x={cx - 2.5} y={cy - 2.5} width="5" height="5" transform={`rotate(45 ${cx} ${cy})`} />;
            })}
          </g>
        </g>
      )}
      {accBg === 'spotlight-bg' && (
        <g>
          <rect x="0" y="0" width="100" height="100" rx="20" fill="#241E1A" />
          <path d="M50 -6 L16 106 L84 106 Z" fill="#F5E3B0" opacity="0.3" />
          <ellipse cx="50" cy="52" rx="30" ry="30" fill="#F5E7C0" opacity="0.22" />
        </g>
      )}

      {/* Cou */}
      <rect x="43" y="70" width="14" height="16" rx="4" fill={skin} stroke={OUTLINE} strokeWidth="2" />

      {/* Cheveux "arrière" (volume / longs), rognés sous le chapeau */}
      <g clipPath={hairClip}>
        {hairStyle === 4 && <ellipse cx="50" cy="44" rx="30" ry="30" fill={hair} />}
        {hairStyle === 6 && (
          <path d="M20 42 Q20 16 50 16 Q80 16 80 42 L80 74 Q75 62 71 60 L71 42 Q71 30 50 30 Q29 30 29 42 L29 60 Q25 62 20 74 Z" fill={hair} />
        )}
      </g>

      {/* Tête */}
      <rect x="25" y="20" width="50" height="56" rx="21" fill={skin} stroke={OUTLINE} strokeWidth="2.5" />
      {/* Oreilles */}
      <ellipse cx="25" cy="50" rx="4.5" ry="6" fill={skin} stroke={OUTLINE} strokeWidth="2" />
      <ellipse cx="75" cy="50" rx="4.5" ry="6" fill={skin} stroke={OUTLINE} strokeWidth="2" />

      {/* Cheveux "avant", rognés sous le chapeau */}
      <g clipPath={hairClip}>
        {hairStyle === 1 && (
          <path d="M25 40 Q28 20 50 19 Q72 20 75 40 Q70 30 50 30 Q30 30 25 40 Z" fill={hair} />
        )}
        {hairStyle === 2 && (
          <path d="M27 38 Q30 18 42 22 Q46 14 54 20 Q62 15 66 24 Q74 24 73 40 Q66 28 50 29 Q34 29 27 38 Z" fill={hair} />
        )}
        {hairStyle === 3 && (
          <path d="M25 41 Q26 21 50 20 Q74 21 75 41 Q64 27 44 30 Q40 24 25 41 Z" fill={hair} />
        )}
        {hairStyle === 4 && (
          <path d="M24 40 Q26 16 50 16 Q74 16 76 40 Q68 27 50 27 Q32 27 24 40 Z" fill={hair} />
        )}
        {hairStyle === 5 && (
          <path d="M25 44 Q25 27 34 25 Q31 35 30 45 Z M75 44 Q75 27 66 25 Q69 35 70 45 Z" fill={hair} />
        )}
        {hairStyle === 6 && (
          <path d="M26 40 Q28 20 50 19 Q72 20 74 40 Q66 29 50 29 Q34 29 26 40 Z" fill={hair} />
        )}
      </g>

      {/* Mèches des tempes : ce qui dépasse du chapeau quand la coiffure est
          courte. Sans elles, un bonnet donnait l'illusion d'un crâne rasé. */}
      {needsTufts && (
        <g fill={hair}>
          <path d={`M24.5 ${L} Q23 ${L + 9} 26.5 ${L + 15} Q30.5 ${L + 7} 31.5 ${L} Z`} />
          <path d={`M75.5 ${L} Q77 ${L + 9} 73.5 ${L + 15} Q69.5 ${L + 7} 68.5 ${L} Z`} />
        </g>
      )}

      {/* Sourcils */}
      {browStyle === 1 && (
        <>
          <rect x="35" y="40" width="10" height="2.6" rx="1.3" fill={OUTLINE} />
          <rect x="55" y="40" width="10" height="2.6" rx="1.3" fill={OUTLINE} />
        </>
      )}
      {browStyle === 2 && (
        <>
          <rect x="35" y="41" width="10" height="2.6" rx="1.3" fill={OUTLINE} transform="rotate(-10 40 42)" />
          <rect x="55" y="41" width="10" height="2.6" rx="1.3" fill={OUTLINE} transform="rotate(10 60 42)" />
        </>
      )}

      {/* Yeux */}
      {eyeStyle === 0 && (
        <>
          <circle cx={eyeL} cy={eyeY} r="3" fill={OUTLINE} />
          <circle cx={eyeR} cy={eyeY} r="3" fill={OUTLINE} />
        </>
      )}
      {eyeStyle === 1 && (
        <>
          <circle cx={eyeL} cy={eyeY} r="4.5" fill="#fff" stroke={OUTLINE} strokeWidth="1.6" />
          <circle cx={eyeR} cy={eyeY} r="4.5" fill="#fff" stroke={OUTLINE} strokeWidth="1.6" />
          <circle cx={eyeL + 0.5} cy={eyeY} r="2" fill={OUTLINE} />
          <circle cx={eyeR + 0.5} cy={eyeY} r="2" fill={OUTLINE} />
        </>
      )}
      {eyeStyle === 2 && (
        <>
          <rect x={eyeL - 4} y={eyeY - 1.3} width="8" height="2.6" rx="1.3" fill={OUTLINE} />
          <rect x={eyeR - 4} y={eyeY - 1.3} width="8" height="2.6" rx="1.3" fill={OUTLINE} />
        </>
      )}
      {eyeStyle === 3 && (
        <>
          <path d={`M${eyeL - 4} ${eyeY} q4 3 8 0`} fill="none" stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" />
          <path d={`M${eyeR - 4} ${eyeY} q4 3 8 0`} fill="none" stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {/* Lunettes (masquées si un accessoire yeux est équipé) */}
      {!accEyes && glasses === 2 && (
        <g stroke={OUTLINE} strokeWidth="2" fill="none">
          <circle cx={eyeL} cy={eyeY} r="7.5" />
          <circle cx={eyeR} cy={eyeY} r="7.5" />
          <line x1={eyeL + 7} y1={eyeY} x2={eyeR - 7} y2={eyeY} />
          <line x1={eyeL - 7.5} y1={eyeY - 1} x2="27" y2={eyeY - 3} />
          <line x1={eyeR + 7.5} y1={eyeY - 1} x2="73" y2={eyeY - 3} />
        </g>
      )}
      {!accEyes && glasses === 3 && (
        <g stroke={OUTLINE} strokeWidth="2" fill="none">
          <rect x={eyeL - 8} y={eyeY - 5.5} width="16" height="11" rx="2.5" />
          <rect x={eyeR - 8} y={eyeY - 5.5} width="16" height="11" rx="2.5" />
          <line x1={eyeL + 8} y1={eyeY} x2={eyeR - 8} y2={eyeY} />
        </g>
      )}
      {!accEyes && glasses === 4 && (
        <g stroke={OUTLINE} strokeWidth="1.6">
          <rect x={eyeL - 8} y={eyeY - 5.5} width="16" height="11" rx="2.5" fill="#242424" />
          <rect x={eyeR - 8} y={eyeY - 5.5} width="16" height="11" rx="2.5" fill="#242424" />
          <line x1={eyeL + 8} y1={eyeY - 3} x2={eyeR - 8} y2={eyeY - 3} />
        </g>
      )}

      {/* Nez */}
      <path d="M50 52 l-3 8 q3 2 6 0" fill="none" stroke={OUTLINE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />

      {/* Taches de rousseur */}
      {hasFreckles && (
        <g fill={OUTLINE} opacity="0.3">
          <circle cx="35" cy="56" r="1" /><circle cx="39.5" cy="58" r="1" /><circle cx="33" cy="60" r="1" />
          <circle cx="65" cy="56" r="1" /><circle cx="60.5" cy="58" r="1" /><circle cx="67" cy="60" r="1" />
        </g>
      )}

      {/* Cicatrice */}
      {hasScar && (
        <line x1="63" y1="35" x2="68" y2="49" stroke="#B87A5A" strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
      )}

      {/* Bouche */}
      {mouthStyle === 0 && <rect x="43" y="65" width="14" height={female ? 3 : 2.4} rx="1.5" fill={mouthColor} />}
      {mouthStyle === 1 && <path d="M42 65 q8 8 16 0" fill="none" stroke={mouthColor} strokeWidth="2.6" strokeLinecap="round" />}
      {mouthStyle === 2 && <path d="M42 68 q8 -8 16 0" fill="none" stroke={mouthColor} strokeWidth="2.4" strokeLinecap="round" />}
      {mouthStyle === 3 && <ellipse cx="50" cy="66" rx="4" ry="5" fill={mouthColor} />}
      {mouthStyle === 4 && <path d="M42 66 q8 6 16 -1" fill="none" stroke={mouthColor} strokeWidth="2.4" strokeLinecap="round" />}

      {/* Boucles d'oreilles */}
      {earrings && (
        <g fill="#E8B84B" stroke={OUTLINE} strokeWidth="0.8">
          <circle cx="25" cy="58" r="2.2" />
          <circle cx="75" cy="58" r="2.2" />
        </g>
      )}

      {/* Barbe / moustache */}
      {beardStyle === 1 && (
        <path d="M30 58 Q32 78 50 80 Q68 78 70 58 Q66 72 50 73 Q34 72 30 58 Z" fill={hair} opacity="0.35" />
      )}
      {beardStyle === 2 && (
        <path d="M29 56 Q31 82 50 84 Q69 82 71 56 Q67 74 50 75 Q33 74 29 56 Z" fill={hair} />
      )}
      {beardStyle === 3 && (
        <path d="M42 62 q8 5 16 0 q-3 4 -8 4 q-5 0 -8 -4 Z" fill={hair} />
      )}

      {/* Chapeaux procéduraux (masqués si un chapeau-accessoire est équipé) */}
      {!accHat && hat === 1 && (
        <>
          <path d="M24 34 Q26 14 50 14 Q74 14 76 34 Z" fill={hatColor} stroke={OUTLINE} strokeWidth="2" />
          <rect x="22" y="32" width="56" height="7" rx="3.5" fill={hatColor} stroke={OUTLINE} strokeWidth="2" />
        </>
      )}
      {!accHat && hat === 2 && (
        <>
          <path d="M25 33 Q27 15 50 15 Q73 15 75 33 Z" fill={hatColor} stroke={OUTLINE} strokeWidth="2" />
          <path d="M50 33 L86 36 Q80 30 50 30 Z" fill={hatColor} stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
        </>
      )}

      {/* ============ ACCESSOIRES COSMÉTIQUES ============ */}

      {/* Cou */}
      {accNeck === 'scarf' && (
        <g stroke={OUTLINE} strokeWidth="1.6" strokeLinejoin="round">
          <path d="M34 74 Q50 82 66 74 L66 80 Q50 88 34 80 Z" fill="#C4553A" />
          <path d="M39 79 L35 97 L46 97 L48 81 Z" fill="#B34A32" />
          <line x1="35" y1="77" x2="65" y2="77" stroke="#E8C9A0" strokeWidth="1.2" opacity="0.6" />
        </g>
      )}
      {accNeck === 'gold-chain' && (
        <g fill="none" stroke="#EAC24A" strokeWidth="2.4" strokeLinecap="round">
          <path d="M36 76 Q50 90 64 76" />
          <circle cx="50" cy="87" r="2.6" fill="#EAC24A" stroke={OUTLINE} strokeWidth="0.8" />
        </g>
      )}
      {accNeck === 'bowtie' && (
        <g stroke={OUTLINE} strokeWidth="1.4" strokeLinejoin="round">
          <path d="M50 76 L40 71 L40 81 Z" fill="#C4463A" />
          <path d="M50 76 L60 71 L60 81 Z" fill="#C4463A" />
          <rect x="47.5" y="73" width="5" height="6" rx="1" fill="#9E3A30" />
        </g>
      )}
      {accNeck === 'gold-medal' && (
        <g stroke={OUTLINE} strokeWidth="1.2">
          <line x1="45" y1="76" x2="48" y2="88" stroke="#4A8FBF" strokeWidth="3" />
          <line x1="55" y1="76" x2="52" y2="88" stroke="#D94F4F" strokeWidth="3" />
          <circle cx="50" cy="92" r="6" fill="#EAC24A" />
          <text x="50" y="94.4" fontSize="7" textAnchor="middle" fill={OUTLINE} stroke="none" fontWeight="bold">1</text>
        </g>
      )}
      {accNeck === 'tie' && (
        <g stroke={OUTLINE} strokeWidth="1" strokeLinejoin="round">
          <path d="M50 75 L46 79 L50 82 L54 79 Z" fill="#B34A32" />
          <path d="M50 82 L47 82 L48.5 96 L50 98 L51.5 96 L53 82 Z" fill="#C4553A" />
        </g>
      )}
      {accNeck === 'bandana' && (
        <g stroke={OUTLINE} strokeWidth="1.4" strokeLinejoin="round">
          <path d="M36 75 Q50 82 64 75 L62 81 Q50 87 38 81 Z" fill="#C4463A" />
          <g fill="#F3EEE8" stroke="none" opacity="0.55">
            <circle cx="44" cy="79" r="1" /><circle cx="50" cy="80.5" r="1" /><circle cx="56" cy="79" r="1" />
          </g>
        </g>
      )}
      {accNeck === 'cape' && (
        <g stroke={OUTLINE} strokeWidth="1.4" strokeLinejoin="round">
          <path d="M39 74 Q34 82 33 96 Q42 90 46 78 Z" fill="#7B2D8E" />
          <path d="M61 74 Q66 82 67 96 Q58 90 54 78 Z" fill="#7B2D8E" />
          <path d="M42 73 Q50 78 58 73 Q54 80 50 80 Q46 80 42 73 Z" fill="#8E3AA0" />
          <circle cx="50" cy="74" r="2.4" fill="#EAC24A" stroke={OUTLINE} strokeWidth="0.8" />
        </g>
      )}
      {accNeck === 'pearls' && (
        <g fill="#F3EEE8" stroke={OUTLINE} strokeWidth="0.6">
          {Array.from({ length: 9 }).map((_, i) => {
            const t = i / 8;
            const x = (1 - t) * (1 - t) * 36 + 2 * (1 - t) * t * 50 + t * t * 64;
            const y = (1 - t) * (1 - t) * 76 + 2 * (1 - t) * t * 87 + t * t * 76;
            return <circle key={i} cx={x} cy={y} r="2" />;
          })}
        </g>
      )}
      {accNeck === 'whistle' && (
        <g stroke={OUTLINE} strokeWidth="1">
          <path d="M45 74 Q49 88 55 82" fill="none" stroke="#8B6B4A" strokeWidth="1.6" />
          <g transform="rotate(18 55 84)">
            <rect x="50" y="82" width="9" height="6" rx="2.5" fill="#C4C4C4" />
            <rect x="58" y="83" width="3.5" height="4" rx="1" fill="#A8A8A8" />
          </g>
        </g>
      )}

      {/* Visage */}
      {accFace === 'blush' && (
        <g fill="#E88AA0" opacity="0.5">
          <ellipse cx="35" cy="58" rx="5" ry="3.2" />
          <ellipse cx="65" cy="58" rx="5" ry="3.2" />
        </g>
      )}
      {accFace === 'warpaint' && (
        <g fill="#C4463A">
          <rect x="30" y="51" width="13" height="3" rx="1.5" transform="rotate(-10 36 52)" />
          <rect x="30" y="56" width="13" height="3" rx="1.5" transform="rotate(-10 36 57)" />
          <rect x="57" y="51" width="13" height="3" rx="1.5" transform="rotate(10 63 52)" />
          <rect x="57" y="56" width="13" height="3" rx="1.5" transform="rotate(10 63 57)" />
        </g>
      )}
      {accFace === 'mustache' && (
        <path d="M50 60 Q42 56 35 60 Q40 65 46 61 Q48 60 50 61.5 Q52 60 54 61 Q60 65 65 60 Q58 56 50 60 Z" fill={hair} stroke={OUTLINE} strokeWidth="0.7" strokeLinejoin="round" />
      )}
      {accFace === 'goatee' && (
        <path d="M44 66 q6 4 12 0 q-1 8 -6 9.5 q-5 -1.5 -6 -9.5 Z" fill={hair} stroke={OUTLINE} strokeWidth="0.6" strokeLinejoin="round" />
      )}
      {accFace === 'unibrow' && (
        <path d="M35 41 Q50 36.5 65 41 Q50 39.5 35 41 Z" fill={hair} />
      )}
      {accFace === 'clown-nose' && (
        <circle cx="50" cy="57" r="5" fill="#E23A3A" stroke={OUTLINE} strokeWidth="1.2" />
      )}
      {accFace === 'bandage' && (
        <g transform="rotate(-20 62 39)">
          <rect x="55" y="35" width="14" height="6" rx="1.5" fill="#F0C98A" stroke={OUTLINE} strokeWidth="1" />
          <g stroke="#D9A85E" strokeWidth="0.8">
            <line x1="59" y1="35" x2="59" y2="41" /><line x1="65" y1="35" x2="65" y2="41" />
          </g>
        </g>
      )}
      {accFace === 'face-tattoo' && (
        <path d="M60 52 Q56.5 56 60 59 Q63.5 56 60 52 Z" fill="#3A2A6E" stroke={OUTLINE} strokeWidth="0.4" />
      )}
      {accFace === 'star-cheeks' && (
        <g fill="#F2C14E" stroke={OUTLINE} strokeWidth="0.5">
          <polygon points={star(35, 57, 3.4, 1.5)} />
          <polygon points={star(65, 57, 3.4, 1.5)} />
        </g>
      )}

      {/* Yeux */}
      {accEyes === 'monocle' && (
        <g stroke={OUTLINE} strokeWidth="2" fill="none">
          <circle cx={eyeR} cy={eyeY} r="8" fill="#ffffff" fillOpacity="0.2" />
          <path d="M60 55 Q57 67 51 71" strokeWidth="1.4" />
        </g>
      )}
      {accEyes === '3d-glasses' && (
        <g stroke={OUTLINE} strokeWidth="1.5">
          <rect x="30" y="41.5" width="17" height="11" rx="2" fill="#E24A4A" />
          <rect x="53" y="41.5" width="17" height="11" rx="2" fill="#3AA0C4" />
          <line x1="47" y1="44" x2="53" y2="44" />
        </g>
      )}
      {accEyes === 'eyepatch' && (
        <g>
          <line x1="26" y1="40" x2="75" y2="45" stroke={OUTLINE} strokeWidth="2" />
          <rect x="52" y="41" width="16" height="13" rx="3" fill="#241f1c" stroke={OUTLINE} strokeWidth="1.5" />
        </g>
      )}
      {accEyes === 'heart-glasses' && (
        <g fill="#E86A8A" stroke={OUTLINE} strokeWidth="1.3">
          <path d="M40 51 C33 44 34 39 40 43 C46 39 47 44 40 51 Z" />
          <path d="M60 51 C53 44 54 39 60 43 C66 39 67 44 60 51 Z" />
          <line x1="46" y1="45" x2="54" y2="45" strokeWidth="1.3" />
        </g>
      )}
      {accEyes === 'star-glasses' && (
        <g fill="#F2C14E" stroke={OUTLINE} strokeWidth="1.2">
          <polygon points={star(eyeL, eyeY, 6.5, 2.8)} />
          <polygon points={star(eyeR, eyeY, 6.5, 2.8)} />
          <line x1="47" y1="46" x2="53" y2="46" strokeWidth="1.2" />
        </g>
      )}
      {accEyes === 'sunglasses' && (
        <g stroke={OUTLINE} strokeWidth="1.6">
          <path d="M31 43 h16 v4 q0 5 -8 5 q-8 0 -8 -6 Z" fill="#20242A" />
          <path d="M53 43 h16 v3 q0 6 -8 6 q-8 0 -8 -4 Z" fill="#20242A" />
          <line x1="47" y1="44" x2="53" y2="44" />
          <line x1="31" y1="43" x2="26" y2="41" />
          <line x1="69" y1="43" x2="74" y2="41" />
        </g>
      )}
      {accEyes === 'nerd-glasses' && (
        <g stroke={OUTLINE} strokeWidth="2.2" fill="#ffffff" fillOpacity="0.15">
          <circle cx={eyeL} cy={eyeY} r="8" />
          <circle cx={eyeR} cy={eyeY} r="8" />
          <line x1="48" y1="47" x2="52" y2="47" strokeWidth="2.2" />
          <rect x="48" y="43" width="4" height="8" fill="#E8E8E8" stroke={OUTLINE} strokeWidth="0.8" />
        </g>
      )}
      {accEyes === 'ski-goggles' && (
        <g stroke={OUTLINE} strokeWidth="2">
          <rect x="30" y="41" width="40" height="13" rx="6.5" fill="#4A8FBF" />
          <rect x="33" y="43.5" width="34" height="8" rx="4" fill="#BFE3F0" opacity="0.7" stroke="none" />
          <path d="M26 44 L30 46 M74 44 L70 46" strokeWidth="2" />
        </g>
      )}
      {accEyes === 'thug-glasses' && (
        <g fill="#181818">
          <rect x="31" y="43" width="16" height="6" />
          <rect x="53" y="43" width="16" height="6" />
          <rect x="47" y="44.5" width="6" height="3" />
          <rect x="26" y="43.5" width="5" height="3" />
        </g>
      )}

      {/* Chapeaux-accessoires (au-dessus de tout) */}
      {accHat === 'halo' && (
        <g fill="none">
          <ellipse cx="50" cy="13" rx="17" ry="4.5" stroke="#F2C14E" strokeWidth="3.5" />
          <ellipse cx="50" cy="13" rx="17" ry="4.5" stroke="#FBE7A8" strokeWidth="1.2" />
        </g>
      )}
      {accHat === 'crown' && (
        <g stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round">
          <path d="M28 30 L30 14 L40 24 L50 10 L60 24 L70 14 L72 30 Z" fill="#EAC24A" />
          <rect x="28" y="30" width="44" height="7" rx="2" fill="#DDB02E" />
          <circle cx="50" cy="15" r="2.4" fill="#D94F4F" stroke={OUTLINE} strokeWidth="1" />
          <circle cx="31" cy="20" r="1.8" fill="#4A8FBF" stroke={OUTLINE} strokeWidth="0.8" />
          <circle cx="69" cy="20" r="1.8" fill="#4A8FBF" stroke={OUTLINE} strokeWidth="0.8" />
        </g>
      )}
      {accHat === 'tophat' && (
        <g stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round">
          <rect x="22" y="30" width="56" height="6" rx="3" fill="#2A2320" />
          <rect x="31" y="8" width="38" height="24" rx="3" fill="#2A2320" />
          <rect x="31" y="24" width="38" height="4" fill="#8B3A3A" />
        </g>
      )}
      {accHat === 'santa' && (
        <g stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round">
          <path d="M26 34 Q30 8 62 12 Q54 22 50 34 Z" fill="#CE4A42" />
          <rect x="22" y="32" width="46" height="7" rx="3.5" fill="#F3EEE8" />
          <circle cx="62" cy="11" r="5" fill="#F3EEE8" />
        </g>
      )}
      {accHat === 'cap-back' && (
        <g stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round">
          <path d="M25 34 Q27 16 50 16 Q73 16 75 34 Z" fill="#4A7FB5" />
          <rect x="40" y="31" width="20" height="5" rx="2.5" fill="#3E6E9E" />
          <circle cx="50" cy="18" r="2" fill="#3E6E9E" />
        </g>
      )}
      {accHat === 'party' && (
        <g stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round">
          <path d="M50 6 L38 34 L62 34 Z" fill="#E86A8A" />
          <line x1="44" y1="21" x2="56" y2="21" stroke="#F2C14E" strokeWidth="3" />
          <line x1="41" y1="28" x2="59" y2="28" stroke="#4A8FBF" strokeWidth="3" />
          <circle cx="50" cy="6" r="3" fill="#F2C14E" />
        </g>
      )}
      {accHat === 'beanie' && (
        <g stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round">
          <path d="M24 34 Q26 14 50 14 Q74 14 76 34 Z" fill="#5E8B6A" />
          <rect x="22" y="31" width="56" height="8" rx="4" fill="#4E7A5A" />
          <circle cx="50" cy="12" r="4" fill="#F3EEE8" />
        </g>
      )}
      {accHat === 'cowboy' && (
        <g stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round">
          <path d="M16 34 Q50 26 84 34 Q50 41 16 34 Z" fill="#9B6B3A" />
          <path d="M34 34 Q34 15 50 15 Q66 15 66 34 Z" fill="#A87543" />
          <path d="M34 30 Q50 33 66 30" stroke="#6E4A28" strokeWidth="2" fill="none" />
        </g>
      )}
      {accHat === 'wizard' && (
        <g stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round">
          <path d="M50 4 Q54 20 62 36 L38 36 Q46 20 50 4 Z" fill="#5A4A9E" />
          <path d="M20 37 Q50 30 80 37 Q50 43 20 37 Z" fill="#5A4A9E" />
          <polygon points={star(50, 24, 4, 1.7)} fill="#F2C14E" stroke="none" />
        </g>
      )}
      {accHat === 'chef' && (
        <g stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round">
          <path d="M32 28 Q28 12 40 14 Q42 6 50 10 Q58 6 60 14 Q72 12 68 28 Z" fill="#F8F5F0" />
          <rect x="30" y="27" width="40" height="10" rx="2" fill="#F3EEE8" />
        </g>
      )}
      {accHat === 'flower-crown' && (
        <g>
          <path d="M24 34 Q50 24 76 34" fill="none" stroke="#6B8E5A" strokeWidth="2.5" />
          <g stroke={OUTLINE} strokeWidth="0.5">
            <g><circle cx="30" cy="31" r="3.4" fill="#E86A8A" /><circle cx="30" cy="31" r="1.3" fill="#F2C14E" stroke="none" /></g>
            <g><circle cx="42" cy="26" r="3.4" fill="#F2C14E" /><circle cx="42" cy="26" r="1.3" fill="#fff" stroke="none" /></g>
            <g><circle cx="50" cy="23" r="3.8" fill="#EBA23F" /><circle cx="50" cy="23" r="1.4" fill="#fff" stroke="none" /></g>
            <g><circle cx="58" cy="26" r="3.4" fill="#7B68C4" /><circle cx="58" cy="26" r="1.3" fill="#F2C14E" stroke="none" /></g>
            <g><circle cx="70" cy="31" r="3.4" fill="#E86A8A" /><circle cx="70" cy="31" r="1.3" fill="#F2C14E" stroke="none" /></g>
          </g>
        </g>
      )}
      {accHat === 'pirate-hat' && (
        <g stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round">
          <path d="M22 30 Q50 12 78 30 Q78 36 68 34 Q50 29 32 34 Q22 36 22 30 Z" fill="#2A2320" />
          <g fill="#F3EEE8" stroke="none">
            <circle cx="50" cy="25" r="3.6" />
            <rect x="46.5" y="27.5" width="7" height="3" rx="1" />
          </g>
        </g>
      )}
      {accHat === 'graduation' && (
        <g stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round">
          <rect x="39" y="24" width="22" height="9" rx="1" fill="#3A322C" />
          <path d="M50 30 L24 22 L50 14 L76 22 Z" fill="#2A2320" />
          <line x1="76" y1="22" x2="76" y2="33" stroke="#F2C14E" strokeWidth="1.5" />
          <circle cx="76" cy="34" r="2" fill="#F2C14E" stroke="none" />
        </g>
      )}
      {accHat === 'beret' && (
        <g stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round">
          <path d="M28 30 Q26 14 52 15 Q76 16 72 27 Q58 31 42 31 Q34 31 28 30 Z" fill="#B5432F" />
          <circle cx="52" cy="14" r="2" fill="#8E3423" />
        </g>
      )}

      {/* ---- Calque d'ÉTAT (dérivé des jauges, voir condition) ----
          Superposé au visage : bas = mine dégradée (teint verdâtre, cernes,
          sueur, bouche tombante) ; haut = bonne forme (joues roses, éclat). */}
      {typeof condition === 'number' && condition < 0.34 && (
        <g style={{ pointerEvents: 'none' }}>
          {/* voile blafard/verdâtre */}
          <rect x="14" y="26" width="72" height="60" rx="26" fill="#7C8B5A" opacity={0.16 + (0.34 - condition) * 0.5} />
          {/* cernes */}
          <path d={`M${eyeL - 6} ${eyeY + 6} Q${eyeL} ${eyeY + 9} ${eyeL + 6} ${eyeY + 6}`} stroke="#6E5A4E" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d={`M${eyeR - 6} ${eyeY + 6} Q${eyeR} ${eyeY + 9} ${eyeR + 6} ${eyeY + 6}`} stroke="#6E5A4E" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
          {/* bouche tombante par-dessus */}
          <path d="M42 70 Q50 64 58 70" stroke={OUTLINE} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          {/* goutte de sueur */}
          <path d="M74 40 q-3 5 0 8 q3 -3 0 -8 Z" fill="#8FB8D8" stroke="#5E86A6" strokeWidth="0.6" opacity="0.9" />
        </g>
      )}
      {typeof condition === 'number' && condition > 0.72 && (
        <g style={{ pointerEvents: 'none' }}>
          {/* joues roses */}
          <circle cx="30" cy="60" r="6" fill="#E8927C" opacity={0.18 + (condition - 0.72) * 0.6} />
          <circle cx="70" cy="60" r="6" fill="#E8927C" opacity={0.18 + (condition - 0.72) * 0.6} />
          {/* petite étincelle de forme */}
          <path d="M78 30 l1.4 3 3 1.4 -3 1.4 -1.4 3 -1.4 -3 -3 -1.4 3 -1.4 Z" fill="#F5D06B" opacity="0.9" />
        </g>
      )}

      {/* ---- Calque de TENUE (dérivé de la Dignité) ----
          Quatre paliers, quatre crans discrets. Rien de dramatique : c'est la
          présentation qui se dégrade, pas la santé. Sous 75, le carton
          commence à s'écorner ; sous 50, le trait de feutre bave ; sous 25, la
          barbe gagne et le col se plie pour de bon. */}
      {typeof dignity === 'number' && dignity < 75 && (
        <g style={{ pointerEvents: 'none' }}>
          {/* Un coin de carton corné, en haut à gauche du visage. */}
          <path d="M20 30 l7 -3 -1 6 Z" fill="#C9A97E" stroke={OUTLINE} strokeWidth="1.2" strokeLinejoin="round" opacity="0.85" />
        </g>
      )}
      {typeof dignity === 'number' && dignity < 50 && (
        <g style={{ pointerEvents: 'none' }}>
          {/* Le feutre bave : deux coulures sous le trait du visage. */}
          <path d="M36 78 q1.5 5 0 8" stroke={OUTLINE} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.5" />
          <path d="M64 76 q-1.2 6 0.4 9" stroke={OUTLINE} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.42" />
          {/* Une éraflure sur la joue droite. */}
          <path d="M74 56 l5 4" stroke="#9A7B5A" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
        </g>
      )}
      {typeof dignity === 'number' && dignity < 25 && (
        <g style={{ pointerEvents: 'none' }}>
          {/* Le col plié, franchement de travers. */}
          <path d="M30 86 l10 -5 -2 7 Z" fill="#B9986E" stroke={OUTLINE} strokeWidth="1.2" strokeLinejoin="round" opacity="0.9" />
          {/* Des poils qui dépassent partout : la barbe a gagné. */}
          <path d="M24 64 l-5 2 M25 70 l-5 3 M76 64 l5 2 M75 70 l5 3" stroke={OUTLINE} strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
          {/* Un voile terne sur l'ensemble : plus personne ne vous regarde. */}
          <rect x="14" y="26" width="72" height="60" rx="26" fill="#6B5740" opacity="0.13" />
        </g>
      )}
    </svg>
  );
}
