import { useVerrouScroll } from '@/lib/verrouScroll';
import { useGame, STAT_META, type Stats } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { showRewarded, canOfferRewarded } from '@/lib/ads';
import { DIGNITY_TIERS, dignityTierIndex } from '@/contexts/data/dignity';
import { playSuccess, playFail, playWin, playKO } from '@/lib/sound';
import { useLang, tr, tc } from '@/lib/lang';
import KenBurnsImage from './KenBurnsImage';
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
  const [keeping, setKeeping] = useState(false);
  // Chaîne de replis pour l'image : variante réussite/échec → image de la
  // rencontre → scène dessinée. errorCount compte les échecs de chargement.
  const [errorCount, setErrorCount] = useState(0);
  useEffect(() => { setErrorCount(0); }, [result?.image]);
  const candidates = [result?.image, result?.fallbackImage].filter(Boolean) as string[];
  const shownImage = errorCount < candidates.length ? candidates[errorCount] : null;

  // Son du résultat + petit encouragement : fanfare de victoire, réussite ou échec.
  useEffect(() => {
    if (!result) return;
    const positive = (result.moneyChange || 0) > 0 || (result.respectChange || 0) > 0 ||
      Object.values(result.statChanges || {}).reduce((s, v) => s + (v || 0), 0) > 0;
    const isVictory = /^Victoire|^Victory/.test(result.text);
    // Victoire en combat : le K.O. tombe d'abord, la fanfare enchaîne.
    if (isVictory) { playKO(); setTimeout(() => playWin(), 620); }
    else if (positive) playSuccess();
    else playFail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.text]);

  // Le décor derrière ce voile ne doit plus défiler : on lisait son résultat
  // pendant que le contrat, la météo et les jauges glissaient au moindre doigt.
  useVerrouScroll(!!result);

  if (!result) return null;

  const canDouble = !!result.moneyChange && result.moneyChange > 0 && !result.doubled && canOfferRewarded();

  async function handleDouble() {
    if (doubling) return;
    setDoubling(true);
    const rewarded = await showRewarded();
    if (rewarded) {
      dispatch({ type: 'DOUBLE_REWARD' });
    }
    setDoubling(false);
  }

  /*
   * GARDER SON ALLURE.
   *
   * Cette action vient de faire quitter un palier de Dignité. Une vidéo
   * récompensée convertit bien mieux pour restaurer une perte que pour offrir
   * un gain — et il n'y a pas de perte plus lisible dans ce jeu que celle-là,
   * puisqu'elle a un nom que le joueur voit disparaître de son écran. On ne
   * rend que le strict nécessaire pour rester dans le palier : l'offre
   * restaure une allure, elle ne fabrique pas de la fierté.
   */
  const perduDignite = Math.abs(result.statChanges?.dignity ?? 0);
  const digniteActuelle = state.character?.stats.dignity ?? 0;
  const paliersPerdus = perduDignite > 0
    && dignityTierIndex(digniteActuelle) > dignityTierIndex(Math.min(100, digniteActuelle + perduDignite));
  const palierQuitte = paliersPerdus
    ? DIGNITY_TIERS.find(t => Math.min(100, digniteActuelle + perduDignite) >= t.min)
    : undefined;
  const canKeepFace = !!palierQuitte && !result.faceKept && canOfferRewarded();

  async function handleKeepFace() {
    if (keeping) return;
    setKeeping(true);
    const rewarded = await showRewarded();
    if (rewarded) {
      dispatch({ type: 'KEEP_FACE' });
    }
    setKeeping(false);
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

  // Victoire en combat : on tamponne un « K.O. » sur l'image de l'adversaire.
  const isVictory = /^Victoire|^Victory/.test(result.text);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        /*
         * ANCRÉE EN BAS, PAS AU CENTRE.
         *
         * Les mini-jeux ont leurs boutons de sortie collés au bas de l'écran ;
         * la fenêtre de résultat les avait au milieu. Le pouce devait donc
         * remonter entre le geste et sa conclusion — c'est ce déplacement qui
         * sépare deux actions au lieu de les enchaîner. Le « Continuer » se
         * retrouve maintenant là où était le bouton qu'on venait de toucher.
         */
        className="fixed inset-0 z-50 flex items-end justify-center p-4 overlay-backdrop"
        onClick={() => dispatch({ type: 'DISMISS_RESULT' })}
      >
        <motion.div
          initial={{ scale: 0.9, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="craft-card-solid p-5 max-w-sm w-full max-h-[92vh] overflow-y-auto"
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
            {shownImage ? (
              <KenBurnsImage src={shownImage} onError={() => setErrorCount((n) => n + 1)} />
            ) : (
              <SceneIllustration theme={sceneFor(result.text, isPositive ? 'coins' : 'street')} mood={moodFor(result.text, isPositive)} className="w-full h-full" sway />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            <span className="absolute top-2 right-2 text-2xl drop-shadow">{isVictory ? '🏆' : isPositive ? '✨' : '😓'}</span>

            {/* Tampon K.O. quand l'adversaire est mis à terre */}
            {isVictory && (
              <>
                <div className="absolute inset-0 bg-black/30" />
                <motion.div
                  initial={{ scale: 3, rotate: -28, opacity: 0 }}
                  animate={{ scale: 1, rotate: -11, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 11, delay: 0.18 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <span
                    className="text-5xl font-black tracking-widest"
                    style={{ color: '#FFD34E', WebkitTextStroke: '2px #B84A3A', textShadow: '0 3px 6px rgba(0,0,0,0.6)' }}
                  >
                    K.O.
                  </span>
                </motion.div>
                {[[18, 30], [78, 26], [30, 70], [70, 66]].map(([l, t], i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, rotate: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.3, 1], rotate: 360, opacity: [0, 1, 0.9] }}
                    transition={{ delay: 0.35 + i * 0.08, duration: 0.7 }}
                    className="absolute text-xl pointer-events-none drop-shadow"
                    style={{ left: `${l}%`, top: `${t}%` }}
                  >
                    ⭐
                  </motion.span>
                ))}
              </>
            )}
          </motion.div>

          {/* Result text */}
          <p className="text-sm text-[#3D3020] leading-relaxed mb-4 text-center">{tc(result.text)}</p>

          {/*
           * LA JOURNÉE COUPÉE NET.
           *
           * La garde à vue emporte le reste de la journée — souvent deux
           * actions sur trois, la perte la plus lourde du jeu. Elle le disait
           * au milieu de sa phrase, puis s'affichait comme n'importe quel
           * résultat mineur : trois pastilles grises alignées. On la sort du
           * lot, en rouge, avec le compte exact de ce qui est parti.
           */}
          {!!result.journeeFinie && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.2, damping: 18 }}
              className="mb-4 rounded-xl px-3 py-2.5 text-center"
              style={{ background: 'rgba(217,79,79,0.12)', border: '1px solid rgba(217,79,79,0.35)' }}
            >
              <p className="text-[10px] tracking-widest uppercase font-mono text-[#B84A3A]">
                🚔 {tr('Journée terminée', 'Day over')}
              </p>
              <p className="text-sm font-semibold text-[#B84A3A] leading-snug mt-0.5">
                {tr(
                  `${result.journeeFinie} action${result.journeeFinie > 1 ? 's' : ''} perdue${result.journeeFinie > 1 ? 's' : ''} au poste`,
                  `${result.journeeFinie} action${result.journeeFinie > 1 ? 's' : ''} lost at the station`,
                )}
              </p>
              <p className="text-[11px] text-[#8B6B4A] leading-snug mt-1">
                {tr('On vous relâche à la nuit tombée. Il ne reste plus qu\'à dormir.',
                    'They let you out after dark. Nothing left to do but sleep.')}
              </p>
            </motion.div>
          )}

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

          {/* Garder son allure : racheter le palier de Dignité qu'on vient de
              quitter. Passe AVANT le doublement des gains — c'est la perte la
              plus fraîche, et la seule qui ait un nom. */}
          {canKeepFace && palierQuitte && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.36 }}
              whileTap={{ scale: 0.98 }}
              disabled={keeping}
              onClick={handleKeepFace}
              className="w-full py-3 text-sm font-semibold text-white rounded-xl mb-2 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #B8703A, #94552A)',
                boxShadow: '0 4px 16px rgba(184, 112, 58, 0.3)',
              }}
            >
              {keeping
                ? tr('⏳ Chargement…', '⏳ Loading…')
                : `🎬 ${tr(`Rester « ${palierQuitte.fr} »`, `Stay "${palierQuitte.en}"`)}`}
            </motion.button>
          )}

          {result.faceKept && (
            <p className="text-[11px] text-[#B8703A] text-center mb-2 font-medium">
              👑 {tr('Vous avez sauvé les apparences.', 'You kept up appearances.')}
            </p>
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
