import { useGame } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { isMuted, setMuted } from '@/lib/sound';

// ⚠️ Remplace cette URL par ta vraie page de politique de confidentialité
// avant publication (obligatoire avec des publicités sur les stores).
const PRIVACY_URL = 'https://example.com/roi-du-carton/confidentialite';
const APP_VERSION = '1.5.0';

export default function SettingsScreen() {
  const { state, dispatch } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);
  const [muted, setMutedState] = useState(isMuted());

  return (
    <div className="min-h-screen bg-texture p-5 flex flex-col gap-4">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: state.character ? 'main' : 'title' })}
          className="action-btn w-10 h-10 flex items-center justify-center text-lg"
          aria-label="Retour"
        >
          ←
        </button>
        <h1 className="text-2xl text-[#2A1F1A]">Options</h1>
      </div>

      {/* À propos */}
      <motion.section
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="craft-card p-4"
      >
        <h2 className="text-base font-semibold text-[#2A1F1A] mb-1">À propos</h2>
        <p className="text-sm text-[#6B5740] leading-relaxed">
          <strong>Le Roi du Carton</strong> — une épopée urbaine où vous incarnez
          un sans-abri qui lutte pour survivre dans la rue, entre humour noir et
          dure réalité. Gérez vos besoins vitaux, explorez, mendiez, et tenez
          le plus longtemps possible.
        </p>
      </motion.section>

      {/* Comment jouer */}
      <motion.section
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="craft-card p-4"
      >
        <h2 className="text-base font-semibold text-[#2A1F1A] mb-2">Comment jouer</h2>
        <ul className="text-sm text-[#6B5740] leading-relaxed flex flex-col gap-1.5">
          <li>❤️ Surveillez vos 6 jauges : santé, mental, faim, soif, sommeil, dignité.</li>
          <li>🎯 Chaque jour, vous avez un nombre limité d'actions.</li>
          <li>🔍 <strong>Explorer</strong>, 🙏 <strong>Mendier</strong>, 😴 <strong>Dormir</strong>, 🥊 <strong>Bagarre</strong> et 🥷 <strong>Voler</strong> (risqué) font avancer la journée.</li>
          <li>🌦️ La météo influence vos jauges : préparez-vous au pire.</li>
          <li>💀 Si la santé ou le mental tombe à zéro, c'est la fin… sauf seconde chance !</li>
        </ul>
      </motion.section>

      {/* Son */}
      <motion.section
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="craft-card p-4"
      >
        <button
          onClick={() => { const v = !muted; setMuted(v); setMutedState(v); }}
          className="w-full flex items-center justify-between"
        >
          <span className="text-base font-semibold text-[#2A1F1A]">{muted ? '🔇' : '🔊'} Son</span>
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full ${muted ? 'bg-[#E8D5C0] text-[#8B6B4A]' : 'bg-[#4A9B5F]/15 text-[#3d8b4f]'}`}
          >
            {muted ? 'Coupé' : 'Activé'}
          </span>
        </button>
      </motion.section>

      {/* Données */}
      <motion.section
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="craft-card p-4 flex flex-col gap-3"
      >
        <h2 className="text-base font-semibold text-[#2A1F1A]">Données</h2>

        <a
          href={PRIVACY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn p-3 text-sm text-[#3D3020] flex items-center justify-between"
        >
          <span>🔒 Politique de confidentialité</span>
          <span className="text-[#A08B70]">↗</span>
        </a>

        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="action-btn p-3 text-sm text-[#B84A3A] flex items-center gap-2"
          >
            🗑️ Réinitialiser les meilleurs scores
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { dispatch({ type: 'RESET_SCORES' }); setConfirmReset(false); }}
              className="flex-1 p-3 text-sm font-semibold text-white rounded-xl"
              style={{ background: 'linear-gradient(135deg, #D94F4F, #B83A3A)' }}
            >
              Confirmer
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="flex-1 action-btn p-3 text-sm text-[#3D3020]"
            >
              Annuler
            </button>
          </div>
        )}
      </motion.section>

      {/* Crédits & version */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-center text-xs text-[#A08B70] mt-auto pt-4"
      >
        <p>Créé avec ❤️ et beaucoup de carton.</p>
        <p className="mt-1">Version {APP_VERSION}</p>
      </motion.div>
    </div>
  );
}
