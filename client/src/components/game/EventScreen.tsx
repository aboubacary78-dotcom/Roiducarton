import { useGame, STAT_META, type Character, type EventChoice } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { showRewarded } from '@/lib/ads';

const COMBAT_IMG_FALLBACK = '/assets/combat-scene.png';

// Vérifie les conditions d'un choix (stat minimale, objet, compétence de
// métier) et fournit le libellé à afficher sur le cadenas.
function checkRequirements(choice: EventChoice, char: Character | null): { ok: boolean; label: string | null } {
  const req = choice.requirements;
  if (!req || !char) return { ok: true, label: null };
  if (req.stat && req.minValue !== undefined) {
    const meta = STAT_META[req.stat];
    return { ok: char.stats[req.stat] >= req.minValue, label: `${meta.emoji} ${meta.label} ${req.minValue}+` };
  }
  if (req.item) {
    const item = char.inventory.find(i => i.id === req.item);
    return { ok: !!item, label: `🎒 Objet requis` };
  }
  if (req.skill) {
    const ok = char.job.bonusSkills.includes(req.skill) || (char.skills[req.skill] ?? 0) > 0;
    return { ok, label: `💼 ${req.skill}` };
  }
  return { ok: true, label: null };
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  combat: { label: 'Combat', color: '#D94F4F' },
  social: { label: 'Rencontre', color: '#4A8FBF' },
  discovery: { label: 'Découverte', color: '#4A9B5F' },
  narrative: { label: 'Événement', color: '#B8860B' },
};

export default function EventScreen() {
  const { state, dispatch } = useGame();
  const event = state.currentEvent;
  const [boosted, setBoosted] = useState(false);
  const [loadingBoost, setLoadingBoost] = useState(false);

  async function activateBoost() {
    if (loadingBoost || boosted) return;
    setLoadingBoost(true);
    const rewarded = await showRewarded();
    if (rewarded) setBoosted(true);
    setLoadingBoost(false);
  }

  if (!event) {
    dispatch({ type: 'SET_SCREEN', screen: 'main' });
    return null;
  }

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
            Suite d'une rencontre précédente
          </span>
        </motion.div>
      )}

      {/* Event illustration */}
      {eventImage && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full h-44 rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.1)] relative"
        >
          <img
            src={eventImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
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
            {isFollowUp ? 'Suite narrative' : typeInfo.label}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl text-[#2A1F1A] mb-2">{event.title}</h2>

        {/* Description */}
        <p className="text-sm text-[#5C4A38] leading-relaxed mb-4">{event.description}</p>

        {/* Choices */}
        <div className="flex flex-col gap-2">
          {event.choices.map((choice, i) => {
            const req = checkRequirements(choice, state.character);
            const locked = !req.ok;
            return (
              <motion.button
                key={i}
                initial={{ x: -15, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                whileHover={locked ? {} : { scale: 1.01, x: 2 }}
                whileTap={locked ? {} : { scale: 0.98 }}
                onClick={locked ? undefined : () => dispatch({ type: 'CHOOSE_EVENT', choiceIndex: i, boosted })}
                disabled={locked}
                className={`action-btn p-3 text-left flex items-start gap-2.5 ${boosted && !locked ? 'border-[#B8860B]/60' : ''} ${
                  locked ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <span className="text-lg mt-0.5">{locked ? '🔒' : choice.emoji}</span>
                <span className="text-sm text-[#3D3020] font-medium flex-1">{choice.text}</span>
                {req.label && (
                  <span className={`text-[10px] font-semibold mt-1 whitespace-nowrap ${locked ? 'text-[#B84A3A]' : 'text-[#3d8b4f]'}`}>
                    {req.label}
                  </span>
                )}
                {boosted && !locked && !req.label && <span className="text-[10px] text-[#B8860B] font-semibold mt-1">✨ garanti</span>}
              </motion.button>
            );
          })}
        </div>

        {/* Coup de pouce par pub */}
        {boosted ? (
          <div className="mt-3 text-center text-xs font-semibold text-[#B8860B]">
            ✨ Coup de pouce actif : votre prochain choix réussira au mieux.
          </div>
        ) : (
          <button
            onClick={activateBoost}
            disabled={loadingBoost}
            className="mt-3 w-full py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #B8860B, #9B7209)' }}
          >
            {loadingBoost ? '⏳ Chargement…' : '🎬 Coup de pouce (pub) — garantir le meilleur résultat'}
          </button>
        )}
      </motion.div>

      {/* Back */}
      <button
        onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'main' })}
        className="text-sm text-[#A08B70] font-medium text-center py-2 hover:text-[#6B5740] transition-colors"
      >
        ← Retour
      </button>
    </div>
  );
}
