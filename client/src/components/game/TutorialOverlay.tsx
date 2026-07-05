import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { playClick } from '@/lib/sound';
import { useLang, tr } from '@/lib/lang';

/*
 * Tutoriel dynamique : une visite guidée qui met en lumière les VRAIS
 * éléments de l'écran principal (projecteur découpé dans un voile sombre),
 * étape par étape. S'affiche au premier lancement, rejouable via Options.
 */

export const TUTORIAL_KEY = 'roi-du-carton-tutorial-seen-v3';

interface Step { targetId: string | null; emoji: string; title: string; titleEn: string; text: string; textEn: string; }

const STEPS: Step[] = [
  {
    targetId: 'tuto-header', emoji: '👤', title: 'Votre personnage', titleEn: 'Your character',
    text: 'Votre nom, votre quartier et le jour de survie. À droite : votre argent 💰 et votre respect ⭐ — le respect fait baisser les prix en boutique, aide à intimider les voyous et débloque certains choix « on vous connaît ici ». Touchez votre visage 🎽 pour ouvrir la garde-robe et équiper les accessoires gagnés par vos succès.',
    textEn: 'Your name, your district and the day you\'ve survived to. On the right: your money 💰 and your respect ⭐ — respect lowers shop prices, helps you intimidate thugs, and unlocks some "they know you here" choices. Tap your face 🎽 to open the wardrobe and equip accessories earned from achievements.',
  },
  {
    targetId: 'tuto-stats', emoji: '❤️', title: 'Vos six jauges', titleEn: 'Your six gauges',
    text: 'Santé, mental, faim, soif, sommeil, dignité. Elles chutent chaque nuit. Si la santé ou le mental tombe à zéro… c\'est la fin.',
    textEn: 'Health, mind, hunger, thirst, sleep, dignity. They drop every night. If health or mind hits zero… it\'s over.',
  },
  {
    targetId: 'tuto-stats', emoji: '👑', title: 'La dignité, arme secrète', titleEn: 'Dignity, your secret weapon',
    text: 'Sous 25 de dignité, votre mental s\'effondre chaque nuit — c\'est la spirale qui tue. Bien tenue, elle fait donner les passants à la manche et ouvre des choix réservés aux gens « présentables ». La laverie est votre alliée.',
    textEn: 'Below 25 dignity, your mind collapses every night — that\'s the spiral that kills. Kept high, passers-by give more when you beg, and "presentable" choices open up. The laundromat is your ally.',
  },
  {
    targetId: 'tuto-weather', emoji: '🌦️', title: 'La météo', titleEn: 'The weather',
    text: 'Elle change chaque jour et pèse sur vos jauges et vos gains. Orage et neige sont redoutables — anticipez grâce à la prévision de demain.',
    textEn: 'It changes daily and weighs on your gauges and your gains. Storms and snow are brutal — plan ahead using tomorrow\'s forecast.',
  },
  {
    targetId: 'tuto-actions', emoji: '🎯', title: '3 actions par jour', titleEn: '3 actions a day',
    text: 'Explorer déclenche des rencontres. Mendier se joue à l\'adresse. Voler, c\'est un casse en grille : récupérez le butin et filez vers la sortie sans vous faire toucher — sinon bagarre ou garde à vue ! Dormir récupère, Bagarre… c\'est la bagarre.',
    textEn: 'Explore triggers encounters. Begging is a game of skill. Stealing is a grid heist: grab the loot and slip out without getting caught — or it\'s a fight or a night in a cell! Sleep restores, Fight… is a fight.',
  },
  {
    targetId: 'tuto-secondary', emoji: '🛒', title: 'Gratuit et vital', titleEn: 'Free and vital',
    text: 'Boutiques (nourriture, soins, armes), voyage entre quartiers et votre sac : utilisez et revendez vos objets. Ces menus ne coûtent aucune action.',
    textEn: 'Shops (food, healing, weapons), travel between districts and your bag: use and resell your items. These menus cost no action.',
  },
  {
    targetId: 'tuto-nextday', emoji: '🌙', title: 'Jour suivant', titleEn: 'Next day',
    text: 'Vos actions épuisées, passez la nuit. Elle consomme vos jauges — surtout sous la pluie. Préparez-vous avant de dormir.',
    textEn: 'Once your actions are used up, get through the night. It drains your gauges — especially in the rain. Prepare before you sleep.',
  },
  {
    targetId: null, emoji: '👑', title: 'À vous de jouer !', titleEn: 'Over to you!',
    text: 'La rue est dure, mais l\'humour est plus dur. Bonne chance, Majesté du carton.',
    textEn: 'The street is hard, but humor is harder. Good luck, Your Cardboard Majesty.',
  },
];

interface Rect { top: number; left: number; width: number; height: number; }

export default function TutorialOverlay() {
  useLang();
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
              <h2 className="text-xl text-[#2A1F1A] leading-tight">{tr(s.title, s.titleEn)}</h2>
              <p className="text-[10px] text-[#A08B70] font-mono mt-0.5">{tr('Étape', 'Step')} {step + 1}/{STEPS.length}</p>
            </div>
          </div>
          <p className="text-sm text-[#6B5740] leading-relaxed mb-3">{tr(s.text, s.textEn)}</p>

          <div className="flex items-center gap-2">
            {!last && (
              <button
                onClick={close}
                className="px-3 py-2.5 text-xs text-[#A08B70] font-medium hover:text-[#6B5740] transition-colors"
              >
                {tr('Passer', 'Skip')}
              </button>
            )}
            <button
              onClick={() => { playClick(); last ? close() : setStep(step + 1); }}
              className="btn-primary flex-1 py-2.5 text-sm"
            >
              {last ? tr('C\'est parti !', 'Let\'s go!') : tr('Suivant →', 'Next →')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
