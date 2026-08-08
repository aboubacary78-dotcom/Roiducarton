import { motion } from 'framer-motion';
import { playClick } from '@/lib/sound';
import { useLang, tr } from '@/lib/lang';
import SafeImg from './SafeImg';
import SceneIllustration, { type SceneTheme } from './SceneIllustration';

/*
 * Petit tutoriel de mini-jeu, affiché UNE SEULE FOIS par type de mini-jeu
 * (casse, manche, bagarre). Une fois lu et validé, il ne réapparaît plus :
 * on mémorise l'identifiant dans le localStorage. Le mini-jeu lui-même n'est
 * monté qu'après ce panneau (voir le wrapper de chaque mini-jeu), pour que
 * ses minuteurs ne tournent pas pendant la lecture.
 */

const INTRO_KEY = 'roi-du-carton-minigame-intro-v1';

export function introSeen(id: string): boolean {
  try {
    const raw = localStorage.getItem(INTRO_KEY);
    if (!raw) return false;
    return (JSON.parse(raw) as string[]).includes(id);
  } catch {
    return false;
  }
}

function markSeen(id: string): void {
  try {
    const raw = localStorage.getItem(INTRO_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(id)) list.push(id);
    localStorage.setItem(INTRO_KEY, JSON.stringify(list));
  } catch {
    /* silent */
  }
}

interface Line {
  emoji: string;
  fr: string;
  en: string;
}

export default function MinigameIntro({
  id,
  emoji,
  title,
  titleEn,
  lines,
  onStart,
  image,
  scene = 'street',
}: {
  id: string;
  emoji: string;
  title: string;
  titleEn: string;
  lines: Line[];
  onStart: () => void;
  /** Diorama du mini-jeu (assets/intro-*.webp) ; repli sur la scène dessinée. */
  image?: string;
  scene?: SceneTheme;
}) {
  useLang();

  function start() {
    playClick();
    markSeen(id);
    onStart();
  }

  return (
    <div className="min-h-screen bg-texture p-5 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        className="craft-card-solid p-5 w-full max-w-sm"
      >
        {/* Le mini-jeu en image : jusqu'ici, ces cartes n'avaient qu'un emoji.
            Le diorama s'affiche s'il existe, sinon la scène dessinée. */}
        <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3 shadow-[0_3px_12px_rgba(58,42,30,0.15)]">
          <SceneIllustration theme={scene} className="absolute inset-0 w-full h-full" sway />
          {image && <SafeImg src={image} className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <span className="absolute bottom-1.5 right-2.5 text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">{emoji}</span>
        </div>

        <div className="text-center mb-4">
          <h1 className="text-2xl text-[#2A1F1A] leading-tight">{tr(title, titleEn)}</h1>
          <p className="text-[10px] text-[#A08B70] font-mono mt-1 uppercase tracking-wide">
            {tr('Comment jouer', 'How to play')}
          </p>
        </div>

        <ul className="flex flex-col gap-2.5 mb-5">
          {lines.map((l, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.06 }}
              className="flex items-start gap-2.5 text-sm text-[#6B5740] leading-snug"
            >
              <span className="text-lg leading-none mt-0.5">{l.emoji}</span>
              <span>{tr(l.fr, l.en)}</span>
            </motion.li>
          ))}
        </ul>

        <button onClick={start} className="btn-primary w-full py-3 text-sm">
          {tr('Compris, on y va !', 'Got it, let\'s go!')}
        </button>
      </motion.div>
    </div>
  );
}
