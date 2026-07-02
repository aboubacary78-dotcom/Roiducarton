import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { playClick } from '@/lib/sound';

/*
 * Tutoriel de premier lancement : quelques cartes qui expliquent les bases.
 * S'affiche une seule fois (drapeau en localStorage), et peut être revu
 * depuis l'écran Options.
 */

export const TUTORIAL_KEY = 'roi-du-carton-tutorial-seen';

const STEPS = [
  {
    emoji: '📦',
    title: 'Bienvenue dans la rue',
    text: 'Vous incarnez un sans-abri dans une ville française. Pas de victoire, pas de fin heureuse garantie : survivez le plus longtemps possible, un jour à la fois.',
  },
  {
    emoji: '❤️',
    title: 'Vos six jauges',
    text: 'Santé, mental, faim, soif, sommeil et dignité. Elles baissent chaque nuit — plus vite s\'il pleut ou s\'il neige. Si la santé ou le mental tombe à zéro, c\'est la fin.',
  },
  {
    emoji: '🎯',
    title: 'Trois actions par jour',
    text: 'Explorer, mendier, dormir, chercher la bagarre ou voler : chaque action consomme un des trois points de la journée. Ensuite, passez au jour suivant… et encaissez la nuit.',
  },
  {
    emoji: '🥷',
    title: 'Mendier et voler',
    text: 'Ces actions se jouent à l\'adresse : attrapez les pièces, arrêtez le curseur au bon endroit. Mais gare à la police — amende pour la manche, garde à vue pour le vol.',
  },
  {
    emoji: '🥊',
    title: 'Le combat',
    text: 'Attaquez avec le bon timing, ou visez le point faible de l\'ennemi — chaque adversaire a le sien, et un indice pour le deviner. Intimider ou fuir reste parfois plus sage.',
  },
  {
    emoji: '🛒',
    title: 'Dépensez malin',
    text: 'Vos euros durement gagnés s\'échangent en boutique : nourriture, soins, armes, manteau. Le respect fait baisser les prix. Bonne chance… Majesté du carton.',
  },
];

export default function TutorialOverlay() {
  const [visible, setVisible] = useState(() => {
    try { return localStorage.getItem(TUTORIAL_KEY) !== '1'; } catch { return false; }
  });
  const [step, setStep] = useState(0);

  function close() {
    try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch { /* silent */ }
    setVisible(false);
  }

  if (!visible) return null;

  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-5 overlay-backdrop"
      >
        <motion.div
          key={step}
          initial={{ scale: 0.92, y: 12, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          className="craft-card-solid p-6 max-w-sm w-full text-center"
        >
          <div className="text-5xl mb-3">{s.emoji}</div>
          <h2 className="text-2xl text-[#2A1F1A] mb-2">{s.title}</h2>
          <p className="text-sm text-[#6B5740] leading-relaxed mb-5">{s.text}</p>

          {/* Points d'étape */}
          <div className="flex justify-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-colors"
                style={{ background: i === step ? '#C4723A' : '#E8D5C0' }}
              />
            ))}
          </div>

          <button
            onClick={() => { playClick(); last ? close() : setStep(step + 1); }}
            className="btn-primary w-full py-3 text-sm"
          >
            {last ? 'C\'est parti !' : 'Suivant'}
          </button>
          {!last && (
            <button
              onClick={close}
              className="w-full py-2.5 mt-1 text-xs text-[#A08B70] font-medium hover:text-[#6B5740] transition-colors"
            >
              Passer le tutoriel
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
