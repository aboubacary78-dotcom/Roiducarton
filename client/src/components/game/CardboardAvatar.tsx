/*
 * Visage de personnage généré en SVG, dans la direction artistique "carton".
 * Chaque personnage a une graine (seed) : le même personnage a toujours le
 * même visage, et deux personnages différents ont des visages différents.
 * Aucune image externe, tout est dessiné par le code.
 */

import type { AccessorySlot } from '@/lib/cosmetics';
import { tr } from '@/lib/lang';

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

export const SKIN = ['#F2DAB8', '#EAD0A8', '#DDB483', '#CB9A63', '#B27F4C', '#946237', '#7C5230', '#5E3E24'];
export const HAIR = ['#2E2018', '#4A3320', '#6B4A2C', '#141414', '#7C7C7C', '#B8862F', '#CBCBCB', '#8A5A2A', '#E8E8E8', '#B5432F'];
/*
 * SEPT FONDS QUI SE DISTINGUENT VRAIMENT.
 *
 * Les sept précédents tenaient dans un mouchoir : #F1E1C9, #EBD3B4, #F0DAC0…
 * sept crèmes qu'aucun œil ne sépare. Sur une planche de vingt-quatre visages,
 * les fonds paraissaient identiques, et c'est un réglage qu'on VEND dans
 * l'Atelier : sept boutons pour la même couleur. Ils couvrent maintenant toute
 * l'étendue du kraft, de l'ivoire au carton brun, sans quitter la matière.
 */
export const BG = ['#F3E7D3', '#EBD9BC', '#E0C8A2', '#D3B68A', '#C4A272', '#E6D3B8', '#CFAE87'];
export const HAT_COLORS = ['#C4723A', '#4A7FB5', '#6B8E5A', '#9B5B3A', '#7B68A8', '#B8894A'];
// Les vêtements de la rue : lavés trop souvent, jamais assortis.
const VETEMENT = ['#6E5F52', '#59685C', '#7A5A46', '#4E5A68', '#655A6B', '#7A6E54'];

// ── Le carton comme matière : quelques outils de couleur ──────────────────
function canaux(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
/** Clarté perçue, de 0 (noir) à 1 (blanc). */
function clarte(hex: string): number {
  const [r, g, b] = canaux(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
/** Mélange deux couleurs, `t` = 0 garde la première, 1 donne la seconde. */
function melanger(a: string, b: string, t: number): string {
  const [r1, g1, b1] = canaux(a);
  const [r2, g2, b2] = canaux(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${m(r1, r2)}${m(g1, g2)}${m(b1, b2)}`;
}
/*
 * UN VISAGE NE DOIT PAS FONDRE DANS SON FOND.
 *
 * Le teint le plus clair (#F2DAB8) et le fond le plus clair (#F3E7D3) ne sont
 * séparés que par le trait de contour : la tête disparaît, il ne reste qu'un
 * dessin flottant. Le tirage étant indépendant, ce cas arrive tout seul.
 *
 * Plutôt que d'interdire des combinaisons, ce qui trahirait le choix fait
 * dans l'Atelier, on ÉCARTE le fond du teint quand les deux se touchent :
 * teint clair, le fond fonce ; teint sombre, le fond s'éclaircit. La couleur
 * choisie reste reconnaissable, le visage se détache.
 */
function ecarter(bg: string, skin: string): string {
  if (Math.abs(clarte(bg) - clarte(skin)) >= 0.085) return bg;
  return melanger(bg, clarte(skin) > 0.5 ? '#8A6B48' : '#F6EBD9', 0.45);
}

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
/** Les cinq jauges de survie, telles quelles, de 0 à 100. */
export interface JaugesVisage { health: number; mental: number; hunger: number; thirst: number; sleep: number }

export default function CardboardAvatar({ seed, gender, size = 40, className = '', accessories, condition, jauges, dignity, visage }: { seed: string; gender?: 'm' | 'f'; size?: number; className?: string; accessories?: Partial<Record<AccessorySlot, string>>; condition?: number; jauges?: JaugesVisage; dignity?: number; visage?: Record<string, number> }) {
  const s = seed || 'anon';
  const female = gender === 'f';
  // Un tirage indépendant par caractéristique (graine + sel).
  const pick = (salt: string, n: number) => hashSeed(`${s}|${salt}`) % n;

  /*
   * LE HASARD RESTE LE DÉFAUT, LE CHOIX PASSE DEVANT.
   *
   * `visage` vient de l'Atelier (lib/visage) : un sel → une valeur. Ce qui n'y
   * est pas continue d'être tiré de la graine, ce qui rend un visage
   * PARTIELLEMENT composé parfaitement valable, on décide de la barbe et on
   * laisse le reste au sort.
   *
   * La clé d'un trait EST son sel : c'est tout le contrat entre ce fichier et
   * le catalogue, et `scripts/test-atelier.mjs` le vérifie des deux côtés.
   */
  const choisir = (salt: string, n: number) => {
    const v = visage?.[salt];
    return typeof v === 'number' && Number.isFinite(v) ? ((v % n) + n) % n : pick(salt, n);
  };
  /*
   * Les traits « avec ou sans » se tiraient à une chance sur n. Un choix ne
   * peut pas s'exprimer dans cette échelle sans devenir illisible (« mettez 0
   * pour oui, 1 à 6 pour non ») : on lit donc 0 = oui, tout le reste = non, et
   * l'écran ne propose que ces deux valeurs.
   */
  const oui = (salt: string, chanceSur: number) => {
    const v = visage?.[salt];
    if (typeof v === 'number' && Number.isFinite(v)) return v === 0;
    return pick(salt, chanceSur) === 0;
  };

  const skinBase = SKIN[choisir('skin', SKIN.length)];
  const hair = HAIR[choisir('hair', HAIR.length)];

  /*
   * ─────────── CE QUE LE VISAGE DIT DE L'ÉTAT ───────────
   *
   * Ce calque était le point noir du portrait, et une grille de onze crans l'a
   * montré d'un coup : de 0,00 à 0,30, quatre visages IDENTIQUES ; de 0,40 à
   * 0,70, rien du tout ; de 0,80 à 1,00, identiques encore. Trois états, pas
   * un axe, et l'écart entre le mourant et l'homme en forme se résumait à une
   * goutte de sueur. À quarante-quatre pixels, la taille du hub, seize
   * combinaisons donnaient seize fois la même image.
   *
   * Deux principes en réponse.
   *
   * ① TOUT EST CONTINU. Plus un seul seuil : chaque signe a une intensité qui
   *    suit la jauge. Un signe qui apparaît d'un coup se lit comme un bug ;
   *    un signe qui monte se lit comme une dégradation.
   *
   * ② CHAQUE JAUGE A SON SIGNE. `condition` était la MOYENNE de cinq jauges :
   *    le visage pouvait dire « ça va mal », jamais « il crève de soif ». Les
   *    jauges arrivent maintenant entières, et chacune écrit sur une partie du
   *    visage, le sommeil sur les paupières, la faim sur les joues, la soif
   *    sur les lèvres, le mental sur le TRAIT lui-même, la santé sur le teint.
   *    On lit la cause, plus seulement la gravité.
   *
   * `condition` reste accepté pour les visages qu'on ne suit pas (les
   * passants) : on répartit alors la moyenne, et le portrait dit la gravité
   * sans pouvoir nommer la cause.
   */
  const aEtat = jauges !== undefined || typeof condition === 'number';
  const borne = (x: number) => Math.min(1, Math.max(0, x));
  // Une jauge ne se ressent pas dès 99 : le manque commence à 62 et sature à 0.
  const manque = (v: number) => borne((62 - v) / 62);
  const moyenne = typeof condition === 'number' ? borne((0.62 - condition) / 0.62) : 0;
  const mSommeil = jauges ? manque(jauges.sleep) : moyenne;
  const mFaim = jauges ? manque(jauges.hunger) : moyenne;
  const mSoif = jauges ? manque(jauges.thirst) : moyenne;
  const mMental = jauges ? manque(jauges.mental) : moyenne;
  const mSante = jauges ? manque(jauges.health) : moyenne;
  // La gravité générale, c'est la PIRE jauge, pas leur moyenne. Mourir de
  // soif en pleine forme par ailleurs reste mourir.
  const mal = aEtat ? Math.max(mSommeil, mFaim, mSoif, mMental, mSante) : 0;
  // Et la belle vigueur, c'est quand la plus basse est encore haute.
  const vigueur = !aEtat ? 0
    : jauges ? borne((Math.min(jauges.health, jauges.mental, jauges.hunger, jauges.thirst, jauges.sleep) - 68) / 32)
    : borne(((condition ?? 0) - 0.68) / 0.32);

  /*
   * LE TEINT EST LE SIGNE QUI PORTE LE PLUS LOIN.
   *
   * Un voile translucide posé par-dessus se voyait à peine ; changer la
   * couleur de la peau elle-même se lit encore à trente-deux pixels, où plus
   * aucun détail ne survit. La santé tire vers le gris-vert, la forme vers le
   * chaud.
   */
  const skin = melanger(melanger(skinBase, '#8A9078', (mSante * 0.55 + mal * 0.45) * 0.36), '#FFE3C4', vigueur * 0.16);
  const bg = ecarter(BG[choisir('bg', BG.length)], skin);
  /*
   * LA DIGNITÉ, ELLE AUSSI, DEVIENT CONTINUE.
   *
   * Elle avait trois paliers, et les trois marquaient les COINS de la carte,
   * là où il reste deux pixels à quarante-quatre. Ce qui se dégrade
   * maintenant, c'est d'abord ce qui est GRAND : le vêtement, la barbe, les
   * cheveux. Le carton s'abîme encore, mais en second, et progressivement.
   */
  const crasse = typeof dignity === 'number' ? borne((100 - dignity) / 100) : 0;
  const hatColor = HAT_COLORS[choisir('hatc', HAT_COLORS.length)];
  // Les tons dérivés : l'ombre du carton, le pli, le creux d'une joue.
  const kraftOmbre = melanger(bg, '#3A2A1E', 0.26);
  const cannelure = melanger(bg, '#3A2A1E', 0.14);
  const peauOmbre = melanger(skin, '#5E3E24', 0.30);

  /*
   * LA FORME DU CRÂNE : ce qui manquait le plus.
   *
   * La tête était un rectangle arrondi, le MÊME pour tout le monde : deux
   * douzaines d'inconnus avaient exactement la même silhouette, et toute la
   * différence tenait aux cheveux et aux lunettes. À trente-deux pixels, où
   * rien d'autre ne se lit, ils étaient interchangeables.
   *
   * Les tempes restent à 25/75, c'est là-dessus que sont calés les chapeaux,
   * les lunettes et les quarante accessoires, mais la MÂCHOIRE et le MENTON
   * varient. Ça suffit à séparer les silhouettes sans rien décaler.
   */
  const FORMES = [
    { jaw: 0.74, chin: 77 },   // ovale
    { jaw: 0.95, chin: 74 },   // carrée
    { jaw: 0.66, chin: 80 },   // longue, menton pointu
    { jaw: 0.88, chin: 72 },   // ronde
  ];
  const forme = FORMES[choisir('face', FORMES.length)];
  const chin = forme.chin;
  /*
   * LA FAIM RENTRE DANS LA SILHOUETTE ELLE-MÊME.
   *
   * Deux ombres sur les joues restaient un maquillage : la planche montrait
   * « faim 0 » et « faim 50 » presque semblables. Un affamé n'a pas les joues
   * ombrées, il a le visage PLUS ÉTROIT. La mâchoire se resserre donc pour de
   * bon, et comme tout le bas du visage (bouche, barbe, mâchoire) est calé
   * sur `jx`, il suit sans qu'on ait à y penser.
   */
  const jx = 25 * forme.jaw * (1 - mFaim * 0.15);   // demi-largeur de la mâchoire
  /** Le contour de la tête, éventuellement dilaté de `d` (pour l'ombre portée). */
  const tete = (d = 0) => {
    const t = 25 + d, j = jx + d, c = chin + d, h = 19 - d;
    return `M${50 - t} 43 C${50 - t} ${h + 5} ${50 - t * 0.68} ${h} 50 ${h}`
      + ` C${50 + t * 0.68} ${h} ${50 + t} ${h + 5} ${50 + t} 43`
      + ` C${50 + t} ${43 + (c - 43) * 0.52} ${50 + j} ${c - 5} 50 ${c}`
      + ` C${50 - j} ${c - 5} ${50 - t} ${43 + (c - 43) * 0.52} ${50 - t} 43 Z`;
  };
  // La bouche suit le menton : sur un visage long elle descend, sur un visage
  // rond elle remonte. Sinon un menton allongé donnait un grand vide sous la
  // lèvre, et un menton court une bouche posée sur le bord.
  const mY = 65 + (chin - 77) * 0.5;

  // Coiffure : les femmes ont toujours des cheveux (pas chauve/dégarni).
  let hairStyle = choisir('hairstyle', 7);   // 0 chauve, 1 court, 2 touffe, 3 raie, 4 volume, 5 dégarni, 6 longs
  /*
   * Le biais féminin ne s'applique qu'au TIRAGE. Choisir explicitement une
   * coiffure la donne telle quelle : une table de pondération est là pour que
   * le hasard tombe juste, pas pour corriger quelqu'un qui a décidé.
   */
  if (female && typeof visage?.hairstyle !== 'number') {
    const femaleHair = [1, 2, 3, 4, 6, 6];   // biais vers volume/longs
    hairStyle = femaleHair[pick('fhair', femaleHair.length)];
  }
  const eyeStyle = choisir('eyes', 4);       // 0 points, 1 ronds, 2 traits, 3 fatigué
  const browStyle = choisir('brow', 3);      // 0 aucun, 1 droit, 2 relevé
  const mouthStyle = choisir('mouth', 5);    // 0 neutre, 1 sourire, 2 grimace, 3 "o", 4 rictus
  const beardStyle = female ? 0 : choisir('beard', 4); // pas de barbe/moustache pour les femmes
  const hat = choisir('hat', 4);             // 0 aucun, 1 bonnet, 2 casquette, 3 aucun (pondère le "aucun")
  const glasses = choisir('glasses', 5);     // 0/1 aucun, 2 rondes, 3 carrées, 4 solaires
  const hasFreckles = oui('freckles', 4);
  const hasScar = !female && oui('scar', 7);
  const earrings = female && oui('earring', 3);
  // Lèvres colorées pour les femmes ; la soif les décolore, chez tout le monde.
  const mouthColor = melanger(female ? '#B85763' : OUTLINE, '#A98E80', mSoif * 0.65);

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
  // Même précaution pour la découpe du visage : les voiles d'état s'y appuient.
  const faceId = `faceclip-${hashSeed(`${s}|face`)}`;
  // Les coiffures courtes (1 court, 2 touffe, 3 raie, 5 dégarni) ne descendent
  // pas sous la ligne du chapeau : les rogner ne laisserait rien, le
  // personnage aurait encore l'air rasé. On lui dessine donc les mèches qui
  // dépassent sur les tempes. Les coiffures longues (4, 6) ont déjà leur
  // volume derrière la tête, elles n'en ont pas besoin.
  const needsTufts = hairLine !== null && [1, 2, 3, 5].includes(hairStyle);
  const L = hairLine ?? 0;

  const eyeL = 40, eyeR = 60, eyeY = 47;

  /*
   * LE GRAIN DU PAPIER.
   *
   * Sept impuretés tirées de la graine, posées sur la joue. Une par une elles
   * ne se voient pas ; ensemble elles empêchent l'aplat de peau de ressembler
   * à du plastique. À trente-deux pixels elles disparaissent, et c'est bien.
   */
  const grains = Array.from({ length: 7 }, (_, i) => {
    const h = hashSeed(`${s}|grain${i}`);
    return { x: 30 + (h % 41), y: 34 + ((h >>> 7) % 38), r: 0.55 + ((h >>> 15) % 3) * 0.25 };
  });

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img"
      /* Comme le bouton de personnalisation avant lui, ce libellé était écrit
         en dur en français : le seul texte d'un écran traduit qu'un lecteur
         d'écran anglophone entendait dans la mauvaise langue. */
      aria-label={tr('Visage du personnage', 'Character face')}>
      <defs>
        {/* Découpe des cheveux sous la ligne du chapeau (voir hairLine) */}
        {hairLine !== null && (
          <clipPath id={clipId}>
            <rect x="0" y={hairLine} width="100" height={100 - hairLine} />
          </clipPath>
        )}
        {/* Découpe du visage : les voiles d'état s'arrêtent au bord de la tête
            au lieu de baver sur le fond comme une tache. */}
        <clipPath id={faceId}><path d={tete()} /></clipPath>
      </defs>

      {/* ---- LE CARTON ----
          Le fond n'est plus un aplat : c'est un morceau de carton découpé. La
          cannelure se voit par la tranche, le bord de coupe est plus sombre
          que la face, et la tête est une seconde épaisseur posée dessus,
          c'est son ombre portée qui la décolle. */}
      <rect x="0" y="0" width="100" height="100" rx="20" fill={bg} />
      <g stroke={cannelure} strokeWidth="0.9" opacity="0.26">
        {[14, 28, 42, 56, 70, 84].map(x => (
          <line key={x} x1={x} y1="2" x2={x} y2="98" />
        ))}
      </g>
      <rect x="2.2" y="2.2" width="95.6" height="95.6" rx="18" fill="none" stroke={kraftOmbre} strokeWidth="1.4" opacity="0.45" />

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

      {/*
        DES ÉPAULES, PARCE QU'UN COU SEUL EST UNE TIGE.

        La tête flottait au-dessus d'un rectangle de peau coupé net par le bord
        du cadre : de loin, une sucette. Deux épaules suffisent à en faire un
        portrait, et elles donnent enfin une assise aux accessoires de cou,
        l'écharpe et la cravate, qui pendaient jusque-là dans le vide.

        Le vêtement se tire de la graine sans passer par l'Atelier : c'est la
        rue qui habille, pas le joueur.
      */}
      <rect x="43" y={chin - 7} width="14" height={95 - chin} rx="4" fill={skin} stroke={OUTLINE} strokeWidth="2" />
      <path d={`M43.5 ${chin - 5} q6.5 5 13 0`} fill="none" stroke={peauOmbre} strokeWidth="1.6" opacity="0.5" />
      {/* La salissure du vêtement suit une courbe et non une droite : les
          premiers points de dignité perdus se voient le plus, et c'est là que
          se joue le début de partie. */}
      <path d="M11 101 Q13 88 34 84 L66 84 Q87 88 89 101 Z" fill={melanger(VETEMENT[pick('cloth', VETEMENT.length)], '#463726', Math.pow(crasse, 0.65) * 0.55)} stroke={OUTLINE} strokeWidth="2.2" strokeLinejoin="round" />
      {/* Le col, ouvert sur le cou. */}
      <path d="M41 84.5 Q50 92 59 84.5" fill="none" stroke={OUTLINE} strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
      {/* Un col tenu, boutonné, le seul signe POSITIF de la dignité. Le reste
          de l'axe ne dit que ce qui se perd ; ici, quelque chose est encore
          en place, et ça disparaît doucement quand on cesse d'y tenir. */}
      {crasse < 0.45 && (
        <g style={{ pointerEvents: 'none' }} opacity={(0.45 - crasse) * 2.2}>
          <path d="M41 85 L46 90 L43 94" fill="none" stroke={OUTLINE} strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M59 85 L54 90 L57 94" fill="none" stroke={OUTLINE} strokeWidth="1.3" strokeLinejoin="round" />
          <circle cx="50" cy="96" r="1.6" fill={OUTLINE} opacity="0.75" />
        </g>
      )}
      {/* Le vêtement s'use : une déchirure à l'épaule, et des taches. */}
      {crasse > 0.35 && (
        <g style={{ pointerEvents: 'none' }} opacity={(crasse - 0.35) * 1.5}>
          {/* Un ourlet déchiré, pas un gribouillis : le bas du vêtement part
              en dents de scie et laisse voir le carton derrière. */}
          <path d="M14 101 L18 92 L23 99 L28 90 L32 98 L36 101 Z" fill={bg} opacity="0.75" />
          <path d="M14 101 L18 92 L23 99 L28 90 L32 98 L36 101" fill="none" stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />
          <ellipse cx="72" cy="94" rx="7" ry="4" fill="#3A2A1E" opacity="0.28" />
          <ellipse cx="60" cy="99" rx="5" ry="3" fill="#3A2A1E" opacity="0.22" />
        </g>
      )}

      {/* Cheveux "arrière" (volume / longs), rognés sous le chapeau */}
      <g clipPath={hairClip}>
        {hairStyle === 4 && <ellipse cx="50" cy="44" rx="30" ry="30" fill={hair} />}
        {hairStyle === 6 && (
          <path d="M20 42 Q20 16 50 16 Q80 16 80 42 L80 74 Q75 62 71 60 L71 42 Q71 30 50 30 Q29 30 29 42 L29 60 Q25 62 20 74 Z" fill={hair} />
        )}
      </g>

      {/* Oreilles, dessinées AVANT la tête : le visage recouvre leur moitié
          interne et elles se rattachent au crâne. Posées par-dessus, elles
          flottaient comme deux anses. */}
      <ellipse cx="24.5" cy="50" rx="4.2" ry="5.6" fill={skin} stroke={OUTLINE} strokeWidth="2" />
      <ellipse cx="75.5" cy="50" rx="4.2" ry="5.6" fill={skin} stroke={OUTLINE} strokeWidth="2" />

      {/* Tête : l'ombre portée d'abord, puis la découpe */}
      <path d={tete(1.6)} fill={kraftOmbre} opacity="0.55" transform="translate(1.6 2.2)" />
      <path d={tete()} fill={skin} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Le relief de la découpe : un bord de joue plus sombre, côté droit. */}
      <g clipPath={`url(#${faceId})`}>
        <path d={`M${50 + 25 * 0.92} 40 C${50 + 25} ${43 + (chin - 43) * 0.52} ${50 + jx} ${chin - 5} 50 ${chin} L100 ${chin} L100 30 Z`} fill={peauOmbre} opacity="0.16" />
        <g fill={peauOmbre} opacity="0.16">
          {grains.map((g, i) => <circle key={i} cx={g.x} cy={g.y} r={g.r} />)}
        </g>
      </g>

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

      {/*
        LES PAUPIÈRES TOMBENT AVEC LE SOMMEIL.

        Elles passent SOUS les lunettes et par-dessus les yeux, quel que soit
        le regard tiré : c'est le seul signe qui se lise encore à trente-deux
        pixels, parce qu'il mange la moitié de la seule zone sombre du visage.
      */}
      {mSommeil > 0.06 && (
        <g style={{ pointerEvents: 'none' }}>
          {[eyeL, eyeR].map(x => {
            const h = 1 + mSommeil * 6.4;
            return (
              <g key={x}>
                {/* La paupière est un aplat de peau, sans contour en haut :
                    un trait horizontal au-dessus de l'œil se lisait comme un
                    second sourcil. Seul le BORD BAS est repassé au feutre. */}
                <path d={`M${x - 6.4} ${eyeY - 6.5} h12.8 v${h} q-6.4 2.2 -12.8 0 Z`} fill={skin} />
                <path d={`M${x - 6.4} ${eyeY - 6.5 + h} q6.4 2.2 12.8 0`} fill="none" stroke={OUTLINE} strokeWidth="1.5" strokeLinecap="round" />
              </g>
            );
          })}
        </g>
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

      {/* Nez, une petite ombre de papier plié plutôt qu'un crochet seul, et
          calé sur la bouche : il s'arrête cinq unités au-dessus d'elle. */}
      <path d={`M50 52 L${46.5} ${mY - 5} q3.5 2.2 7 0 Z`} fill={peauOmbre} opacity="0.28" />
      <path d={`M50 52 l-3.5 ${mY - 57} q3.5 2.2 7 0`} fill="none" stroke={OUTLINE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />

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

      {/*
        BARBE ET MOUSTACHE : AVANT la bouche, et à leur place.

        Le « bouc » était dessiné de 62 à 66, la bouche de 65 à 68 : les deux
        se chevauchaient et produisaient au milieu du visage une masse noire
        qu'on lisait comme une bouche grande ouverte. C'est le défaut le plus
        visible de la planche de contact.

        Et les trois formes ne correspondaient pas à leurs propres libellés :
        l'Atelier vendait « Moustache » et dessinait une barbe pleine. Chaque
        valeur dessine maintenant ce que son nom annonce, et se cale sur le
        menton du visage.
      */}
      {beardStyle === 1 && (
        // Moustache : au-dessus de la lèvre, elle ne touche pas la bouche.
        <path d={`M50 ${mY - 4.5} Q42 ${mY - 8} 35 ${mY - 4} Q40 ${mY} 46 ${mY - 3.5} Q48 ${mY - 4.5} 50 ${mY - 3} Q52 ${mY - 4.5} 54 ${mY - 3.5} Q60 ${mY} 65 ${mY - 4} Q58 ${mY - 8} 50 ${mY - 4.5} Z`} fill={hair} />
      )}
      {beardStyle === 2 && (
        // Bouc : sous la lèvre, sur le menton, plus une moustache fine.
        <g fill={hair}>
          <path d={`M45 ${mY + 5.5} q5 2.5 10 0 q-1 ${chin - mY - 5} -5 ${chin - mY - 3.5} q-4 -1.5 -5 -${chin - mY - 5} Z`} />
          <path d={`M50 ${mY - 4} Q44 ${mY - 7} 38 ${mY - 4} Q44 ${mY - 2.5} 50 ${mY - 3} Q56 ${mY - 2.5} 62 ${mY - 4} Q56 ${mY - 7} 50 ${mY - 4} Z`} />
        </g>
      )}
      {beardStyle === 3 && (
        // Barbe pleine : elle épouse la mâchoire, donc la forme du visage.
        <path d={`M28 54 Q30 ${chin - 2} 50 ${chin + 4} Q70 ${chin - 2} 72 54 Q68 ${mY + 2} ${50 + jx * 0.6} ${mY + 3} Q50 ${mY + 7} ${50 - jx * 0.6} ${mY + 3} Q32 ${mY + 2} 28 54 Z`} fill={hair} />
      )}

      {/* Bouche */}
      {mouthStyle === 0 && <rect x="43" y={mY} width="14" height={female ? 3 : 2.4} rx="1.5" fill={mouthColor} />}
      {mouthStyle === 1 && <path d={`M42 ${mY} q8 8 16 0`} fill="none" stroke={mouthColor} strokeWidth="2.6" strokeLinecap="round" />}
      {mouthStyle === 2 && <path d={`M42 ${mY + 3} q8 -8 16 0`} fill="none" stroke={mouthColor} strokeWidth="2.4" strokeLinecap="round" />}
      {mouthStyle === 3 && <ellipse cx="50" cy={mY + 1} rx="4" ry="5" fill={mouthColor} />}
      {mouthStyle === 4 && <path d={`M42 ${mY + 1} q8 6 16 -1`} fill="none" stroke={mouthColor} strokeWidth="2.4" strokeLinecap="round" />}

      {/* Boucles d'oreilles */}
      {earrings && (
        <g fill="#E8B84B" stroke={OUTLINE} strokeWidth="0.8">
          <circle cx="25" cy="58" r="2.2" />
          <circle cx="75" cy="58" r="2.2" />
        </g>
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
      {/*
        LE JETON DU MARCHÉ, et il est en carton comme le reste.

        Les neuf autres pièces de cou sont des objets du monde, écharpe,
        cravate, perles. Celle-ci est un morceau du décor : un rond découpé
        dans une cannelure, une ficelle, une croix au feutre. Elle se
        reconnaît à sa MATIÈRE avant sa forme, ce qui est la seule façon de
        rendre lisible à 38 px un objet dont personne ne connaît le nom.
      */}
      {accNeck === 'jeton-marche' && (
        <g stroke={OUTLINE} strokeWidth="1.1" strokeLinejoin="round">
          <path d="M38 75 Q50 90 62 75" fill="none" stroke="#B99A6B" strokeWidth="1.4" />
          <circle cx="50" cy="88" r="6.2" fill="#C9A97E" />
          {/* La cannelure du carton, deux traits, pas une texture. */}
          <g stroke="#A8895F" strokeWidth="0.9" opacity="0.85">
            <line x1="45" y1="86" x2="55" y2="86" />
            <line x1="45" y1="90" x2="55" y2="90" />
          </g>
          {/* La marque du vendeur, au feutre, jamais droite. */}
          <g stroke="#2A1F1A" strokeWidth="1.5" strokeLinecap="round" opacity="0.9">
            <line x1="47.2" y1="85.4" x2="52.6" y2="90.8" />
            <line x1="52.8" y1="85.6" x2="47.4" y2="90.6" />
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

      {/* ══════════ CALQUE D'ÉTAT ══════════
          Un signe par jauge, tous continus. Voir le long commentaire en tête
          de composant : c'est ici que se joue « on lit la cause, pas seulement
          la gravité ». `pnpm planche-etat` rend la grille qui juge ce bloc. */}

      {/* LA FAIM CREUSE : joues et tempes. */}
      {mFaim > 0.06 && (
        <g clipPath={`url(#${faceId})`} style={{ pointerEvents: 'none' }}>
          <path d={`M${50 - jx - 3} 50 Q${50 - jx + 4} ${mY - 4} ${50 - jx * 0.5} ${mY + 3}`} stroke={peauOmbre} strokeWidth={2 + mFaim * 3} fill="none" strokeLinecap="round" opacity={mFaim * 0.55} />
          <path d={`M${50 + jx + 3} 50 Q${50 + jx - 4} ${mY - 4} ${50 + jx * 0.5} ${mY + 3}`} stroke={peauOmbre} strokeWidth={2 + mFaim * 3} fill="none" strokeLinecap="round" opacity={mFaim * 0.55} />
          {/* Les tempes se creusent aussi : c'est ce qui vieillit un visage. */}
          <ellipse cx="30" cy="41" rx="6" ry="4.5" fill={peauOmbre} opacity={mFaim * 0.3} />
          <ellipse cx="70" cy="41" rx="6" ry="4.5" fill={peauOmbre} opacity={mFaim * 0.3} />
        </g>
      )}

      {/* LE SOMMEIL CERNE : sous les paupières déjà tombées. */}
      {mSommeil > 0.06 && (
        <g style={{ pointerEvents: 'none' }} clipPath={`url(#${faceId})`}>
          {[eyeL, eyeR].map(x => (
            <g key={x}>
              <path d={`M${x - 6} ${eyeY + 5.5} Q${x} ${eyeY + 9} ${x + 6} ${eyeY + 5.5}`} stroke="#6E5A4E" strokeWidth="2" fill="none" strokeLinecap="round" opacity={mSommeil * 0.85} />
              <path d={`M${x - 5} ${eyeY + 8.5} Q${x} ${eyeY + 11} ${x + 5} ${eyeY + 8.5}`} stroke="#6E5A4E" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity={Math.max(0, mSommeil - 0.45) * 1.4} />
            </g>
          ))}
        </g>
      )}

      {/*
        LA SOIF GERCE, et il en fallait bien plus que trois traits.

        La planche donnait « soif 0 » et « soif 50 » quasiment identiques :
        trois fissures d'une unité et une teinte de lèvre à peine décalée ne
        se voient pas. La soif dessèche maintenant TOUT le pourtour de la
        bouche, la peau blanchit et se craquelle sur cinq fentes franches,
        en plus de la décoloration déjà appliquée aux lèvres.
      */}
      {mSoif > 0.15 && (
        <g style={{ pointerEvents: 'none' }}>
          <g clipPath={`url(#${faceId})`}>
            <ellipse cx="50" cy={mY + 0.5} rx="9.5" ry="5" fill="#E4D2BE" opacity={(mSoif - 0.15) * 0.34} />
          </g>
          {/* Les fentes restent SUR la lèvre. Plus hautes, elles débordaient
              en un rayé sombre qui se lisait comme une rangée de dents. */}
          <g stroke={melanger(mouthColor, '#5E3A2A', 0.5)} strokeWidth="1" strokeLinecap="round" opacity={(mSoif - 0.15) * 1.05}>
            <line x1="44.5" y1={mY - 1} x2="44.2" y2={mY + 2.4} />
            <line x1="47.5" y1={mY - 1.6} x2="47.5" y2={mY + 3} />
            <line x1="50.5" y1={mY - 1.8} x2="50.5" y2={mY + 3.2} />
            <line x1="53.5" y1={mY - 1.6} x2="53.5" y2={mY + 3} />
            <line x1="56.5" y1={mY - 1} x2="56.8" y2={mY + 2.4} />
          </g>
        </g>
      )}

      {/*
        LE MENTAL FAIT TREMBLER LE TRAIT.

        Pas le visage : le DESSIN. Un second contour décalé, comme une main qui
        ne tient plus le feutre, c'est le même parti pris que le texte qui se
        brouille quand le mental lâche, et ça ne dépend d'aucun des quatorze
        traits tirés, donc ça ne peut entrer en conflit avec rien.
      */}
      {mMental > 0.12 && (
        <g style={{ pointerEvents: 'none' }} opacity={(mMental - 0.12) * 0.85} strokeDasharray="3.5 2.5">
          {/* Le trait est POINTILLÉ : un second contour plein se lisait comme
              une image mal rendue, un contour repassé se lit comme un dessin
              que la main n'arrive plus à fermer. */}
          <path d={tete()} fill="none" stroke={OUTLINE} strokeWidth="1.5" transform={`translate(${-1.4 - mMental * 1.6} ${0.9 + mMental * 1.2})`} />
          <path d={tete()} fill="none" stroke={OUTLINE} strokeWidth="1.1" transform={`translate(${1.1 + mMental * 1.2} ${-0.7 - mMental})`} />
        </g>
      )}

      {/* LA SANTÉ MARQUE : un hématome sur la pommette. */}
      {mSante > 0.35 && (
        <g clipPath={`url(#${faceId})`} style={{ pointerEvents: 'none' }} opacity={(mSante - 0.35) * 1.4}>
          <ellipse cx="34" cy="55" rx="6.5" ry="4.5" fill="#7A5A78" opacity="0.5" transform="rotate(-12 34 55)" />
          <ellipse cx="34" cy="55" rx="4" ry="2.6" fill="#6B4A6E" opacity="0.45" transform="rotate(-12 34 55)" />
        </g>
      )}

      {/* LA GRAVITÉ GÉNÉRALE : les coins de la bouche, et la sueur.
          Des coins, pas une seconde bouche : l'ancien calque en redessinait
          une par-dessus la vraie, et on en voyait deux. */}
      {mal > 0.1 && (
        <g style={{ pointerEvents: 'none' }}>
          <path d={`M41.5 ${mY + 0.5} q-1.6 ${1.5 + mal * 4.5} -3.4 ${2 + mal * 5}`} stroke={OUTLINE} strokeWidth={1.4 + mal} fill="none" strokeLinecap="round" opacity={mal * 0.8} />
          <path d={`M58.5 ${mY + 0.5} q1.6 ${1.5 + mal * 4.5} 3.4 ${2 + mal * 5}`} stroke={OUTLINE} strokeWidth={1.4 + mal} fill="none" strokeLinecap="round" opacity={mal * 0.8} />
        </g>
      )}
      {mal > 0.5 && (
        <path d="M71 33 q-2.6 4.5 0 7 q2.6 -2.5 0 -7 Z" fill="#8FB8D8" stroke="#5E86A6" strokeWidth="0.6" opacity={(mal - 0.5) * 1.9} style={{ pointerEvents: 'none' }} />
      )}

      {/* LA BONNE FORME : joues, et un coin de bouche qui remonte. */}
      {vigueur > 0.04 && (
        <g style={{ pointerEvents: 'none' }}>
          <g clipPath={`url(#${faceId})`}>
            <circle cx="32" cy="59" r={5 + vigueur * 2} fill="#E8927C" opacity={vigueur * 0.42} />
            <circle cx="68" cy="59" r={5 + vigueur * 2} fill="#E8927C" opacity={vigueur * 0.42} />
          </g>
          <path d={`M41.5 ${mY + 1.5} q-1.4 -${1 + vigueur * 3} -3 -${1.5 + vigueur * 3.5}`} stroke={OUTLINE} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity={vigueur * 0.7} />
          <path d={`M58.5 ${mY + 1.5} q1.4 -${1 + vigueur * 3} 3 -${1.5 + vigueur * 3.5}`} stroke={OUTLINE} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity={vigueur * 0.7} />
        </g>
      )}
      {vigueur > 0.55 && (
        // L'étincelle reste HORS de la découpe : elle brille à côté de la tête.
        <path d="M80 28 l1.4 3 3 1.4 -3 1.4 -1.4 3 -1.4 -3 -3 -1.4 3 -1.4 Z" fill="#F5D06B" stroke={kraftOmbre} strokeWidth="0.4" opacity={(vigueur - 0.55) * 2.2} style={{ pointerEvents: 'none' }} />
      )}

      {/* ---- Calque de TENUE (dérivé de la Dignité) ----
          Quatre paliers, quatre crans discrets. Rien de dramatique : c'est la
          présentation qui se dégrade, pas la santé. Sous 75, le carton
          commence à s'écorner ; sous 50, le trait de feutre bave ; sous 25, la
          barbe gagne et le col se plie pour de bon. */}
      {/*
        C'EST LE CARTON QUI S'ABÎME, PAS LE PERSONNAGE.

        L'ancien premier palier posait un petit triangle beige au bord gauche du
        visage : à la taille du hub, il ressemblait à une flèche pointant vers
        la tête, pas à un coin corné. Les trois paliers sont maintenant des
        accidents de la MATIÈRE, un pli, une déchirure, une réparation au
        ruban, parce que c'est ce que le joueur peut reconnaître d'un coup
        d'œil sans qu'aucun texte ne le dise.
      */}
      {/*
        LA BARBE DE TROIS JOURS : le signe qui porte le plus loin, parce qu'il
        assombrit toute la mâchoire. Densité et opacité continues.

        Elle démarrait à 0,2 de crasse, c'est-à-dire à 80 de dignité, et le
        contrôle a trouvé là une zone morte que l'œil ne voyait pas : entre 80
        et 100, plus rien ne bougeait, alors que c'est la plage où l'on passe
        le début de partie. Elle commence maintenant à peine la dignité
        quittée, ce qui est aussi plus juste : on ne se rase pas dehors.
      */}
      {crasse > 0.06 && beardStyle !== 3 && (
        <g clipPath={`url(#${faceId})`} style={{ pointerEvents: 'none' }}>
          {/* Assombrie, jamais éclaircie : tirée telle quelle, une chevelure
              blanche posait un bavoir clair au milieu du menton. Une barbe qui
              repousse fonce le bas du visage, quelle que soit sa couleur. */}
          <path
            d={`M${50 - jx - 2} ${mY - 4} Q${50 - jx + 1} ${chin - 1} 50 ${chin + 2.5} Q${50 + jx - 1} ${chin - 1} ${50 + jx + 2} ${mY - 4} Q${50 + jx * 0.6} ${mY + 4} 50 ${mY + 5} Q${50 - jx * 0.6} ${mY + 4} ${50 - jx - 2} ${mY - 4} Z`}
            fill={melanger(hair, '#2A1F16', 0.45)}
            opacity={(crasse - 0.06) * 0.44}
          />
        </g>
      )}
      {/* Des mèches qui ne tiennent plus. */}
      {crasse > 0.4 && hairStyle !== 0 && !accHat && hat !== 1 && hat !== 2 && (
        <g stroke={hair} strokeWidth="1.6" strokeLinecap="round" fill="none" style={{ pointerEvents: 'none' }} opacity={(crasse - 0.4) * 1.6}>
          <path d="M34 22 q-3 -6 -1 -10" /><path d="M50 17 q1 -7 4 -9" /><path d="M64 21 q4 -5 3 -10" />
        </g>
      )}

      {/* ET LE CARTON, EN SECOND : un coin corné, un bord mangé, une fissure
          recollée. Ils arrivent l'un après l'autre, mais en fondu. */}
      {crasse > 0.25 && (
        <g style={{ pointerEvents: 'none' }} opacity={Math.min(1, (crasse - 0.25) * 2.6)}>
          <path d="M2 20 L20 2 L20 20 Z" fill={melanger(bg, '#FFFFFF', 0.4)} stroke={kraftOmbre} strokeWidth="0.9" strokeLinejoin="round" />
          <path d="M20 20 L20 2" stroke={kraftOmbre} strokeWidth="0.9" opacity="0.6" />
        </g>
      )}
      {crasse > 0.5 && (
        <g style={{ pointerEvents: 'none' }} opacity={Math.min(1, (crasse - 0.5) * 2.6)}>
          {/* Le bord droit est mangé : la cannelure sort par la déchirure. */}
          <path d="M100 34 Q94 44 97 54 Q92 64 98 74 Q94 82 100 90 L100 34 Z" fill={melanger(bg, '#FFFFFF', 0.3)} stroke={kraftOmbre} strokeWidth="0.8" strokeLinejoin="round" />
          <g stroke={kraftOmbre} strokeWidth="0.6" opacity="0.5">
            <line x1="96" y1="40" x2="100" y2="40" /><line x1="97" y1="50" x2="100" y2="50" />
            <line x1="95" y1="60" x2="100" y2="60" /><line x1="97" y1="70" x2="100" y2="70" />
            <line x1="96" y1="80" x2="100" y2="80" />
          </g>
        </g>
      )}
      {crasse > 0.75 && (
        <g style={{ pointerEvents: 'none' }} opacity={Math.min(1, (crasse - 0.75) * 4)}>
          {/* Une fissure recollée au ruban adhésif : réparé, pas remplacé. */}
          <path d="M8 6 L12 40 L7 92" stroke={kraftOmbre} strokeWidth="1.1" fill="none" opacity="0.6" />
          <g transform="rotate(-12 10 44)">
            <rect x="3" y="40" width="13" height="6" fill="#EFE6D2" opacity="0.5" stroke={kraftOmbre} strokeWidth="0.5" />
          </g>
          {/* Un voile terne sur l'ensemble : plus personne ne vous regarde. */}
          <rect x="0" y="0" width="100" height="100" rx="20" fill="#6B5740" opacity="0.12" />
        </g>
      )}
    </svg>
  );
}
