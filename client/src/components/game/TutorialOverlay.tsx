import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { playClick } from '@/lib/sound';

/*
 * Tutoriel dynamique : une visite guidée qui met en lumière les VRAIS
 * éléments de l'écran principal (projecteur découpé dans un voile sombre),
 * étape par étape. S'affiche au premier lancement, rejouable via Options.
 */

export const TUTORIAL_KEY = 'roi-du-carton-tutorial-seen-v3';

interface Step { targetId: string | null; emoji: string; title: string; text: string; }

const STEPS: Step[] = [
  {
    targetId: 'tuto-header', emoji: '👤', title: 'Votre personnage',
    text: 'Votre nom, votre quartier et le jour de survie. À droite : votre argent 💰 et votre respect ⭐ — le respect fait baisser les prix en boutique, aide à intimider les voyous et débloque certains choix « on vous connaît ici ». Touchez votre visage 🎽 pour ouvrir la garde-robe et équiper les accessoires gagnés par vos succès.',
  },
  {
    targetId: 'tuto-stats', emoji: '❤️', title: 'Vos six jauges',
    text: 'Santé, mental, faim, soif, sommeil, dignité. Elles chutent chaque nuit. Si la santé ou le mental tombe à zéro… c\'est la fin.',
  },
  {
    targetId: 'tuto-stats', emoji: '👑', title: 'La dignité, arme secrète',
    text: 'Sous 25 de dignité, votre mental s\'effondre chaque nuit — c\'est la spirale qui tue. Bien tenue, elle fait donner les passants à la manche et ouvre des choix réservés aux gens « présentables ». La laverie est votre alliée.',
  },
  {
    targetId: 'tuto-weather', emoji: '🌦️', title: 'La météo',
    text: 'Elle change chaque jour et pèse sur vos jauges et vos gains. Orage et neige sont redoutables — anticipez grâce à la prévision de demain.',
  },
  {
    targetId: 'tuto-actions', emoji: '🎯', title: '3 actions par jour',
    text: 'Explorer déclenche des rencontres. Mendier se joue à l\'adresse. Voler, c\'est un casse en grille : récupérez le butin et filez vers la sortie sans vous faire toucher — sinon bagarre ou garde à vue ! Dormir récupère, Bagarre… c\'est la bagarre.',
  },
  {
    targetId: 'tuto-secondary', emoji: '🛒', title: 'Gratuit et vital',
    text: 'Boutiques (nourriture, soins, armes), voyage entre quartiers et votre sac : utilisez et revendez vos objets. Ces menus ne coûtent aucune action.',
  },
  {
    targetId: 'tuto-nextday', emoji: '🌙', title: 'Jour suivant',
    text: 'Vos actions épuisées, passez la nuit. Elle consomme vos jauges — surtout sous la pluie. Préparez-vous avant de dormir.',
  },
  {
    targetId: null, emoji: '👑', title: 'À vous de jouer !',
    text: 'La rue est dure, mais l\'humour est plus dur. Bonne chance, Majesté du carton.',
  },
];

interface Rect { top: number; left: number; width: number; height: number; }

export default function TutorialOverlay() {
  const [visible, setVisible] = useState(() => {
    try { return localStorage.getItem(TUTORIAL_KEY) !== '1'; } catch { return false; }
  });
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const s = STEPS[step];

  // Mesure l'élément ciblé (après les animations d'entrée de l'écran).
  useEffect(() => {
    if (!visible) return;
    if (!s.targetId) { setRect(null); return; }
    let cancelled = false;
    const measure = () => {
      const el = document.getElementById(s.targetId!);
      if (!el || cancelled) { setRect(null); return; }
      el.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    // Deux mesures : tout de suite, puis après les animations framer (~600 ms).
    const t1 = setTimeout(measure, 80);
    const t2 = setTimeout(measure, 650);
    return () => { cancelled = true; clearTimeout(t1); clearTimeout(t2); };
  }, [visible, step, s.targetId]);

  function close() {
    try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch { /* silent */ }
    setVisible(false);
  }

  if (!visible) return null;

  const last = step === STEPS.length - 1;
  const pad = 6;
  // Le panneau se place sous l'élément s'il est dans la moitié haute, sinon au-dessus.
  const placeBelow = rect ? rect.top + rect.height / 2 < window.innerHeight * 0.5 : false;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
      >
        {/* Projecteur : la découpe suit l'élément ciblé */}
        {rect ? (
          <motion.div
            animate={{
              top: rect.top - pad, left: rect.left - pad,
              width: rect.width + pad * 2, height: rect.height + pad * 2,
            }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="absolute rounded-2xl pointer-events-none"
            style={{ boxShadow: '0 0 0 9999px rgba(42,31,26,0.66)', border: '2px solid #F2C14E' }}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: 'rgba(42,31,26,0.66)' }} />
        )}

        {/* Panneau d'explication */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: placeBelow ? -8 : 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          className="absolute left-1/2 -translate-x-1/2 craft-card-solid p-4 w-[calc(100%-2.5rem)] max-w-sm"
          style={
            rect
              ? placeBelow
                ? { top: Math.min(rect.top + rect.height + 16, window.innerHeight - 240) }
                : { bottom: Math.max(window.innerHeight - rect.top + 16, 96) }
              : { top: '50%', transform: 'translate(-50%, -50%)' }
          }
        >
          <div className="flex items-start gap-3 mb-2">
            <span className="text-3xl">{s.emoji}</span>
            <div>
              <h2 className="text-xl text-[#2A1F1A] leading-tight">{s.title}</h2>
              <p className="text-[10px] text-[#A08B70] font-mono mt-0.5">Étape {step + 1}/{STEPS.length}</p>
            </div>
          </div>
          <p className="text-sm text-[#6B5740] leading-relaxed mb-3">{s.text}</p>

          <div className="flex items-center gap-2">
            {!last && (
              <button
                onClick={close}
                className="px-3 py-2.5 text-xs text-[#A08B70] font-medium hover:text-[#6B5740] transition-colors"
              >
                Passer
              </button>
            )}
            <button
              onClick={() => { playClick(); last ? close() : setStep(step + 1); }}
              className="btn-primary flex-1 py-2.5 text-sm"
            >
              {last ? 'C\'est parti !' : 'Suivant →'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
