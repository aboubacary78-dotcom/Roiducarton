import { useGame } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { isMuted, setMuted } from '@/lib/sound';
import { isAdsRemoved, purchaseRemoveAds } from '@/lib/ads';
import { TUTORIAL_KEY } from './TutorialOverlay';
import { useLang, setLang, tr } from '@/lib/lang';

// ⚠️ Remplace cette URL par ta vraie page de politique de confidentialité
// avant publication (obligatoire avec des publicités sur les stores).
const PRIVACY_URL = 'https://example.com/roi-du-carton/confidentialite';
const APP_VERSION = '1.70.0';

export default function SettingsScreen() {
  const { state, dispatch } = useGame();
  const lang = useLang();
  const [confirmReset, setConfirmReset] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const [noAds, setNoAds] = useState(isAdsRemoved());
  const [buying, setBuying] = useState(false);

  async function handleBuyNoAds() {
    if (buying || noAds) return;
    setBuying(true);
    const ok = await purchaseRemoveAds();
    if (ok) setNoAds(true);
    setBuying(false);
  }

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
        <h1 className="text-2xl text-[#2A1F1A]">{tr('Options', 'Settings')}</h1>
      </div>

      {/* Langue / Language */}
      <motion.section
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="craft-card p-4"
      >
        <h2 className="text-base font-semibold text-[#2A1F1A] mb-2">{tr('Langue', 'Language')}</h2>
        <div className="flex gap-2">
          {(['fr', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                lang === l ? 'btn-primary' : 'action-btn text-[#6B5740]'
              }`}
            >
              {l === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
            </button>
          ))}
        </div>
      </motion.section>

      {/* À propos */}
      <motion.section
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.03 }}
        className="craft-card p-4"
      >
        <h2 className="text-base font-semibold text-[#2A1F1A] mb-1">{tr('À propos', 'About')}</h2>
        <p className="text-sm text-[#6B5740] leading-relaxed">
          {tr(
            'Dans Le Roi du Carton, vous êtes à la rue et il faut tenir. Manger, boire, dormir, éviter les ennuis, et durer le plus de jours possible. C\'est rude, souvent injuste, et parfois ça fait rire jaune.',
            'In Cardboard King, you\'re living on the street and you have to hang on. Eat, drink, sleep, stay out of trouble, and last as many days as you can. It\'s harsh, often unfair, and sometimes darkly funny.',
          )}
        </p>
      </motion.section>

      {/* Comment jouer */}
      <motion.section
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="craft-card p-4"
      >
        <h2 className="text-base font-semibold text-[#2A1F1A] mb-2">{tr('Comment jouer', 'How to play')}</h2>
        <ul className="text-sm text-[#6B5740] leading-relaxed flex flex-col gap-1.5">
          <li>❤️ {tr('Surveillez vos 6 jauges : santé, mental, faim, soif, sommeil, dignité.', 'Watch your 6 gauges: health, mind, hunger, thirst, sleep, dignity.')}</li>
          <li>🎯 {tr('Chaque jour, vous avez un nombre limité d\'actions.', 'Each day you have a limited number of actions.')}</li>
          <li>🔍 {tr('Explorer, Mendier, Dormir, Bagarre et Voler (risqué) font avancer la journée.', 'Explore, Beg, Sleep, Fight and Steal (risky) move the day forward.')}</li>
          <li>👑 {tr('La dignité compte : sous 25, le mental fond chaque nuit ; bien tenue, elle fait donner les passants et ouvre certains choix.', 'Dignity matters: below 25 your mind erodes each night; kept high, passers-by give more and some choices open up.')}</li>
          <li>⭐ {tr('Le respect fait baisser les prix en boutique, aide à intimider les voyous et débloque des choix « on vous connaît ici ».', 'Respect lowers shop prices, helps you intimidate thugs, and unlocks "they know you here" choices.')}</li>
          <li>🎽 {tr('Touchez votre visage pour ouvrir la garde-robe : réussissez des succès pour gagner des accessoires, gardés d\'une partie à l\'autre.', 'Tap your face to open the wardrobe: complete achievements to earn accessories that carry over between runs.')}</li>
          <li>🌦️ {tr('La météo influence vos jauges : préparez-vous au pire.', 'Weather affects your gauges: brace for the worst.')}</li>
          <li>💀 {tr('Si la santé ou le mental tombe à zéro, c\'est la fin… sauf seconde chance !', 'If health or mind hits zero, it\'s over… unless you get a second chance!')}</li>
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
          <span className="text-base font-semibold text-[#2A1F1A]">{muted ? '🔇' : '🔊'} {tr('Son', 'Sound')}</span>
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full ${muted ? 'bg-[#E8D5C0] text-[#8B6B4A]' : 'bg-[#4A9B5F]/15 text-[#3d8b4f]'}`}
          >
            {muted ? tr('Coupé', 'Off') : tr('Activé', 'On')}
          </span>
        </button>
      </motion.section>

      {/* Sans pub */}
      <motion.section
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.09 }}
        className="craft-card p-4"
      >
        {noAds ? (
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-[#2A1F1A]">🚫 {tr('Sans pub', 'Ad-free')}</span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4A9B5F]/15 text-[#3d8b4f]">
              {tr('✅ Actif, merci !', '✅ Active, thanks!')}
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-semibold text-[#2A1F1A]">🚫 {tr('Supprimer les pubs', 'Remove ads')}</span>
            </div>
            <p className="text-xs text-[#8B6B4A] mb-3">
              {tr(
                'Supprime les publicités imposées (plein écran). Les bonus vidéo facultatifs (seconde chance, gains doublés…) restent disponibles.',
                'Removes forced full-screen ads. Optional reward videos (second chance, doubled gains…) stay available.',
              )}
            </p>
            <button
              onClick={handleBuyNoAds}
              disabled={buying}
              className="w-full py-3 text-sm font-semibold text-white rounded-xl disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #7B68EE, #5A4ABB)', boxShadow: '0 4px 12px rgba(123,104,238,0.25)' }}
            >
              {buying ? tr('⏳ Achat en cours…', '⏳ Purchasing…') : tr('Acheter « Sans pub »', 'Buy "Ad-free"')}
            </button>
          </>
        )}
      </motion.section>

      {/* Données */}
      <motion.section
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="craft-card p-4 flex flex-col gap-3"
      >
        <h2 className="text-base font-semibold text-[#2A1F1A]">{tr('Données', 'Data')}</h2>

        <button
          onClick={() => {
            try { localStorage.removeItem(TUTORIAL_KEY); } catch { /* silent */ }
            dispatch({ type: 'SET_SCREEN', screen: state.character ? 'main' : 'title' });
          }}
          className="action-btn p-3 text-sm text-[#3D3020] flex items-center gap-2"
        >
          📖 {tr('Revoir le tutoriel', 'Replay the tutorial')}
        </button>

        <a
          href={PRIVACY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn p-3 text-sm text-[#3D3020] flex items-center justify-between"
        >
          <span>🔒 {tr('Politique de confidentialité', 'Privacy policy')}</span>
          <span className="text-[#A08B70]">↗</span>
        </a>

        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="action-btn p-3 text-sm text-[#B84A3A] flex items-center gap-2"
          >
            🗑️ {tr('Réinitialiser les meilleurs scores', 'Reset best scores')}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { dispatch({ type: 'RESET_SCORES' }); setConfirmReset(false); }}
              className="flex-1 p-3 text-sm font-semibold text-white rounded-xl"
              style={{ background: 'linear-gradient(135deg, #D94F4F, #B83A3A)' }}
            >
              {tr('Confirmer', 'Confirm')}
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="flex-1 action-btn p-3 text-sm text-[#3D3020]"
            >
              {tr('Annuler', 'Cancel')}
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
        <p>{tr('Créé avec ❤️ et beaucoup de carton.', 'Made with ❤️ and a lot of cardboard.')}</p>
        <p className="mt-1">Version {APP_VERSION}</p>
      </motion.div>
    </div>
  );
}
