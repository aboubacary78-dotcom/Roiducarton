/*
 * Visage de personnage généré en SVG, dans la direction artistique "carton".
 * Chaque personnage a une graine (seed) : le même personnage a toujours le
 * même visage, et deux personnages différents ont des visages différents.
 * Aucune image externe — tout est dessiné par le code.
 */

import type { AccessorySlot } from '@/lib/cosmetics';

const OUTLINE = '#3A2A1E';

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

export default function CardboardAvatar({ seed, gender, size = 40, className = '', accessories }: { seed: string; gender?: 'm' | 'f'; size?: number; className?: string; accessories?: Partial<Record<AccessorySlot, string>> }) {
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
  // Un chapeau-accessoire masque les cheveux (sauf l'auréole qui flotte au-dessus).
  const accHidesHair = !!accHat && accHat !== 'halo';
  const showHat = hat === 1 || hat === 2 || accHidesHair;

  const eyeL = 40, eyeR = 60, eyeY = 47;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-label="Visage du personnage">
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

      {/* Cou */}
      <rect x="43" y="70" width="14" height="16" rx="4" fill={skin} stroke={OUTLINE} strokeWidth="2" />

      {/* Cheveux "arrière" (volume / longs) */}
      {!showHat && hairStyle === 4 && <ellipse cx="50" cy="44" rx="30" ry="30" fill={hair} />}
      {!showHat && hairStyle === 6 && (
        <path d="M20 42 Q20 16 50 16 Q80 16 80 42 L80 74 Q75 62 71 60 L71 42 Q71 30 50 30 Q29 30 29 42 L29 60 Q25 62 20 74 Z" fill={hair} />
      )}

      {/* Tête */}
      <rect x="25" y="20" width="50" height="56" rx="21" fill={skin} stroke={OUTLINE} strokeWidth="2.5" />
      {/* Oreilles */}
      <ellipse cx="25" cy="50" rx="4.5" ry="6" fill={skin} stroke={OUTLINE} strokeWidth="2" />
      <ellipse cx="75" cy="50" rx="4.5" ry="6" fill={skin} stroke={OUTLINE} strokeWidth="2" />

      {/* Cheveux "avant" */}
      {!showHat && hairStyle === 1 && (
        <path d="M25 40 Q28 20 50 19 Q72 20 75 40 Q70 30 50 30 Q30 30 25 40 Z" fill={hair} />
      )}
      {!showHat && hairStyle === 2 && (
        <path d="M27 38 Q30 18 42 22 Q46 14 54 20 Q62 15 66 24 Q74 24 73 40 Q66 28 50 29 Q34 29 27 38 Z" fill={hair} />
      )}
      {!showHat && hairStyle === 3 && (
        <path d="M25 41 Q26 21 50 20 Q74 21 75 41 Q64 27 44 30 Q40 24 25 41 Z" fill={hair} />
      )}
      {!showHat && hairStyle === 4 && (
        <path d="M24 40 Q26 16 50 16 Q74 16 76 40 Q68 27 50 27 Q32 27 24 40 Z" fill={hair} />
      )}
      {!showHat && hairStyle === 5 && (
        <path d="M25 44 Q25 27 34 25 Q31 35 30 45 Z M75 44 Q75 27 66 25 Q69 35 70 45 Z" fill={hair} />
      )}
      {!showHat && hairStyle === 6 && (
        <path d="M26 40 Q28 20 50 19 Q72 20 74 40 Q66 29 50 29 Q34 29 26 40 Z" fill={hair} />
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
    </svg>
  );
}
