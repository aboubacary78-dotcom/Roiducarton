import { useGame, STAT_META, type Character, type EventChoice } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { showRewarded } from '@/lib/ads';
import { useLang, tr, tc } from '@/lib/lang';
import KenBurnsImage from './KenBurnsImage';
import SceneIllustration, { sceneFor, type SceneTheme } from './SceneIllustration';
import { stampTap, liftHover } from '@/lib/anim';

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
  // Repli propre si l'image de l'événement n'existe pas encore (fichier absent).
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [event?.id]);

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
  const eventImage = event.image || (isCombat ? COMBAT_IMG_FALLBACK : null);
  const typeInfo = TYPE_LABELS[event.type] || TYPE_LABELS['narrative'];

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
      {eventImage && !imgError ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full h-44 rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.1)] relative"
        >
          <KenBurnsImage src={eventImage} alt={event.title} onError={() => setImgError(true)} />
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
        <p className="text-sm text-[#5C4A38] leading-relaxed mb-4">{tc(event.description)}</p>

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
                onClick={locked ? undefined : () => dispatch({ type: 'CHOOSE_EVENT', choiceIndex: i, boosted })}
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
        ) : (
          <button
            onClick={activateBoost}
            disabled={loadingBoost}
            className="mt-3 w-full py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #B8860B, #9B7209)' }}
          >
            {loadingBoost ? tr('⏳ Chargement…', '⏳ Loading…') : tr('🎬 Coup de pouce (pub), garantir le meilleur résultat', '🎬 Boost (ad), guarantee the best outcome')}
          </button>
        )}
      </motion.div>

      {/* Back */}
      <button
        onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'main' })}
        className="text-sm text-[#A08B70] font-medium text-center py-2 hover:text-[#6B5740] transition-colors"
      >
        ← {tr('Retour', 'Back')}
      </button>
    </div>
  );
}
