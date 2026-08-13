import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { SALVAGE_JUNK, TROUVAILLES } from '@/contexts/data/salvage';
import { randomFromArray } from '@/contexts/data/util';
import { useLang, tr, tc } from '@/lib/lang';
import {
  dailyStatus, claimDaily, rescueStreak, abandonStreak, grantWeeklySave,
  loadDaily, rollCarton, milestoneFor, pushPendingGift, type CartonGift,
} from '@/lib/daily';
import { addKarma } from '@/lib/necrology';
import { showRewarded } from '@/lib/ads';
import { playCoin, playPaper } from '@/lib/sound';
import { haptic } from '@/lib/haptics';
import SafeImg from './SafeImg';

/*
 * LE CARTON DU MATIN.
 *
 * À la première ouverture d'un jour calendaire, quelqu'un est passé pendant la
 * nuit et a laissé quelque chose. C'est l'étage manquant du jeu : entre la
 * partie (huit minutes) et le Registre (sans fin), il n'y avait aucune raison
 * de rouvrir l'application demain.
 *
 * Deux choses comptent dans cet écran :
 *
 * — LE CONTENU EST À VALEUR VARIABLE. Le plus souvent une bricole, parfois du
 *   Karma, rarement une vraie trouvaille. Ouvrir devient un tirage.
 *
 * — LA SÉRIE SE RATTRAPE. Un jour manqué ne casse rien tant qu'il reste un
 *   jeton (un par semaine) ou qu'on accepte une vidéo. On garde le poids de la
 *   perte et on supprime la falaise du « c'est cassé, tant pis ». Et une série
 *   perdue n'est jamais affichée à zéro : elle disparaît, simplement.
 */
export default function CartonMatinOverlay() {
  const { state, dispatch } = useGame();
  useLang();

  const [phase, setPhase] = useState<'closed' | 'offer' | 'rescue' | 'opened'>('closed');
  const [gift, setGift] = useState<CartonGift | null>(null);
  const [itemName, setItemName] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [saves, setSaves] = useState(0);
  const [milestone, setMilestone] = useState<ReturnType<typeof milestoneFor>>(null);
  const [busy, setBusy] = useState(false);

  // Une seule décision par lancement : on regarde ce que le jour réclame.
  useEffect(() => {
    const d = grantWeeklySave();
    setSaves(d.saves);
    const st = dailyStatus();
    if (st.kind === 'claimed') return;
    if (st.kind === 'rescuable') { setPhase('rescue'); return; }
    setPhase('offer');
  }, []);

  useEffect(() => { if (phase === 'offer' || phase === 'rescue') playPaper(); }, [phase]);

  function remettre(g: CartonGift) {
    if (g.kind === 'karma') { addKarma(g.karma ?? 0); return null; }
    const item = g.kind === 'trouvaille' ? randomFromArray(TROUVAILLES) : randomFromArray(SALVAGE_JUNK);
    // Une partie en cours reçoit l'objet tout de suite ; sinon il attend le
    // prochain personnage, posé sur son carton — ce qui est la fiction même.
    if (state.character?.alive) dispatch({ type: 'CLAIM_CARTON', item });
    else pushPendingGift(item.id);
    return tc(item.name);
  }

  function ouvrir() {
    const d = claimDaily();
    const g = rollCarton(d.streak);
    setGift(g);
    setItemName(remettre(g));
    setStreak(d.streak);
    const m = milestoneFor(d.streak);
    if (m) { addKarma(m.karma); setMilestone(m); }
    playCoin();
    haptic(g.kind === 'trouvaille' ? 'heavy' : 'medium');
    setPhase('opened');
  }

  async function sauver(parPub: boolean) {
    if (busy) return;
    setBusy(true);
    if (parPub) {
      // Restaurer une perte : c'est le meilleur emplacement de vidéo du jeu,
      // et il est exempté du plafond — le joueur est venu le chercher.
      const ok = await showRewarded({ exempt: true });
      if (!ok) { setBusy(false); return; }
    }
    const ok = rescueStreak(!parPub);
    setBusy(false);
    if (!ok) return;
    const d = loadDaily();
    setSaves(d.saves);
    setStreak(d.streak);
    const g = rollCarton(d.streak);
    setGift(g);
    setItemName(remettre(g));
    playCoin();
    haptic('medium');
    setPhase('opened');
  }

  function laisserTomber() {
    abandonStreak();
    setPhase('offer');
  }

  if (phase === 'closed') return null;

  const libelleCadeau = gift?.kind === 'karma'
    ? `+${gift.karma} 👑 ${tr('de Karma de Rue', 'Street Karma')}`
    : itemName;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[75] flex items-center justify-center p-5"
        style={{ background: 'rgba(12,8,14,0.96)', backdropFilter: 'blur(3px)' }}
      >
        <motion.div
          initial={{ scale: 0.93, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 23 }}
          className="w-full max-w-sm craft-card-solid p-5 text-center"
        >
          <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3">
            {/* Le carton disparu n'est pas un cadeau : les mains vides
                conviennent mieux que le paquet posé sur le trottoir. */}
            <SafeImg
              src={phase === 'rescue' ? '/assets/result-recup-vide.webp' : '/assets/result-cadeau-carton.webp'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>

          {/* ---- LA SÉRIE EST EN PÉRIL ---- */}
          {phase === 'rescue' && (
            <>
              <h2 className="text-lg font-bold text-[#2A1F1A] leading-tight mb-1.5">
                {tr('Votre carton a disparu.', 'Your cardboard is gone.')}
              </h2>
              <p className="text-[13px] text-[#6B5740] leading-snug mb-4">
                {tr(
                  'Le service de nettoyage est passé. Quelqu\'un peut peut-être encore le récupérer avant la benne.',
                  'Street cleaning came through. Someone might still grab it before the truck does.',
                )}
              </p>
              {saves > 0 ? (
                <button
                  onClick={() => sauver(false)}
                  disabled={busy}
                  className="w-full py-3.5 text-sm font-bold text-white rounded-xl mb-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #4A9B5F, #3d8b4f)' }}
                >
                  {tr(`🤝 Quelqu'un l'a ramassé pour vous (${saves} restant${saves > 1 ? 's' : ''})`,
                      `🤝 Someone picked it up for you (${saves} left)`)}
                </button>
              ) : (
                <button
                  onClick={() => sauver(true)}
                  disabled={busy}
                  className="w-full py-3.5 text-sm font-bold text-white rounded-xl mb-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #4A9B5F, #3d8b4f)' }}
                >
                  {busy ? tr('⏳ Chargement…', '⏳ Loading…') : tr('🎬 Le rattraper (regarder une pub)', '🎬 Get it back (watch an ad)')}
                </button>
              )}
              <button onClick={laisserTomber} className="w-full py-2.5 text-[12px] font-semibold text-[#8B6B4A]">
                {tr('Le laisser partir', 'Let it go')}
              </button>
            </>
          )}

          {/* ---- LE CARTON ATTEND ---- */}
          {phase === 'offer' && (
            <>
              <h2 className="text-lg font-bold text-[#2A1F1A] leading-tight mb-1.5">
                {tr('Quelqu\'un est passé cette nuit.', 'Someone came by in the night.')}
              </h2>
              <p className="text-[13px] text-[#6B5740] leading-snug mb-4">
                {tr('Il y a quelque chose sur votre carton.', 'There\'s something on your cardboard.')}
              </p>
              <button
                onClick={ouvrir}
                className="w-full py-3.5 text-[15px] font-bold text-white rounded-xl"
                style={{ background: 'linear-gradient(135deg, #D4874D, #9B5B3A)', boxShadow: '0 4px 18px rgba(212,135,77,0.35)' }}
              >
                {tr('Regarder', 'Take a look')}
              </button>
            </>
          )}

          {/* ---- CE QU'IL Y AVAIT ---- */}
          {phase === 'opened' && (
            <>
              <motion.p
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 15 }}
                className="text-3xl mb-1"
              >
                {gift?.kind === 'trouvaille' ? '💎' : gift?.kind === 'karma' ? '👑' : '🔧'}
              </motion.p>
              <h2 className="text-lg font-bold text-[#2A1F1A] leading-tight mb-1">
                {libelleCadeau}
              </h2>
              <p className="text-[12px] text-[#8B6B4A] leading-snug mb-3">
                {state.character?.alive
                  ? tr('Dans le sac.', 'In the bag.')
                  : tr('Posé là pour votre prochain personnage.', 'Left there for your next character.')}
              </p>

              {streak > 1 && (
                <p className="text-[13px] font-semibold text-[#B8860B] mb-1">
                  🔥 {tr(`${streak} jours de suite`, `${streak} days running`)}
                </p>
              )}
              {milestone && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-[12px] font-bold text-[#3d8b4f] mb-2"
                >
                  {tr(milestone.fr, milestone.en)} · +{milestone.karma} 👑
                </motion.p>
              )}

              <button
                onClick={() => setPhase('closed')}
                className="w-full mt-2 py-3 text-sm font-bold text-white rounded-xl"
                style={{ background: 'linear-gradient(135deg, #D4874D, #9B5B3A)' }}
              >
                {tr('Merci', 'Thanks')}
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
