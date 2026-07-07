import { useGame, STAT_META, type Stats } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { showRewarded } from '@/lib/ads';
import { playSuccess, playFail, playWin } from '@/lib/sound';
import { useLang, tr, tc } from '@/lib/lang';
import SceneIllustration, { sceneFor, moodFor } from './SceneIllustration';

const FLAG_LABELS: Record<string, { fr: string; en: string }> = {
  'ami-jardinier': { fr: '🌱 Ami du jardinier', en: '🌱 Gardener\'s friend' },
  'hero-enfant': { fr: '🦸 Héros d\'un enfant', en: '🦸 A child\'s hero' },
  'ami-pecheur': { fr: '🎣 Ami du pêcheur', en: '🎣 Fisherman\'s friend' },
  'ami-brocanteur': { fr: '🔧 Ami du brocanteur', en: '🔧 Junk dealer\'s friend' },
  'ami-musicien': { fr: '🎵 Ami du musicien', en: '🎵 Musician\'s friend' },
  'roi-dechetterie': { fr: '♻️ Roi de la récup', en: '♻️ King of salvage' },
  'chat-compagnon': { fr: '🐱 Chat compagnon', en: '🐱 Cat companion' },
  'aide-mairie': { fr: '🏛️ Aide de la mairie', en: '🏛️ Town hall aid' },
  'jardinier-mentor': { fr: '🌻 Mentor jardinier', en: '🌻 Gardening mentor' },
  'emploi-jardin': { fr: '💼 Emploi au jardin', en: '💼 Garden job' },
};

export default function EventResultOverlay() {
  const { state, dispatch } = useGame();
  useLang();
  const result = state.eventResult;
  const [doubling, setDoubling] = useState(false);
  // Si l'image de résultat n'existe pas encore (fichier absent), on retombe
  // proprement sur la scène générée.
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [result?.image]);

  // Son du résultat + petit encouragement : fanfare de victoire, réussite ou échec.
  useEffect(() => {
    if (!result) return;
    const positive = (result.moneyChange || 0) > 0 || (result.respectChange || 0) > 0 ||
      Object.values(result.statChanges || {}).reduce((s, v) => s + (v || 0), 0) > 0;
    const isVictory = /^Victoire|^Victory/.test(result.text);
    if (isVictory) playWin();
    else if (positive) playSuccess();
    else playFail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.text]);

  if (!result) return null;

  const canDouble = !!result.moneyChange && result.moneyChange > 0 && !result.doubled;

  async function handleDouble() {
    if (doubling) return;
    setDoubling(true);
    const rewarded = await showRewarded();
    if (rewarded) {
      dispatch({ type: 'DOUBLE_REWARD' });
    }
    setDoubling(false);
  }

  const hasChanges = result.statChanges || result.moneyChange || result.respectChange;
  const lastFlag = state.character?.activeFlags?.slice(-1)[0];
  const flagEntry = lastFlag ? FLAG_LABELS[lastFlag] : null;
  const flagLabel = flagEntry ? tr(flagEntry.fr, flagEntry.en) : null;

  const isPositive = (() => {
    if (result.moneyChange && result.moneyChange > 0) return true;
    if (result.respectChange && result.respectChange > 0) return true;
    if (result.statChanges) {
      const total = Object.values(result.statChanges).reduce((sum, v) => sum + (v || 0), 0);
      return total > 0;
    }
    return false;
  })();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-backdrop"
        onClick={() => dispatch({ type: 'DISMISS_RESULT' })}
      >
        <motion.div
          initial={{ scale: 0.9, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="craft-card-solid p-5 max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Illustration de résultat : la vraie image (diorama) de l'événement
              si elle existe, sinon une scène générée en repli. */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.05 }}
            className="relative w-full h-32 rounded-xl overflow-hidden mb-3 shadow-[0_3px_12px_rgba(58,42,30,0.12)]"
          >
            {result.image && !imgError ? (
              <img src={result.image} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
            ) : (
              <SceneIllustration theme={sceneFor(result.text, isPositive ? 'coins' : 'street')} mood={moodFor(result.text, isPositive)} className="w-full h-full" sway />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            <span className="absolute top-2 right-2 text-2xl drop-shadow">{isPositive ? '✨' : '😓'}</span>
          </motion.div>

          {/* Result text */}
          <p className="text-sm text-[#3D3020] leading-relaxed mb-4 text-center">{tc(result.text)}</p>

          {/* Stat changes */}
          {hasChanges && (
            <div className="border-t border-[#E8D5C0] pt-3 mb-4">
              <div className="flex flex-wrap gap-1.5 justify-center">
                {result.statChanges && Object.entries(result.statChanges).map(([key, val], i) => {
                  if (!val) return null;
                  const isPos = val > 0;
                  return (
                    <motion.span
                      key={key}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.12 + i * 0.04 }}
                      className={`text-[11px] px-2 py-1 rounded-full font-semibold font-mono ${
                        isPos ? 'bg-[#4A9B5F]/10 text-[#3d8b4f]' : 'bg-[#D94F4F]/10 text-[#B84A3A]'
                      }`}
                    >
                      {STAT_META[key as keyof Stats].emoji} {tr(STAT_META[key as keyof Stats].label, STAT_META[key as keyof Stats].labelEn)} {isPos ? '+' : ''}{val}
                    </motion.span>
                  );
                })}
                {!!result.moneyChange && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.25 }}
                    className={`text-[11px] px-2 py-1 rounded-full font-semibold font-mono ${
                      result.moneyChange > 0 ? 'bg-[#B8860B]/10 text-[#8B6B4A]' : 'bg-[#D94F4F]/10 text-[#B84A3A]'
                    }`}
                  >
                    💰 {result.moneyChange > 0 ? '+' : ''}{result.moneyChange}€
                  </motion.span>
                )}
                {!!result.respectChange && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.3 }}
                    className={`text-[11px] px-2 py-1 rounded-full font-semibold font-mono ${
                      result.respectChange! > 0 ? 'bg-[#7B68EE]/10 text-[#7B68EE]' : 'bg-[#D94F4F]/10 text-[#B84A3A]'
                    }`}
                  >
                    ⭐ {result.respectChange! > 0 ? '+' : ''}{result.respectChange} Respect
                  </motion.span>
                )}
              </div>
            </div>
          )}

          {/* Follow-up flag */}
          {flagLabel && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-4 p-2.5 rounded-lg bg-[#7B68EE]/6 border border-[#7B68EE]/15"
            >
              <p className="text-xs text-[#7B68EE] text-center font-semibold">{flagLabel}</p>
              <p className="text-[10px] text-[#7B68EE]/60 text-center mt-0.5">
                {tr('Cette rencontre pourrait avoir une suite...', 'This encounter might have a sequel...')}
              </p>
            </motion.div>
          )}

          {/* Doubler les gains (pub récompensée) */}
          {canDouble && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.38 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={doubling}
              onClick={handleDouble}
              className="w-full py-3 text-sm font-semibold text-white rounded-xl mb-2 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #B8860B, #9B7209)',
                boxShadow: '0 4px 16px rgba(184, 134, 11, 0.3)',
              }}
            >
              {doubling ? tr('⏳ Chargement…', '⏳ Loading…') : `🎬 ${tr('Doubler mes gains', 'Double my gains')} (+${result.moneyChange}€)`}
            </motion.button>
          )}

          {result.doubled && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs text-[#8B6B4A] font-semibold mb-2"
            >
              {tr('✅ Gains doublés !', '✅ Gains doubled!')}
            </motion.p>
          )}

          {/* Dismiss */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => dispatch({ type: 'DISMISS_RESULT' })}
            className="btn-primary w-full py-3 text-sm"
          >
            {tr('Continuer', 'Continue')}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
