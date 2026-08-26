import { useGame, STAT_META, DETTE_PRET, type Character, type EventChoice } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { bonusEn, bonusFr, canOfferRewarded, showRewarded } from '@/lib/ads';
import { useLang, tr, tc } from '@/lib/lang';
import { charabia } from '@/lib/charabia';
import KenBurnsImage from './KenBurnsImage';
import SceneIllustration, { sceneFor, type SceneTheme } from './SceneIllustration';
import { stampTap, liftHover } from '@/lib/anim';
import { playEventSfx } from '@/lib/eventSfx';
import { playBack, playClick, playMemory, playMoneyIn, playMoneyOut, playTurnedAway, playUnlock } from '@/lib/sound';

const COMBAT_IMG_FALLBACK = '/assets/combat-scene.webp';

// Vignette de repli selon le type d'événement quand aucun mot-clé ne ressort.
const TYPE_SCENE: Record<string, SceneTheme> = {
  combat: 'fight',
  social: 'friend',
  discovery: 'discovery',
  narrative: 'street',
};

// Vérifie les conditions d'un choix (stat minimale, objet, compétence de
// métier) et fournit le libellé à afficher sur le cadenas.
function checkRequirements(choice: EventChoice, char: Character | null, en: boolean): { ok: boolean; label: string | null } {
  /*
   * Le verrou explicite, quand la condition ne rentre pas dans `requirements`
   * : rembourser demande une SOMME, pas un objet ni un seuil de statistique.
   * Le bouton reste visible et barré plutôt que retiré — le joueur doit voir
   * ce qu'il aurait pu faire, sinon l'autre choix n'en est plus un.
   */
  if (choice.bloqueSi?.argentMoinsDe !== undefined && char) {
    const somme = choice.bloqueSi.argentMoinsDe;
    if (char.money < somme) {
      return { ok: false, label: `${somme}€ ${en ? 'needed' : 'requis'}` };
    }
  }
  const req = choice.requirements;
  if (!req || !char) return { ok: true, label: null };
  if (req.stat && req.minValue !== undefined) {
    const meta = STAT_META[req.stat];
    return { ok: char.stats[req.stat] >= req.minValue, label: `${meta.emoji} ${en ? meta.labelEn : meta.label} ${req.minValue}+` };
  }
  if (req.item) {
    const item = char.inventory.find(i => i.id === req.item);
    return { ok: !!item, label: en ? '🎒 Item required' : '🎒 Objet requis' };
  }
  if (req.respect !== undefined) {
    return { ok: char.respect >= req.respect, label: `⭐ ${en ? 'Respect' : 'Respect'} ${req.respect}+` };
  }
  return { ok: true, label: null };
}

/*
 * Les choix qui déclenchent une mécanique gardent le son de cette mécanique.
 *
 * Ils sonnaient tous comme un clic d'interface depuis qu'ils sont passés par
 * l'écran des rencontres — alors que prendre dix euros et repartir sans rien
 * ne s'entendaient pas pareil du temps où c'étaient des boutons du hub. On ne
 * perd pas ça en changeant de mise en scène.
 */
const SON_DU_CHOIX: Record<string, () => void> = {
  ACCEPTER_PRET: () => playMoneyIn(DETTE_PRET),
  REFUSER_PRET: playBack,
  REMBOURSER_DETTE: playMoneyOut,
  AVOUER_INSOLVABILITE: playTurnedAway,
};

const TYPE_LABELS: Record<string, { label: string; labelEn: string; color: string }> = {
  combat: { label: 'Combat', labelEn: 'Combat', color: '#D94F4F' },
  social: { label: 'Rencontre', labelEn: 'Encounter', color: '#4A8FBF' },
  discovery: { label: 'Découverte', labelEn: 'Discovery', color: '#4A9B5F' },
  narrative: { label: 'Événement', labelEn: 'Event', color: '#B8860B' },
};

export default function EventScreen() {
  const { state, dispatch } = useGame();
  const en = useLang() === 'en';
  // On mémorise le dernier événement affiché : au moment où un choix est fait,
  // `currentEvent` repasse à null alors que cet écran joue encore sa transition
  // de sortie (AnimatePresence). On garde donc l'ancien contenu pendant la
  // sortie, sans jamais déclencher de navigation pendant le rendu.
  const lastEventRef = useRef(state.currentEvent);
  if (state.currentEvent) lastEventRef.current = state.currentEvent;
  const event = state.currentEvent ?? lastEventRef.current;
  const [boosted, setBoosted] = useState(false);
  const [loadingBoost, setLoadingBoost] = useState(false);
  // Repli propre si l'image de l'événement n'existe pas encore (fichier
  // absent) : on descend la chaîne image → diorama voisin → scène dessinée,
  // un cran par échec de chargement.
  const [imgError, setImgError] = useState(0);
  useEffect(() => { setImgError(0); }, [event?.id]);
  // Bruitage propre à la rencontre : le chien aboie, le mariage sonne les
  // cloches, la gare siffle… (aiguillé sur l'id + le titre, voir lib/eventSfx).
  useEffect(() => {
    if (!state.currentEvent) return;
    const e = state.currentEvent;
    // « Le Sursaut » n'arrive qu'une fois par partie, au bord du gouffre : il a
    // son propre son plutôt que le bruitage de famille (qui le rangeait avec
    // les fantômes).
    if (e.id === 'sursaut') playMemory();
    else playEventSfx(`${e.id} ${e.title} ${e.description}`, e.id);
  }, [state.currentEvent?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function activateBoost() {
    if (loadingBoost || boosted) return;
    setLoadingBoost(true);
    const rewarded = await showRewarded();
    if (rewarded) setBoosted(true);
    setLoadingBoost(false);
  }

  if (!event) return null;

  const isCombat = event.type === 'combat';
  const isFollowUp = event.isFollowUp;
  const candidates = [event.image, event.fallbackImage, isCombat ? COMBAT_IMG_FALLBACK : null].filter(Boolean) as string[];
  const eventImage = imgError < candidates.length ? candidates[imgError] : null;
  const typeInfo = TYPE_LABELS[event.type] || TYPE_LABELS['narrative'];
  /*
   * Une rencontre dont les choix sont des RÈGLES n'a pas d'issue à tirer, donc
   * rien à garantir : proposer d'y « garantir le meilleur résultat » contre
   * une publicité serait vendre quelque chose qui n'existe pas.
   */
  const mecanique = event.choices.every(c => !!c.action);

  return (
    <div className="min-h-screen bg-texture p-4 flex flex-col gap-3">
      {/* Follow-up banner */}
      {isFollowUp && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#7B68EE]/8 border border-[#7B68EE]/20"
        >
          <span className="text-xs font-medium text-[#7B68EE]">
            {tr('Suite d\'une rencontre précédente', 'Follow-up to an earlier encounter')}
          </span>
        </motion.div>
      )}

      {/* Event illustration */}
      {eventImage ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full h-44 rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.1)] relative"
        >
          <KenBurnsImage key={eventImage} src={eventImage} alt={event.title} onError={() => setImgError(n => n + 1)} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full h-40 rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(58,42,30,0.12)] relative"
        >
          <SceneIllustration
            theme={sceneFor(`${event.title} ${event.description}`, TYPE_SCENE[event.type] || 'street')}
            className="w-full h-full"
            sway
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        </motion.div>
      )}

      {/* Event Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="craft-card p-4"
      >
        {/* Type badge */}
        <div className="mb-2">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white"
            style={{ backgroundColor: isFollowUp ? '#7B68EE' : typeInfo.color }}
          >
            {isFollowUp ? tr('Suite narrative', 'Story follow-up') : tr(typeInfo.label, typeInfo.labelEn)}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl text-[#2A1F1A] mb-2">{tc(event.title)}</h2>

        {/* Description */}
        {/*
          LE RÉCIT PASSE PAR LA TÊTE DU PERSONNAGE, LES CHOIX NON.
          Sous 60 de mental, les mots de la description se mélangent (voir
          lib/charabia). Les LIBELLÉS DE CHOIX, eux, restent intacts : brouiller
          ce dont dépend une décision ne rend pas le jeu inquiétant, il le rend
          injouable — on ne joue plus, on subit.
        */}
        <p className="text-sm text-[#5C4A38] leading-relaxed mb-4">
          {charabia(tc(event.description), state.character?.stats.mental ?? 100, en)}
        </p>

        {/* Choices */}
        <div className="flex flex-col gap-2">
          {event.choices.map((choice, i) => {
            const req = checkRequirements(choice, state.character, en);
            const locked = !req.ok;
            return (
              <motion.button
                key={i}
                initial={{ x: -15, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                whileHover={locked ? {} : liftHover}
                whileTap={locked ? {} : stampTap}
                onClick={locked ? undefined : () => {
                  (SON_DU_CHOIX[choice.action ?? ''] ?? playClick)();
                  dispatch({ type: 'CHOOSE_EVENT', choiceIndex: i, boosted });
                }}
                disabled={locked}
                className={`action-btn p-3 text-left flex items-start gap-2.5 ${boosted && !locked ? 'border-[#B8860B]/60' : ''} ${
                  locked ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <span className="text-lg mt-0.5">{locked ? '🔒' : choice.emoji}</span>
                <span className="text-sm text-[#3D3020] font-medium flex-1">{tc(choice.text)}</span>
                {req.label && (
                  <span className={`text-[10px] font-semibold mt-1 whitespace-nowrap ${locked ? 'text-[#B84A3A]' : 'text-[#3d8b4f]'}`}>
                    {req.label}
                  </span>
                )}
                {boosted && !locked && !req.label && <span className="text-[10px] text-[#B8860B] font-semibold mt-1">{tr('✨ garanti', '✨ guaranteed')}</span>}
              </motion.button>
            );
          })}
        </div>

        {/* Coup de pouce par pub */}
        {boosted ? (
          <div className="mt-3 text-center text-xs font-semibold text-[#B8860B]">
            {tr('✨ Coup de pouce actif : votre prochain choix réussira au mieux.', '✨ Boost active: your next choice will get the best outcome.')}
          </div>
        ) : canOfferRewarded() && !mecanique ? (
          <button
            onClick={() => { playUnlock(); activateBoost(); }}
            disabled={loadingBoost}
            className="mt-3 w-full py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #B8860B, #9B7209)' }}
          >
            {loadingBoost ? tr('⏳ Chargement…', '⏳ Loading…') : tr(bonusFr('Coup de pouce, garantir le meilleur résultat'), bonusEn('Boost, guarantee the best outcome'))}
          </button>
        ) : null}
      </motion.div>

      {/*
        Back — sauf pour les rencontres dont on ne sort pas.

        La rue ne vous force à rien, et toutes les rencontres se quittent : on
        passe son chemin. L'échéance d'une dette, non. Un bouton « Retour »
        viderait de leur sens les trois jours qu'on vient de passer à compter
        ses euros, et le compteur de l'en-tête avec eux.
      */}
      {event.sansRetour ? (
        <p className="text-center text-[11px] text-[#8B6B4A] py-3">
          {tr('Personne ne bouge tant que vous n\'avez pas répondu.', 'Nobody moves until you answer.')}
        </p>
      ) : (
        <button
          onClick={() => { playBack(); dispatch({ type: 'SET_SCREEN', screen: 'main' }); }}
          className="action-btn py-3 text-sm font-semibold text-[#6B5740] flex items-center justify-center gap-1.5"
        >
          ← {tr('Retour', 'Back')}
        </button>
      )}
    </div>
  );
}
