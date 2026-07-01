/*
 * Visage de personnage généré en SVG, dans la direction artistique "carton".
 * Chaque personnage a une graine (seed) : le même personnage a toujours le
 * même visage, et deux personnages différents ont des visages différents.
 * Aucune image externe — tout est dessiné par le code.
 */

const OUTLINE = '#3A2A1E';

const SKIN = ['#EAD0A8', '#DDB483', '#CB9A63', '#B27F4C', '#946237', '#7C5230'];
const HAIR = ['#2E2018', '#4A3320', '#6B4A2C', '#141414', '#7C7C7C', '#B8862F', '#CBCBCB', '#8A5A2A'];
const BG = ['#F1E1C9', '#EBD3B4', '#F0DAC0', '#E7D8C0', '#F2E0CE', '#E9D6BB'];
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

export default function CardboardAvatar({ seed, size = 40, className = '' }: { seed: string; size?: number; className?: string }) {
  const s = seed || 'anon';
  // Un tirage indépendant par caractéristique (graine + sel).
  const pick = (salt: string, n: number) => hashSeed(`${s}|${salt}`) % n;

  const skin = SKIN[pick('skin', SKIN.length)];
  const hair = HAIR[pick('hair', HAIR.length)];
  const bg = BG[pick('bg', BG.length)];
  const hatColor = HAT_COLORS[pick('hatc', HAT_COLORS.length)];

  const hairStyle = pick('hairstyle', 6);   // 0 chauve, 1 court, 2 touffe, 3 raie, 4 volume, 5 (peu importe si chapeau)
  const eyeStyle = pick('eyes', 4);          // 0 points, 1 ronds, 2 traits, 3 fatigué
  const browStyle = pick('brow', 3);         // 0 aucun, 1 droit, 2 relevé
  const mouthStyle = pick('mouth', 5);       // 0 neutre, 1 sourire, 2 grimace, 3 "o", 4 rictus
  const beardStyle = pick('beard', 4);       // 0 aucun, 1 barbe naissante, 2 pleine, 3 moustache
  const hat = pick('hat', 4);                // 0 aucun, 1 bonnet, 2 casquette, 3 aucun (pondère le "aucun")
  const showHat = hat === 1 || hat === 2;

  const eyeL = 40, eyeR = 60, eyeY = 47;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-label="Visage du personnage">
      {/* Fond kraft */}
      <rect x="0" y="0" width="100" height="100" rx="20" fill={bg} />

      {/* Cou */}
      <rect x="43" y="70" width="14" height="16" rx="4" fill={skin} stroke={OUTLINE} strokeWidth="2" />

      {/* Cheveux "arrière" (volume) */}
      {!showHat && hairStyle === 4 && <ellipse cx="50" cy="44" rx="30" ry="30" fill={hair} />}

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

      {/* Nez */}
      <path d="M50 52 l-3 8 q3 2 6 0" fill="none" stroke={OUTLINE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />

      {/* Bouche */}
      {mouthStyle === 0 && <rect x="43" y="65" width="14" height="2.4" rx="1.2" fill={OUTLINE} />}
      {mouthStyle === 1 && <path d="M42 65 q8 8 16 0" fill="none" stroke={OUTLINE} strokeWidth="2.4" strokeLinecap="round" />}
      {mouthStyle === 2 && <path d="M42 68 q8 -8 16 0" fill="none" stroke={OUTLINE} strokeWidth="2.4" strokeLinecap="round" />}
      {mouthStyle === 3 && <ellipse cx="50" cy="66" rx="4" ry="5" fill={OUTLINE} />}
      {mouthStyle === 4 && <path d="M42 66 q8 6 16 -1" fill="none" stroke={OUTLINE} strokeWidth="2.4" strokeLinecap="round" />}

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

      {/* Chapeaux */}
      {hat === 1 && (
        <>
          <path d="M24 34 Q26 14 50 14 Q74 14 76 34 Z" fill={hatColor} stroke={OUTLINE} strokeWidth="2" />
          <rect x="22" y="32" width="56" height="7" rx="3.5" fill={hatColor} stroke={OUTLINE} strokeWidth="2" />
        </>
      )}
      {hat === 2 && (
        <>
          <path d="M25 33 Q27 15 50 15 Q73 15 75 33 Z" fill={hatColor} stroke={OUTLINE} strokeWidth="2" />
          <path d="M50 33 L86 36 Q80 30 50 30 Z" fill={hatColor} stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}
