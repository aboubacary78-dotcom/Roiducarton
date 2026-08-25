import { useEffect, useState } from 'react';
import { useVerrouScroll } from '@/lib/verrouScroll';
import { useGame, STAT_META, WEATHER_TYPES, getContract, type Stats } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang, tr } from '@/lib/lang';
import { canOfferRewarded, showRewarded } from '@/lib/ads';
import { playWakeUp, playWear, playBack, playGaugeFilled, playUnlock } from '@/lib/sound';

/** Sous ce niveau une jauge est en danger — le même seuil que l'alerte sonore. */
const SEUIL_ALERTE = 25;

/*
 * Bilan de la nuit, affiché après « Jour suivant » : nouveau jour, météo,
 * variations de jauges (ce que la nuit a coûté ou rapporté) et effets de traits.
 * C'est le petit pop-up qui annonce ce qui vient de se passer.
 */
export default function DaySummaryOverlay() {
  const { state, dispatch } = useGame();
  const lang = useLang();
  const s = state.daySummary;
  useVerrouScroll(!!s);

  /*
   * Le réveil sonne à l'APPARITION du bilan, pas au montage du composant : cet
   * overlay est monté en permanence et ne rend `null` que faute de bilan à
   * montrer. Accroché au montage, le son partait une fois au lancement du jeu,
   * dans le vide.
   *
   * Un objet bricolé qui a cédé pendant la nuit a son propre son — du carton
   * mouillé qui se déchire. Le réducteur le signale par une note en 💔.
   */
  const jour = s?.day;
  useEffect(() => {
    if (!s) return;
    playWakeUp();
    if (s.notes.some(n => n.startsWith('💔'))) setTimeout(() => playWear(), 700);
    /*
     * LE COMMENTAIRE DU MATIN.
     *
     * C'est l'écran le plus vu du jeu : une fois par nuit, toutes les parties.
     * D'où le débit bridé de `piquer` — trente secondes minimum entre deux
     * piques, toutes catégories confondues — et six phrases qui se contentent
     * d'un détail exact plutôt que de pousser la blague. Une vanne qu'on relit
     * chaque matin doit pouvoir se relire cent fois.
     *
     * Posée après le réveil, jamais dessus : le bilan a déjà ses chiffres à
     * lire, et deux informations qui arrivent ensemble n'en font qu'une.
     */
    /*
      LE COMMENTAIRE DU MATIN N'EST PLUS ICI.

      Il partait en bandeau flottant au-dessus de ce bilan et disparaissait en
      trois secondes — une notification posée sur le jeu, pas une ligne du
      jeu. Il est maintenant écrit dans les NOTES de la nuit (voir le reducer,
      cas NEXT_DAY), au milieu du réchaud qui a tenu et du carton qui a lâché.
      On le lit avec le reste, et aussi longtemps qu'on veut.
    */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jour]);

  /*
   * Ce `useState` reste AU-DESSUS du `return null` : un hook posé sous un
   * retour anticipé disparaît du rendu dès que la condition bascule, et React
   * refuse de rendre un composant qui compte soudain un hook de moins. Ce
   * défaut exact a déjà planté l'écran de mort en production (erreur #300).
   */
  const [enCours, setEnCours] = useState(false);

  if (!s) return null;

  const weather = WEATHER_TYPES[s.weather];
  const entries = Object.entries(s.deltas) as [keyof Stats, number][];
  const notes = lang === 'en' ? s.notesEn : s.notes;

  /*
   * UNE HEURE DE PLUS AU CHAUD — vidéo récompensée du bilan de nuit.
   *
   * L'offre ne se montre PAS toutes les nuits, et c'est délibéré. Elle attend
   * que la nuit vienne de pousser une jauge sous le seuil d'alerte : la perte
   * est alors chiffrée à l'écran, fraîche, et elle menace vraiment. Une nuit
   * ordinaire n'est qu'une ligne de comptes ; celle-là fait peur.
   *
   * Ce filtre est aussi ce qui protège le placement de lui-même. Le bilan
   * revient chaque jour ; proposé chaque jour, il mangerait à lui seul le
   * budget de trois sollicitations par session et étoufferait la seconde
   * chance à la mort, qui vaut bien plus.
   */
  const jaugesEnDanger = (Object.keys(s.deltas) as (keyof Stats)[])
    .filter(k => (s.deltas[k] ?? 0) < 0 && (state.character?.stats[k] ?? 100) < SEUIL_ALERTE);
  const rendu = s.recovered ? (Object.keys(s.recovered) as (keyof Stats)[]) : [];

  /*
   * LE CONTRAT RATÉ DE PEU.
   *
   * Le réducteur ne renseigne `contratRate` que sur un échec à moins de 20 %
   * du but. La récompense est celle du contrat, à l'unité près : si la vidéo
   * payait mieux que le contrat lui-même, plus personne ne remplirait de
   * contrat.
   */
  const contratDef = s.contratRate ? getContract(s.contratRate.id) : undefined;
  const peutRattraperContrat = !!contratDef && !s.contratRattrape && canOfferRewarded();

  /*
   * UNE SEULE OFFRE PAR BILAN.
   *
   * Deux boutons de publicité côte à côte sur le même écran ne doublent pas
   * les impressions : ils apprennent au joueur que cet écran est un panneau
   * d'affichage, et il cesse de le lire. Le contrat passe devant quand les
   * deux sont possibles — il est plus rare, et rater de deux euros pique plus
   * qu'une jauge basse de plus.
   */
  const peutRattraper = !peutRattraperContrat && !s.recovered
    && jaugesEnDanger.length > 0 && canOfferRewarded();

  async function rattraperLaNuit() {
    if (enCours) return;
    setEnCours(true);
    const vue = await showRewarded();
    if (vue) {
      dispatch({ type: 'RECOVER_NIGHT' });
      playGaugeFilled();
    }
    setEnCours(false);
  }

  async function rattraperLeContrat() {
    if (enCours) return;
    setEnCours(true);
    const vue = await showRewarded();
    if (vue) {
      dispatch({ type: 'RATTRAPER_CONTRAT' });
      playUnlock();
    }
    setEnCours(false);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-backdrop"
        onClick={() => { playBack(); dispatch({ type: 'DISMISS_DAY_SUMMARY' }); }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 16, rotate: 0.5 }}
          animate={{ scale: 1, y: 0, rotate: 0 }}
          exit={{ scale: 0.9, y: 16 }}
          transition={{ type: 'spring', damping: 24, stiffness: 340 }}
          className="craft-card-solid p-5 max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête : nouveau jour + météo */}
          <div className="text-center mb-3">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#A08B70]">{tr('Une nuit passe…', 'A night passes…')}</div>
            <h2 className="text-2xl text-[#2A1F1A] mt-0.5">{tr('Jour', 'Day')} {s.day}</h2>
            <div className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full bg-[#F3E7D8] text-[#6B5740] text-xs font-semibold">
              <span className="text-base">{weather.emoji}</span>
              {tr(weather.label, weather.labelEn)}
            </div>
          </div>

          {/* Variations de jauges pendant la nuit */}
          {entries.length > 0 && (
            <div className="border-t border-[#E8D5C0] pt-3 mb-3">
              <p className="text-[10px] text-center text-[#A08B70] mb-2 uppercase tracking-wide">{tr('Cette nuit', 'Overnight')}</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {entries.map(([key, val], i) => {
                  const meta = STAT_META[key];
                  const pos = val > 0;
                  return (
                    <motion.span
                      key={key}
                      initial={{ scale: 0, y: 4 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ type: 'spring', delay: 0.08 + i * 0.05 }}
                      className={`text-[11px] px-2 py-1 rounded-full font-semibold font-mono ${
                        pos ? 'bg-[#4A9B5F]/12 text-[#3d8b4f]' : 'bg-[#D94F4F]/12 text-[#B84A3A]'
                      }`}
                    >
                      {meta.emoji} {tr(meta.label, meta.labelEn)} {pos ? '+' : ''}{val}
                    </motion.span>
                  );
                })}
                {s.moneyChange > 0 && (
                  <span className="text-[11px] px-2 py-1 rounded-full font-semibold font-mono bg-[#B8860B]/12 text-[#8B6B4A]">💰 +{s.moneyChange}€</span>
                )}
              </div>
            </div>
          )}

          {/* Effets de traits / petits événements de la nuit */}
          {notes.length > 0 && (
            <div className="mb-3 flex flex-col gap-1.5">
              {notes.map((n, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="text-xs text-[#6B5740] bg-[#F5EDE4] rounded-lg px-2.5 py-1.5 leading-snug"
                >
                  {n}
                </motion.p>
              ))}
            </div>
          )}

          {/* Le contrat raté de peu. Le libellé montre l'écart, parce que c'est
              lui qui pique : « 10 € sur 12 » se supporte moins bien que
              « contrat manqué ». */}
          {peutRattraperContrat && contratDef && s.contratRate && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.34 }}
              whileTap={{ scale: 0.98 }}
              disabled={enCours}
              onClick={() => { playBack(); rattraperLeContrat(); }}
              className="w-full py-3 text-sm font-semibold text-white rounded-xl mb-2 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #B8860B, #9B7209)',
                boxShadow: '0 4px 16px rgba(184, 134, 11, 0.3)',
              }}
            >
              {enCours ? tr('⏳ Chargement…', '⏳ Loading…') : (
                <>
                  🎬 {tr('Rattraper le contrat', 'Save the contract')}
                  <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                    {contratDef.emoji} {s.contratRate.valeur}/{s.contratRate.cible} ·{' '}
                    {tr(contratDef.rewardLabel, contratDef.rewardLabelEn)}
                  </span>
                </>
              )}
            </motion.button>
          )}

          {s.contratRattrape && contratDef && (
            <p className="text-[11px] text-[#8B6B4A] text-center mb-2 font-medium">
              {contratDef.emoji} {tr('Contrat validé de justesse.', 'Contract scraped through.')}
            </p>
          )}

          {/* Rattraper la nuit. Le libellé nomme ce qui est en train de se
              perdre, pas ce qu'on gagnerait : « Sommeil au plus bas » convertit,
              « bonus » ne convertit pas. */}
          {peutRattraper && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.34 }}
              whileTap={{ scale: 0.98 }}
              disabled={enCours}
              onClick={() => { playBack(); rattraperLaNuit(); }}
              className="w-full py-3 text-sm font-semibold text-white rounded-xl mb-2 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #6B7FA8, #4C5F84)',
                boxShadow: '0 4px 16px rgba(107, 127, 168, 0.3)',
              }}
            >
              {enCours ? tr('⏳ Chargement…', '⏳ Loading…') : (
                <>
                  🎬 {tr('Dormir une heure de plus', 'Sleep one more hour')}
                  <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                    {tr('Au plus bas :', 'In the red:')}{' '}
                    {jaugesEnDanger.map(k => `${STAT_META[k].emoji} ${tr(STAT_META[k].label, STAT_META[k].labelEn)}`).join(' · ')}
                  </span>
                </>
              )}
            </motion.button>
          )}

          {rendu.length > 0 && (
            <p className="text-[11px] text-[#4C5F84] text-center mb-2 font-medium">
              😴 {tr('La nuit vous a rendu', 'The night gave back')}{' '}
              {rendu.map(k => `+${s.recovered![k]} ${STAT_META[k].emoji}`).join(' ')}
            </p>
          )}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { playBack(); dispatch({ type: 'DISMISS_DAY_SUMMARY' }); }}
            className="btn-primary w-full py-3 text-sm"
          >
            {tr('Nouvelle journée', 'New day')}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
